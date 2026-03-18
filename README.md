<div align="center">

# 🗳️ VoteChain

**A blockchain-based voting platform engineered for trust — where every vote is tamper-proof, publicly verifiable, and permanently recorded on the Ethereum blockchain.**

<br/>

[![🚀 Live Demo](https://img.shields.io/badge/🚀_Live_Demo-VoteChain-4F8EF7?style=for-the-badge&logoColor=white)](https://vote-chain-hackathon-project.vercel.app/)
[![MIT License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.x-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.x-F0C519?style=for-the-badge)](https://hardhat.org/)

</div>

---

## 🌟 What is VoteChain?

VoteChain is a **fully decentralized voting system** built on the Ethereum blockchain. It eliminates the risk of vote manipulation, central authority bias, and data breaches that plague traditional e-voting systems. Using **Ethereum smart contracts**, every vote is cryptographically sealed, immutable, and publicly auditable — forever.

> *"Don't trust. Verify."* — The VoteChain philosophy.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔐 **Decentralized Voting** | Powered by Ethereum — no central authority, no single point of failure |
| 🧾 **Immutable Vote Records** | Once cast, votes cannot be altered, deleted, or tampered with |
| 🪪 **Face Authentication** | Biometric face verification to prevent impersonation at login |
| 🪖 **Voter ID Verification** | On-chain Voter ID validation ensures only eligible citizens can vote |
| 🦊 **MetaMask Integration** | Seamless Web3 wallet connection for secure transaction signing |
| 📊 **Transparent Results** | Live, publicly verifiable vote tallies — no black box counting |
| ⚡ **Blazing Fast UI** | React + Vite for a snappy, modern, mobile-friendly experience |
| ⛽ **Gas Optimized** | Smart contracts engineered for minimal transaction costs |

---

## 🛠️ Tech Stack

### 🎨 Frontend
| Technology | Purpose |
|---|---|
| **React 18** | Component-based UI framework |
| **Vite 5** | Lightning-fast build tool & dev server |
| **JavaScript (ES6+)** | Application logic |
| **HTML / CSS** | Markup, layout & styling |

### ⛓️ Blockchain
| Technology | Purpose |
|---|---|
| **Solidity 0.8.x** | Smart contract development |
| **Ethereum** | Decentralized blockchain network |
| **Hardhat 2.x** | Smart contract dev, testing & deployment |
| **Web3.js** | Frontend-to-blockchain interaction layer |

### 🔐 Security & Auth
| Technology | Purpose |
|---|---|
| **Face Authentication** | Biometric login via webcam to prevent impersonation |
| **Voter ID Verification** | On-chain eligibility check before ballot access |
| **MetaMask** | Cryptographic transaction signing via browser wallet |

---

## 🔄 System Flowchart

```
          ┌─────────────────────────┐
          │       User / Voter       │
          └───────────┬─────────────┘
                      ▼
          ┌─────────────────────────┐
          │   Face Authentication   │ ◄── ❌ Failed ──► Access Denied
          └───────────┬─────────────┘
                   ✅ │
                      ▼
          ┌─────────────────────────┐
          │   Voter ID Verification │ ◄── ❌ Invalid ──► Not Eligible
          └───────────┬─────────────┘
                   ✅ │
                      ▼
          ┌─────────────────────────┐
          │   Connect MetaMask      │ ◄── ❌ No wallet ──► Prompt Reconnect
          └───────────┬─────────────┘
                   ✅ │
                      ▼
          ┌─────────────────────────┐
          │   Load Candidates       │
          │   (Read contract state) │
          └───────────┬─────────────┘
                      ▼
          ┌─────────────────────────┐
          │   User Selects &        │
          │   Casts Vote            │
          └───────────┬─────────────┘
                      ▼
          ┌─────────────────────────┐
          │   MetaMask Approved?    │ ◄── ❌ No ──► Transaction Rejected
          └───────────┬─────────────┘
                   ✅ │
                      ▼
          ┌─────────────────────────┐
          │   Already Voted?        │ ◄── ✅ Yes ──► Duplicate Blocked
          └───────────┬─────────────┘
                   ❌ │ No
                      ▼
          ┌─────────────────────────┐
          │  ✅ Vote Recorded!      │
          │  Immutable & Publicly   │
          │  Verifiable On-Chain    │
          └─────────────────────────┘
```

---

## 📂 Project Structure

```
VoteChain/
│── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Route-level page views
│   ├── App.jsx            # Root component & routing
│   └── main.jsx           # Entry point
│── public/                # Static assets
│── contracts/             # Solidity smart contracts
│── scripts/               # Deployment scripts (Hardhat)
│── test/                  # Contract unit tests
│── package.json
│── vite.config.js
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** v16 or higher
- **npm**
- **MetaMask** browser extension
- A webcam *(for face authentication)*

### 🔧 Installation

```bash
# 1. Clone the repository
git clone https://github.com/lakshay-porwal/VoteChain-Hackathon-Project.git

# 2. Navigate into the project
cd VoteChain

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

App runs at → `http://localhost:5173`

### 🔗 Deploy Smart Contracts *(Optional)*

```bash
npx hardhat compile
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

---

## 🌐 Live Demo

> ✅ Deployed and live — try it out right now:

**🔗 [https://vote-chain-hackathon-project.vercel.app/](https://vote-chain-hackathon-project.vercel.app/)**

---

## 👥 Contributors

| Avatar | Name | Role | GitHub |
|:---:|:---|:---|:---:|
| <img src="https://github.com/lakshay-porwal.png" width="48" style="border-radius:50%"/> | **Lakshay Porwal** | 🚀 *Lead Developer & Architect*  | [@lakshay-porwal](https://github.com/lakshay-porwal) |
| <img src="https://github.com/Akshatsrii.png" width="48" style="border-radius:50%"/> | **Akshat Srivastava** | ⛓️ Smart Contracts | [@Akshatsrii](https://github.com/Akshatsrii) |
| <img src="https://github.com/Riyaban583.png" width="48" style="border-radius:50%"/> | **Riya Bansal** | 🎨 Frontend Developer | [@Riyaban583](https://github.com/Riyaban583) |
| <img src="https://github.com/omgupta4546.png" width="48" style="border-radius:50%"/> | **Om Gupta** | 🌐 Web3 Integration | [@omgupta4546](https://github.com/omgupta4546) |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ by  **VoteChain Team**

*Making democracy trustless, one block at a time.*

</div>
