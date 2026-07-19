import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { ExternalLink, Check, ArrowRight, RefreshCw } from 'lucide-react';
import { 
  QUEST_BADGES_ADDR, 
  MOCK_TOKEN_ADDR, 
  MOCK_DEX_ADDR, 
  questBadgesAbi, 
  mockTokenAbi, 
  mockDexAbi 
} from '../config/contracts';

interface Quest3Props {
  onComplete: () => void;
  addLog: (message: string, type?: 'info' | 'success' | 'error') => void;
  openExplainer: (data: any) => void;
}

export function Quest3({ onComplete, addLog, openExplainer }: Quest3Props) {
  const { address, isConnected } = useAccount();

  // State flags for steps
  const [minting, setMinting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [spending, setSpending] = useState(false);
  const [claimingBadge, setClaimingBadge] = useState(false);
  const [explainerVisible, setExplainerVisible] = useState(false);

  // Tx Hashes
  const [mintTxHash, setMintTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [spendTxHash, setSpendTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [badgeTxHash, setBadgeTxHash] = useState<`0x${string}` | undefined>(undefined);

  // Tx Recepients & Statuses
  const { isSuccess: isMintSuccess } = useWaitForTransactionReceipt({ hash: mintTxHash });
  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash });
  const { isSuccess: isSpendSuccess } = useWaitForTransactionReceipt({ hash: spendTxHash });
  const { isLoading: isBadgeWaiting, isSuccess: isBadgeSuccess } = useWaitForTransactionReceipt({ hash: badgeTxHash });

  // Read GMT balance and allowance from contract
  const { data: rawBalance, refetch: refetchBalance } = useReadContract({
    address: MOCK_TOKEN_ADDR,
    abi: mockTokenAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: rawAllowance, refetch: refetchAllowance } = useReadContract({
    address: MOCK_TOKEN_ADDR,
    abi: mockTokenAbi,
    functionName: 'allowance',
    args: address ? [address, MOCK_DEX_ADDR] : undefined,
  });

  const { writeContractAsync } = useWriteContract();

  const tokenBalance = rawBalance ? Number(formatEther(rawBalance)) : 0;
  const tokenAllowance = rawAllowance ? Number(formatEther(rawAllowance)) : 0;

  // STEP 1: Mint Mock GMT Tokens
  const handleMint = () => {
    openExplainer({
      title: 'Minting Mock Tokens',
      concept: 'ERC-20 Token Faucets',
      bullets: [
        'Calls the mint() function on the MockToken contract to credit 100 GMT to your address.',
        'GMT is an ERC-20 standard custom token, managed entirely by its contract balance sheets.',
        'Requires standard gas fee execution paid in native MON.'
      ],
      actionLabel: 'MINT 100 GMT',
      onConfirm: async () => {
        setMinting(true);
        addLog('Requesting mint of 100 GMT (Gas Money Token)...', 'info');
        try {
          const hash = await writeContractAsync({
            address: MOCK_TOKEN_ADDR,
            abi: mockTokenAbi,
            functionName: 'mint',
            args: [address!, parseEther('100')],
          });
          setMintTxHash(hash);
          addLog(`Mint transaction submitted: ${hash}`, 'info');
        } catch (err: any) {
          addLog(`Minting failed: ${err.shortMessage || err.message}`, 'error');
          setMinting(false);
        }
      }
    });
  };

  // STEP 2: Approve DEX Spender
  const handleApprove = () => {
    openExplainer({
      title: 'Approving Token Allowance',
      concept: 'ERC-20 Allowances & Security',
      bullets: [
        'Authorizes the MockDEX contract to spend up to 100 GMT from your wallet.',
        'This is a crucial security barrier: smart contracts cannot move your assets without explicit approval.',
        'Sets the allowance value in the MockToken\'s internal mapping registry.'
      ],
      actionLabel: 'APPROVE SPENDING',
      onConfirm: async () => {
        setApproving(true);
        addLog('Approving DEX to spend 100 GMT...', 'info');
        try {
          const hash = await writeContractAsync({
            address: MOCK_TOKEN_ADDR,
            abi: mockTokenAbi,
            functionName: 'approve',
            args: [MOCK_DEX_ADDR, parseEther('100')],
          });
          setApproveTxHash(hash);
          addLog(`Approval transaction submitted: ${hash}`, 'info');
        } catch (err: any) {
          addLog(`Approval failed: ${err.shortMessage || err.message}`, 'error');
          setApproving(false);
        }
      }
    });
  };

  // STEP 3: Let DEX Spend (pullTokens)
  const handleSpend = () => {
    openExplainer({
      title: 'Triggering Pull Mechanism',
      concept: 'The Spend/TransferFrom Pattern',
      bullets: [
        'Taps the pullTokens() function on the MockDEX contract.',
        'The DEX triggers transferFrom(your_address, dex_address, 100 GMT) on the MockToken contract.',
        'Moves the approved GMT tokens into the DEX pool treasury.'
      ],
      actionLabel: 'ALLOW DEX SPEND',
      onConfirm: async () => {
        setSpending(true);
        addLog('Triggering DEX pullTokens to spend approved GMT...', 'info');
        try {
          const hash = await writeContractAsync({
            address: MOCK_DEX_ADDR,
            abi: mockDexAbi,
            functionName: 'pullTokens',
            args: [parseEther('100')],
          });
          setSpendTxHash(hash);
          addLog(`Spend transaction submitted: ${hash}`, 'info');
        } catch (err: any) {
          addLog(`Spending failed: ${err.shortMessage || err.message}`, 'error');
          setSpending(false);
        }
      }
    });
  };

  // STEP 4: Claim Badge
  const handleClaimBadge = () => {
    openExplainer({
      title: 'Minting Quest 3 Badge',
      concept: 'State Writes & NFTs',
      bullets: [
        'Triggers completeQuest(3) on the QuestBadges contract.',
        'Mints your third verifiable learning badge NFT on-chain.'
      ],
      actionLabel: 'MINT QUEST 3 BADGE',
      onConfirm: async () => {
        setClaimingBadge(true);
        addLog('Minting Quest 3 Badge...', 'info');
        try {
          const hash = await writeContractAsync({
            address: QUEST_BADGES_ADDR,
            abi: questBadgesAbi,
            functionName: 'completeQuest',
            args: [3],
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

  // Sync balances and states on completion of transaction steps
  useEffect(() => {
    if (isMintSuccess && minting) {
      setMinting(false);
      refetchBalance();
      addLog('100 GMT minted successfully to your address!', 'success');
    }
  }, [isMintSuccess, minting]);

  useEffect(() => {
    if (isApproveSuccess && approving) {
      setApproving(false);
      refetchAllowance();
      addLog('Spending allowance approved for DEX!', 'success');
    }
  }, [isApproveSuccess, approving]);

  useEffect(() => {
    if (isSpendSuccess && spending) {
      setSpending(false);
      refetchBalance();
      refetchAllowance();
      addLog('DEX successfully spent your 100 GMT!', 'success');
      setExplainerVisible(true);
    }
  }, [isSpendSuccess, spending]);

  useEffect(() => {
    if (isBadgeSuccess && claimingBadge) {
      setClaimingBadge(false);
      addLog('Quest 3 Badge minted successfully!', 'success');
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  }, [isBadgeSuccess, claimingBadge]);

  return (
    <div className="glass-card rounded border border-primary/20 p-6 sm:p-8 shadow-2xl relative overflow-hidden w-full max-w-2xl mx-auto glow-border">
      {/* Absolute bracket highlights in corners */}
      <div className="absolute left-0 top-0 h-3 w-3 border-l border-t border-primary/50" />
      <div className="absolute right-0 top-0 h-3 w-3 border-r border-t border-primary/50" />
      <div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-primary/50" />
      <div className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-primary/50" />

      {/* Background glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/2 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Stage Badge */}
      <div className="mb-4 inline-flex items-center gap-2 border border-primary/30 bg-primary-soft px-2.5 py-0.5">
        <span className="h-1.5 w-1.5 bg-primary pulse-soft" />
        <span className="font-mono text-[9px] text-primary uppercase tracking-wider">STAGE_03_APPROVE_FLOW</span>
      </div>

      <h2 className="text-xl mb-3 text-primary font-display font-bold uppercase tracking-tight flex items-center gap-2">
        Quest 3: Approve then spend
      </h2>
      <p className="text-xs text-zinc-400 mb-6 leading-relaxed font-body">
        In DeFi, smart contracts can't touch your tokens unless you explicitly authorize them. In this quest, you will experience the double-transaction "approve then spend" process.
      </p>

      {!isConnected ? (
        <div className="text-xs font-mono text-zinc-500 bg-surface-low border border-zinc-800 p-4 rounded uppercase tracking-wide">
          Please connect your wallet at the top to initialize this quest.
        </div>
      ) : (
        <div className="flex flex-col gap-6 relative z-10 font-mono text-xs">
          
          {/* Step 1: Mint GMT */}
          <div className="flex flex-col gap-2 border border-zinc-850 p-4 rounded bg-surface-low">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-zinc-300">Step 1: Get Mock GMT Tokens</span>
              <span className="text-[10px] text-primary">Your GMT Balance: {tokenBalance.toFixed(0)} GMT</span>
            </div>
            
            {tokenBalance < 100 && !isMintSuccess ? (
              <button
                onClick={handleMint}
                disabled={minting}
                className="quest-btn-primary py-2 text-xs font-mono w-max"
              >
                {minting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    MINTING GMT...
                  </>
                ) : (
                  'MINT 100 GMT TO WALLET'
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-primary font-bold text-xs py-1">
                <Check className="w-4 h-4" /> 100 GMT Available in Wallet
              </div>
            )}
          </div>

          {/* Step 2: Approve Spender */}
          {((tokenBalance >= 100) || isMintSuccess) && (
            <div className="flex flex-col gap-2 border border-zinc-850 p-4 rounded bg-surface-low animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-zinc-300">Step 2: Approve DEX Spending Limit</span>
                <span className="text-[10px] text-primary">DEX Allowance: {tokenAllowance.toFixed(0)} GMT</span>
              </div>
              
              {tokenAllowance < 100 && !isApproveSuccess ? (
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="quest-btn-primary py-2 text-xs font-mono w-max"
                >
                  {approving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      APPROVING SPENDER...
                    </>
                  ) : (
                    'APPROVE DEX TO SPEND 100 GMT'
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2 text-primary font-bold text-xs py-1">
                  <Check className="w-4 h-4" /> DEX Approved to Spend GMT
                </div>
              )}
            </div>
          )}

          {/* Step 3: Spend Allowance */}
          {((tokenAllowance >= 100) || isApproveSuccess) && (
            <div className="flex flex-col gap-2 border border-zinc-850 p-4 rounded bg-surface-low animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-zinc-300">Step 3: Trigger DEX Spending</span>
              </div>

              {!isSpendSuccess ? (
                <button
                  onClick={handleSpend}
                  disabled={spending}
                  className="quest-btn-primary py-2 text-xs font-mono w-max"
                >
                  {spending ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      DEX SPENDING...
                    </>
                  ) : (
                    <>
                      LET DEX PULL 100 GMT <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2 text-primary font-bold text-xs py-1">
                  <Check className="w-4 h-4" /> 100 GMT Successfully Spent by DEX
                </div>
              )}
            </div>
          )}

          {/* Educational Explainer */}
          {explainerVisible && (
            <div className="bg-[#12130F] p-4 rounded border border-primary/20 shadow-[0_0_15px_rgba(0,255,65,0.02)] animate-in fade-in slide-in-from-bottom-2 duration-500 leading-relaxed text-zinc-400 font-body">
              <h3 className="text-primary font-display font-semibold mb-2 flex items-center gap-2 uppercase tracking-wide text-xs">
                What just happened?
              </h3>
              <p className="text-xs mb-3">
                You executed two separate actions: an **Approval** and a **Spend**.
              </p>
              <p className="text-xs">
                Because ERC-20 tokens reside on separate smart contracts, other applications (like DEXs) cannot automatically read or transfer your tokens. You must first **approve** a specific allowance of tokens. Once allowed, the DEX contract calls `transferFrom` to pull and spend them. Almost all DeFi interactions (swapping, staking, lending) follow this secure two-step pattern!
              </p>
            </div>
          )}

          {/* Step 4: Claim Badge */}
          {explainerVisible && (
            <div className="flex flex-col gap-3 pt-4 border-t border-zinc-850 mt-2">
              {!badgeTxHash ? (
                <button 
                  onClick={handleClaimBadge}
                  disabled={claimingBadge}
                  className="quest-btn-primary py-2 text-xs font-mono w-max"
                >
                  {claimingBadge ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      MINTING BADGE...
                    </>
                  ) : (
                    'CLAIM QUEST 3 BADGE'
                  )}
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <a href={`https://testnet.monadscan.com/tx/${badgeTxHash}`} target="_blank" rel="noreferrer" className="text-primary hover:text-white underline text-xs flex items-center gap-1.5 font-mono">
                    View Mint Tx on Explorer <ExternalLink className="w-3 h-3" />
                  </a>
                  {isBadgeWaiting && <div className="text-zinc-500 text-xs font-mono animate-pulse">Waiting for badge confirmation...</div>}
                  {isBadgeSuccess && (
                    <div className="text-primary font-bold text-xs flex items-center gap-1.5 font-mono">
                      BADGE MINTED <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
