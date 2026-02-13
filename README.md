# Neura Bounty Board PRO

A fully decentralized bounty platform built on Neura Testnet with native ANKR payments and onchain reputation.

## Features

- **Native ANKR Rewards**: Bounties funded directly with native ANKR tokens
- **Secure Escrow**: Smart contract holds funds until winner is awarded
- **Onchain Reputation**: Build verifiable reputation with every bounty won
- **Review Period**: Creators have dedicated time to review submissions
- **Anti-Spam**: One submission per user per bounty

## Smart Contract

**Contract Address**: `0x0000000000000000000000000000000000000000` (Deploy and update)

### Bounty Lifecycle

1. **Open**: Creator funds bounty, hunters can submit solutions
2. **Review**: After deadline, creator reviews submissions
3. **Awarded**: Winner selected and paid automatically
4. **Refundable**: If no winner selected by review end, creator can reclaim funds

### Key Functions

- `createBounty(title, description, deadline, reviewPeriod)` - Create and fund a bounty
- `submitSolution(bountyId, evidence, note)` - Submit a solution
- `awardWinner(bountyId, winner)` - Award winner and pay reward
- `cancelBounty(bountyId)` - Cancel bounty with no submissions
- `claimRefund(bountyId)` - Claim refund after review period expires

## Deployment

### 1. Deploy Smart Contract

Use Remix IDE or Hardhat to deploy `contracts/NeuraBountyBoard.sol` to Neura Testnet:

- **Network**: Neura Testnet
- **Chain ID**: 2040
- **RPC**: https://rpc.ankr.com/neura_testnet
- **Explorer**: https://explorer.neura.network

### 2. Update Contract Address

After deployment, update the contract address in `src/config/contract.ts`:

```typescript
export const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS'
```

### 3. Run Frontend

```bash
npm install
npm run dev
```

## Network Configuration

- **Network Name**: Neura Testnet
- **Chain ID**: 2040
- **Currency**: ANKR
- **RPC URL**: https://rpc.ankr.com/neura_testnet
- **Block Explorer**: https://explorer.neura.network

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Web3**: ethers.js v6
- **Smart Contract**: Solidity 0.8.19

## License

MIT
