import { expect } from "chai";
import { ethers } from "hardhat";
import type { ContractTransactionReceipt, Log } from "ethers";
import type { MockERC20, TokenVault } from "../typechain-types";
import { MockERC20__factory, TokenVault__factory } from "../typechain-types";

type DeployFixture = {
  owner: Awaited<ReturnType<typeof ethers.getSigners>>[number];
  user: Awaited<ReturnType<typeof ethers.getSigners>>[number];
  other: Awaited<ReturnType<typeof ethers.getSigners>>[number];
  vault: TokenVault;
  token: MockERC20;
  userAmount: bigint;
};

async function getEventArgs(
  receipt: ContractTransactionReceipt,
  contract: { interface: { parseLog: (log: Log) => { name: string; args: any } } },
  eventName: string
) {
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log as Log);
      if (parsed && parsed.name === eventName) {
        return parsed.args;
      }
    } catch (error) {
      // Not a log from this contract, skip.
    }
  }
  throw new Error(`Event ${eventName} not found in receipt`);
}

describe("TokenVault", function () {
  async function deployFixture(): Promise<DeployFixture> {
    const [owner, user, other] = await ethers.getSigners();

    const vault = (await new TokenVault__factory(owner).deploy()) as TokenVault;

    const initialSupply = ethers.parseUnits("1000000", 18);
    const token = (await new MockERC20__factory(owner).deploy(
      "Mock Token",
      "MOCK",
      initialSupply
    )) as MockERC20;

    const userAmount = ethers.parseUnits("1000", 18);
    await token.mint(user.address, userAmount);

    return { owner, user, other, vault, token, userAmount };
  }

  it("tracks deposits and emits Deposit with the block timestamp", async function () {
    const { user, vault, token } = await deployFixture();
    const amount = ethers.parseUnits("100", 18);

    await token.connect(user).approve(await vault.getAddress(), amount);
    const tx = await vault.connect(user).deposit(await token.getAddress(), amount);
    const receipt = (await tx.wait()) as ContractTransactionReceipt;
    const block = await ethers.provider.getBlock(receipt.blockNumber);

    const total = await vault.totalDeposits(await token.getAddress());
    const balance = await vault.balanceOf(user.address, await token.getAddress());
    expect(total).to.equal(amount);
    expect(balance).to.equal(amount);

    const args = await getEventArgs(receipt, vault, "Deposit");
    expect(args.user).to.equal(user.address);
    expect(args.token).to.equal(await token.getAddress());
    expect(args.amount).to.equal(amount);
    expect(args.timestamp).to.equal(block?.timestamp);
  });

  it("tracks withdrawals and emits Withdrawal with the block timestamp", async function () {
    const { user, vault, token } = await deployFixture();
    const amount = ethers.parseUnits("100", 18);
    const withdrawAmount = ethers.parseUnits("40", 18);

    await token.connect(user).approve(await vault.getAddress(), amount);
    await vault.connect(user).deposit(await token.getAddress(), amount);

    const tx = await vault.connect(user).withdraw(await token.getAddress(), withdrawAmount);
    const receipt = (await tx.wait()) as ContractTransactionReceipt;
    const block = await ethers.provider.getBlock(receipt.blockNumber);

    const total = await vault.totalDeposits(await token.getAddress());
    const balance = await vault.balanceOf(user.address, await token.getAddress());
    expect(total).to.equal(amount - withdrawAmount);
    expect(balance).to.equal(amount - withdrawAmount);

    const args = await getEventArgs(receipt, vault, "Withdrawal");
    expect(args.user).to.equal(user.address);
    expect(args.token).to.equal(await token.getAddress());
    expect(args.amount).to.equal(withdrawAmount);
    expect(args.timestamp).to.equal(block?.timestamp);
  });

  it("reverts on deposit without sufficient allowance", async function () {
    const { user, vault, token } = await deployFixture();
    const amount = ethers.parseUnits("10", 18);

    await expect(vault.connect(user).deposit(await token.getAddress(), amount)).to.be.revertedWith(
      "InsufficientAllowance"
    );
  });

  it("reverts on withdrawal with insufficient balance or zero amount", async function () {
    const { user, vault, token } = await deployFixture();
    const amount = ethers.parseUnits("10", 18);

    await token.connect(user).approve(await vault.getAddress(), amount);
    await vault.connect(user).deposit(await token.getAddress(), amount);

    await expect(
      vault.connect(user).withdraw(await token.getAddress(), amount + 1n)
    ).to.be.revertedWith("InsufficientFunds");
    await expect(vault.connect(user).withdraw(await token.getAddress(), 0)).to.be.revertedWith(
      "InsufficientFunds"
    );
  });

  it("allows only the owner to pause/unpause and blocks actions while paused", async function () {
    const { owner, user, other, vault, token } = await deployFixture();
    const amount = ethers.parseUnits("10", 18);

    await expect(vault.connect(other).pause()).to.be.revertedWithCustomError(
      vault,
      "OwnableUnauthorizedAccount"
    );

    await vault.connect(owner).pause();
    expect(await vault.paused()).to.equal(true);

    await token.connect(user).approve(await vault.getAddress(), amount);
    await expect(vault.connect(user).deposit(await token.getAddress(), amount)).to.be.revertedWithCustomError(
      vault,
      "EnforcedPause"
    );
    await expect(
      vault.connect(user).withdraw(await token.getAddress(), amount)
    ).to.be.revertedWithCustomError(vault, "EnforcedPause");

    await expect(vault.connect(other).unpause()).to.be.revertedWithCustomError(
      vault,
      "OwnableUnauthorizedAccount"
    );
    await vault.connect(owner).unpause();
    expect(await vault.paused()).to.equal(false);
  });
});
