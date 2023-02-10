# Merkle Distribution Proxy

## Get started

1. Install packages
   ```bash
    npm install
   ```

2. Add a .env file with an RPC endpoint to an archive node (Alchemy recommended):
   ```
   MAINNET_RPC_ENDPOINT=https://eth-mainnet.g.alchemy.com/v2/<ALCHEMY_API_KEY>
   GOERLI_RPC_ENDPOINT=https://eth-goerli.g.alchemy.com/v2/<ALCHEMY_API_KEY>
   DEPLOYER_PRIVATE_KEY="<PRIVATE_KEY>"
   ETHERSCAN_KEY="<ETHERSCAN_API_KEY>"
   ```

3. Run the scripts
   ```bash
   npx hardhat run scripts/<script.ts>
   ```

## Scripts
- `example_forking.ts`: deploy on Hardhat network using forking. Contracts and accounts already deployed on mainnet are used (T token, Merkle distribution, council multisig). An actual Merkle tree is used.
- `example_deploying.ts`: deploy on Hardhat network all the contract needed (T token, Merkle distribution...) and use a test Merkle tree.

## Tests
```bash
npx hardhat tests
```

## Deploy
To deploy using Hardhat local network:

```bash
npx hardhat deploy
```

To deploy using Goerli testnet:

```bash
npx hardhat --network goerli deploy
```
