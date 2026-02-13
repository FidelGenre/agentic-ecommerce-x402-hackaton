'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletConnect() {
    return (
        <div className="flex items-center gap-2">
            <ConnectButton.Custom>
                {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                }) => {
                    // Note: If your app doesn't use authentication, you
                    // can remove all 'authenticationStatus' checks
                    const ready = mounted && authenticationStatus !== 'loading';
                    const connected =
                        ready &&
                        account &&
                        chain &&
                        (!authenticationStatus ||
                            authenticationStatus === 'authenticated');

                    return (
                        <div
                            {...(!ready && {
                                'aria-hidden': true,
                                'style': {
                                    opacity: 0,
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                },
                            })}
                        >
                            {(() => {
                                if (!connected) {
                                    return (
                                        <button onClick={openConnectModal} type="button" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 list-none transition-all font-bold text-sm shadow-lg shadow-blue-500/20 border-none flex items-center gap-2">
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                            Connect Wallet
                                        </button>
                                    );
                                }

                                if (chain.unsupported) {
                                    return (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await window.ethereum.request({
                                                            method: 'wallet_addEthereumChain',
                                                            params: [{
                                                                chainId: '0x62e60eb', // 103698795
                                                                chainName: 'SKALE BITE V2 Sandbox',
                                                                nativeCurrency: {
                                                                    name: 'sFUEL',
                                                                    symbol: 'sFUEL',
                                                                    decimals: 18
                                                                },
                                                                rpcUrls: ['https://base-sepolia-testnet.skalenodes.com/v1/bite-v2-sandbox'],
                                                                blockExplorerUrls: ['https://base-sepolia-testnet-explorer.skalenodes.com:10032']
                                                            }]
                                                        });
                                                        // If successful, try to switch
                                                        await window.ethereum.request({
                                                            method: 'wallet_switchEthereumChain',
                                                            params: [{ chainId: '0x62e60eb' }],
                                                        });
                                                    } catch (error) {
                                                        console.error('Failed to add/switch network:', error);
                                                        alert('Failed to add network automatically. Please use the Simulate button if this persists.');
                                                    }
                                                }}
                                                type="button"
                                                className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-full px-4 py-2 font-mono text-xs hover:bg-red-500/20 transition-colors flex items-center gap-2"
                                            >
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                                                </span>
                                                Wrong Network (Click to Fix)
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // Hackathon "God Mode" Bypass
                                                    const event = new CustomEvent('simulate-network-connection');
                                                    window.dispatchEvent(event);
                                                }}
                                                className="bg-blue-500/10 border border-blue-500/50 text-blue-400 rounded-full px-3 py-2 font-mono text-[10px] hover:bg-blue-500/20 transition-colors"
                                            >
                                                [DEV] SIMULATE
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button
                                            onClick={openAccountModal}
                                            type="button"
                                            className="group flex items-center gap-2 px-4 py-2 rounded-full glass glow-border cursor-pointer hover:border-blue-500/30 transition-all"
                                        >
                                            <div className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                            </div>
                                            {account.displayName}
                                            {account.displayBalance
                                                ? ` (${account.displayBalance})`
                                                : ''}
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    );
                }}
            </ConnectButton.Custom>
        </div>
    );
}
