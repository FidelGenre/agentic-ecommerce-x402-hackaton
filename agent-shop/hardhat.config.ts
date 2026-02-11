import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

const config: HardhatUserConfig = {
    solidity: "0.8.24",
    networks: {
        skaleChaos: {
            url: process.env.NEXT_PUBLIC_SKALE_RPC_URL || "https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix",
            chainId: 1351057110,
            accounts: [DEPLOYER_PRIVATE_KEY],
        },
    },
};

export default config;
