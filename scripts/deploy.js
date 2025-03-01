const hre = require("hardhat");

async function main() {
  const MonadDeathmatch = await hre.ethers.getContractFactory("MonadDeathmatch");
  console.log("Deploying MonadDeathmatch...");
  
  const monadDeathmatch = await MonadDeathmatch.deploy();
  await monadDeathmatch.waitForDeployment();
  
  const address = await monadDeathmatch.getAddress();
  console.log("MonadDeathmatch deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
