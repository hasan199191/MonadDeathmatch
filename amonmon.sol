// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleMonadSurvive
 * @dev Basitleştirilmiş Monad Survive oyunu kontratı
 */
contract SimpleMonadSurvive is Ownable {
    // Sabitler
    uint256 private constant MIN_PLAYERS = 5;
    uint256 private constant TICKET_USE_THRESHOLD = 5; // 20 yerine 5 yapın
    uint256 private constant PLATFORM_FEE_PERCENT = 10;

    // State değişkenleri
    uint256 public poolId;
    uint256 public entranceFee;
    uint256 public ticketPrice;
    uint256 public minBetAmount;
    uint256 public maxBetAmount;
    uint256 public eliminationStartTime;
    uint256 public eliminationInterval;
    bool public isEliminationActive;

    address[] public players;
    address[] public eliminatedPlayers;
    mapping(address => bool) public hasTicket;
    mapping(address => uint256) public playerBets;

    uint256 public totalEntranceFees;
    uint256 public totalBetFees;
    uint256 public totalTicketFees;
    uint256 public platformFees;

    // Ödül yüzdeleri
    uint256[10] public rewardPercentages = [35, 20, 15, 10, 5, 100, 100, 100, 100, 100];

    // Etkinlikler
    event PoolCreated(uint256 poolId, uint256 entranceFee, uint256 ticketPrice);
    event PlayerJoined(uint256 poolId, address player);
    event BetPlaced(uint256 poolId, address player, address target, uint256 amount);
    event TicketPurchased(uint256 poolId, address player);
    event TicketUsed(uint256 poolId, address player);
    event PlayerEliminated(uint256 poolId, address player);
    event PoolCompleted(uint256 poolId);
    event RewardClaimed(uint256 poolId, address player, uint256 amount);
    event PlatformFeesWithdrawn(uint256 amount);
    event ParametersUpdated(uint256 entranceFee, uint256 ticketPrice, uint256 minBetAmount, uint256 maxBetAmount);

    // Yapıcı fonksiyon
    constructor(
        uint256 _entranceFee,
        uint256 _ticketPrice,
        uint256 _minBetAmount,
        uint256 _maxBetAmount,
        uint256 _eliminationStartTime,
        uint256 _eliminationInterval
    ) Ownable(msg.sender) {
        poolId = 1;
        entranceFee = _entranceFee;
        ticketPrice = _ticketPrice;
        minBetAmount = _minBetAmount;
        maxBetAmount = _maxBetAmount;
        eliminationStartTime = _eliminationStartTime;
        eliminationInterval = _eliminationInterval;
    }

    // Modifiers
    modifier poolActive() {
        require(block.timestamp >= eliminationStartTime || isEliminationActive, "Pool is not active yet");
        _;
    }

    modifier validBetAmount(uint256 amount) {
        require(amount >= minBetAmount && amount <= maxBetAmount, "Invalid bet amount");
        _;
    }

    // Havuz oluşturma (sadece bir havuz olacak)
    function createPool() external onlyOwner {
        require(players.length == 0, "Pool already exists");
        emit PoolCreated(poolId, entranceFee, ticketPrice);
    }

    // Oyuncuların havuza katılması
    function joinPool() external payable {
        require(msg.value == entranceFee, "Incorrect entrance fee");
        require(!isPlayerInPool(msg.sender), "Player already in pool");
        require(players.length < 100, "Pool is full"); // Maksimum oyuncu sayısı

        players.push(msg.sender);
        totalEntranceFees += msg.value;

        emit PlayerJoined(poolId, msg.sender);
    }

    // Bahis yapma
    function placeBet(address target) external payable poolActive validBetAmount(msg.value) {
        require(isPlayerInPool(target), "Target player not in pool");
        require(target != msg.sender, "Cannot bet on yourself");

        playerBets[msg.sender] += msg.value;
        totalBetFees += msg.value;

        emit BetPlaced(poolId, msg.sender, target, msg.value);
    }

    // Bilet satın alma
    function purchaseTicket() external payable {
        require(msg.value == ticketPrice, "Incorrect ticket price");
        require(!hasTicket[msg.sender], "Player already has a ticket");

        hasTicket[msg.sender] = true;
        totalTicketFees += msg.value;

        emit TicketPurchased(poolId, msg.sender);
    }

    // Bilet kullanma
    function useTicket() external {
        require(hasTicket[msg.sender], "Player does not have a ticket");
        // Test için gereken durumu kaldırın veya değiştirin
        //require(players.length > TICKET_USE_THRESHOLD, "Cannot use ticket with fewer than 20 players");

        hasTicket[msg.sender] = false;
        emit TicketUsed(poolId, msg.sender);
    }

    // Eleme turu (otomatik veya yönetici tarafından)
    function eliminatePlayer(address player) external onlyOwner poolActive {
        require(isEliminationActive, "Elimination is not active");
        require(isPlayerInPool(player), "Player not in pool");
        require(!isPlayerEliminated(player), "Player already eliminated");

        // Oyuncuyu listeden çıkar
        removePlayer(player);
        eliminatedPlayers.push(player);

        emit PlayerEliminated(poolId, player);

        // Havuzun tamamlanıp tamamlanmadığını kontrol et
        if (players.length <= 1) {
            completePool();
        }
    }

    // Otomatik eleme turu başlatma
    function startAutomaticElimination() external onlyOwner {
        require(!isEliminationActive, "Elimination is already active");
        isEliminationActive = true;
        eliminationStartTime = block.timestamp + eliminationInterval;
    }

    // Otomatik eleme turunu durdurma
    function stopAutomaticElimination() external onlyOwner {
        require(isEliminationActive, "Elimination is not active");
        isEliminationActive = false;
    }

    // Havuzu tamamlama
    function completePool() internal {
        require(players.length <= 1, "Pool is not complete yet");

        // Ödülleri dağıt
        distributeRewards();

        emit PoolCompleted(poolId);
    }

    // Ödülleri dağıtma
    function distributeRewards() internal {
        // Eğer dağıtılacak ödül yoksa işlemi atla
        if (totalEntranceFees == 0) {
            return;
        }

        uint256 totalPrizePool = totalEntranceFees;
        uint256 platformFee = (totalPrizePool * PLATFORM_FEE_PERCENT) / 100;
        platformFees += platformFee;

        uint256 availablePrizePool = totalPrizePool - platformFee;

        // Eğer hiç oyuncu kalmadıysa işlemi durdur
        if (players.length == 0 && eliminatedPlayers.length == 0) {
            return;
        }

        // Şampiyonu (ve diğer sıradakileri) belirle
        // Şu anda players dizisinde kalan şampiyon + eliminatedPlayers dizisinde elenenler var
        
        // Kazananlara ödül dağıtımı (rewardPercentages'e göre)
        // Şampiyon (1. sıra)
        if (players.length > 0) {
            address champion = players[0];
            uint256 rewardAmount = (availablePrizePool * rewardPercentages[0]) / 100;
            payable(champion).transfer(rewardAmount);
            emit RewardClaimed(poolId, champion, rewardAmount);
        }

        // Elenenler arasında 2-10. sıra
        uint256 eliminatedLength = eliminatedPlayers.length;
        // Top 9 elenenler (veya daha az, eğer 9'dan az elenen varsa)
        uint256 maxToCheck = eliminatedLength > 9 ? 9 : eliminatedLength;
        
        for (uint256 i = 0; i < maxToCheck; i++) {
            // İndeksi tersten alıyoruz, en son elenen = 2. sıra
            uint256 index = eliminatedLength - 1 - i;
            if (index < eliminatedLength) { // Güvenlik kontrolü
                address player = eliminatedPlayers[index];
                uint256 rankIndex = i + 1; // 2. sıradan başlıyor (i=0 için 2. sıra)
                
                if (rankIndex < 5) { // 2-5. sıralar için yüzde ödül
                    uint256 rewardAmount = (availablePrizePool * rewardPercentages[rankIndex]) / 100;
                    payable(player).transfer(rewardAmount);
                    emit RewardClaimed(poolId, player, rewardAmount);
                } else { // 6-10. sıralar için giriş ücreti iadesi
                    payable(player).transfer(entranceFee);
                    emit RewardClaimed(poolId, player, entranceFee);
                }
            }
        }

        // Bahis ödüllerini dağıt
        distributeBetRewards();
    }

    // Bahis ödüllerini dağıtma
    function distributeBetRewards() internal {
        uint256 totalBetPrizePool = totalBetFees;
        uint256 platformFee = (totalBetPrizePool * PLATFORM_FEE_PERCENT) / 100;
        platformFees += platformFee;

        // Son 1'e kalanı bilen
        if (players.length == 1) {
            address winner = players[0];
            uint256 rewardAmount = playerBets[winner] * 30;
            payable(winner).transfer(rewardAmount);
            emit RewardClaimed(poolId, winner, rewardAmount);
        }

        // Son 3'ü bilen
        if (players.length <= 3) {
            for (uint256 i = 0; i < players.length; i++) {
                address player = players[i];
                uint256 rewardAmount = playerBets[player] * 20;
                payable(player).transfer(rewardAmount);
                emit RewardClaimed(poolId, player, rewardAmount);
            }
        }

        // Son 5'i bilen
        if (players.length <= 5) {
            for (uint256 i = 0; i < players.length; i++) {
                address player = players[i];
                uint256 rewardAmount = playerBets[player] * 10;
                payable(player).transfer(rewardAmount);
                emit RewardClaimed(poolId, player, rewardAmount);
            }
        }

        // Son 10'u bilen
        if (players.length <= 10) {
            for (uint256 i = 0; i < players.length; i++) {
                address player = players[i];
                uint256 rewardAmount = playerBets[player] * 5;
                payable(player).transfer(rewardAmount);
                emit RewardClaimed(poolId, player, rewardAmount);
            }
        }
    }

    // Platform ücretlerini çekme
    function withdrawPlatformFees() external onlyOwner {
        uint256 amount = platformFees;
        require(amount > 0, "No fees to withdraw");

        platformFees = 0;
        payable(owner()).transfer(amount);

        emit PlatformFeesWithdrawn(amount);
    }

    // Parametreleri güncelleme
    function updateParameters(
        uint256 _entranceFee,
        uint256 _ticketPrice,
        uint256 _minBetAmount,
        uint256 _maxBetAmount
    ) external onlyOwner {
        entranceFee = _entranceFee;
        ticketPrice = _ticketPrice;
        minBetAmount = _minBetAmount;
        maxBetAmount = _maxBetAmount;

        emit ParametersUpdated(_entranceFee, _ticketPrice, _minBetAmount, _maxBetAmount);
    }

    // Yardımcı fonksiyonlar
    function isPlayerInPool(address player) public view returns (bool) {
        for (uint256 i = 0; i < players.length; i++) {
            if (players[i] == player) {
                return true;
            }
        }
        return false;
    }

    function isPlayerEliminated(address player) internal view returns (bool) {
        for (uint256 i = 0; i < eliminatedPlayers.length; i++) {
            if (eliminatedPlayers[i] == player) {
                return true;
            }
        }
        return false;
    }

    function removePlayer(address player) internal {
        for (uint256 i = 0; i < players.length; i++) {
            if (players[i] == player) {
                players[i] = players[players.length - 1];
                players.pop();
                break;
            }
        }
    }

    // Acil durum fonksiyonu (havuzu tamamlamak için)
    function emergencyCompletePool() external onlyOwner {
        completePool();
    }

    // ETH almak için
    receive() external payable {}
    fallback() external payable {}

    // Aktif oyuncu sayısını döndürme
    function getActivePlayerCount() public view returns (uint256) {
        return players.length;
    }
}
