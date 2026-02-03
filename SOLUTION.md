# Solution Documentation

Please provide a brief explanation of your approach, design decisions, and any assumptions you made while completing the assessment.

## Approach

<!-- Describe your overall approach to solving all three tasks -->

## Task 1: Smart Contract

Implemented a simple ERC20 vault that tracks per-user balances per token, exposes `balanceOf` and `totalDeposits` getters, emits deposit/withdraw events, and uses OpenZeppelin Ownable/Pausable/ReentrancyGuard for safety. Added deployment tooling: a TokenVault deploy script and task, plus a MockERC20 deploy task that supports initial minting and optional extra minting for test flows.

## Task 2: Backend API Configuration

Configured the Express backend to connect to the deployed TokenVault contract via RPC and updated the ABI to the compiled contract artifact. Added accurate gas estimation via ethers v6 and improved error messages for common vault reverts (InsufficientFunds/InsufficientAllowance). The backend now exposes working read and estimate endpoints against the deployed contract.

## Task 3: Next.js Frontend

Connected the prebuilt Next.js UI to the backend API and wired MetaMask flow. The vault page now sends `userAddress` for gas estimation and supports executing deposit/withdraw transactions directly via MetaMask using the configured contract address.

## Design Decisions

<!-- Explain key design choices across all components -->

## Integration

<!-- How do the three components work together? -->

## Handy Hardhat Tasks

Added simple Hardhat tasks to streamline local testing:
- `deploy-mock-erc20` to deploy a test token with initial supply
- `approve-token` to grant vault allowance
- `check-allowance` to verify allowance and balance for an owner/spender

## Assumptions

<!-- List any assumptions you made -->

## Challenges & Solutions

<!-- Describe any challenges you encountered and how you solved them -->

## Setup Instructions

<!-- Provide step-by-step instructions to run your solution -->

### Smart Contract
```bash
# Your instructions here
```

### Backend API Configuration
```bash
# Create backend/.env
PORT=4000
RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=<TOKEN_VAULT_ADDRESS>

# Update ABI in backend/src/config/blockchain.js
# (copied from artifacts/contracts/TokenVault.sol/TokenVault.json)

# Run backend
cd backend
npm run dev
```

### Next.js Frontend
```bash
# Create frontend/.env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_CONTRACT_ADDRESS=<TOKEN_VAULT_ADDRESS>
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_NETWORK_NAME=HARDHAT
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

# Run frontend
cd frontend
npm run dev
```

## Additional Notes

<!-- Any other information you'd like to share -->
