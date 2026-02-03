import { ethers } from "hardhat";

async function main() {
  const factory = await ethers.getContractFactory("TokenVault");
  const vault = await factory.deploy();
  await vault.waitForDeployment();

  const address = await vault.getAddress();
  console.log(`TokenVault deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
