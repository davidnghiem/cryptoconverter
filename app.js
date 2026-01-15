// Conversion Constants
const LAMPORTS_PER_SOL = 1_000_000_000;
const GWEI_PER_ETH = 1_000_000_000;
const WEI_PER_ETH = 1_000_000_000_000_000_000n; // Use BigInt for precision
const WEI_PER_GWEI = 1_000_000_000;
const SATS_PER_BTC = 100_000_000;

// DOM Elements
const solInput = document.getElementById('sol-input');
const lamportsInput = document.getElementById('lamports-input');
const ethInput = document.getElementById('eth-input');
const ethSubInput = document.getElementById('eth-sub-input');
const ethUnitSelect = document.getElementById('eth-unit-select');
const btcInput = document.getElementById('btc-input');
const satsInput = document.getElementById('sats-input');
const refreshBtn = document.getElementById('refresh-btn');
const lastUpdated = document.getElementById('last-updated');

// Conversion Functions
function solToLamports(sol) {
    return Math.round(sol * LAMPORTS_PER_SOL);
}

function lamportsToSol(lamports) {
    return lamports / LAMPORTS_PER_SOL;
}

function ethToGwei(eth) {
    return Math.round(eth * GWEI_PER_ETH);
}

function gweiToEth(gwei) {
    return gwei / GWEI_PER_ETH;
}

function ethToWei(eth) {
    return BigInt(Math.round(eth * 1e18));
}

function weiToEth(wei) {
    return Number(wei) / 1e18;
}

function gweiToWei(gwei) {
    return BigInt(Math.round(gwei * WEI_PER_GWEI));
}

function weiToGwei(wei) {
    return Number(wei) / WEI_PER_GWEI;
}

function btcToSats(btc) {
    return Math.round(btc * SATS_PER_BTC);
}

function satsToBtc(sats) {
    return sats / SATS_PER_BTC;
}

// Format numbers with commas
function formatNumber(num) {
    if (num === '' || isNaN(num)) return '';
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

// Event Listeners for Converters
let isUpdating = false;

solInput.addEventListener('input', (e) => {
    if (isUpdating) return;
    isUpdating = true;
    const sol = parseFloat(e.target.value) || 0;
    lamportsInput.value = sol ? solToLamports(sol) : '';
    isUpdating = false;
});

lamportsInput.addEventListener('input', (e) => {
    if (isUpdating) return;
    isUpdating = true;
    const lamports = parseFloat(e.target.value) || 0;
    const sol = lamportsToSol(lamports);
    solInput.value = lamports ? (sol < 0.000001 ? sol.toExponential(6) : sol) : '';
    isUpdating = false;
});

// Helper to get current ETH unit
function getEthUnit() {
    return ethUnitSelect.value;
}

// Update sub-input based on ETH value
function updateEthSubInput(eth) {
    if (!eth) {
        ethSubInput.value = '';
        return;
    }
    if (getEthUnit() === 'gwei') {
        ethSubInput.value = ethToGwei(eth);
    } else {
        ethSubInput.value = ethToWei(eth).toString();
    }
}

// Update ETH input based on sub-input value
function updateEthFromSubInput(value) {
    if (!value) {
        ethInput.value = '';
        return;
    }
    let eth;
    if (getEthUnit() === 'gwei') {
        eth = gweiToEth(parseFloat(value));
    } else {
        eth = weiToEth(BigInt(value));
    }
    ethInput.value = eth < 0.000001 ? eth.toExponential(6) : eth;
}

ethInput.addEventListener('input', (e) => {
    if (isUpdating) return;
    isUpdating = true;
    const eth = parseFloat(e.target.value) || 0;
    updateEthSubInput(eth);
    isUpdating = false;
});

ethSubInput.addEventListener('input', (e) => {
    if (isUpdating) return;
    isUpdating = true;
    updateEthFromSubInput(e.target.value);
    isUpdating = false;
});

// When dropdown changes, recalculate the sub-input value
ethUnitSelect.addEventListener('change', () => {
    const eth = parseFloat(ethInput.value) || 0;
    updateEthSubInput(eth);
});

btcInput.addEventListener('input', (e) => {
    if (isUpdating) return;
    isUpdating = true;
    const btc = parseFloat(e.target.value) || 0;
    satsInput.value = btc ? btcToSats(btc) : '';
    isUpdating = false;
});

satsInput.addEventListener('input', (e) => {
    if (isUpdating) return;
    isUpdating = true;
    const sats = parseFloat(e.target.value) || 0;
    const btc = satsToBtc(sats);
    btcInput.value = sats ? (btc < 0.000001 ? btc.toExponential(6) : btc) : '';
    isUpdating = false;
});

// Gas Price Fetching Functions
async function fetchEthereumGas() {
    try {
        // Try Beaconcha.in API first (no API key required)
        const response = await fetch('https://beaconcha.in/api/v1/execution/gasnow');
        const data = await response.json();

        if (data.data) {
            // Values come in Wei, convert to Gwei (show 2 decimal places)
            const low = (data.data.slow / 1e9).toFixed(2);
            const standard = (data.data.standard / 1e9).toFixed(2);
            const fast = (data.data.fast / 1e9).toFixed(2);

            document.getElementById('eth-gas-low').textContent = low;
            document.getElementById('eth-gas-standard').textContent = standard;
            document.getElementById('eth-gas-fast').textContent = fast;
            return;
        }
    } catch (error) {
        console.log('Beaconcha.in API failed, trying fallback...');
    }

    try {
        // Fallback to ethgasstation
        const response = await fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle');
        const data = await response.json();

        if (data.result) {
            document.getElementById('eth-gas-low').textContent = data.result.SafeGasPrice;
            document.getElementById('eth-gas-standard').textContent = data.result.ProposeGasPrice;
            document.getElementById('eth-gas-fast').textContent = data.result.FastGasPrice;
            return;
        }
    } catch (error) {
        console.error('Failed to fetch Ethereum gas prices:', error);
    }

    // Show error state
    document.getElementById('eth-gas-low').textContent = 'Error';
    document.getElementById('eth-gas-standard').textContent = 'Error';
    document.getElementById('eth-gas-fast').textContent = 'Error';
}

async function fetchBitcoinFees() {
    try {
        const response = await fetch('https://mempool.space/api/v1/fees/recommended');
        const data = await response.json();

        document.getElementById('btc-gas-economy').textContent = data.economyFee;
        document.getElementById('btc-gas-standard').textContent = data.halfHourFee;
        document.getElementById('btc-gas-fast').textContent = data.fastestFee;
    } catch (error) {
        console.error('Failed to fetch Bitcoin fees:', error);
        document.getElementById('btc-gas-economy').textContent = 'Error';
        document.getElementById('btc-gas-standard').textContent = 'Error';
        document.getElementById('btc-gas-fast').textContent = 'Error';
    }
}

async function fetchSolanaFees() {
    try {
        const response = await fetch('https://api.mainnet-beta.solana.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getRecentPrioritizationFees',
                params: []
            })
        });

        const data = await response.json();

        if (data.result && data.result.length > 0) {
            // Get the fees from recent slots and calculate percentiles
            const fees = data.result
                .map(f => f.prioritizationFee)
                .filter(f => f > 0)
                .sort((a, b) => a - b);

            if (fees.length > 0) {
                const low = fees[Math.floor(fees.length * 0.25)] || fees[0];
                const medium = fees[Math.floor(fees.length * 0.5)] || fees[0];
                const high = fees[Math.floor(fees.length * 0.75)] || fees[fees.length - 1];

                document.getElementById('sol-gas-low').textContent = formatNumber(low);
                document.getElementById('sol-gas-medium').textContent = formatNumber(medium);
                document.getElementById('sol-gas-high').textContent = formatNumber(high);
                return;
            }
        }

        // If no fees found, show base fee message
        document.getElementById('sol-gas-low').textContent = '0';
        document.getElementById('sol-gas-medium').textContent = '100';
        document.getElementById('sol-gas-high').textContent = '1,000';
    } catch (error) {
        console.error('Failed to fetch Solana fees:', error);
        document.getElementById('sol-gas-low').textContent = 'Error';
        document.getElementById('sol-gas-medium').textContent = 'Error';
        document.getElementById('sol-gas-high').textContent = 'Error';
    }
}

// Update timestamp
function updateTimestamp() {
    const now = new Date();
    lastUpdated.textContent = now.toLocaleTimeString();
}

// Fetch all gas prices
async function fetchAllGasPrices() {
    // Add spinning animation to refresh button
    refreshBtn.classList.add('animate-spin');

    await Promise.all([
        fetchEthereumGas(),
        fetchBitcoinFees(),
        fetchSolanaFees()
    ]);

    updateTimestamp();

    // Remove spinning animation
    refreshBtn.classList.remove('animate-spin');
}

// Refresh button handler
refreshBtn.addEventListener('click', fetchAllGasPrices);

// Initial fetch and auto-refresh
fetchAllGasPrices();
setInterval(fetchAllGasPrices, 30000); // Refresh every 30 seconds
