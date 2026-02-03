// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title TokenVault
/// @notice Simple ERC20 vault that tracks per-user balances per token.
/// @dev Uses OpenZeppelin Ownable, Pausable, and ReentrancyGuard for safety.
contract TokenVault is Ownable, Pausable, ReentrancyGuard {

    /// @notice Total tokens held by the vault for each ERC20 token address.
    mapping(address => uint256) public total;
    /// @notice User balances per token address.
    mapping(address => mapping(address => uint256)) public balances;

    /// @notice Emitted when a user deposits tokens into the vault.
    /// @param user The address that performed the deposit.
    /// @param token The ERC20 token address.
    /// @param amount The amount of tokens deposited.
    /// @param timestamp The block timestamp when the deposit was recorded.
    event Deposit(address indexed user, address indexed token, uint256 amount, uint256 timestamp);
    /// @notice Emitted when a user withdraws tokens from the vault.
    /// @param user The address that performed the withdrawal.
    /// @param token The ERC20 token address.
    /// @param amount The amount of tokens withdrawn.
    /// @param timestamp The block timestamp when the withdrawal was recorded.
    event Withdrawal(address indexed user, address indexed token, uint256 amount, uint256 timestamp);

    constructor() Ownable(msg.sender) {}

    /// @notice Get the total tokens held by the vault for a specific ERC20.
    /// @param tokenAddress The ERC20 token address.
    function totalDeposits(address tokenAddress) external view returns (uint256) {
        return total[tokenAddress];
    }

    /// @notice Get the user's balance in the vault for a specific ERC20.
    /// @param user The user address.
    /// @param tokenAddress The ERC20 token address.
    function balanceOf(address user, address tokenAddress) external view returns (uint256) {
        return balances[user][tokenAddress];
    }

    /// @notice Deposit ERC20 tokens into the vault.
    /// @param tokenAddress The ERC20 token address.
    /// @param amount The amount to deposit.
    /// @dev Requires allowance for this contract and is disabled when paused.
    function deposit(address tokenAddress, uint256 amount) public whenNotPaused nonReentrant {
        require(IERC20(tokenAddress).allowance(msg.sender, address(this)) >= amount, "InsufficientAllowance");
        total[tokenAddress] += amount;
        balances[msg.sender][tokenAddress] += amount;
        SafeERC20.safeTransferFrom(IERC20(tokenAddress), msg.sender, address(this), amount);
        emit Deposit(msg.sender, tokenAddress, amount, block.timestamp);
    }

    /// @notice Withdraw ERC20 tokens from the vault.
    /// @param tokenAddress The ERC20 token address.
    /// @param amount The amount to withdraw.
    /// @dev Requires sufficient balance and is disabled when paused.
    function withdraw(address tokenAddress, uint256 amount) public whenNotPaused nonReentrant {
        require(amount > 0 && balances[msg.sender][tokenAddress] >= amount, "InsufficientFunds");
        total[tokenAddress] -= amount;
        balances[msg.sender][tokenAddress] -= amount;
        SafeERC20.safeTransfer(IERC20(tokenAddress), msg.sender, amount);
        emit Withdrawal(msg.sender, tokenAddress, amount, block.timestamp);
    }

    /// @notice Pause deposits and withdrawals.
    /// @dev Only callable by the contract owner.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause deposits and withdrawals.
    /// @dev Only callable by the contract owner.
    function unpause() external onlyOwner {
        _unpause();
    }
}
