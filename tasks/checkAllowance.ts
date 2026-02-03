import { task, types } from "hardhat/config";

task("check-allowance", "Check ERC20 allowance and balance for an owner/spender pair")
  .addParam("token", "ERC20 token address")
  .addParam("owner", "Token owner address")
  .addParam("spender", "Spender address")
  .addOptionalParam("decimals", "Token decimals", 18, types.int)
  .setAction(async (args, hre) => {
    const decimals = Number(args.decimals);
    if (!Number.isInteger(decimals) || decimals < 0) {
      throw new Error("decimals must be a non-negative integer");
    }

    const token = await hre.ethers.getContractAt("MockERC20", args.token);
    const allowance = await token.allowance(args.owner, args.spender);
    const balance = await token.balanceOf(args.owner);

    console.log(`Allowance: ${allowance.toString()} (${hre.ethers.formatUnits(allowance, decimals)})`);
    console.log(`Balance:   ${balance.toString()} (${hre.ethers.formatUnits(balance, decimals)})`);
  });
