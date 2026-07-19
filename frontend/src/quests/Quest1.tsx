import { useState, useEffect } from 'react';
import { useAccount, useBalance, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ExternalLink, Check, RefreshCw } from 'lucide-react';
import { QUEST_BADGES_ADDR, questBadgesAbi } from '../config/contracts';

interface Quest1Props {
  onComplete: () => void;
  addLog: (message: string, type?: 'info' | 'success' | 'error') => void;
  openExplainer: (data: any) => void;
}

export function Quest1({ onComplete, addLog, openExplainer }: Quest1Props) {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const [checking, setChecking] = useState(false);
  const [minting, setMinting] = useState(false);
  const [hasCheckedBalance, setHasCheckedBalance] = useState(false);

  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const handleConnect = async () => {
    const hasEthereum = typeof window !== 'undefined' && !!(window as any).ethereum;
    if (!hasEthereum) {
      addLog('No Web3 wallet detected in this browser.', 'error');
      addLog('Please copy http://localhost:5174/ and open it in a browser with a wallet extension (like Google Chrome or Brave with MetaMask/Rabby installed).', 'info');
      return;
    }
    const connectorNames = connectors.map(c => c.name).join(', ');
    addLog(`Detected wallet connectors: ${connectorNames || 'None'}`);
    addLog('Connecting wallet...');
    try {
      if (connectors.length > 0) {
        await connectAsync({ connector: connectors[0] });
      } else {
        addLog('No wallet connectors found.', 'error');
      }
    } catch (e: any) {
      addLog(`Failed to connect wallet: ${e.shortMessage || e.message}`, 'error');
    }
  };

  const handleCheckBalance = () => {
    openExplainer({
      title: 'Querying Native Balance',
      concept: 'State Reads',
      bullets: [
        'Reads your address balance directly from the Monad Testnet state ledger.',
        'This is a read-only query (State View), requiring zero gas fees and zero wallet signatures.',
        'If your balance is greater than 0 MON, you can proceed to mint your badges.'
      ],
      actionLabel: 'RUN BALANCE CHECK',
      onConfirm: async () => {
        setChecking(true);
        addLog('Checking MON balance...');
        if (balance && balance.value > 0n) {
          addLog(`Balance found: ${balance.formatted} MON`, 'success');
          setHasCheckedBalance(true);
          setChecking(false);
        } else {
          addLog('Balance is 0 MON. Please request tokens from the faucet.', 'error');
          setChecking(false);
        }
      }
    });
  };

  const handleMintBadge = () => {
    openExplainer({
      title: 'Minting On-Chain Badge',
      concept: 'State Writes & NFTs',
      bullets: [
        'Triggers a write transaction calling completeQuest(1) on the QuestBadges contract.',
        'Requires gas execution fees paid in native MON to compensate network validators.',
        'Generates an immutable cryptographic badge NFT proving you completed Quest 1.'
      ],
      actionLabel: 'CONFIRM MINT BADGE',
      onConfirm: async () => {
        setMinting(true);
        addLog('Minting Quest 1 Badge...', 'info');
        try {
          const hash = await writeContractAsync({
            address: QUEST_BADGES_ADDR,
            abi: questBadgesAbi,
            functionName: 'completeQuest',
            args: [1],
          });
          setTxHash(hash);
          addLog(`Mint tx sent: ${hash}`, 'info');
        } catch (err: any) {
          addLog(`Minting failed: ${err.shortMessage || err.message}`, 'error');
          setMinting(false);
        }
      }
    });
  };

  useEffect(() => {
    if (isSuccess && txHash) {
      setMinting(false);
      addLog('Quest 1 Badge minted successfully!', 'success');
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [isSuccess, txHash]);

  return (
    <div className="glass-card rounded border border-primary/20 p-6 sm:p-8 shadow-2xl relative overflow-hidden w-full max-w-2xl mx-auto glow-border">
      {/* Absolute bracket highlights in corners */}
      <div className="absolute left-0 top-0 h-3 w-3 border-l border-t border-primary/50" />
      <div className="absolute right-0 top-0 h-3 w-3 border-r border-t border-primary/50" />
      <div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-primary/50" />
      <div className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-primary/50" />
      
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/2 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      {/* Section marker badge */}
      <div className="mb-4 inline-flex items-center gap-2 border border-primary/30 bg-primary-soft px-2.5 py-0.5">
        <span className="h-1.5 w-1.5 bg-primary pulse-soft" />
        <span className="font-mono text-[9px] text-primary uppercase tracking-wider">QUEST_01_INITIALIZE</span>
      </div>

      <h2 className="text-xl mb-3 text-primary font-display font-bold uppercase tracking-tight flex items-center gap-2">
        Quest 1: Get your bearings
      </h2>
      <p className="text-xs text-zinc-400 mb-6 leading-relaxed font-body">
        Connect your wallet and ensure you have some testnet MON. Your wallet address is your public identifier, and your balance is required to pay for transaction gas.
      </p>

      {!isConnected ? (
        <button 
          onClick={handleConnect}
          className="quest-btn-primary font-mono"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="flex flex-col gap-4 font-mono text-xs">
          <div className="text-xs font-mono bg-surface-low p-3 rounded border border-zinc-800 flex justify-between items-center text-zinc-400">
            <span className="truncate">Connected: {address}</span>
            <button onClick={() => disconnect()} className="text-[10px] text-primary hover:text-white underline uppercase tracking-wider pl-2 flex-shrink-0">Disconnect</button>
          </div>
          
          {!txHash ? (
            <div className="flex flex-col gap-3">
              {!hasCheckedBalance ? (
                <button 
                  onClick={handleCheckBalance}
                  disabled={checking}
                  className="quest-btn-primary font-mono text-xs w-max"
                >
                  {checking ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      CHECKING BALANCE...
                    </>
                  ) : (
                    'CHECK MON BALANCE'
                  )}
                </button>
              ) : (
                <button 
                  onClick={handleMintBadge}
                  disabled={minting}
                  className="quest-btn-primary font-mono text-xs w-max"
                >
                  {minting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      MINTING BADGE...
                    </>
                  ) : (
                    'CLAIM QUEST 1 BADGE'
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <a href={`https://testnet.monadscan.com/tx/${txHash}`} target="_blank" rel="noreferrer" className="text-primary hover:text-white underline text-xs flex items-center gap-1.5 font-mono">
                View Mint Tx on Explorer <ExternalLink className="w-3 h-3" />
              </a>
              {isWaiting && <div className="text-zinc-500 text-xs font-mono animate-pulse">Waiting for network confirmation...</div>}
              {isSuccess && (
                <div className="text-primary font-bold text-xs flex items-center gap-1.5 font-mono">
                  BADGE MINTED <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          )}
          
          {(!balance || balance.value === 0n) && !minting && (
            <a href="https://testnet.monad.xyz/" target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1.5 text-xs font-mono">
              Get MON from the testnet faucet <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
