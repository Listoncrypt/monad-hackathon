import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { ExternalLink, Check, RefreshCw } from 'lucide-react';
import { 
  QUEST_BADGES_ADDR, 
  MOCK_TOKEN_ADDR, 
  MOCK_DEX_ADDR, 
  questBadgesAbi, 
  mockTokenAbi, 
  mockDexAbi 
} from '../config/contracts';

interface Quest4Props {
  onComplete: () => void;
  addLog: (message: string, type?: 'info' | 'success' | 'error') => void;
  openExplainer: (data: any) => void;
}

export function Quest4({ onComplete, addLog, openExplainer }: Quest4Props) {
  const { address, isConnected } = useAccount();

  const [swapping, setSwapping] = useState(false);
  const [claimingBadge, setClaimingBadge] = useState(false);

  const [swapTxHash, setSwapTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [badgeTxHash, setBadgeTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { isSuccess: isSwapSuccess } = useWaitForTransactionReceipt({ hash: swapTxHash });
  const { isLoading: isBadgeWaiting, isSuccess: isBadgeSuccess } = useWaitForTransactionReceipt({ hash: badgeTxHash });

  // Read GMT balance
  const { refetch: refetchTokenBalance } = useReadContract({
    address: MOCK_TOKEN_ADDR,
    abi: mockTokenAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { writeContractAsync } = useWriteContract();

  const handleSwap = () => {
    openExplainer({
      title: 'Executing DEX Token Swap',
      concept: 'Automated Market Makers',
      bullets: [
        'Sends 0.1 MON to the MockDEX contract and requests its equivalent value in GMT.',
        'Uses an Automated Market Maker (AMM) pool ratio logic to distribute assets.',
        'Requires gas fees in native MON, and slippage tolerances are enforced to prevent sandwich attacks.'
      ],
      actionLabel: 'EXECUTE SWAP',
      onConfirm: async () => {
        setSwapping(true);
        addLog('Initiating DEX swap: 0.1 MON -> 0.1 GMT...', 'info');
        try {
          const hash = await writeContractAsync({
            address: MOCK_DEX_ADDR,
            abi: mockDexAbi,
            functionName: 'swapMonForToken',
            value: parseEther('0.1'),
          });
          setSwapTxHash(hash);
          addLog(`Swap transaction submitted: ${hash}`, 'info');
        } catch (err: any) {
          addLog(`Swap failed: ${err.shortMessage || err.message}`, 'error');
          setSwapping(false);
        }
      }
    });
  };

  const handleClaimBadge = () => {
    openExplainer({
      title: 'Minting Quest 4 Badge',
      concept: 'On-Chain Achievements',
      bullets: [
        'Triggers completeQuest(4) on the QuestBadges contract.',
        'Mints the fourth and final badge NFT to verify your completion of the Gas Money path.'
      ],
      actionLabel: 'MINT FINAL BADGE',
      onConfirm: async () => {
        setClaimingBadge(true);
        addLog('Minting Quest 4 Badge...', 'info');
        try {
          const hash = await writeContractAsync({
            address: QUEST_BADGES_ADDR,
            abi: questBadgesAbi,
            functionName: 'completeQuest',
            args: [4],
          });
          setBadgeTxHash(hash);
          addLog(`Badge mint tx sent: ${hash}`, 'info');
        } catch (err: any) {
          addLog(`Badge claiming failed: ${err.shortMessage || err.message}`, 'error');
          setClaimingBadge(false);
        }
      }
    });
  };

  useEffect(() => {
    if (isSwapSuccess && swapTxHash) {
      setSwapping(false);
      refetchTokenBalance();
      addLog('Successfully swapped 0.1 MON for 0.1 GMT!', 'success');
    }
  }, [isSwapSuccess, swapTxHash]);

  useEffect(() => {
    if (isBadgeSuccess && badgeTxHash) {
      setClaimingBadge(false);
      addLog('Quest 4 Badge minted successfully! All quests completed.', 'success');
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  }, [isBadgeSuccess, badgeTxHash]);

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
        <span className="font-mono text-[9px] text-primary uppercase tracking-wider">QUEST_04_DEX_SWAP</span>
      </div>

      <h2 className="text-xl mb-3 text-primary font-display font-bold uppercase tracking-tight flex items-center gap-2">
        Quest 4: Decentralized Swapping
      </h2>
      <p className="text-xs text-zinc-400 mb-6 leading-relaxed font-body">
        Learn how Automated Market Makers (AMMs) exchange tokens using smart contract liquidity pools instead of centralized order books.
      </p>

      {!isConnected ? (
        <div className="text-xs font-mono text-zinc-500 bg-surface-low p-4 rounded border border-zinc-800">
          Please connect your wallet at the top of the page to start Quest 4.
        </div>
      ) : (
        <div className="flex flex-col gap-6 font-mono text-xs">
          
          {/* STEP 1: Swap MON for GMT */}
          <div className="bg-surface-low p-5 rounded border border-zinc-800 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white uppercase text-[11px] tracking-wider">Step 1: Execute MON -&gt; GMT Swap</span>
              {swapTxHash && isSwapSuccess && (
                <span className="text-[10px] text-primary bg-primary-soft px-2 py-0.5 border border-primary/30 flex items-center gap-1">
                  SWAP COMPLETE <Check className="w-3 h-3" />
                </span>
              )}
            </div>
            <p className="text-zinc-500 text-[11px]">
              Deposit 0.1 MON into the MockDEX liquidity pool to receive GMT tokens based on current pool reserves.
            </p>

            {!swapTxHash ? (
              <button 
                onClick={handleSwap}
                disabled={swapping}
                className="quest-btn-primary py-2.5 px-4 text-xs font-mono w-max mt-1"
              >
                {swapping ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    SWAPPING TOKENS...
                  </>
                ) : (
                  'SWAP 0.1 MON FOR 0.1 GMT'
                )}
              </button>
            ) : (
              <div className="flex flex-col gap-1.5 text-[11px] mt-1">
                <a href={`https://testnet.monadscan.com/tx/${swapTxHash}`} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                  View Swap Tx on MonadScan <ExternalLink className="w-3 h-3" />
                </a>
                {!isSwapSuccess && <span className="text-zinc-500 animate-pulse">Waiting for DEX confirmation...</span>}
              </div>
            )}
          </div>

          {/* STEP 2: Claim Badge */}
          <div className={`bg-surface-low p-5 rounded border transition-all ${
            isSwapSuccess ? 'border-primary/40 bg-primary-soft/5' : 'border-zinc-850 opacity-60'
          } flex flex-col gap-3`}>
            <div className="flex justify-between items-center">
              <span className="font-bold text-white uppercase text-[11px] tracking-wider">Step 2: Mint Quest 4 Badge</span>
              {badgeTxHash && isBadgeSuccess && (
                <span className="text-[10px] text-primary bg-primary-soft px-2 py-0.5 border border-primary/30 flex items-center gap-1">
                  PATH COMPLETE <Check className="w-3 h-3" />
                </span>
              )}
            </div>
            <p className="text-zinc-500 text-[11px]">
              Claim your final verification badge recorded permanently on the Monad testnet blockchain.
            </p>

            {!badgeTxHash ? (
              <button 
                onClick={handleClaimBadge}
                disabled={!isSwapSuccess || claimingBadge}
                className={`py-2.5 px-4 text-xs font-mono w-max mt-1 transition-all ${
                  isSwapSuccess 
                    ? 'quest-btn-primary glow-on-hover' 
                    : 'bg-zinc-800 text-zinc-600 border border-zinc-700 cursor-not-allowed'
                }`}
              >
                {claimingBadge ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    MINTING BADGE...
                  </>
                ) : (
                  'CLAIM QUEST 4 BADGE'
                )}
              </button>
            ) : (
              <div className="flex flex-col gap-1.5 text-[11px] mt-1">
                <a href={`https://testnet.monadscan.com/tx/${badgeTxHash}`} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                  View Badge Mint Tx on MonadScan <ExternalLink className="w-3 h-3" />
                </a>
                {isBadgeWaiting && <div className="text-zinc-500 text-xs font-mono animate-pulse">Waiting for badge confirmation...</div>}
                {isBadgeSuccess && (
                  <div className="text-primary font-bold text-xs flex items-center gap-1.5 mt-2">
                    Congratulations! You completed all 4 Gas Money Quests! 🎉
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
