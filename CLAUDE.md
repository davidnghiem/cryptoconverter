# Crypto Converter Project

A static web application for converting between cryptocurrency denominations and displaying live gas prices.

## Tech Stack
- **HTML5** - Structure
- **Tailwind CSS** (CDN) - Styling
- **Vanilla JavaScript** - Logic and API calls
- No build step required

## File Structure
```
/crypto
├── index.html    # Main page
├── app.js        # Conversion logic + API calls
├── styles.css    # Custom CSS (minimal)
└── CLAUDE.md     # This file
```

## Features

### Unit Converters
- **Solana**: SOL ↔ Lamports (1 SOL = 1,000,000,000 Lamports)
- **Ethereum**: ETH ↔ Gwei (1 ETH = 1,000,000,000 Gwei)
- **Bitcoin**: BTC ↔ Satoshis (1 BTC = 100,000,000 Satoshis)

### Live Gas Prices
Auto-refreshes every 30 seconds.

| Chain    | API Source                          | Unit            |
|----------|-------------------------------------|-----------------|
| Ethereum | beaconcha.in / etherscan fallback   | Gwei            |
| Solana   | Solana mainnet RPC                  | Micro-lamports  |
| Bitcoin  | mempool.space                       | sat/vB          |

## API Endpoints

### Ethereum Gas
```
GET https://beaconcha.in/api/v1/execution/gasnow
Fallback: https://api.etherscan.io/api?module=gastracker&action=gasoracle
```

### Bitcoin Fees
```
GET https://mempool.space/api/v1/fees/recommended
```

### Solana Priority Fees
```
POST https://api.mainnet-beta.solana.com
Body: {"jsonrpc":"2.0","id":1,"method":"getRecentPrioritizationFees","params":[]}
```

## Running Locally
Simply open `index.html` in a web browser. No server required for basic functionality.

For a local dev server (optional):
```bash
npx serve .
# or
python -m http.server 8000
```

## Notes
- All APIs are free and don't require API keys
- CORS: Some APIs may fail when opened as a local file. Use a local server if needed.
- Gas prices show Low/Standard/Fast tiers for each chain
