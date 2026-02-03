import { task, types } from "hardhat/config";

task("approve-token", "Approve an ERC20 allowance for a spender")
  .addParam("token", "ERC20 token address")
  .addParam("spender", "Spender address")
  .addParam("amount", "Amount in whole tokens")
  .addOptionalParam("decimals", "Token decimals", 18, types.int)
  .setAction(async (args, hre) => {
    const decimals = Number(args.decimals);
    if (!Number.isInteger(decimals) || decimals < 0) {
      throw new Error("decimals must be a non-negative integer");
    }

    const token = await hre.ethers.getContractAt("MockERC20", args.token);
    const amountUnits = hre.ethers.parseUnits(args.amount, decimals);
    const tx = await token.approve(args.spender, amountUnits);
    await tx.wait();

    console.log(`Approved ${args.amount} (decimals=${decimals}) for ${args.spender}`);
  });
