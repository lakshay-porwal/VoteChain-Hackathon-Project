<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=32&pause=1000&color=4F8EF7&center=true&vCenter=true&width=600&lines=🗳️+VoteChain;Decentralized+Voting+System;Secure+%7C+Transparent+%7C+Immutable" alt="Typing SVG" />

<br/>

**A blockchain-based voting platform engineered for trust — where every vote is tamper-proof, publicly verifiable, and permanently recorded on the Ethereum blockchain.**

<br/>

[![🚀 Live Demo](https://img.shields.io/badge/🚀_Live_Demo-VoteChain-4F8EF7?style=for-the-badge&logoColor=white)](https://vote-chain-hackathon-project.vercel.app/)
[![MIT License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.x-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.x-F0C519?style=for-the-badge)](https://hardhat.org/)

<br/>

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
| ⚡ **Blazing Fast UI** | React + Vite for a snappy, modern, mobile-friendly interface |
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

### 🧰 Tools
| Tool | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **npm** | Package manager |
| **ESLint** | Code quality & linting |

---

## 🔄 System Flowchart

```
          ┌─────────────────────────┐
          │       User / Voter       │
          └───────────┬─────────────┘
                      │
                      ▼
          ┌─────────────────────────┐
          │   Face Authentication   │ ◄─── ❌ Failed ──► Access Denied
          │   (Biometric Verify)    │
          └───────────┬─────────────┘
                   ✅ │
                      ▼
          ┌─────────────────────────┐
          │   Voter ID Verification │ ◄─── ❌ Invalid ──► Not Eligible
          │   (On-chain check)      │
          └───────────┬─────────────┘
                   ✅ │
                      ▼
          ┌─────────────────────────┐
          │   Connect MetaMask      │ ◄─── ❌ No wallet ──► Prompt Reconnect
          │   Wallet via Web3.js    │
          └───────────┬─────────────┘
                   ✅ │
                      ▼
          ┌─────────────────────────┐
          │   Load Candidates       │
          │   (Read contract state) │
          └───────────┬─────────────┘
                      │
                      ▼
          ┌─────────────────────────┐
          │   User Selects &        │
          │   Casts Vote            │
          │   (Web3 transaction)    │
          └───────────┬─────────────┘
                      │
                      ▼
          ┌─────────────────────────┐
          │   MetaMask Approved?    │ ◄─── ❌ No ──► Transaction Rejected
          └───────────┬─────────────┘
                   ✅ │
                      ▼
          ┌─────────────────────────┐
          │   Smart Contract        │
          │   Validates Vote        │
          └───────────┬─────────────┘
                      │
                      ▼
          ┌─────────────────────────┐
          │   Already Voted?        │ ◄─── ✅ Yes ──► Tx Reverted / Duplicate Blocked
          └───────────┬─────────────┘
                   ❌ │ No
                      ▼
          ┌─────────────────────────┐
          │   ✅ Vote Recorded!     │
          │   Immutable & Publicly  │
          │   Verifiable on-chain   │
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

## ⚙️ Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **npm**
- **MetaMask** browser extension
- A webcam *(for face authentication)*

---

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

The app will be live at → `http://localhost:5173`

---

### 🔗 Deploy Smart Contracts *(Optional)*

```bash
# Compile contracts
npx hardhat compile

# Start a local Hardhat node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

---

## 🌐 Live Deployment

> ✅ The app is deployed and live! Try it out:

**🔗 [https://vote-chain-hackathon-project.vercel.app/](https://vote-chain-hackathon-project.vercel.app/)**

---

## 👥 Contributors

<table>
  <tr>
    <td align="center" width="200">
      <a href="https://github.com/lakshay-porwal">
        <img src="https://github.com/lakshay-porwal.png" width="80" style="border-radius:50%"/><br/>
        <b>⭐ Lakshay Porwal</b><br/>
        <sub>🚀 Lead Developer & Architect</sub><br/>
        <sub>Built the full system end-to-end,<br/>led the team & drove the vision</sub>
      </a>
    </td>
    <td align="center" width="200">
      <a href="https://github.com/Akshatsrii">
        <img src="https://github.com/Akshatsrii.png" width="80" style="border-radius:50%"/><br/>
        <b>Akshat Srivastava</b><br/>
        <sub>⛓️ Smart Contracts</sub>
      </a>
    </td>
    <td align="center" width="200">
      <a href="https://github.com/Riyaban583">
        <img src="https://github.com/Riyaban583.png" width="80" style="border-radius:50%"/><br/>
        <b>Riya Bansal</b><br/>
        <sub>🎨 Frontend Developer</sub>
      </a>
    </td>
    <td align="center" width="200">
      <a href="https://github.com/omgupta4546">
        <img src="https://github.com/omgupta4546.png" width="80" style="border-radius:50%"/><br/>
        <b>Om Gupta</b><br/>
        <sub>🌐 Web3 Integration</sub>
      </a>
    </td>
  </tr>
</table>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ by the **VoteChain Team**
*Making democracy trustless, one block at a time.*

</div>
