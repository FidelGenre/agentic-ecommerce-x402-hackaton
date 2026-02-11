import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying ServiceMarketplace to SKALE Chaos Testnet...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "sFUEL\n");

  const ServiceMarketplace = await ethers.getContractFactory("ServiceMarketplace");
  const marketplace = await ServiceMarketplace.deploy();
  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();
  console.log("✅ ServiceMarketplace deployed to:", address);
  console.log("\n📋 Save this address in your .env.local as:");
  console.log(`   NEXT_PUBLIC_MARKETPLACE_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
