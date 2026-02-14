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
                                        <button onClick={openConnectModal} type="button" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-1.5 list-none transition-all font-bold text-[10px] md:text-xs shadow-lg shadow-blue-500/20 border-none flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                            Connect
                                        </button>
                                    );
                                }

                                if (chain.unsupported) {
                                    return (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={openChainModal}
                                                type="button"
                                                className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-full px-3 py-1 font-mono text-[9px] hover:bg-red-500/20 transition-colors flex items-center gap-2"
                                            >
                                                <span className="relative flex h-1.5 w-1.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                                                </span>
                                                Wrong Net
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button
                                            onClick={openAccountModal}
                                            type="button"
                                            className="group flex items-center gap-2 px-3 py-1.5 rounded-full glass glow-border cursor-pointer hover:border-blue-500/30 transition-all text-[10px] md:text-px font-bold"
                                        >
                                            <div className="relative flex h-1.5 w-1.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                                            </div>
                                            <span className="truncate max-w-[60px] md:max-w-none">{account.displayName}</span>
                                            <span className="opacity-60 hidden md:inline">
                                                {account.displayBalance ? ` (${account.displayBalance})` : ''}
                                            </span>
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
