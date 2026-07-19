import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { ExternalLink, Check, ArrowRight, RefreshCw } from 'lucide-react';
import { QUEST_BADGES_ADDR, DEMO_RECIPIENT_ADDR, questBadgesAbi } from '../config/contracts';

interface Quest2Props {
  onComplete: () => void;
  addLog: (message: string, type?: 'info' | 'success' | 'error') => void;
  openExplainer: (data: any) => void;
}

export function Quest2({ onComplete, addLog, openExplainer }: Quest2Props) {
  const { isConnected } = useAccount();
  const [sending, setSending] = useState(false);
  const [minting, setMinting] = useState(false);
  const [explainerVisible, setExplainerVisible] = useState(false);

  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();

  const [sendTxHash, setSendTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [mintTxHash, setMintTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { isLoading: isSendWaiting, isSuccess: isSendSuccess, data: sendTxReceipt } = useWaitForTransactionReceipt({ hash: sendTxHash });
  const { isLoading: isMintWaiting, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({ hash: mintTxHash });

  const handleSendTransaction = () => {
    openExplainer({
      title: 'Peer-to-Peer Transfer',
      concept: 'Balance Transfers & Gas',
      bullets: [
        'Transfers 0.01 MON native tokens from your address to a demo recipient address.',
        'This write transaction updates the balance mappings inside the Monad genesis ledger.',
        'Requires gas fees in native MON to compensate network validators.'
      ],
      actionLabel: 'SEND 0.01 MON',
      onConfirm: async () => {
        setSending(true);
        addLog('Requesting signature to send 0.01 MON...', 'info');
        try {
          const hash = await sendTransactionAsync({
            to: DEMO_RECIPIENT_ADDR as `0x${string}`,
            value: parseEther('0.01'),
          });
          setSendTxHash(hash);
          addLog(`Transaction sent! Hash: ${hash}`, 'info');
          addLog('Waiting for network confirmation...', 'info');
        } catch (err: any) {
          addLog(`Transaction failed: ${err.shortMessage || err.message}`, 'error');
          setSending(false);
        }
      }
    });
  };

  const handleMintBadge = () => {
    openExplainer({
      title: 'Minting On-Chain Badge',
      concept: 'State Writes & NFTs',
      bullets: [
        'Triggers a write transaction calling completeQuest(2) on the QuestBadges contract.',
        'Modifies contract state permanently to award a new NFT badge to your address.',
        'Requires gas execution fees paid in native MON.'
      ],
      actionLabel: 'MINT QUEST 2 BADGE',
      onConfirm: async () => {
        setMinting(true);
        addLog('Minting Quest 2 Badge...', 'info');
        try {
          const hash = await writeContractAsync({
            address: QUEST_BADGES_ADDR as `0x${string}`,
            abi: questBadgesAbi,
            functionName: 'completeQuest',
            args: [2],
          });
          setMintTxHash(hash);
          addLog(`Badge mint tx sent: ${hash}`, 'info');
        } catch (err: any) {
          addLog(`Minting failed: ${err.shortMessage || err.message}`, 'error');
          setMinting(false);
        }
      }
    });
  };

  useEffect(() => {
    if (isSendSuccess && sendTxHash) {
      setSending(false);
      addLog(`Transaction confirmed on Monad testnet!`, 'success');
      setExplainerVisible(true);
    }
  }, [isSendSuccess, sendTxHash]);

  useEffect(() => {
    if (isMintSuccess && mintTxHash) {
      setMinting(false);
      addLog('Quest 2 Badge minted successfully!', 'success');
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  }, [isMintSuccess, mintTxHash]);

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
        <span className="font-mono text-[9px] text-primary uppercase tracking-wider">STAGE_02_STATE_CHANGE</span>
      </div>

      <h2 className="text-xl mb-3 text-primary font-display font-bold uppercase tracking-tight flex items-center gap-2">
        Quest 2: Send your first transaction
      </h2>
      <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
        A transaction is how you change state on the blockchain. Send 0.01 MON to our demo recipient to learn how it works.
      </p>

      <div className="flex flex-col gap-6 relative z-10">
        {/* Step 1: Send Transaction */}
        <div className="flex flex-col gap-3">
          {!sendTxHash || (!isSendSuccess && !isSendWaiting) ? (
            <button 
              onClick={handleSendTransaction}
              disabled={sending || !isConnected}
              className="quest-btn-primary font-mono text-xs"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  SENDING MON...
                </>
              ) : (
                <>
                  SEND 0.01 MON <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          ) : (
            <div className="flex flex-col gap-2 bg-surface-low p-4 rounded border border-zinc-800">
              <div className="flex items-center gap-2 text-primary font-bold font-mono text-xs">
                <Check className="w-4 h-4" /> 0.01 MON Sent
              </div>
              <a href={`https://testnet.monadscan.com/tx/${sendTxHash}`} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white underline text-xs flex items-center gap-1 font-mono">
                View Transfer Tx on Explorer <ExternalLink className="w-3 h-3" />
              </a>
              {isSendWaiting && <div className="text-primary text-xs font-mono animate-pulse">Waiting for network confirmation...</div>}
            </div>
          )}
        </div>

        {/* Explainer (Appears after confirmation) */}
        {explainerVisible && (
          <div className="bg-[#12130F] p-4 rounded border border-primary/20 shadow-[0_0_15px_rgba(0,255,65,0.02)] animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h3 className="text-primary font-display font-semibold mb-2 flex items-center gap-2 uppercase tracking-wide text-xs">
              What just happened?
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              You signed a message with your private key authorizing the transfer of 0.01 MON to another address. 
              The validators included your transaction in a block. You paid a tiny amount of MON as a <strong>Gas Fee</strong> to compensate the network for processing this state change.
            </p>
          </div>
        )}

        {/* Step 2: Mint Badge */}
        {explainerVisible && (
          <div className="flex flex-col gap-3 pt-4 border-t border-zinc-850 mt-2">
            {!mintTxHash ? (
              <button 
                onClick={handleMintBadge}
                disabled={minting}
                className="quest-btn-primary font-mono text-xs"
              >
                {minting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    MINTING BADGE...
                  </>
                ) : (
                  'CLAIM QUEST 2 BADGE'
                )}
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <a href={`https://testnet.monadscan.com/tx/${mintTxHash}`} target="_blank" rel="noreferrer" className="text-primary hover:text-white underline text-xs flex items-center gap-1.5 font-mono">
                  View Mint Tx on Explorer <ExternalLink className="w-3 h-3" />
                </a>
                {isMintWaiting && <div className="text-zinc-500 text-xs font-mono animate-pulse">Waiting for badge confirmation...</div>}
                {isMintSuccess && (
                  <div className="text-primary font-bold text-xs flex items-center gap-1.5 font-mono">
                    BADGE MINTED <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
