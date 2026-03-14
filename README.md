# 🗳️ VoteChain – Decentralized Voting System

> A blockchain-based decentralized voting platform designed to ensure **security, transparency, and immutability** in the voting process. It uses **Ethereum smart contracts** for tamper-proof vote recording and a **React + Vite frontend** for a fast and modern user experience.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.x-blue)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-blue)](https://vitejs.dev/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.x-blue)](https://hardhat.org/)

---

## 🚀 Features

- 🔐 **Decentralized voting** using Ethereum blockchain
- 🧾 **Immutable on-chain vote storage** — no tampering possible
- ⚡ **Fast frontend** with React and Vite
- 🔄 **Optimized gas usage** in smart contracts
- 🌐 **Web3 integration** for seamless blockchain interaction
- 📊 **Transparent and verifiable** voting results
- 🦊 **MetaMask** wallet support

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React | UI framework |
| Vite | Build tool & dev server |
| JavaScript | Application logic |
| HTML / CSS | Markup & styling |

### Blockchain
| Technology | Purpose |
|------------|---------|
| Solidity | Smart contract language |
| Ethereum | Blockchain network |
| Hardhat | Development & testing framework |
| Web3.js | Blockchain interaction library |

### Tools
| Tool | Purpose |
|------|---------|
| Node.js | JavaScript runtime |
| npm | Package manager |
| ESLint | Code linting |
| MetaMask | Wallet provider |

---

## 📂 Project Structure

```
VoteChain/
│── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Route-level page views
│   ├── App.jsx            # Root component & routing
│   └── main.jsx           # Entry point
│
│── public/                # Static assets
│── contracts/             # Solidity smart contracts
│── scripts/               # Deployment scripts (Hardhat)
│── test/                  # Contract unit tests
│── package.json
│── vite.config.js
└── README.md
```

---

## 🔄 System Flowchart

```
          ┌─────────────────────┐
          │     User / Voter     │
          └──────────┬──────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │  Connect MetaMask   │
          │  Wallet via Web3.js │
          └──────────┬──────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │  Wallet Connected?  │◄─── No ──► Show Error / Prompt Reconnect
          └──────────┬──────────┘
                  Yes│
                     ▼
          ┌─────────────────────┐
          │   Load Candidates   │
          │ (Read contract state)│
          └──────────┬──────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │  User Selects &     │
          │  Casts Vote         │
          │  (Web3 transaction) │
          └──────────┬──────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │  MetaMask Approved? │◄─── No ──► Transaction Rejected / Notify Voter
          └──────────┬──────────┘
                  Yes│
                     ▼
          ┌─────────────────────┐
          │  Ethereum Smart     │
          │  Contract Executes  │
          │  (Validates vote)   │
          └──────────┬──────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │  Already Voted?     │◄─── Yes ─► Tx Reverted / Duplicate Blocked
          └──────────┬──────────┘
                  No │
                     ▼
          ┌─────────────────────┐
          │  ✅ Vote Recorded   │
          │  Immutable &        │
          │  Publicly Verifiable│
          └─────────────────────┘
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm**
- **MetaMask** browser extension (for blockchain interaction)

---

### 🔧 Installation

**1. Clone the repository:**
```bash
git clone https://github.com/lakshay-porwal/VoteChain-Hackathon-Project.git
```

**2. Navigate to the project directory:**
```bash
cd VoteChain
```

**3. Install dependencies:**
```bash
npm install
```

**4. Start the development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

### 🔗 Deploy Smart Contracts (Optional)

**Compile contracts:**
```bash
npx hardhat compile
```

**Start a local Hardhat node:**
```bash
npx hardhat node
```

**Deploy to local network:**
```bash
npx hardhat run scripts/deploy.js --network localhost
```

---

## 📈 Future Enhancements

- [ ] Role-based access control (Admin / Voter)
- [ ] Wallet-based voter authentication with on-chain eligibility checks
- [ ] Live election result dashboard with real-time vote tallies
- [ ] Support for multiple simultaneous elections
- [ ] IPFS integration for decentralized storage (candidate metadata, images)

---

## 👥 Contributors

| Name | Role | GitHub |
|------|------|--------|
| **Lakshay Porwal** | Lead Developer | [GitHub](https://github.com/lakshay-porwal) |
| **Akshat Srivastava** | Smart Contracts | [GitHub](https://github.com/Akshatsrii) |
| **Riya Bansal** | Frontend Developer | [GitHub](https://github.com/Riyaban583) |
| **Om Gupta** | Web3 Integration | [GitHub](https://github.com/omgupta4546) |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with ❤️ by the VoteChain Team</p>
