const hre = require("hardhat");
require('dotenv').config();

async function main() {
  const monadDeathmatch = await hre.ethers.getContractAt(
    "MonadDeathmatch",
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  );

  console.log("Checking contract:", process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);

  try {
    // Get pool count
    const poolCount = await monadDeathmatch.getPoolCount();
    console.log("Total pools:", poolCount.toString());

    // Get participants for pool #1
    const participants = await monadDeathmatch.getParticipants(1);
    console.log("\nPool #1 participants:", participants);
    console.log("Number of participants:", participants.length);

    // Get pool info
    const pool = await monadDeathmatch.getPool(1);
    console.log("\nPool #1 info:");
    console.log("- Start time:", new Date(Number(pool.startTime) * 1000).toLocaleString());
    console.log("- Last elimination:", pool.lastEliminationTime > 0 ? new Date(Number(pool.lastEliminationTime) * 1000).toLocaleString() : "Not yet");
    console.log("- Total participants:", pool.totalParticipants.toString());
    console.log("- Remaining participants:", pool.remainingParticipants.toString());
    console.log("- Phase:", pool.phase.toString());
    console.log("- Active:", pool.active);

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
