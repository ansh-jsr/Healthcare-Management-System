# 🏥 Blockchain-Based Healthcare Management System

A decentralized Healthcare Management System built using **Blockchain technology** for secure data handling and **MetaMask-based authentication**.  
The system enables patients, doctors, and administrators to interact with healthcare records in a **secure, transparent, and tamper-proof** manner.

---

## 🚀 Key Features

- 🔐 Blockchain-based authentication using MetaMask
- 🧾 Secure storage and retrieval of healthcare records
- 👨‍⚕️ Patient, doctor, and admin role management
- 📄 Medical document upload and access control
- 🔔 Notifications and appointment management
- 🧠 Smart contracts for trust and data integrity
- 🌐 Full-stack application (Frontend + Backend)

---

## 🛠 Tech Stack

### Frontend
- Angular
- TypeScript
- MetaMask Wallet Integration
- Web3.js / Ethers.js

### Backend
- Node.js
- Express.js
- REST APIs
- JWT (where applicable)
- File upload handling

### Blockchain
- Solidity Smart Contracts
- Ethereum-compatible network (Local / Testnet)
- MetaMask Extension

---

## 🔐 Authentication Flow (MetaMask)

1. User connects MetaMask wallet
2. Wallet address is used as identity
3. Message signing verifies ownership
4. Blockchain ensures tamper-proof authentication
5. Access granted based on wallet role

---

## 📂 Project Structure

Healthcare-Management-System/
│
├── backend/          # Node.js backend
├── front/            # Angular frontend
├── node-backend/     # Additional backend services
├── .gitignore
├── package.json
└── README.md

---

## ⚙️ Prerequisites

- Node.js (v16+ recommended)
- npm
- MetaMask browser extension
- MongoDB / required database (local or cloud)
- Ethereum local network or testnet (Ganache / Sepolia / Goerli)

---

## 🧪 Running the Project Locally

### 1️⃣ Clone the Repository

git clone https://github.com/ansh-jsr/Healthcare-Management-System.git
cd Healthcare-Management-System

---

### 2️⃣ Backend Setup

cd backend
npm install

Create a `.env` file inside `backend/`:

PORT=5000  
DB_URI=your_database_connection_string  
JWT_SECRET=your_jwt_secret  
BLOCKCHAIN_RPC_URL=your_rpc_url  

Start backend server:

npm start

Backend runs on:  
http://localhost:5000

---

### 3️⃣ Frontend Setup

cd ../front
npm install
npm start

Frontend runs on:  
http://localhost:4200

---

### 4️⃣ Smart Contract Deployment (Optional / Required)

- Deploy the Solidity smart contract using:
  - Remix IDE OR
  - Hardhat / Truffle
- Use a local blockchain (Ganache) or testnet
- Update deployed contract address in backend/frontend config

---

### 5️⃣ MetaMask Configuration

- Install MetaMask browser extension
- Import test account or create a new one
- Connect MetaMask to:
  - Local network (Ganache), OR
  - Ethereum testnet
- Ensure wallet is unlocked before login

---

## 🧩 Important Notes

- `.env` files are intentionally excluded from the repository
- Uploaded files are stored locally and not tracked by Git
- Blockchain wallet is required to authenticate users
- Each developer must configure their own environment

---

## 🛡 Security

- No private keys are stored on the server
- Authentication is wallet-based
- Smart contracts ensure data integrity
- Environment variables protect sensitive data

---

## 🤝 Contributing

1. Fork the repository
2. Create a new branch
3. Commit changes
4. Open a Pull Request

---

## 📄 License

This project is for educational and research purposes.

---

## 📬 Contact

GitHub: https://github.com/ansh-jsr

---

⭐ If you find this project useful, please consider giving it a star!
