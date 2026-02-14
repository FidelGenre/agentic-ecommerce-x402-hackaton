import { coinbaseWallet as coinbaseWalletConnector } from 'wagmi/connectors';
import { Wallet, WalletDetailsParams } from '@rainbow-me/rainbowkit';
import { CreateConnectorFn } from 'wagmi';
import coinbaseIcon from './coinbase-icon';

export interface CoinbaseWalletOptions {
    appName: string;
    appLogoUrl?: string;
    preference?: 'smartWalletOnly' | 'all' | 'eoaOnly';
}

export const coinbaseSmartWallet = ({
    appName,
    appLogoUrl,
    preference = 'smartWalletOnly',
}: CoinbaseWalletOptions): Wallet => ({
    id: 'coinbase-smart-wallet',
    name: 'Coinbase Smart Wallet',
    shortName: 'Smart Wallet',
    iconUrl: async () => coinbaseIcon,
    iconBackground: '#0052FF',
    downloadUrls: {
        android: 'https://play.google.com/store/apps/details?id=org.toshi',
        ios: 'https://apps.apple.com/us/app/coinbase-wallet-nfts-crypto/id1278383455',
        mobile: 'https://coinbase.com/wallet/downloads',
        qrCode: 'https://coinbase.com/wallet/downloads',
        chrome: 'https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad',
        browserExtension: 'https://coinbase.com/wallet',
    },
    createConnector: (walletDetails: WalletDetailsParams) => {
        const createCoinbaseConnector = coinbaseWalletConnector({
            appName,
            appLogoUrl,
            preference,
        });

        return (config) => ({
            ...createCoinbaseConnector(config),
            ...walletDetails,
        });
    },
});
