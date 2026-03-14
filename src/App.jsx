import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { Vote, Wallet, LogOut, CheckCircle, AlertCircle, Bell, X, User, Shield, Home } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from './config';
import { CONTRACT_ABI } from './utils/ABI';
import AdminDashboard from './components/AdminDashboard';
import VoterDashboard from './components/VoterDashboard';
import Notification from './components/Notification';
import NotificationPanel from './components/NotificationPanel';
import FaceAuth from './components/FaceAuth';

const CONTRACT_ADDRESS = "0x4b63fb6f07080caE94e4751DCB90c22F25d1bAe2";

// --- Contexts ---
const RouterContext = createContext();
const Web3Context = createContext();

/* ─── Injected Global Styles ─────────────────────────────────────────────── */
const injectAppStyles = () => {
  if (document.getElementById('app-global-styles')) return;
  const tag = document.createElement('style');
  tag.id = 'app-global-styles';
  tag.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: linear-gradient(160deg, #f0f7ff 0%, #e6f2ff 45%, #f8fbff 100%);
      min-height: 100vh;
      color: #0c2340;
    }

    /* Global ambient blobs */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      background:
        radial-gradient(ellipse 55% 45% at 5%  5%,  rgba(147,210,255,0.38) 0%, transparent 60%),
        radial-gradient(ellipse 45% 38% at 95% 85%, rgba(186,227,255,0.28) 0%, transparent 60%),
        radial-gradient(ellipse 35% 28% at 55% 25%, rgba(219,241,255,0.18) 0%, transparent 55%);
    }

    /* ── Keyframes ── */
    @keyframes appFadeUp {
      from { opacity:0; transform:translateY(20px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes appShimmer {
      0%   { background-position:-200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes appPulse {
      0%,100% { opacity:1; }
      50%      { opacity:.45; }
    }
    @keyframes appSlideDown {
      from { opacity:0; transform:translateY(-8px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes appGlow {
      0%,100% { box-shadow: 0 0 0 0 rgba(56,189,248,.30); }
      50%      { box-shadow: 0 0 0 8px rgba(56,189,248,.00); }
    }
    @keyframes appFloat {
      0%,100% { transform:translateY(0); }
      50%      { transform:translateY(-8px); }
    }

    .app-fade-up   { animation: appFadeUp .55s cubic-bezier(.22,.68,0,1.15) both; }
    .app-d1 { animation-delay:.07s; }
    .app-d2 { animation-delay:.14s; }
    .app-d3 { animation-delay:.21s; }
    .app-pulse-dot { animation: appPulse 1.6s ease-in-out infinite; }

    /* ── Navbar ── */
    .app-navbar {
      position: fixed; top:0; left:0; right:0; z-index:50;
      background: rgba(255,255,255,0.80);
      border-bottom: 1px solid rgba(147,210,255,0.45);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 16px rgba(14,165,233,0.08);
      animation: appSlideDown .4s cubic-bezier(.22,.68,0,1.15) both;
    }
    .app-navbar-inner {
      max-width: 1280px; margin:0 auto; padding:0 1.25rem;
      height: 64px; display:flex; align-items:center; justify-content:space-between;
    }

    /* Logo */
    .app-logo {
      display:flex; align-items:center; gap:.6rem; cursor:pointer; text-decoration:none;
    }
    .app-logo-icon {
      background: linear-gradient(135deg,#38bdf8,#0ea5e9);
      border-radius:.6rem; padding:.45rem;
      box-shadow: 0 3px 10px rgba(14,165,233,0.35);
      display:flex; align-items:center; justify-content:center;
      transition: box-shadow .2s, transform .2s;
    }
    .app-logo:hover .app-logo-icon {
      box-shadow: 0 5px 18px rgba(14,165,233,0.50);
      transform: translateY(-1px);
    }
    .app-logo-text {
      font-size:1.2rem; font-weight:800; letter-spacing:-.02em;
      background: linear-gradient(90deg,#0ea5e9,#38bdf8,#0ea5e9);
      background-size:200% auto;
      animation: appShimmer 4s linear infinite;
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    }

    /* Nav links */
    .app-nav-link {
      padding:.45rem 1rem; border-radius:.55rem; font-size:.875rem; font-weight:600;
      background:transparent; border:none; cursor:pointer; font-family:inherit;
      transition: background .2s, color .2s;
    }
    .app-nav-link-admin {
      color: #7c3aed;
      background: rgba(124,58,237,0.08);
      border: 1px solid rgba(124,58,237,0.20);
    }
    .app-nav-link-admin:hover {
      background: rgba(124,58,237,0.16);
      border-color: rgba(124,58,237,0.38);
    }
    .app-nav-link-voter {
      color: #0369a1;
      background: rgba(14,165,233,0.09);
      border: 1px solid rgba(14,165,233,0.22);
    }
    .app-nav-link-voter:hover {
      background: rgba(14,165,233,0.18);
      border-color: rgba(14,165,233,0.38);
    }

    /* Bell button */
    .app-bell {
      position:relative; padding:.5rem; border-radius:.55rem;
      background: rgba(14,165,233,0.07);
      border: 1px solid rgba(147,210,255,0.38);
      color:#5ba8cc; cursor:pointer;
      transition: background .2s, color .2s;
    }
    .app-bell:hover { background:rgba(14,165,233,0.15); color:#0ea5e9; }
    .app-bell-dot {
      position:absolute; top:6px; right:6px;
      width:9px; height:9px; border-radius:50%;
      background: #ef4444;
      border: 2px solid rgba(255,255,255,0.90);
      animation: appGlow 2s ease-in-out infinite;
    }

    /* Account pill */
    .app-account-pill {
      display:flex; align-items:center; gap:.5rem;
      background: rgba(255,255,255,0.75);
      border: 1px solid rgba(147,210,255,0.50);
      border-radius:9999px; padding:.35rem .85rem;
      backdrop-filter:blur(8px);
      box-shadow: 0 2px 8px rgba(14,165,233,0.08);
    }
    .app-account-name {
      display:flex; align-items:center; gap:.3rem;
      padding-right:.6rem; margin-right:.15rem;
      border-right:1px solid rgba(147,210,255,0.50);
      font-size:.85rem; font-weight:600; color:#0c2340;
    }
    .app-account-addr {
      font-size:.82rem; font-family:'JetBrains Mono',monospace; color:#3a7fa8; font-weight:500;
    }
    .app-disconnect {
      background:none; border:none; cursor:pointer; color:#7ab8d8; margin-left:.25rem;
      padding:.15rem; border-radius:.35rem; display:flex; align-items:center;
      transition:color .2s, background .2s;
    }
    .app-disconnect:hover { color:#dc2626; background:rgba(239,68,68,0.10); }

    /* Connect wallet button */
    .app-btn-connect {
      display:flex; align-items:center; gap:.5rem;
      padding:.55rem 1.4rem; border-radius:.7rem;
      background: linear-gradient(135deg,#0ea5e9,#38bdf8,#0284c7);
      background-size:200% 200%; background-position:0% 50%;
      border:none; color:#fff; font-weight:700; font-size:.9rem;
      font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer;
      box-shadow: 0 4px 16px rgba(14,165,233,0.38), 0 1px 0 rgba(255,255,255,0.22) inset;
      transition: background-position .4s, box-shadow .25s, transform .18s;
    }
    .app-btn-connect:hover {
      background-position:100% 50%;
      box-shadow: 0 6px 24px rgba(14,165,233,0.52), 0 1px 0 rgba(255,255,255,0.22) inset;
      transform:translateY(-1px);
    }

    /* ── Backend warning banner ── */
    .app-warn-banner {
      position:fixed; top:64px; left:0; right:0; z-index:40;
      background: linear-gradient(135deg,rgba(251,146,60,0.92),rgba(234,88,12,0.88));
      color:#fff; font-size:.82rem; text-align:center;
      padding:.5rem 1rem;
      display:flex; align-items:center; justify-content:center; gap:.5rem;
      backdrop-filter:blur(8px);
      box-shadow: 0 2px 12px rgba(234,88,12,0.25);
      border-bottom:1px solid rgba(255,255,255,0.20);
    }
    .app-warn-code {
      background:rgba(0,0,0,0.25); padding:.1rem .4rem; border-radius:.35rem;
      font-family:'JetBrains Mono',monospace; font-size:.8rem;
    }

    /* ── Home page ── */
    .app-home {
      min-height:100vh; position:relative; overflow:hidden;
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      padding-top:5rem; padding-left:1.25rem; padding-right:1.25rem;
    }

    /* Hero badge */
    .app-hero-badge {
      display:inline-flex; align-items:center; gap:.5rem;
      padding:.45rem 1.1rem; border-radius:9999px;
      background: rgba(14,165,233,0.10);
      border:1px solid rgba(14,165,233,0.28);
      color:#0369a1; font-size:.82rem; font-weight:700;
      margin-bottom:1.5rem;
      animation: appGlow 3s ease-in-out infinite;
    }

    /* Hero heading */
    .app-hero-h1 {
      font-size: clamp(2.5rem,7vw,4.5rem);
      font-weight:800; letter-spacing:-.03em; line-height:1.1;
      color:#0c2340; text-align:center; margin:0 0 1.25rem;
    }
    .app-hero-gradient {
      background: linear-gradient(90deg,#0ea5e9,#6366f1,#a855f7);
      background-size:200% auto;
      animation: appShimmer 4s linear infinite;
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    }
    .app-hero-sub {
      font-size:1.1rem; color:#5ba8cc; max-width:560px;
      text-align:center; line-height:1.7; margin:0 0 2.5rem;
    }

    /* Hero CTA */
    .app-cta-btn {
      padding:.85rem 2.2rem; border-radius:.85rem;
      background: linear-gradient(135deg,#0ea5e9,#0284c7);
      color:#fff; font-weight:800; font-size:1rem; border:none; cursor:pointer;
      font-family:'Plus Jakarta Sans',sans-serif;
      box-shadow: 0 6px 24px rgba(14,165,233,0.40), 0 1px 0 rgba(255,255,255,0.22) inset;
      transition: box-shadow .25s, transform .18s;
      display:flex; align-items:center; gap:.5rem;
      animation: appFloat 3.5s ease-in-out infinite;
    }
    .app-cta-btn:hover {
      box-shadow: 0 8px 32px rgba(14,165,233,0.55), 0 1px 0 rgba(255,255,255,0.22) inset;
      transform:translateY(-2px);
      animation:none;
    }

    /* Hero notice */
    .app-hero-notice-yellow {
      background:rgba(251,191,36,0.10); border:1px solid rgba(251,191,36,0.32);
      color:#b45309; padding:.6rem 1.2rem; border-radius:.7rem;
      font-size:.875rem; font-weight:600;
    }
    .app-hero-notice-gray {
      color:#7ab8d8; font-style:italic; font-size:.9rem;
    }

    /* Feature cards grid */
    .app-features {
      display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
      gap:1.5rem; margin-top:5rem; max-width:1080px; width:100%; padding-bottom:4rem;
    }
    .app-feature-card {
      padding:1.75rem; border-radius:1.2rem;
      background:rgba(255,255,255,0.65);
      border:1px solid rgba(147,210,255,0.45);
      backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);
      box-shadow: 0 1px 0 rgba(255,255,255,0.92) inset, 0 4px 20px rgba(14,165,233,0.07);
      transition:border-color .25s, box-shadow .25s, transform .22s;
    }
    .app-feature-card:hover {
      border-color:rgba(56,189,248,0.55);
      box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 10px 36px rgba(14,165,233,0.14);
      transform:translateY(-3px);
    }
    .app-feature-icon {
      width:48px; height:48px; border-radius:.85rem;
      background:linear-gradient(135deg,rgba(56,189,248,0.18),rgba(14,165,233,0.10));
      border:1px solid rgba(56,189,248,0.28);
      display:flex; align-items:center; justify-content:center;
      margin-bottom:1.1rem;
    }
    .app-feature-title {
      font-size:1.05rem; font-weight:800; color:#0c2340; margin:0 0 .5rem; letter-spacing:-.01em;
    }
    .app-feature-desc { font-size:.875rem; color:#5ba8cc; line-height:1.65; margin:0; }

    /* ── Offline / FaceAuth wrapper ── */
    .app-center-wrap {
      min-height:100vh; display:flex; align-items:center; justify-content:center;
      padding:5rem 1.25rem 2rem; position:relative;
    }
    .app-offline-card {
      background:rgba(255,255,255,0.80);
      border:1px solid rgba(251,146,60,0.38);
      border-radius:1.5rem; padding:2.5rem;
      max-width:460px; width:100%; text-align:center;
      box-shadow: 0 1px 0 rgba(255,255,255,0.95) inset, 0 8px 40px rgba(234,88,12,0.12);
      backdrop-filter:blur(16px);
    }
    .app-offline-icon {
      width:72px; height:72px; border-radius:9999px;
      background:rgba(251,146,60,0.12); border:2px solid rgba(251,146,60,0.30);
      display:flex; align-items:center; justify-content:center;
      margin:0 auto 1.25rem;
    }
    .app-offline-title { font-size:1.4rem; font-weight:800; color:#c2410c; margin:0 0 .6rem; }
    .app-offline-desc  { font-size:.875rem; color:#7ab8d8; line-height:1.65; margin:0 0 1.25rem; }
    .app-offline-code {
      background:rgba(224,242,255,0.70);
      border:1px solid rgba(147,210,255,0.45);
      border-radius:.8rem; padding:1rem 1.25rem;
      font-family:'JetBrains Mono',monospace;
      font-size:.82rem; color:#0369a1; text-align:left;
      line-height:1.8;
    }
    .app-offline-hint { font-size:.75rem; color:#93c4e0; margin-top:.85rem; }

    /* status dot (green/yellow) */
    .app-status-dot-green  { background:#10b981; }
    .app-status-dot-yellow { background:#f59e0b; }

    /* scrollbar global */
    ::-webkit-scrollbar       { width:5px; height:5px; }
    ::-webkit-scrollbar-track { background:rgba(147,210,255,0.15); border-radius:99px; }
    ::-webkit-scrollbar-thumb { background:rgba(56,189,248,0.40);  border-radius:99px; }

    /* selection */
    ::selection { background:rgba(56,189,248,0.28); color:#0c2340; }
  `;
  document.head.appendChild(tag);
};

// --- Router ---
const useRouter = () => useContext(RouterContext);
const RouterProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('home');
  return (
    <RouterContext.Provider value={{ currentPage, navigate: setCurrentPage }}>
      {children}
    </RouterContext.Provider>
  );
};

// --- Web3 Provider (logic unchanged) ---
const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);
  const [isFaceVerified, setIsFaceVerified] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('notification_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('notification_history', JSON.stringify(history));
  }, [history]);

  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    const newNotif = { id, message, type, timestamp: id, read: false };
    setToasts(prev => [...prev, newNotif]);
    setTimeout(() => setToasts(prev => prev.filter(n => n.id !== id)), 5000);
    setHistory(prev => [newNotif, ...prev]);
  }, []);

  const markAsRead    = (id) => setHistory(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllAsRead = ()   => setHistory(prev => prev.map(n => ({ ...n, read: true })));
  const removeNotification = (id) => setHistory(prev => prev.filter(n => n.id !== id));
  const clearHistory  = () => { if (confirm("Clear all notifications?")) setHistory([]); };
  const togglePanel   = () => setIsPanelOpen(!isPanelOpen);

  const getContract = async (signerOrProvider) => {
    if (!CONTRACT_ADDRESS) return null;
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
  };

  const connectWallet = async () => {
    if (!window.ethereum) { addNotification("MetaMask not found!", "error"); return; }
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer   = await provider.getSigner();
      const acc      = await signer.getAddress();
      setAccount(acc); setIsConnected(true);
      addNotification("Wallet connected. Checking registration...", "info");
      try {
        const res = await axios.get(`${API_BASE}/api/users/${acc}`);
        if (res.data.success) { setIsRegistered(true); setUserProfile(res.data.user); setBackendOnline(true); }
      } catch (err) {
        if (err.response && err.response.status === 404) { setIsRegistered(false); setUserProfile(null); setBackendOnline(true); }
        else { console.warn("Backend offline:", err.message); setBackendOnline(false); addNotification("⚠️ Backend server is offline. Face auth unavailable.", "warning"); }
      }
      const contractInstance = await getContract(signer);
      if (contractInstance) {
        setContract(contractInstance);
        try {
          const isAdminUser = await contractInstance.isAdmin(acc);
          if (isAdminUser) { setIsAdmin(true); addNotification("Welcome, Admin! 🛡️", "success"); }
          else addNotification("Wallet connected successfully! ✅", "success");
        } catch (e) {
          console.warn("isAdmin check failed:", e.shortMessage || e.message);
          addNotification("Wallet connected successfully! ✅", "success");
        }
      }
    } catch (error) { console.error(error); addNotification("Connection Failed", "error"); }
    finally { setLoading(false); }
  };

  const disconnectWallet = () => {
    setAccount(''); setIsConnected(false); setIsAdmin(false); setContract(null);
    setIsFaceVerified(false); setIsRegistered(false); setUserProfile(null);
    addNotification("Wallet Disconnected", "info");
  };

  const handleFaceVerification = (user) => { setIsFaceVerified(true); setUserProfile(user); setIsRegistered(true); };

  // Inject styles once
  useEffect(() => { injectAppStyles(); }, []);

  return (
    <Web3Context.Provider value={{
      account, isAdmin, isConnected, contract,
      connectWallet, disconnectWallet,
      isFaceVerified, setIsFaceVerified,
      isRegistered, setIsRegistered,
      userProfile, setUserProfile,
      handleFaceVerification,
      notifications: toasts,
      history, isPanelOpen, togglePanel,
      addNotification, markAsRead, markAllAsRead, removeNotification, clearHistory,
      loading, ethers, backendOnline
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);

// --- Navbar ---
const Navbar = () => {
  const { account, isConnected, isFaceVerified, isAdmin, userProfile, connectWallet, disconnectWallet, history, togglePanel, loading } = useWeb3();
  const { navigate } = useRouter();

  return (
    <nav className="app-navbar">
      <div className="app-navbar-inner">

        {/* Logo */}
        <div className="app-logo" onClick={() => navigate('home')}>
          <div className="app-logo-icon">
            <Vote style={{ width: 20, height: 20, color: '#fff' }} />
          </div>
          <span className="app-logo-text">VoteChain</span>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          {isConnected ? (
            <>
              {isFaceVerified && (
                isAdmin ? (
                  <button className="app-nav-link app-nav-link-admin" onClick={() => navigate('admin')}>
                    🛡️ Admin Dashboard
                  </button>
                ) : (
                  <button className="app-nav-link app-nav-link-voter" onClick={() => navigate('voter')}>
                    🗳️ Voter Dashboard
                  </button>
                )
              )}

              {/* Bell */}
              <button className="app-bell" onClick={togglePanel} title="Notifications">
                <Bell style={{ width: 17, height: 17 }} />
                {history.filter(n => !n.read).length > 0 && <span className="app-bell-dot" />}
              </button>

              {/* Account pill */}
              <div className="app-account-pill">
                {userProfile && userProfile.name && (
                  <div className="app-account-name">
                    <User style={{ width: 14, height: 14, color: '#0ea5e9' }} />
                    {userProfile.name}
                  </div>
                )}
                <span
                  className="app-pulse-dot"
                  style={{
                    display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                    background: isFaceVerified ? '#10b981' : '#f59e0b'
                  }}
                />
                <span className="app-account-addr">
                  {account.substring(0, 6)}…{account.slice(-4)}
                </span>
                <button className="app-disconnect" onClick={disconnectWallet} title="Disconnect">
                  <LogOut style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </>
          ) : (
            <button className="app-btn-connect" onClick={connectWallet} disabled={loading}>
              <Wallet style={{ width: 15, height: 15 }} />
              {loading ? 'Connecting…' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

// --- Home Page ---
const HomePage = () => {
  const { isConnected, isFaceVerified, isAdmin } = useWeb3();
  const { navigate } = useRouter();

  const features = [
    {
      title: "Dual Security",
      desc: "Requires both a Web3 Wallet and Biometric Face Verification for entry.",
      icon: User
    },
    {
      title: "Immutable Records",
      desc: "Every vote is recorded permanently on the blockchain, ensuring 100% data integrity.",
      icon: Shield
    },
    {
      title: "Transparent Results",
      desc: "Results are verifiable by anyone, but only released after the election ends.",
      icon: CheckCircle
    },
  ];

  return (
    <div className="app-home">

      {/* Hero */}
      <div className="app-fade-up" style={{ textAlign: 'center', maxWidth: 760, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <div className="app-hero-badge">
          <Shield style={{ width: 15, height: 15 }} />
          Secure Face-Verified Blockchain Voting System
        </div>

        <h1 className="app-hero-h1">
          Destiny of the Future<br />
          <span className="app-hero-gradient">Decided by You</span>
        </h1>

        <p className="app-hero-sub">
          Experience the next generation of electoral integrity. Identity verified by face recognition, voting powered by Ethereum smart contracts.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          {isConnected ? (
            isFaceVerified ? (
              <button
                className="app-cta-btn"
                onClick={() => navigate(isAdmin ? 'admin' : 'voter')}
              >
                Go to Dashboard →
              </button>
            ) : (
              <div className="app-hero-notice-yellow">
                Please verify your face to access the dashboard.
              </div>
            )
          ) : (
            <p className="app-hero-notice-gray">Connect your wallet to get started</p>
          )}
        </div>
      </div>

      {/* Feature cards */}
      <div className="app-features">
        {features.map((f, i) => (
          <div key={i} className={`app-feature-card app-fade-up app-d${i + 1}`}>
            <div className="app-feature-icon">
              <f.icon style={{ width: 22, height: 22, color: '#0ea5e9' }} />
            </div>
            <h3 className="app-feature-title">{f.title}</h3>
            <p className="app-feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Backend Warning Banner ---
const BackendWarningBanner = () => {
  const { backendOnline } = useWeb3();
  if (backendOnline) return null;
  return (
    <div className="app-warn-banner">
      <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
      <span>
        Backend server is offline. Start it in{' '}
        <code className="app-warn-code">/server</code>
        {' '}to enable face authentication.
      </span>
    </div>
  );
};

// --- App Entry ---
function App() {
  return (
    <RouterProvider>
      <Web3Provider>
        <div style={{ minHeight: '100vh', position: 'relative' }}>
          <Navbar />
          <BackendWarningBanner />
          <Notification />
          <NotificationPanel />
          <MainContent />
        </div>
      </Web3Provider>
    </RouterProvider>
  );
}

// --- Main Content ---
const MainContent = () => {
  const { currentPage } = useRouter();
  const { isConnected, isFaceVerified, isRegistered, backendOnline, account, addNotification, handleFaceVerification } = useWeb3();

  if (isConnected && !isFaceVerified) {
    if (!backendOnline) {
      return (
        <div className="app-center-wrap">
          <div className="app-offline-card">
            <div className="app-offline-icon">
              <AlertCircle style={{ width: 36, height: 36, color: '#ea580c' }} />
            </div>
            <h2 className="app-offline-title">Backend Server Offline</h2>
            <p className="app-offline-desc">
              The face authentication server is not running. Please start it by opening a new terminal and running:
            </p>
            <div className="app-offline-code">
              cd server<br />
              npm install<br />
              node index.js
            </div>
            <p className="app-offline-hint">Make sure MongoDB is running first.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="app-center-wrap">
        <FaceAuth
          account={account}
          isRegistration={!isRegistered}
          onVerified={(user) => { handleFaceVerification(user); }}
          addNotification={addNotification}
        />
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '4rem' }}>
      {currentPage === 'home'  && <HomePage />}
      {currentPage === 'admin' && <AdminDashboard />}
      {currentPage === 'voter' && <VoterDashboard />}
    </div>
  );
};

export default App;