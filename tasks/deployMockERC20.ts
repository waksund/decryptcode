import { task, types } from "hardhat/config";

task("deploy-mock-erc20", "Deploy MockERC20")
  .addParam("tokenName", "Token name")
  .addParam("tokenSymbol", "Token symbol")
  .addParam("initialSupply", "Initial supply in whole tokens")
  .addOptionalParam("mintTo", "Address to mint to")
  .addOptionalParam("mintAmount", "Amount to mint in whole tokens")
  .addOptionalParam("decimals", "Token decimals", 18, types.int)
  .setAction(async (args, hre) => {
    const decimals = Number(args.decimals);
    if (!Number.isInteger(decimals) || decimals < 0) {
      throw new Error("decimals must be a non-negative integer");
    }

    const initialSupplyUnits = hre.ethers.parseUnits(args.initialSupply, decimals);
    const factory = await hre.ethers.getContractFactory("MockERC20");
    const token = await factory.deploy(args.tokenName, args.tokenSymbol, initialSupplyUnits);
    await token.waitForDeployment();

    const tokenAddress = await token.getAddress();
    console.log(`MockERC20 deployed to: ${tokenAddress}`);
    console.log(
      `name=${args.tokenName} symbol=${args.tokenSymbol} initialSupply=${args.initialSupply} decimals=${decimals}`
    );

    if (args.mintTo && args.mintAmount) {
      const mintTx = await token.mint(
        args.mintTo,
        hre.ethers.parseUnits(args.mintAmount, decimals)
      );
      await mintTx.wait();
      console.log(`Minted ${args.mintAmount} to ${args.mintTo}`);
    } else if (args.mintTo || args.mintAmount) {
      console.warn("Both mintTo and mintAmount are required to mint.");
    }
  });
