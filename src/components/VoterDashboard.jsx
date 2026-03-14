import React, { useState, useEffect } from 'react';
import { Vote, Clock, Crown, CheckCircle, Lock, Bell, RefreshCw, Calendar } from 'lucide-react';
import { useWeb3 } from '../App';

/* ─── Injected Global Styles ─────────────────────────────────────────────── */
const injectStyles = () => {
    if (document.getElementById('voter-dash-styles')) return;
    const tag = document.createElement('style');
    tag.id = 'voter-dash-styles';
    tag.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

    .vdash {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: linear-gradient(160deg, #f0f7ff 0%, #e6f2ff 45%, #f8fbff 100%);
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }

    /* Ambient blobs */
    .vdash::before {
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
    .vdash > * { position: relative; z-index: 1; }

    /* ── Keyframes ── */
    @keyframes vdFadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes vdBlink  { 0%,100%{opacity:1} 50%{opacity:.2} }
    @keyframes vdSpin   { to { transform: rotate(360deg); } }
    @keyframes vdShimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes vdPulseRing {
      0%,100% { box-shadow: 0 0 0 0 rgba(56,189,248,.28); }
      50%      { box-shadow: 0 0 0 7px rgba(56,189,248,.00); }
    }
    @keyframes vdSlideIn {
      from { opacity:0; transform:scale(.96) translateY(12px); }
      to   { opacity:1; transform:scale(1)   translateY(0); }
    }
    @keyframes vdPulseText { 0%,100%{opacity:.45} 50%{opacity:1} }

    .vd-fade-up  { animation: vdFadeUp .5s cubic-bezier(.22,.68,0,1.15) both; }
    .vd-d1 { animation-delay:.06s; }
    .vd-d2 { animation-delay:.12s; }
    .vd-spin { animation: vdSpin .8s linear infinite; }
    .vd-loading { animation: vdPulseText 1.4s ease-in-out infinite; color:#5ba8cc; font-weight:600; }

    /* ── Refresh button ── */
    .vd-btn-refresh {
      color: #5ba8cc;
      background: rgba(14,165,233,.07);
      border: 1px solid rgba(147,210,255,.38);
      cursor: pointer;
      transition: background .2s, color .2s, transform .2s;
    }
    .vd-btn-refresh:hover {
      background: rgba(14,165,233,.14);
      color: #0ea5e9;
      transform: rotate(15deg);
    }

    /* ── Announcement banner ── */
    .vd-announce {
      background: linear-gradient(135deg, rgba(224,242,255,.88), rgba(240,249,255,.82));
      border: 1px solid rgba(56,189,248,.38);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 4px 28px rgba(14,165,233,.10), 0 1px 0 rgba(255,255,255,.9) inset;
    }
    .vd-announce-row {
      display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;
      padding: .45rem .65rem;
      border-radius: .55rem;
      transition: background .18s;
    }
    .vd-announce-row:hover { background: rgba(14,165,233,.07); }

    /* ── Tabs ── */
    .vd-tabs {
      background: rgba(224,242,255,.60);
      border: 1px solid rgba(147,210,255,.40);
      backdrop-filter: blur(10px);
    }
    .vd-tab {
      color: #5ba8cc; font-weight: 600; font-size: .8125rem;
      border: none; background: transparent; cursor: pointer;
      transition: background .2s, color .2s, box-shadow .2s;
    }
    .vd-tab:hover { color: #0ea5e9; background: rgba(14,165,233,.08); }
    .vd-tab-active {
      background: linear-gradient(135deg,#0ea5e9,#38bdf8) !important;
      color: #fff !important;
      box-shadow: 0 2px 10px rgba(14,165,233,.35);
    }

    /* ── Election Cards ── */
    .vd-card {
      background: rgba(255,255,255,.74);
      border: 1px solid rgba(147,210,255,.45);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      box-shadow: 0 1px 0 rgba(255,255,255,.92) inset, 0 4px 24px rgba(14,165,233,.07);
      transition: border-color .25s, box-shadow .25s, transform .22s;
      display: flex; flex-direction: column;
    }
    .vd-card:hover {
      border-color: rgba(56,189,248,.55);
      box-shadow: 0 1px 0 rgba(255,255,255,.95) inset, 0 10px 36px rgba(14,165,233,.14);
      transform: translateY(-2px);
    }

    /* Eligibility badges */
    .vd-badge-eligible {
      background: rgba(16,185,129,.12); color: #047857;
      border: 1px solid rgba(16,185,129,.32);
      font-size: .68rem; font-weight: 700;
      border-radius: 9999px; padding: .2rem .6rem;
      display: inline-flex; align-items: center; gap: .25rem;
    }
    .vd-badge-restricted {
      background: rgba(239,68,68,.10); color: #dc2626;
      border: 1px solid rgba(239,68,68,.28);
      font-size: .68rem; font-weight: 700;
      border-radius: 9999px; padding: .2rem .6rem;
      display: inline-flex; align-items: center; gap: .25rem;
    }

    /* Card meta row */
    .vd-meta { display:flex; align-items:center; justify-content:space-between; font-size:.82rem; }
    .vd-meta-label { display:flex; align-items:center; gap:.35rem; color:#5ba8cc; }
    .vd-meta-value { color:#3a7fa8; font-weight:600; }

    /* Status chips */
    .vd-chip-voted {
      background: rgba(16,185,129,.10); color:#047857;
      border:1px solid rgba(16,185,129,.28);
      font-size:.72rem; font-weight:700; border-radius:9999px; padding:.15rem .6rem;
      display:inline-flex; align-items:center; gap:.25rem;
    }
    .vd-chip-notvoted {
      background: rgba(251,191,36,.10); color:#b45309;
      border:1px solid rgba(251,191,36,.30);
      font-size:.72rem; font-weight:700; border-radius:9999px; padding:.15rem .6rem;
    }

    /* ── Vote buttons ── */
    .vd-btn-vote-active {
      background: linear-gradient(135deg,#0ea5e9 0%,#38bdf8 55%,#0284c7 100%);
      background-size: 200% 200%; background-position: 0% 50%;
      border: none; color: #fff; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 16px rgba(14,165,233,.38), 0 1px 0 rgba(255,255,255,.22) inset;
      transition: background-position .4s, box-shadow .25s, transform .18s;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .vd-btn-vote-active:hover {
      background-position: 100% 50%;
      box-shadow: 0 6px 24px rgba(14,165,233,.52), 0 1px 0 rgba(255,255,255,.22) inset;
      transform: translateY(-1px);
    }
    .vd-btn-vote-active:disabled {
      opacity:.55; cursor:not-allowed; transform:none;
    }
    .vd-btn-view-results {
      background: rgba(14,165,233,.10);
      border: 1px solid rgba(14,165,233,.32);
      color: #0369a1; font-weight: 700; cursor: pointer;
      transition: background .2s, border-color .2s, transform .18s;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .vd-btn-view-results:hover {
      background: rgba(14,165,233,.20);
      border-color: rgba(14,165,233,.50);
      transform: translateY(-1px);
    }
    .vd-btn-disabled {
      background: rgba(147,210,255,.18);
      border: 1px solid rgba(147,210,255,.32);
      color: #7ab8d8; cursor: not-allowed; font-weight:600;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .vd-btn-locked {
      background: rgba(239,68,68,.08);
      border: 1px solid rgba(239,68,68,.25);
      color: #dc2626; cursor: not-allowed; font-weight:600;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    /* ── Empty / loading ── */
    .vd-empty {
      background: rgba(255,255,255,.50);
      border: 1.5px dashed rgba(147,210,255,.55);
      color: #7ab8d8; font-weight:600;
    }

    /* ── Modal overlay ── */
    .vd-overlay {
      position: fixed; inset: 0; z-index: 50;
      display: flex; align-items: center; justify-content: center;
      background: rgba(10,25,55,.55);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      padding: 1rem;
    }

    /* ── Modal box ── */
    .vd-modal {
      background: linear-gradient(160deg, #f8fbff 0%, #edf6ff 100%);
      border: 1px solid rgba(147,210,255,.55);
      box-shadow: 0 32px 80px rgba(14,165,233,.20), 0 1px 0 rgba(255,255,255,.95) inset;
      animation: vdSlideIn .32s cubic-bezier(.22,.68,0,1.2) both;
      width: 100%; max-width: 640px;
      border-radius: 1.5rem;
      overflow: hidden;
    }

    /* Modal header */
    .vd-modal-header {
      background: linear-gradient(135deg, rgba(224,242,255,.90), rgba(240,249,255,.85));
      border-bottom: 1px solid rgba(147,210,255,.40);
      padding: 1.5rem;
      display: flex; justify-content: space-between; align-items: flex-start;
    }

    /* Modal close button */
    .vd-modal-close {
      width: 32px; height: 32px; border-radius: .5rem;
      display: flex; align-items: center; justify-content: center;
      background: rgba(14,165,233,.08);
      border: 1px solid rgba(147,210,255,.40);
      color: #5ba8cc; cursor: pointer; font-size: 1.1rem;
      transition: background .2s, color .2s;
    }
    .vd-modal-close:hover { background: rgba(239,68,68,.10); color: #dc2626; border-color: rgba(239,68,68,.28); }

    /* Candidate row */
    .vd-candidate {
      background: rgba(255,255,255,.70);
      border: 1px solid rgba(147,210,255,.42);
      backdrop-filter: blur(8px);
      transition: border-color .2s, box-shadow .2s, transform .18s;
    }
    .vd-candidate:hover {
      border-color: rgba(56,189,248,.55);
      box-shadow: 0 4px 16px rgba(14,165,233,.10);
      transform: translateX(2px);
    }

    /* Candidate avatar */
    .vd-avatar {
      background: linear-gradient(135deg,#38bdf8,#0ea5e9);
      box-shadow: 0 3px 10px rgba(14,165,233,.35);
    }

    /* Vote count box */
    .vd-count-box {
      background: rgba(224,242,255,.70);
      border: 1px solid rgba(147,210,255,.45);
      border-radius: .65rem;
      text-align: center; min-width: 68px;
      padding: .45rem .75rem;
    }

    /* Modal vote button */
    .vd-btn-cast {
      background: linear-gradient(135deg,#0ea5e9,#0284c7);
      color: #fff; border: none; font-weight: 700; cursor: pointer;
      box-shadow: 0 3px 12px rgba(14,165,233,.38);
      transition: box-shadow .2s, transform .18s;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .vd-btn-cast:hover {
      box-shadow: 0 5px 20px rgba(14,165,233,.52);
      transform: translateY(-1px);
    }

    /* ── Winner card ── */
    .vd-winner {
      background: linear-gradient(135deg, rgba(209,250,229,.60), rgba(167,243,208,.40));
      border: 1px solid rgba(52,211,153,.40);
      box-shadow: 0 4px 20px rgba(16,185,129,.10);
    }
    .vd-winner-crown {
      background: linear-gradient(135deg,#fbbf24,#f59e0b);
      box-shadow: 0 4px 14px rgba(245,158,11,.40);
      border-radius: 9999px; padding: .75rem;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    /* scrollbar inside modal */
    .vd-modal-body::-webkit-scrollbar { width:5px; }
    .vd-modal-body::-webkit-scrollbar-track { background:rgba(147,210,255,.15); border-radius:99px; }
    .vd-modal-body::-webkit-scrollbar-thumb { background:rgba(56,189,248,.40); border-radius:99px; }

    /* "Hidden until end" text */
    .vd-hidden-label { color:#7ab8d8; font-style:italic; font-size:.8rem; }
  `;
    document.head.appendChild(tag);
};

const VoterDashboard = () => {
    const { contract, account, addNotification } = useWeb3();
    const [activeTab, setActiveTab] = useState('active');
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedElection, setSelectedElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => { injectStyles(); }, []);

    // ─── Fetch all visible elections + announcements ───────────────────────────
    const fetchElections = async () => {
        if (!contract) return;
        try {
            setLoading(true);
            const count = await contract.getElectionCount();
            const countNum = Number(count);
            const fetched = [];

            for (let i = countNum; i >= 1; i--) {
                try {
                    const d = await contract.getElectionDetails(i);
                    let isEligible = true;
                    if (d.isPrivate && account) {
                        try { isEligible = await contract.checkUserEligible(i, account); }
                        catch { isEligible = false; }
                    }
                    let hasVoted = false;
                    if (account) {
                        try { hasVoted = await contract.checkUserVoted(i, account); }
                        catch { hasVoted = false; }
                    }
                    fetched.push({
                        id: Number(d.id),
                        name: d.name,
                        description: d.description,
                        startTime: Number(d.startTime) * 1000,
                        endTime: Number(d.endTime) * 1000,
                        isResultsPublished: d.isResultsPublished,
                        isPrivate: d.isPrivate,
                        isDeleted: d.isDeleted,
                        isPaused: d.isPaused,
                        totalVotes: Number(d.totalVotes),
                        hasVoted,
                        isEligible
                    });
                } catch { /* skip */ }
            }
            setElections(fetched);

            try {
                const raw = await contract.getAnnouncements();
                const formatted = raw
                    .filter(a => Number(a.targetGroup) !== 2)
                    .map(a => ({ id: Number(a.id), message: a.message, timestamp: Number(a.timestamp) * 1000 }))
                    .reverse();
                setAnnouncements(formatted);
            } catch { /* announcements optional */ }

        } catch (err) {
            console.error('fetchElections error:', err);
        } finally {
            setLoading(false);
        }
    };

    // ─── Fetch candidates ─────────────────────────────────────────────────────
    const fetchCandidates = async (electionId) => {
        try {
            const data = await contract.getCandidates(electionId);
            const formatted = data[0].map((id, idx) => ({
                id: Number(id),
                name: data[1][idx],
                votes: Number(data[2][idx])
            }));
            setCandidates(formatted);
        } catch (err) {
            console.error('fetchCandidates error:', err);
            addNotification('Failed to load candidates', 'error');
        }
    };

    useEffect(() => {
        fetchElections();
        const interval = setInterval(fetchElections, 12000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contract, account]);

    // ─── Open vote modal ───────────────────────────────────────────────────────
    const handleOpenVote = async (election) => {
        if (election.isPrivate && !election.isEligible) {
            addNotification('You are not authorized to vote in this private election.', 'error');
            return;
        }
        setCandidates([]);
        setSelectedElection(election);
        await fetchCandidates(election.id);
    };

    // ─── Cast vote ─────────────────────────────────────────────────────────────
    const handleVote = async (candidateId) => {
        if (!confirm('Are you sure you want to cast this vote? This cannot be undone.')) return;
        try {
            addNotification('Casting vote... Confirm in MetaMask.', 'info');
            const tx = await contract.vote(selectedElection.id, candidateId);
            addNotification('Waiting for blockchain confirmation...', 'info');
            await tx.wait();
            addNotification('Vote cast successfully! 🎉', 'success');
            setSelectedElection(null);
            fetchElections();
        } catch (err) {
            console.error('vote error:', err);
            addNotification(err.reason || 'Failed to cast vote. You may have already voted.', 'error');
        }
    };

    const filteredElections = elections.filter(e => {
        if (e.isDeleted) return false;
        const now = Date.now();
        if (activeTab === 'active')   return now >= e.startTime && now <= e.endTime && !e.isPaused;
        if (activeTab === 'upcoming') return now < e.startTime;
        if (activeTab === 'closed')   return now > e.endTime || e.isPaused;
        return true;
    });

    const getWinner = (candidates) => {
        if (!candidates || candidates.length === 0) return 'No candidates';
        const maxVotes = Math.max(...candidates.map(c => c.votes));
        if (maxVotes === 0) return 'No votes cast';
        const winners = candidates.filter(c => c.votes === maxVotes);
        return winners.length === 1
            ? `🏆 ${winners[0].name} (${maxVotes} votes)`
            : `🤝 Tie: ${winners.map(w => w.name).join(' & ')}`;
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="vdash" style={{ padding: '2rem 0' }}>
            <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 1.25rem' }}>

                {/* ── Header ── */}
                <div className="vd-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0c2340', letterSpacing: '-.02em', margin: 0 }}>
                            Voter Dashboard
                        </h1>
                        <p style={{ color: '#5ba8cc', marginTop: '.3rem', fontSize: '.9rem', fontWeight: 500 }}>
                            View and participate in active elections
                        </p>
                    </div>
                    <button
                        onClick={fetchElections}
                        className="vd-btn-refresh"
                        style={{ borderRadius: '.65rem', padding: '.5rem .6rem', display: 'flex', alignItems: 'center' }}
                        title="Refresh"
                    >
                        <RefreshCw style={{ width: 17, height: 17 }} className={loading ? 'vd-spin' : ''} />
                    </button>
                </div>

                {/* ── Announcements ── */}
                {announcements.length > 0 && (
                    <div className="vd-announce vd-fade-up vd-d1" style={{ borderRadius: '1.25rem', padding: '1.25rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.75rem' }}>
                            <Bell style={{ width: 15, height: 15, color: '#0ea5e9' }} />
                            <span style={{ fontSize: '.72rem', fontWeight: 800, color: '#0369a1', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                                Announcements
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.15rem' }}>
                            {announcements.slice(0, 3).map((a, i) => (
                                <div key={a.id ?? i} className="vd-announce-row">
                                    <span style={{ fontSize: '.875rem', color: '#0c2340' }}>📢 {a.message}</span>
                                    <span style={{ fontSize: '.72rem', color: '#7ab8d8', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: "'JetBrains Mono',monospace" }}>
                                        {new Date(a.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Tabs ── */}
                <div className="vd-tabs vd-fade-up vd-d2" style={{ display: 'flex', gap: '.25rem', padding: '.3rem', borderRadius: '.85rem', width: 'fit-content', marginBottom: '2rem' }}>
                    {['active', 'upcoming', 'closed'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`vd-tab${activeTab === tab ? ' vd-tab-active' : ''}`}
                            style={{ padding: '.5rem 1.5rem', borderRadius: '.6rem', fontFamily: 'inherit' }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* ── Election Grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {loading && filteredElections.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3.5rem 0' }}>
                            <p className="vd-loading">Loading elections...</p>
                        </div>
                    ) : filteredElections.length === 0 ? (
                        <div className="vd-empty" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4.5rem 1rem', borderRadius: '1.25rem' }}>
                            No {activeTab} elections found.
                        </div>
                    ) : (
                        filteredElections.map(election => {
                            const now = Date.now();
                            const isActive = now >= election.startTime && now <= election.endTime && !election.isPaused;

                            const btnClass = (isActive && (!election.isPrivate || election.isEligible))
                                ? 'vd-btn-vote-active'
                                : (election.isPrivate && !election.isEligible)
                                    ? 'vd-btn-locked'
                                    : activeTab === 'closed'
                                        ? 'vd-btn-view-results'
                                        : 'vd-btn-disabled';

                            return (
                                <div key={election.id} className="vd-card" style={{ borderRadius: '1.2rem', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>

                                    {/* Eligibility badge */}
                                    {election.isPrivate && (
                                        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                                            {election.isEligible ? (
                                                <span className="vd-badge-eligible">
                                                    <CheckCircle style={{ width: 10, height: 10 }} /> Eligible
                                                </span>
                                            ) : (
                                                <span className="vd-badge-restricted">
                                                    <Lock style={{ width: 10, height: 10 }} /> Restricted
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Title / description */}
                                    <div style={{ marginBottom: '1.1rem', flex: 1 }}>
                                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0c2340', margin: '0 0 .3rem', paddingRight: '4.5rem', lineHeight: 1.3 }}>
                                            {election.name}
                                        </h3>
                                        <p style={{ fontSize: '.82rem', color: '#5ba8cc', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {election.description}
                                        </p>
                                    </div>

                                    {/* Meta rows */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginBottom: '1.1rem' }}>
                                        <div className="vd-meta">
                                            <span className="vd-meta-label"><Calendar style={{ width: 13, height: 13 }} /> Ends</span>
                                            <span className="vd-meta-value" style={{ fontSize: '.8rem' }}>{new Date(election.endTime).toLocaleString()}</span>
                                        </div>
                                        <div className="vd-meta">
                                            <span className="vd-meta-label"><Vote style={{ width: 13, height: 13 }} /> Total Votes</span>
                                            <span className="vd-meta-value">{election.totalVotes}</span>
                                        </div>
                                        <div className="vd-meta">
                                            <span className="vd-meta-label"><Clock style={{ width: 13, height: 13 }} /> Your Status</span>
                                            {election.hasVoted ? (
                                                <span className="vd-chip-voted">
                                                    <CheckCircle style={{ width: 11, height: 11 }} /> Voted
                                                </span>
                                            ) : (
                                                <span className="vd-chip-notvoted">Not Voted</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <button
                                        onClick={() => handleOpenVote(election)}
                                        disabled={(!isActive && activeTab !== 'closed') || (election.isPrivate && !election.isEligible)}
                                        className={btnClass}
                                        style={{ width: '100%', padding: '.65rem 1rem', borderRadius: '.75rem', fontSize: '.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.45rem' }}
                                    >
                                        {election.isPrivate && !election.isEligible ? (
                                            <><Lock style={{ width: 14, height: 14 }} /> Not Authorized</>
                                        ) : election.isPaused ? (
                                            '⏸ Election Paused'
                                        ) : isActive ? (
                                            election.hasVoted ? '✓ Already Voted' : <><Vote style={{ width: 14, height: 14 }} /> Vote Now</>
                                        ) : activeTab === 'closed' ? (
                                            'View Results'
                                        ) : (
                                            '⏳ Not Started Yet'
                                        )}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── Modal ── */}
            {selectedElection && (
                <div className="vd-overlay">
                    <div className="vd-modal">

                        {/* Modal Header */}
                        <div className="vd-modal-header">
                            <div>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0c2340', margin: '0 0 .3rem', letterSpacing: '-.01em' }}>
                                    {selectedElection.name}
                                </h2>
                                <p style={{ margin: 0, fontSize: '.82rem', color: '#5ba8cc' }}>
                                    {selectedElection.totalVotes} votes &nbsp;•&nbsp;
                                    {selectedElection.isResultsPublished
                                        ? <span style={{ color: '#047857' }}>✅ Results Declared</span>
                                        : <span style={{ color: '#0ea5e9' }}>Polling Open</span>}
                                </p>
                            </div>
                            <button className="vd-modal-close" onClick={() => setSelectedElection(null)}>✕</button>
                        </div>

                        {/* Candidates */}
                        <div className="vd-modal-body" style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                            {candidates.length === 0 ? (
                                <p className="vd-loading" style={{ textAlign: 'center', padding: '2.5rem 0' }}>Loading candidates...</p>
                            ) : (
                                candidates.map(candidate => (
                                    <div key={candidate.id} className="vd-candidate" style={{ borderRadius: '.9rem', padding: '1rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem' }}>
                                            <div className="vd-avatar" style={{ width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
                                                {candidate.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '.95rem', fontWeight: 700, color: '#0c2340' }}>{candidate.name}</div>
                                                <div style={{ fontSize: '.72rem', color: '#7ab8d8', fontFamily: "'JetBrains Mono',monospace" }}>Candidate #{candidate.id}</div>
                                            </div>
                                        </div>

                                        {selectedElection.isResultsPublished ? (
                                            <div className="vd-count-box">
                                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0c2340', lineHeight: 1 }}>{candidate.votes}</div>
                                                <div style={{ fontSize: '.65rem', color: '#7ab8d8', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: '.1rem' }}>votes</div>
                                            </div>
                                        ) : selectedElection.hasVoted ? (
                                            <span className="vd-hidden-label">Hidden until end</span>
                                        ) : (
                                            <button
                                                onClick={() => handleVote(candidate.id)}
                                                className="vd-btn-cast"
                                                style={{ borderRadius: '.6rem', padding: '.5rem 1.1rem', fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}
                                            >
                                                <Vote style={{ width: 14, height: 14 }} /> Vote
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}

                            {/* Winner card */}
                            {selectedElection.isResultsPublished && candidates.length > 0 && (
                                <div className="vd-winner" style={{ borderRadius: '1rem', padding: '1.25rem 1.4rem', display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '.5rem' }}>
                                    <div className="vd-winner-crown">
                                        <Crown style={{ width: 26, height: 26, color: '#fff' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '.72rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.3rem' }}>
                                            Election Result
                                        </div>
                                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0c2340' }}>
                                            {getWinner(candidates)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoterDashboard;