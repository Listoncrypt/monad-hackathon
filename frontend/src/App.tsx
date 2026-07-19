import { useState, useEffect } from 'react';
import { WagmiProvider, useAccount, useBalance, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config/wagmi';
import { TerminalLog } from './components/TerminalLog';
import type { LogEntry } from './components/TerminalLog';
import { QuestPath } from './components/QuestPath';
import { Quest1 } from './quests/Quest1';
import { Quest2 } from './quests/Quest2';
import { Quest3 } from './quests/Quest3';
import { Quest4 } from './quests/Quest4';
import { QUEST_BADGES_ADDR, MOCK_TOKEN_ADDR, MOCK_DEX_ADDR } from './config/contracts';

export interface ExplainerData {
  title: string;
  concept: string;
  bullets: string[];
  actionLabel: string;
  onConfirm: () => void;
}

const queryClient = new QueryClient();

function DashboardContent() {
  const { address, isConnected, chain } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const { switchChain } = useSwitchChain();

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'start', message: 'System initialized. Ready for Monad testnet quests.', timestamp: Date.now(), type: 'info' }
  ]);
  const [currentQuest, setCurrentQuest] = useState(1);
  const [selectedQuest, setSelectedQuest] = useState(1);
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [explainer, setExplainer] = useState<ExplainerData | null>(null);
  const [showIntro, setShowIntro] = useState(true);



  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev, { id: Math.random().toString(), message, timestamp: Date.now(), type }]);
  };

  const handleQuestComplete = (id: number) => {
    if (currentQuest === id) {
      setCurrentQuest(id + 1);
      setSelectedQuest(id + 1);
    }
  };

  const triggerConnect = async () => {
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

  const formatAddress = (addr?: string) => {
    if (!addr) return '—';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // If user connects, automatically update connection state logs
  useEffect(() => {
    if (isConnected && address) {
      addLog(`Wallet secure connection established: ${address}`, 'success');
    }
  }, [isConnected, address]);

  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#e5e2e1] font-mono relative flex items-center justify-center p-6 antialiased">
        <IntroTerminal onComplete={() => setShowIntro(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-[#e5e2e1] font-body relative flex flex-col antialiased">

      {/* Header / Top Navbar */}
      <nav className="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between border-b border-zinc-800/50 bg-[#09090b]/80 px-6 backdrop-blur-xl shadow-[0_0_15px_rgba(0,255,65,0.03)]">
        <button 
          onClick={() => setView('landing')}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
        >
          {/* Replicating the DIAM polygon/slash logo */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" width="22" height="22" className="text-primary" role="img" aria-label="Gas Money">
            <polygon points="240,52 428,240 240,428 52,240" fill="none" stroke="currentColor" strokeWidth="20" strokeLinejoin="miter" />
            <rect x="78" y="218" width="324" height="44" fill="currentColor" />
          </svg>
          <span className="font-display text-lg font-bold tracking-widest text-primary">GAS MONEY</span>
        </button>

        <div className="flex items-center gap-4">
          {/* Network Badge */}
          {isConnected && chain?.id !== 10143 ? (
            <button
              onClick={() => switchChain?.({ chainId: 10143 })}
              className="flex items-center gap-2 border border-red-500/50 bg-red-950/30 px-3 py-1.5 cursor-pointer hover:bg-red-950/50 animate-pulse rounded"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span className="font-mono text-[9px] tracking-wider text-red-400 uppercase">WRONG NETWORK (SWITCH)</span>
            </button>
          ) : (
            <div className="hidden items-center gap-2 border border-primary/30 bg-primary-soft px-3 py-1.5 md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-soft" />
              <span className="font-mono text-[9px] tracking-wider text-primary uppercase">MONAD-TESTNET</span>
            </div>
          )}

          {/* Connect Button in Navbar */}
          {!isConnected ? (
            <button
              onClick={triggerConnect}
              className="quest-btn-primary py-1.5 px-4 text-[10px] font-mono tracking-widest"
            >
              CONNECT WALLET
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="hidden lg:inline text-xs font-mono text-zinc-500">{formatAddress(address)}</span>
              <button
                onClick={() => disconnect()}
                className="quest-btn-secondary py-1.5 px-3 text-[10px] font-mono tracking-widest"
              >
                DISCONNECT
              </button>
            </div>
          )}
        </div>
      </nav>

      {view === 'landing' ? (
        /* LANDING PAGE VIEW */
        <div className="flex flex-col flex-grow">
          {/* HERO SECTION */}
          <section className="relative flex min-h-[780px] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
            
            <div className="z-10 max-w-4xl">

              {/* Title with cursor blink */}
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight max-w-3xl mx-auto">
                Gas Money: Learn DeFi. <span className="text-primary">On-chain.</span><br/>
                No simulations.
                <span className="inline-block h-[0.9em] w-[0.5em] -mb-0.5 bg-primary terminal-blink ml-2" aria-hidden="true" />
              </h1>

              {/* Sub-label */}
              <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                On-Chain Education · Wallet Setup + DEX Swaps
              </p>

              {/* Paragraph */}
              <p className="mx-auto mb-10 max-w-xl text-sm md:text-base text-zinc-400 leading-relaxed font-body">
                Master EVM wallets, gas fees, approvals, and decentralized token exchanges by signing actual transactions on the Monad testnet. Claim verification badges recorded on-chain as proof of learning.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12 w-full max-w-sm mx-auto sm:max-w-none px-4">
                <button 
                  onClick={() => setView('app')}
                  className="quest-btn-primary glow-on-hover px-8 py-3.5 text-xs font-mono tracking-widest w-full sm:w-auto flex justify-center items-center"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">play_arrow</span>LAUNCH APP
                  </span>
                </button>
                <a href="https://docs.monad.xyz" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                  <button className="quest-btn-secondary px-8 py-3.5 text-xs font-mono tracking-widest w-full flex justify-center items-center">
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">description</span>READ DOCS
                    </span>
                  </button>
                </a>
                <a href="https://github.com/Listoncrypt/monad-hackathon" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                  <button className="quest-btn-secondary px-8 py-3.5 text-xs font-mono tracking-widest w-full flex justify-center items-center">
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">code</span>VIEW SOURCE
                    </span>
                  </button>
                </a>
              </div>

              {/* Stats Grid */}
              <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
                <div className="glass-card relative overflow-hidden p-4 rounded glow-border text-left">
                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-xs text-primary">receipt_long</span>
                    <span>QUESTS_COMPLETED</span>
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary pulse-soft" />
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold text-primary">
                    {currentQuest - 1} / 4
                  </p>
                </div>

                <div className="glass-card relative overflow-hidden p-4 rounded glow-border text-left">
                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-xs text-primary">verified_user</span>
                    <span>NETWORK</span>
                  </div>
                  <p className="mt-2 font-display text-xs sm:text-2xl font-bold text-primary truncate" title="MONAD_TESTNET">
                    MONAD_TESTNET
                  </p>
                </div>

                <div className="glass-card relative overflow-hidden p-4 rounded glow-border text-left">
                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-xs text-primary">hub</span>
                    <span>CHAIN_ID</span>
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold text-primary">
                    10143
                  </p>
                </div>

                <div className="glass-card relative overflow-hidden p-4 rounded glow-border text-left">
                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-xs text-primary">speed</span>
                    <span>VERIFICATION</span>
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold text-primary font-mono">
                    ON-CHAIN
                  </p>
                </div>
              </div>

              {/* Landing Page Terminal Intent Preview */}
              <div className="glass-card mt-12 w-full max-w-3xl mx-auto overflow-hidden border-primary/20 p-1 rounded">
                <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/40 px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-500/50" />
                    <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                    <div className="h-2 w-2 rounded-full bg-green-500/50 pulse-soft" />
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                    <span>System Status</span>
                    <span className="text-zinc-700">·</span>
                    <span>Monad Testnet</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3 text-left">
                  <div className="space-y-2">
                    <div className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">Active Wallet</div>
                    <div className="flex h-9 items-center border border-zinc-850 bg-[#0e0e0e] px-3 rounded font-mono text-xs text-primary truncate">
                      {address || 'Not Connected'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">Verification Badges</div>
                    <div className="flex h-9 items-center border border-zinc-850 bg-[#0e0e0e] px-3 rounded gap-1.5">
                      <div className={`h-4 w-2.5 rounded-sm ${currentQuest > 1 ? 'bg-primary' : 'bg-zinc-800'}`} />
                      <div className={`h-4 w-2.5 rounded-sm ${currentQuest > 2 ? 'bg-primary' : 'bg-zinc-800'}`} />
                      <div className={`h-4 w-2.5 rounded-sm ${currentQuest > 3 ? 'bg-primary' : 'bg-zinc-800'}`} />
                      <div className={`h-4 w-2.5 rounded-sm ${currentQuest > 4 ? 'bg-primary' : 'bg-zinc-800'}`} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">Handshake Proof</div>
                    <div className="flex h-9 items-center border border-zinc-850 bg-[#0e0e0e] px-3 rounded font-mono text-xs text-zinc-400">
                      {isConnected ? 'Connected' : 'Waiting for Wallet'}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* SECTION 1: WHY GAS MONEY */}
          <section className="mx-auto max-w-[1200px] px-6 py-24 w-full">
            <div className="mb-16">
              <p className="font-mono text-[10px] text-primary/60 uppercase tracking-widest mb-2">The Problem</p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-white mb-4">Why Gas Money?</h2>
              <div className="h-0.5 w-16 bg-primary" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="glass-card flex flex-col p-8 glow-border rounded">
                <div className="mb-6 font-mono text-[10px] text-zinc-500 uppercase tracking-wider">Traditional Tutorials</div>
                <h3 className="font-display text-2xl font-bold text-white mb-6">Static Documentation</h3>
                <ul className="flex-grow space-y-4">
                  <li className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <span className="material-symbols-outlined text-red-500/60 text-base">close</span>
                    <span>Outdated screenshots that confuse users</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <span className="material-symbols-outlined text-red-500/60 text-base">close</span>
                    <span>No active muscle memory built by reading</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <span className="material-symbols-outlined text-red-500/60 text-base">close</span>
                    <span>No verifiable proof of contract interaction</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card flex flex-col p-8 glow-border rounded">
                <div className="mb-6 font-mono text-[10px] text-zinc-500 uppercase tracking-wider">Mainnet DeFi</div>
                <h3 className="font-display text-2xl font-bold text-white mb-6">High-Stakes Environments</h3>
                <ul className="flex-grow space-y-4">
                  <li className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <span className="material-symbols-outlined text-yellow-500/60 text-base">warning</span>
                    <span>Expensive gas fees cost real capital</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <span className="material-symbols-outlined text-yellow-500/60 text-base">warning</span>
                    <span>UX mistakes lead to permanent fund loss</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <span className="material-symbols-outlined text-yellow-500/60 text-base">warning</span>
                    <span>Intimidating interface design for beginners</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card flex flex-col p-8 border-primary/40 bg-primary-soft relative rounded">
                <span className="material-symbols-outlined absolute right-6 top-6 text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <div className="mb-6 font-mono text-[10px] text-primary uppercase tracking-wider">Gas Money</div>
                <h3 className="font-display text-2xl font-bold text-white mb-6">Interactive Learning</h3>
                <ul className="flex-grow space-y-4">
                  <li className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <span className="material-symbols-outlined text-primary text-base">check</span>
                    <span>Zero risk using free testnet MON</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <span className="material-symbols-outlined text-primary text-base">check</span>
                    <span>Muscle memory through actual signatures</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <span className="material-symbols-outlined text-primary text-base">check</span>
                    <span>Direct explorer transaction auditing</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <span className="material-symbols-outlined text-primary text-base">check</span>
                    <span>Verifiable stage badges minted onchain</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION 2: HOW IT WORKS */}
          <section className="bg-zinc-950 px-6 py-24 w-full border-t border-b border-zinc-900">
            <div className="mx-auto mb-16 max-w-[1200px] text-center">
              <p className="font-mono text-[10px] text-primary/60 uppercase tracking-widest mb-2">How It Works</p>
              <h2 className="font-display text-3xl font-bold text-white mb-4">The 4-Quest Learning Path</h2>
              <p className="mx-auto max-w-md text-xs text-zinc-500 leading-relaxed font-body">
                Four step-by-step challenges engineered to guide beginners from cryptographic basics to automated market exchanges.
              </p>
            </div>

            <div className="mx-auto grid max-w-[1200px] grid-cols-1 border border-zinc-800 md:grid-cols-3">
              <div className="p-10 transition-all hover:bg-zinc-900/40 border-b border-zinc-800 md:border-b-0 md:border-r">
                <div className="mb-6 grid h-10 w-10 place-items-center border border-primary/40 bg-primary-soft rounded-sm">
                  <span className="material-symbols-outlined text-primary text-base">terminal</span>
                </div>
                <div className="mb-2 font-mono text-[10px] text-primary uppercase tracking-wide">1. Connect &amp; Fund</div>
                <h4 className="font-display text-base font-bold text-white mb-3">Wallet Basics</h4>
                <p className="font-mono text-[10px] leading-relaxed text-zinc-500">
                  Configure browser providers, secure connection states, understand public addresses, and request native gas tokens.
                </p>
              </div>

              <div className="p-10 transition-all hover:bg-zinc-900/40 border-b border-zinc-800 md:border-b-0 md:border-r">
                <div className="mb-6 grid h-10 w-10 place-items-center border border-primary/40 bg-primary-soft rounded-sm">
                  <span className="material-symbols-outlined text-primary text-base">settings_input_component</span>
                </div>
                <div className="mb-2 font-mono text-[10px] text-primary uppercase tracking-wide">2. Allowances &amp; Approvals</div>
                <h4 className="font-display text-base font-bold text-white mb-3">Smart Contract Logic</h4>
                <p className="font-mono text-[10px] leading-relaxed text-zinc-500">
                  Master the critical ERC-20 "approve then spend" mechanism. Control allowances, authorize spending bounds, and authorize contract pulls.
                </p>
              </div>

              <div className="p-10 transition-all hover:bg-zinc-900/40">
                <div className="mb-6 grid h-10 w-10 place-items-center border border-primary/40 bg-primary-soft rounded-sm">
                  <span className="material-symbols-outlined text-primary text-base">security</span>
                </div>
                <div className="mb-2 font-mono text-[10px] text-primary uppercase tracking-wide">3. Mock DEX Swaps</div>
                <h4 className="font-display text-base font-bold text-white mb-3">Liquidity Swaps</h4>
                <p className="font-mono text-[10px] leading-relaxed text-zinc-500">
                  Swap native tokens on a custom exchange contract. Learn how liquidity pools price trades, set slippage limits, and protect transactions.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 3: GET STARTED CALL TO ACTION */}
          <section className="relative overflow-hidden px-6 py-24 w-full">
            <div className="glass-card relative z-10 mx-auto max-w-3xl border-primary/20 p-12 text-center md:p-16 rounded shadow-xl">
              {/* Corner brackets */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-0 top-0 h-4 w-4 border-l border-t border-primary/60"></div>
                <div className="absolute right-0 top-0 h-4 w-4 border-r border-t border-primary/60"></div>
                <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-primary/60"></div>
                <div className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-primary/60"></div>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4 uppercase tracking-tight">
                Ready to learn DeFi?
              </h2>
              <p className="mb-8 text-sm text-zinc-400 max-w-md mx-auto">
                On-chain Web3 training is the best way to understand wallets. Connect your wallet and begin.
              </p>
              <button 
                onClick={() => setView('app')}
                className="quest-btn-primary glow-on-hover px-10 py-4 text-xs font-mono tracking-widest"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>START LEARNING NOW
                </span>
              </button>
            </div>
          </section>
        </div>
      ) : (
        /* QUEST DASHBOARD VIEW */
        <main className="flex-1 pt-24 px-6 pb-12 w-full max-w-7xl mx-auto flex flex-col gap-8">
          {/* Back button */}
          <div className="flex items-center">
            <button 
              onClick={() => setView('landing')}
              className="quest-btn-secondary px-4 py-1.5 text-[10px] font-mono tracking-wider flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-xs">arrow_back</span>
              RETURN TO LANDING
            </button>
          </div>

          {/* Stats Info Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="glass-card relative overflow-hidden p-4 rounded glow-border">
              <div className="flex items-center gap-2 font-mono text-[9px] text-zinc-500 tracking-widest uppercase">
                <span className="material-symbols-outlined text-xs text-primary">verified_user</span>
                <span>Connection Status</span>
                <span className={`ml-auto h-1.5 w-1.5 rounded-full pulse-soft ${isConnected ? 'bg-primary' : 'bg-red-500'}`} />
              </div>
              <p className="mt-2 font-display text-lg font-bold text-primary tracking-tight">
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>

            <div className="glass-card relative overflow-hidden p-4 rounded glow-border">
              <div className="flex items-center gap-2 font-mono text-[9px] text-zinc-500 tracking-widest uppercase">
                <span className="material-symbols-outlined text-xs text-primary">alternate_email</span>
                <span>Wallet Address</span>
              </div>
              <p className="mt-2 font-mono text-sm font-bold text-primary truncate" title={address || '—'}>
                {formatAddress(address)}
              </p>
            </div>

            <div className="glass-card relative overflow-hidden p-4 rounded glow-border">
              <div className="flex items-center gap-2 font-mono text-[9px] text-zinc-500 tracking-widest uppercase">
                <span className="material-symbols-outlined text-xs text-primary">hub</span>
                <span>Chain ID</span>
              </div>
              <p className="mt-2 font-display text-lg font-bold text-primary tracking-tight">
                10143
              </p>
            </div>

            <div className="glass-card relative overflow-hidden p-4 rounded glow-border">
              <div className="flex items-center gap-2 font-mono text-[9px] text-zinc-500 tracking-widest uppercase">
                <span className="material-symbols-outlined text-xs text-primary">payments</span>
                <span>MON Balance</span>
              </div>
              <p className="mt-2 font-display text-lg font-bold text-primary tracking-tight truncate">
                {balance ? `${Number(balance.formatted).toFixed(4)} MON` : '0.0000 MON'}
              </p>
            </div>
          </div>

          {/* 3-Column Dashboard */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-[280px_1fr_350px] gap-8 items-start relative">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 font-mono text-[10px] text-primary/60 uppercase tracking-widest mb-3 pl-4">
                <span>Quest Progression</span>
              </div>
              <QuestPath currentQuest={currentQuest} onSelectQuest={setSelectedQuest} />
            </div>
            
            <div className="w-full flex flex-col items-center min-h-[500px]">
              {isConnected && chain?.id !== 10143 ? (
                <div className="glass-card rounded border border-red-500/20 p-8 text-center w-full max-w-xl glow-border font-mono text-xs bg-red-950/5 relative overflow-hidden">
                  {/* Absolute bracket highlights in corners */}
                  <div className="absolute left-0 top-0 h-3 w-3 border-l border-t border-red-500/50" />
                  <div className="absolute right-0 top-0 h-3 w-3 border-r border-t border-red-500/50" />
                  <div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-red-500/50" />
                  <div className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-red-500/50" />
                  
                  <span className="material-symbols-outlined text-4xl mb-3 text-red-500 animate-pulse">warning</span>
                  <h3 className="font-display text-base font-bold uppercase tracking-wider text-white mb-2">Wrong Network Detected</h3>
                  <p className="text-zinc-400 mb-6 font-body leading-relaxed text-xs">
                    Your wallet is currently connected to <strong>{chain?.name || 'Unsupported Chain'}</strong>. Monad testnet quests must execute on the Monad network.
                  </p>
                  <button 
                    onClick={() => switchChain?.({ chainId: 10143 })}
                    className="quest-btn-primary bg-red-900/30 border-red-500 text-white px-6 py-2.5 font-mono text-[10px] tracking-widest glow-on-hover"
                  >
                    SWITCH TO MONAD TESTNET
                  </button>
                </div>
              ) : (
                <>
                  {selectedQuest === 1 && (
                    <Quest1 onComplete={() => handleQuestComplete(1)} addLog={addLog} openExplainer={setExplainer} />
                  )}
                  {selectedQuest === 2 && (
                    <Quest2 onComplete={() => handleQuestComplete(2)} addLog={addLog} openExplainer={setExplainer} />
                  )}
                  {selectedQuest === 3 && (
                    <Quest3 onComplete={() => handleQuestComplete(3)} addLog={addLog} openExplainer={setExplainer} />
                  )}
                  {selectedQuest === 4 && (
                    <Quest4 onComplete={() => handleQuestComplete(4)} addLog={addLog} openExplainer={setExplainer} />
                  )}
                  
                  {selectedQuest > 4 && (
                    <div className="p-8 bg-[#1a1a1a88] rounded-lg border border-zinc-800 text-center text-muted w-full max-w-xl glass-card glow-border font-mono text-xs">
                      <span className="material-symbols-outlined text-3xl mb-2 text-zinc-650">settings</span>
                      <p className="uppercase tracking-wider">Quest 0{selectedQuest} Implementation Coming Soon.</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="sticky top-24">
              <div className="flex items-center gap-2 font-mono text-[10px] text-primary/60 uppercase tracking-widest mb-3">
                <span>Transaction Log</span>
              </div>
              <TerminalLog logs={logs} />
            </div>
          </div>
        </main>
      )}

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-[#0c0d0a]/50 py-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-left">
            
            {/* Column 1 */}
            <div>
              <p className="font-mono text-[10px] text-primary/70 uppercase tracking-widest mb-4">DEPLOYED CONTRACTS</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <a href={`https://testnet.monadscan.com/address/${QUEST_BADGES_ADDR}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-550 transition-colors hover:text-primary">
                    <span className="material-symbols-outlined text-xs">link</span>
                    <span>QuestBadges</span>
                    <span className="text-zinc-700">{formatAddress(QUEST_BADGES_ADDR)}</span>
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`https://testnet.monadscan.com/address/${MOCK_TOKEN_ADDR}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-550 transition-colors hover:text-primary">
                    <span className="material-symbols-outlined text-xs">link</span>
                    <span>MockToken</span>
                    <span className="text-zinc-700">{formatAddress(MOCK_TOKEN_ADDR)}</span>
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`https://testnet.monadscan.com/address/${MOCK_DEX_ADDR}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-550 transition-colors hover:text-primary">
                    <span className="material-symbols-outlined text-xs">link</span>
                    <span>MockDEX</span>
                    <span className="text-zinc-700">{formatAddress(MOCK_DEX_ADDR)}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div>
              <p className="font-mono text-[10px] text-primary/70 uppercase tracking-widest mb-4">RESOURCES</p>
              <div className="space-y-2 font-mono text-[11px]">
                <a href="https://docs.monad.xyz" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-zinc-500 transition-colors hover:text-primary">
                  <span className="material-symbols-outlined text-xs">description</span>Monad Documentation
                </a>
                <a href="https://hardhat.org" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-zinc-500 transition-colors hover:text-primary">
                  <span className="material-symbols-outlined text-xs">school</span>Hardhat Guides
                </a>
              </div>
            </div>

            {/* Column 3 */}
            <div>
              <p className="font-mono text-[10px] text-primary/70 uppercase tracking-widest mb-4">SYSTEM</p>
              <div className="space-y-2 font-mono text-[11px] text-zinc-500">
                <p className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-soft" />
                  EVM Testnet Active
                </p>
                <p>Network: Monad Testnet</p>
                <p>Chain ID: 10143</p>
              </div>
            </div>

          </div>

          <div className="flex flex-col md:flex-row items-center justify-between border-t border-zinc-900 pt-6 font-mono text-[9px] text-zinc-600 uppercase tracking-widest gap-4">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" width="14" height="14" className="text-primary/70" role="img" aria-label="Gas Money">
                <polygon points="240,52 428,240 240,428 52,240" fill="none" stroke="currentColor" strokeWidth="24" strokeLinejoin="miter" />
                <rect x="78" y="218" width="324" height="44" fill="currentColor" />
              </svg>
              <span>© 2026 GAS MONEY PROTOCOL · LEARN ON-CHAIN ON MONAD</span>
            </div>
            <span>v1.0.0 · BUILT WITH ANTIGRAVITY</span>
          </div>
        </div>
      </footer>

      {explainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glass-card max-w-md w-full border border-primary/30 p-6 rounded shadow-[0_0_50px_rgba(0,255,65,0.08)] relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Corner brackets */}
            <div className="absolute left-0 top-0 h-3 w-3 border-l border-t border-primary/60" />
            <div className="absolute right-0 top-0 h-3 w-3 border-r border-t border-primary/60" />
            <div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-primary/60" />
            <div className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-primary/60" />

            <div className="mb-4 inline-flex items-center gap-2 border border-primary/30 bg-primary-soft px-2 py-0.5">
              <span className="h-1 w-1 bg-primary pulse-soft" />
              <span className="font-mono text-[8px] text-primary uppercase tracking-wider">{explainer.concept}</span>
            </div>

            <h3 className="font-display text-base font-bold text-white uppercase tracking-tight mb-3">
              {explainer.title}
            </h3>

            <ul className="space-y-2.5 mb-6 font-body text-xs text-zinc-400 list-disc list-inside leading-relaxed text-left">
              {explainer.bullets.map((bullet, idx) => (
                <li key={idx} className="marker:text-primary">
                  {bullet}
                </li>
              ))}
            </ul>

            <div className="flex gap-3 justify-end font-mono text-[10px]">
              <button
                onClick={() => setExplainer(null)}
                className="quest-btn-secondary py-2 px-4 tracking-widest"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  explainer.onConfirm();
                  setExplainer(null);
                }}
                className="quest-btn-primary py-2 px-5 tracking-widest glow-on-hover"
              >
                {explainer.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IntroTerminal({ onComplete }: { onComplete: () => void }) {
  const text = `Welcome to Gas Money.

DeFi can be intimidating. Reading docs doesn't teach you Web3.
Gas Money is a learn-by-doing training protocol designed to build real muscle memory.

How it works:
You will execute 4 real, on-chain quests on the Monad testnet:
1. Connect wallet & see native balances.
2. Send a real transaction and pay gas.
3. Master the "approve-then-spend" allowance locks.
4. Swap tokens via Automated Market Maker liquidity pools.

For each stage completed, you will mint a verifiable badge NFT directly on the Monad ledger. This represents cryptographic proof of your on-chain learning.

No simulations. No risks. Just learning Monad by doing.`;

  const [displayed, setDisplayed] = useState('');
  const [typingComplete, setTypingComplete] = useState(false);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index++;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
        setTypingComplete(true);
      }
    }, 25); // comfortable reading speed: 25ms per character
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl glass-card border border-primary/20 p-8 rounded shadow-2xl relative overflow-hidden flex flex-col min-h-[460px] animate-in fade-in zoom-in-95 duration-300">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/40 -mx-8 -mt-8 px-8 py-3 mb-6">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/50 pulse-soft" />
        </div>
        <div className="text-[9px] text-zinc-500 uppercase tracking-widest">
          Introduction
        </div>
      </div>

      {/* Terminal text area */}
      <div className="flex-1 text-left text-xs leading-relaxed text-zinc-350 min-h-[300px] whitespace-pre-wrap font-mono">
        {displayed}
        {!typingComplete && (
          <span className="inline-block h-[0.9em] w-[0.5em] bg-primary terminal-blink ml-1 align-middle" />
        )}
      </div>

      {/* Action footer */}
      <div className="mt-8 flex justify-between items-center border-t border-zinc-850 pt-5">
        <span className="text-[9px] text-zinc-500 tracking-wide uppercase font-mono">
          {typingComplete ? 'Welcome' : 'Writing...'}
        </span>
        <button
          onClick={onComplete}
          className={`quest-btn-primary py-2 px-6 text-[10px] font-mono tracking-widest glow-on-hover transition-all ${
            typingComplete ? 'animate-pulse' : 'opacity-70'
          }`}
        >
          CONTINUE TO GAS MONEY
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <DashboardContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
