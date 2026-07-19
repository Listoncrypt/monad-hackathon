# Gas Money — Learn DeFi On-Chain on Monad

Gas Money is a learn-by-doing Web3 training playground built on the Monad Testnet. It is designed to solve a fundamental problem in crypto onboarding: DeFi is confusing, and static documentation fails to build the active muscle memory needed to interact with smart contracts securely.

## 💡 The Problem
Most crypto newcomers find concepts like transaction confirmations, native gas fees, ERC-20 approvals, and slippage tolerances abstract and intimidating. 
* **Static Tutorials:** Text guides with outdated screenshots do not teach actual Web3 interactions.
* **Mainnet Risk:** Practicing on Ethereum or other mainnets costs real capital, where simple user experience mistakes can result in permanent loss of funds.

## 🛠️ The Solution
Gas Money is a guided path of **4 interactive quests**. Each quest is a real, on-chain transaction executed directly on the Monad Testnet:
1. **Quest 1: Connect Wallet & Balance Audit** — Teaches connection providers, secure states, and public addresses.
2. **Quest 2: Peer-to-Peer Transfer** — Teaches gas fee deductions and reading transaction receipts on block explorers.
3. **Quest 3: ERC-20 Allowances & Approvals** — Explains the safety barrier of token approvals (`approve` and `transferFrom`) preventing contracts from pulling assets without permission.
4. **Quest 4: AMM Liquidity Swap** — Explains how Automated Market Makers price token swaps, and how slippage limits protect transactions.

Upon completing each quest, users trigger a smart contract transaction that mints a **verifiable badge NFT** directly on-chain as cryptographic proof of their learning.

---

## ⛓️ Deployed Contracts (Monad Testnet)

All smart contracts have been compiled using Hardhat and deployed to the official Monad Testnet (Chain ID: `10143`):

* **QuestBadges NFT Contract:** [`0xA530E9242eDeb983fdB41a82A046C3330A430662`](https://testnet.monadscan.com/address/0xA530E9242eDeb983fdB41a82A046C3330A430662)
  * Manages quest completion states and mints badge proof NFTs.
* **MockToken (GMT - Gas Money Token):** [`0x489e22F71d706c8EBD4Da64C23E0eec6da326720`](https://testnet.monadscan.com/address/0x489e22F71d706c8EBD4Da64C23E0eec6da326720)
  * Standard ERC-20 custom token used for approvals and exchange actions.
* **MockDEX (Automated Market Maker):** [`0x312caE32018fa015940A6112BD6388Cefb63a4bF`](https://testnet.monadscan.com/address/0x312caE32018fa015940A6112BD6388Cefb63a4bF)
  * Simple liquidity pool DEX contract supporting native swaps.

---

## 📁 Repository Structure

```text
monad-hackathon/
├── contracts/             # Solidity Smart Contracts
│   ├── QuestBadges.sol    # NFT badge contract
│   ├── MockToken.sol      # ERC-20 utility token
│   └── MockDEX.sol        # Swap pool contract
├── frontend/              # React (Vite + TSX + Tailwind CSS)
│   ├── src/
│   │   ├── config/        # viem & wagmi client setups
│   │   ├── quests/        # Interactive quest layouts
│   │   └── App.tsx        # Dashboard shell and landing route
├── hardhat.config.ts      # Monad networks configurations
└── package.json           # Root scripts
```

---

## 🚀 Getting Started (Run Locally)

Follow these instructions to run the Gas Money training client on your local machine:

### 1. Clone the Repository
```bash
git clone https://github.com/Listoncrypt/monad-hackathon.git
cd monad-hackathon
```

### 2. Set Up & Run Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run Vite dev server
npm run dev
```

Open **[http://localhost:5174/](http://localhost:5174/)** in your browser (preferably with MetaMask or Rabby installed on the Monad Testnet).

---

## 🔒 Security & Best Practices
* Gas Money uses **free Monad testnet tokens**. No real capital is ever requested or put at risk.
* Interactive explainer overlays appear **before** prompting wallet signatures to teach the user exactly what parameters they are authorizing.

## 📝 License
This project is licensed under the MIT License.
