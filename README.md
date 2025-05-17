# Confidential DEX Monorepo

This repository contains a full-stack confidential decentralized exchange (DEX) project on Solana, featuring confidential swaps and liquidity pools using zero-knowledge proofs and Token-2022 confidential balances.

## Project Structure

```
confidential-dex/
├── dex-backend/                # Node.js/NestJS backend for Solana interaction
├── confidential-dex-program/   # Anchor-based Solana smart contract (liquidity pool)
├── confix/                     # Angular frontend for swap and liquidity UI
├── shadow-dex/                 # (Optional) Alternate Angular frontend
├── index.html                  # Demo HTML UI (optional)
└── README.md                   # This file
```

---

## 1. dex-backend

Backend API built with [NestJS](https://nestjs.com/) that:

- Handles confidential swaps and liquidity operations
- Interacts with the Solana blockchain and the Anchor program
- Provides REST endpoints for the frontend

### Setup

```sh
cd dex-backend
npm install
npm run start:dev
```

The backend runs on http://localhost:8888.

---

## 2. confidential-dex-program

Solana smart contract (Anchor framework) implementing:

- Confidential liquidity pools
- AMM swap logic with fees
- Pool initialization, deposit, swap, and pool size queries

### Setup

```sh
cd confidential-dex-program
anchor build
anchor deploy
```

Configure your Anchor.toml and Solana CLI as needed.

---

## 3. confix

Angular frontend for users to:

- Connect wallet
- Swap tokens confidentially
- Add liquidity to pools
- View pool stats and rewards

### Setup

```sh
cd confix
npm install
ng serve
```

Visit http://localhost:4200 in your browser.

---

## Development Workflow

- **Frontend** (`confix`) calls REST endpoints on the **backend** (`dex-backend`)
- **Backend** interacts with the **Solana program** (`confidential-dex-program`) and executes confidential token transfers via CLI
- All swap and liquidity operations are confidential, leveraging Token-2022 and zk-proofs

---

## Key Features

- **Confidential Swaps:** Trade tokens privately using Solana's confidential balances
- **Liquidity Pools:** Provide liquidity and earn rewards, with all amounts encrypted
- **Zero-Knowledge Proofs:** Privacy-preserving transactions with on-chain verifiability
- **Modern UI:** User-friendly Angular frontend

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements or bug fixes.

## License

This project is licensed under the MIT License.
