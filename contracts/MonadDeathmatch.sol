// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MonadDeathmatch {
    struct Pool {
        uint256 startTime;            // Pool start timestamp
        uint256 lastEliminationTime;  // Last elimination timestamp
        uint256 totalParticipants;    // Total number of participants
        uint256 remainingParticipants;// Number of remaining participants
        uint256 phase;                // Current phase (1-3)
        bool active;                  // Pool active status
        mapping(address => bool) isParticipant;  // Participant status tracker
        mapping(address => uint256) totalBetsReceived; // Total bets received by participant
        mapping(address => uint256) bettorCount; // Number of bettors for participant
    }

    struct Bet {
        address bettor;
        address participant;
        uint256 amount;
        uint256 timestamp;
        bool isActive;
    }

    struct ParticipantStats {
        uint256 totalBetsReceived;
        uint256 bettorCount;
        uint256 rank;
        bool isEliminated;
    }

    // Constants
    uint256 public constant ENTRY_FEE = 1 ether;  // 1 MON entry fee
    uint256 public constant MAX_PARTICIPANTS = 100;// Max players per pool
    uint256 public constant DAILY_ELIMINATIONS = 3;// Number of daily eliminations
    uint256 public constant ELIMINATION_INTERVAL = 1 days;// Time between eliminations
    uint256 public constant MIN_BET = 0.1 ether;  // 0.1 MON minimum bet
    uint256 public constant MAX_BET = 10 ether;   // 10 MON maximum bet

    // State Variables
    address public owner;
    uint256 public poolCount;
    mapping(uint256 => Pool) public pools;
    mapping(uint256 => address[]) public poolParticipants;
    mapping(uint256 => mapping(address => Bet[])) public bettingHistory; // poolId => bettor => bets
    mapping(uint256 => uint256) public totalPoolBets; // poolId => total bets

    // Events
    event ParticipantJoined(uint256 indexed poolId, address indexed participant);
    event DailyElimination(uint256 indexed poolId, address indexed participant);
    event PhaseWinner(uint256 indexed poolId, uint256 indexed phase, address indexed winner, uint256 reward);
    event BetPlaced(uint256 indexed poolId, address indexed bettor, address participant, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier validPool(uint256 _poolId) {
        require(_poolId > 0 && _poolId <= poolCount, "Invalid pool ID");
        _;
    }

    constructor() {
        owner = msg.sender;
        _createNewPool();
    }

    function _createNewPool() internal {
        poolCount++;
        Pool storage newPool = pools[poolCount];
        newPool.startTime = block.timestamp;
        newPool.active = true;
        newPool.phase = 1;
    }

    function newPool() external onlyOwner returns (uint256) {
        _createNewPool();
        return poolCount;
    }

    function joinPool(uint256 _poolId) external payable validPool(_poolId) {
        Pool storage pool = pools[_poolId];
        require(pool.active, "Pool is not active");
        require(msg.value == ENTRY_FEE, "Must send exactly 1 MON");
        require(!pool.isParticipant[msg.sender], "Already a participant");
        require(poolParticipants[_poolId].length < MAX_PARTICIPANTS, "Pool is full");

        pool.isParticipant[msg.sender] = true;
        poolParticipants[_poolId].push(msg.sender);
        pool.totalParticipants++;
        pool.remainingParticipants++;

        emit ParticipantJoined(_poolId, msg.sender);
    }

    function placeBet(uint256 _poolId, address _participant) external payable validPool(_poolId) {
        Pool storage pool = pools[_poolId];
        require(pool.active, "Pool is not active");
        require(pool.isParticipant[_participant], "Invalid participant");
        require(msg.value >= MIN_BET && msg.value <= MAX_BET, "Invalid bet amount");

        // Update betting stats
        pool.totalBetsReceived[_participant] += msg.value;
        pool.bettorCount[_participant]++;
        totalPoolBets[_poolId] += msg.value;

        // Record bet in history
        bettingHistory[_poolId][msg.sender].push(Bet({
            bettor: msg.sender,
            participant: _participant,
            amount: msg.value,
            timestamp: block.timestamp,
            isActive: true
        }));

        emit BetPlaced(_poolId, msg.sender, _participant, msg.value);
    }

    function getParticipantStats(uint256 _poolId, address _participant) external view validPool(_poolId) returns (ParticipantStats memory) {
        Pool storage pool = pools[_poolId];
        require(pool.isParticipant[_participant], "Not a participant");

        // Calculate rank (simplified version)
        uint256 rank = 1;
        for (uint i = 0; i < poolParticipants[_poolId].length; i++) {
            address other = poolParticipants[_poolId][i];
            if (pool.totalBetsReceived[other] > pool.totalBetsReceived[_participant]) {
                rank++;
            }
        }

        return ParticipantStats({
            totalBetsReceived: pool.totalBetsReceived[_participant],
            bettorCount: pool.bettorCount[_participant],
            rank: rank,
            isEliminated: !pool.isParticipant[_participant]
        });
    }

    function getBettingHistory(uint256 _poolId, address _bettor) external view validPool(_poolId) returns (Bet[] memory) {
        return bettingHistory[_poolId][_bettor];
    }

    function getParticipants(uint256 _poolId) external view validPool(_poolId) returns (address[] memory) {
        return poolParticipants[_poolId];
    }

    function getPool(uint256 _poolId) external view validPool(_poolId) returns (
        Pool memory
    ) {
        return pools[_poolId];
    }

    function getPoolCount() external view returns (uint256) {
        return poolCount;
    }

    // Get pool participants count
    function getPoolParticipantsCount(uint256 _poolId) external view validPool(_poolId) returns (uint256) {
        return poolParticipants[_poolId].length;
    }

    receive() external payable {}
}
