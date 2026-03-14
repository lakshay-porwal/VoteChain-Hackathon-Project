import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, BarChart3, Trash2, RefreshCw, Send, Lock, Unlock, Users, Globe } from 'lucide-react';
import { useWeb3 } from '../App';

// TargetGroup enum matching the deployed contract
// 0 = All, 1 = VotersOnly, 2 = AdminsOnly
const TargetGroup = { All: 0, VotersOnly: 1, AdminsOnly: 2 };

/* ─── Injected Global Styles ─────────────────────────────────────────────── */
const injectStyles = () => {
    if (document.getElementById('admin-dash-styles')) return;
    const tag = document.createElement('style');
    tag.id = 'admin-dash-styles';
    tag.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

    .adash {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: linear-gradient(160deg, #f0f7ff 0%, #e6f2ff 40%, #f8fbff 100%);
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }

    /* Subtle mesh blobs */
    .adash::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      background:
        radial-gradient(ellipse 60% 50% at 10% 10%, rgba(147,210,255,0.35) 0%, transparent 60%),
        radial-gradient(ellipse 50% 40% at 90% 80%, rgba(186,227,255,0.28) 0%, transparent 60%),
        radial-gradient(ellipse 40% 30% at 60% 30%, rgba(219,241,255,0.20) 0%, transparent 55%);
    }

    .adash > * { position: relative; z-index: 1; }

    /* ── animations ── */
    @keyframes adFadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes adPulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(56,182,255,0.30); }
      50%      { box-shadow: 0 0 0 7px rgba(56,182,255,0.00); }
    }
    @keyframes adBlink {
      0%,100% { opacity: 1; }
      50%      { opacity: 0.25; }
    }
    @keyframes adSpin { to { transform: rotate(360deg); } }
    @keyframes adShimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }

    .ad-fade-up { animation: adFadeUp 0.5s cubic-bezier(.22,.68,0,1.15) both; }
    .ad-d1 { animation-delay: .06s; }
    .ad-d2 { animation-delay: .12s; }
    .ad-spin { animation: adSpin .75s linear infinite; }

    /* ── Header badge ── */
    .ad-badge {
      background: linear-gradient(90deg, #0ea5e9, #38bdf8, #0ea5e9);
      background-size: 200% auto;
      animation: adShimmer 3s linear infinite;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .ad-badge-wrap {
      background: linear-gradient(135deg, rgba(14,165,233,0.12), rgba(56,189,248,0.08));
      border: 1px solid rgba(14,165,233,0.30);
      animation: adPulse 2.5s ease-in-out infinite;
      backdrop-filter: blur(8px);
    }

    /* ── Glass cards ── */
    .ad-glass {
      background: rgba(255,255,255,0.72);
      border: 1px solid rgba(147,210,255,0.45);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      box-shadow:
        0 1px 0 0 rgba(255,255,255,0.9) inset,
        0 4px 24px rgba(14,165,233,0.07),
        0 1px 4px rgba(14,165,233,0.06);
      transition: box-shadow .25s, border-color .25s, transform .22s;
    }
    .ad-glass:hover {
      border-color: rgba(56,182,255,0.55);
      box-shadow:
        0 1px 0 0 rgba(255,255,255,0.95) inset,
        0 8px 32px rgba(14,165,233,0.13),
        0 2px 8px rgba(14,165,233,0.10);
      transform: translateY(-1px);
    }

    /* announcement panel */
    .ad-announce {
      background: linear-gradient(135deg, rgba(224,242,255,0.85), rgba(240,249,255,0.80));
      border: 1px solid rgba(56,189,248,0.40);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 4px 28px rgba(14,165,233,0.10), 0 1px 0 rgba(255,255,255,0.9) inset;
    }

    /* ── Inputs ── */
    .ad-input {
      background: rgba(255,255,255,0.85);
      border: 1.5px solid rgba(147,210,255,0.50);
      color: #0c2340;
      transition: border-color .2s, box-shadow .2s, background .2s;
      outline: none;
    }
    .ad-input::placeholder { color: #93c4e0; }
    .ad-input:focus {
      background: #ffffff;
      border-color: #38bdf8;
      box-shadow: 0 0 0 3px rgba(56,189,248,0.18);
    }

    .ad-input-danger { border-color: rgba(248,113,113,0.45) !important; }
    .ad-input-danger:focus {
      border-color: #f87171 !important;
      box-shadow: 0 0 0 3px rgba(248,113,113,0.15) !important;
    }

    /* ── Select ── */
    .ad-select {
      background: rgba(255,255,255,0.90);
      border: 1.5px solid rgba(147,210,255,0.50);
      color: #0c2340;
      transition: border-color .2s, box-shadow .2s;
      outline: none;
      cursor: pointer;
    }
    .ad-select:focus {
      border-color: #38bdf8;
      box-shadow: 0 0 0 3px rgba(56,189,248,0.18);
    }

    /* ── Primary button ── */
    .ad-btn-primary {
      background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #0284c7 100%);
      background-size: 200% 200%;
      background-position: 0% 50%;
      border: none;
      color: #fff;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 700;
      letter-spacing: .01em;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(14,165,233,0.35), 0 1px 0 rgba(255,255,255,0.25) inset;
      transition: background-position .4s, box-shadow .25s, transform .18s, opacity .2s;
    }
    .ad-btn-primary:hover:not(:disabled) {
      background-position: 100% 50%;
      box-shadow: 0 6px 24px rgba(14,165,233,0.50), 0 1px 0 rgba(255,255,255,0.25) inset;
      transform: translateY(-1px);
    }
    .ad-btn-primary:active:not(:disabled) { transform: translateY(0); }
    .ad-btn-primary:disabled { opacity: .48; cursor: not-allowed; }

    /* ── Send button ── */
    .ad-btn-send {
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      color: #fff;
      font-weight: 600;
      border: none;
      cursor: pointer;
      box-shadow: 0 3px 12px rgba(14,165,233,0.35);
      transition: box-shadow .2s, transform .18s, opacity .2s;
    }
    .ad-btn-send:hover:not(:disabled) {
      box-shadow: 0 5px 20px rgba(14,165,233,0.50);
      transform: translateY(-1px);
    }
    .ad-btn-send:disabled { opacity: .45; cursor: not-allowed; }

    /* ── Tab buttons ── */
    .ad-tabs {
      background: rgba(224,242,255,0.60);
      border: 1px solid rgba(147,210,255,0.40);
      backdrop-filter: blur(10px);
    }
    .ad-tab {
      color: #5ba8cc;
      font-weight: 600;
      font-size: .8125rem;
      transition: background .2s, color .2s, box-shadow .2s;
      cursor: pointer;
      border: none;
      background: transparent;
    }
    .ad-tab:hover { color: #0ea5e9; background: rgba(14,165,233,0.08); }
    .ad-tab-active {
      background: linear-gradient(135deg, #0ea5e9, #38bdf8) !important;
      color: #fff !important;
      box-shadow: 0 2px 10px rgba(14,165,233,0.35);
    }

    /* ── Action buttons ── */
    .ad-btn-pause {
      background: rgba(251,191,36,0.10);
      border: 1px solid rgba(251,191,36,0.35);
      color: #b45309;
      font-weight: 600;
      cursor: pointer;
      transition: background .2s, border-color .2s, transform .18s;
    }
    .ad-btn-pause:hover {
      background: rgba(251,191,36,0.20);
      border-color: rgba(251,191,36,0.60);
      transform: translateY(-1px);
    }

    .ad-btn-publish {
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      color: #fff;
      border: none;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 3px 12px rgba(124,58,237,0.30);
      transition: box-shadow .2s, transform .18s;
    }
    .ad-btn-publish:hover {
      box-shadow: 0 5px 18px rgba(124,58,237,0.45);
      transform: translateY(-1px);
    }

    .ad-btn-extend {
      background: rgba(14,165,233,0.10);
      border: 1px solid rgba(14,165,233,0.30);
      color: #0369a1;
      font-weight: 600;
      cursor: pointer;
      transition: background .2s, transform .18s;
    }
    .ad-btn-extend:hover {
      background: rgba(14,165,233,0.20);
      transform: translateY(-1px);
    }

    .ad-btn-delete {
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.28);
      color: #dc2626;
      cursor: pointer;
      transition: background .2s, transform .18s;
    }
    .ad-btn-delete:hover {
      background: rgba(239,68,68,0.18);
      transform: translateY(-1px);
    }

    .ad-btn-refresh {
      color: #5ba8cc;
      background: rgba(14,165,233,0.07);
      border: 1px solid rgba(147,210,255,0.35);
      cursor: pointer;
      transition: background .2s, color .2s, transform .2s;
    }
    .ad-btn-refresh:hover {
      background: rgba(14,165,233,0.14);
      color: #0ea5e9;
      transform: rotate(15deg);
    }

    /* ── Status pills ── */
    .ad-pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: .72rem;
      font-weight: 500;
      letter-spacing: .04em;
      border-radius: 9999px;
      padding: .25rem .75rem;
      border-width: 1px;
      border-style: solid;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
    }
    .ad-pill-live     { background: rgba(16,185,129,0.12); color: #059669; border-color: rgba(16,185,129,0.35); }
    .ad-pill-closed   { background: rgba(239,68,68,0.10);  color: #dc2626; border-color: rgba(239,68,68,0.28); }
    .ad-pill-upcoming { background: rgba(14,165,233,0.10); color: #0284c7; border-color: rgba(14,165,233,0.30); }
    .ad-pill-paused   { background: rgba(251,191,36,0.12); color: #b45309; border-color: rgba(251,191,36,0.35); }
    .ad-pill-deleted  { background: rgba(148,163,184,0.12); color: #64748b; border-color: rgba(148,163,184,0.30); }

    /* live dot */
    .ad-live-dot {
      display: inline-block;
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #10b981;
      animation: adBlink 1.1s ease-in-out infinite;
      margin-right: 5px;
    }

    /* info / success strip */
    .ad-pill-info {
      background: rgba(14,165,233,0.08);
      border: 1px solid rgba(14,165,233,0.25);
      color: #0369a1;
      font-size: .75rem;
      font-weight: 600;
    }
    .ad-pill-success {
      background: rgba(16,185,129,0.08);
      border: 1px solid rgba(16,185,129,0.25);
      color: #047857;
      font-size: .75rem;
      font-weight: 600;
    }

    /* ── Toggle ── */
    .ad-toggle-track { transition: background .25s, box-shadow .25s; }
    .ad-toggle-thumb { transition: transform .25s; box-shadow: 0 1px 4px rgba(0,0,0,0.18); }

    /* ── Section titles ── */
    .ad-section-label { color: #0369a1; font-weight: 800; letter-spacing: -.01em; }

    /* ── Form labels ── */
    .ad-label       { color: #3a7fa8; font-size: .8125rem; font-weight: 600; }
    .ad-label-danger { color: #dc2626; font-size: .8125rem; font-weight: 600; }
    .ad-helper      { color: #7ab8d8; font-size: .72rem; margin-top: .25rem; }

    /* private badge */
    .ad-private-badge {
      display: inline-flex; align-items: center;
      background: rgba(239,68,68,0.10);
      border: 1px solid rgba(239,68,68,0.28);
      border-radius: 9999px;
      padding: .1rem .45rem;
      gap: .25rem;
    }

    /* ── Empty / loading ── */
    .ad-empty {
      background: rgba(255,255,255,0.50);
      border: 1.5px dashed rgba(147,210,255,0.55);
      color: #7ab8d8;
    }
    @keyframes adPulseText { 0%,100%{opacity:.5} 50%{opacity:1} }
    .ad-loading-text { animation: adPulseText 1.4s ease-in-out infinite; color: #5ba8cc; }

    /* card separator */
    .ad-card-sep { border-color: rgba(147,210,255,0.35); }

    /* scrollbar */
    .adash ::-webkit-scrollbar { width: 5px; height: 5px; }
    .adash ::-webkit-scrollbar-track { background: rgba(147,210,255,0.15); border-radius: 99px; }
    .adash ::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.40); border-radius: 99px; }

    /* ── Dark Mode Overrides ── */
    html.dark .adash { background: linear-gradient(160deg, #020617 0%, #0f172a 40%, #1e293b 100%); color: #f8fafc; }
    html.dark .adash::before {
      background:
        radial-gradient(ellipse 60% 50% at 10% 10%, rgba(14,165,233,0.15) 0%, transparent 60%),
        radial-gradient(ellipse 50% 40% at 90% 80%, rgba(56,189,248,0.15) 0%, transparent 60%),
        radial-gradient(ellipse 40% 30% at 60% 30%, rgba(99,102,241,0.1) 0%, transparent 55%);
    }
    html.dark .adash h1, html.dark .adash h2, html.dark .adash h3, html.dark .adash div { color: #f8fafc; }
    html.dark .adash p, html.dark .adash span { color: #cbd5e1; }
    
    html.dark .ad-badge-wrap { background: rgba(15,23,42,0.6); border-color: rgba(56,189,248,0.3); }
    html.dark .ad-glass { background: rgba(30,41,59,0.7); border-color: rgba(56,189,248,0.2); box-shadow: 0 1px 0 rgba(255,255,255,0.05) inset, 0 4px 24px rgba(0,0,0,0.3); }
    html.dark .ad-glass:hover { border-color: rgba(56,189,248,0.5); }
    html.dark .ad-announce { background: rgba(15,23,42,0.8); border-color: rgba(56,189,248,0.3); }
    
    html.dark .ad-input, html.dark .ad-select { background: rgba(15,23,42,0.8); border-color: rgba(56,189,248,0.3); color: #f8fafc; }
    html.dark .ad-input:focus, html.dark .ad-select:focus { background: rgba(30,41,59,0.9); }
    html.dark .ad-input::placeholder { color: #64748b; }
    
    html.dark .ad-tabs { background: rgba(30,41,59,0.7); border-color: rgba(56,189,248,0.2); }
    html.dark .ad-tab { color: #94a3b8; }
    html.dark .ad-tab:hover { color: #e2e8f0; background: rgba(14,165,233,0.15); }
    html.dark .ad-tab-active { color: #fff !important; }
    
    html.dark .ad-btn-refresh { background: rgba(14,165,233,0.15); border-color: rgba(14,165,233,0.3); color: #bae6fd; }
    html.dark .ad-btn-refresh:hover { background: rgba(14,165,233,0.3); color: #38bdf8; }
    
    html.dark .ad-label { color: #bae6fd !important; }
    html.dark .ad-helper { color: #94a3b8 !important; }
    html.dark .ad-empty { background: rgba(30,41,59,0.5); border-color: rgba(56,189,248,0.3); color: #94a3b8; }
    
    html.dark .ad-card-sep { border-color: rgba(56,189,248,0.2); }

    /* Override inline styles for specific elements */
    html.dark .ad-glass h3 { color: #f8fafc !important; }
    html.dark .ad-glass p { color: #cbd5e1 !important; }
  `;
    document.head.appendChild(tag);
};

const AdminDashboard = () => {
    const { contract, addNotification } = useWeb3();
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('active');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: 60,
        candidates: '',
        isPrivate: false,
        allowedVoters: ''
    });

    const [announcementMsg, setAnnouncementMsg] = useState('');
    const [announcementTarget, setAnnouncementTarget] = useState(0);

    useEffect(() => { injectStyles(); }, []);

    // ─── Fetch Elections ───────────────────────────────────────────────────────
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
                        candidateCount: Number(d.candidateCount)
                    });
                } catch { /* skip bad election */ }
            }
            setElections(fetched);
        } catch (err) {
            console.error('fetchElections error:', err);
            addNotification('Failed to load elections from contract', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchElections();
        const interval = setInterval(fetchElections, 12000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contract]);

    // ─── Create Election ───────────────────────────────────────────────────────
    const handleCreateElection = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.candidates) {
            addNotification('Election title and candidates are required', 'warning');
            return;
        }
        const candidateList = formData.candidates.split(',').map(c => c.trim()).filter(Boolean);
        if (candidateList.length < 2) {
            addNotification('At least 2 candidates are required', 'warning');
            return;
        }
        const voterList = formData.allowedVoters.split(',').map(v => v.trim()).filter(Boolean);
        if (formData.isPrivate && voterList.length === 0) {
            if (!confirm('You are creating a Private election with NO allowed voters. Continue?')) return;
        }
        try {
            addNotification('Creating election... Confirm in MetaMask.', 'info');
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + Number(formData.duration) * 60;
            const tx = await contract.createElection(
                formData.name, formData.description, startTime, endTime,
                candidateList, formData.isPrivate, voterList
            );
            addNotification('Transaction submitted. Waiting for confirmation...', 'info');
            await tx.wait();
            addNotification('Election created successfully! 🎉', 'success');
            setFormData({ name: '', description: '', duration: 60, candidates: '', isPrivate: false, allowedVoters: '' });
            fetchElections();
        } catch (err) {
            console.error('createElection error:', err);
            addNotification(err.reason || 'Failed to create election', 'error');
        }
    };

    // ─── Publish Results ───────────────────────────────────────────────────────
    const handlePublishResults = async (id) => {
        try {
            addNotification('Publishing results... Confirm in MetaMask.', 'info');
            const tx = await contract.publishResults(id);
            await tx.wait();
            addNotification('Results published! ✅', 'success');
            fetchElections();
        } catch (err) {
            console.error(err);
            addNotification(err.reason || 'Failed to publish results', 'error');
        }
    };

    // ─── Restart / Extend Election ─────────────────────────────────────────────
    const handleRestartElection = async (id) => {
        const duration = prompt('Extend duration by how many minutes?', '60');
        if (!duration || isNaN(duration)) return;
        try {
            addNotification('Extending election... Confirm in MetaMask.', 'info');
            const newEndTime = Math.floor(Date.now() / 1000) + parseInt(duration) * 60;
            const tx = await contract.restartElection(id, newEndTime);
            await tx.wait();
            addNotification('Election extended! ✅', 'success');
            fetchElections();
        } catch (err) {
            console.error(err);
            addNotification(err.reason || 'Failed to extend election', 'error');
        }
    };

    // ─── Pause / Resume ────────────────────────────────────────────────────────
    const handleTogglePause = async (election) => {
        try {
            if (election.isPaused) {
                addNotification('Resuming election... Confirm in MetaMask.', 'info');
                const tx = await contract.resumeElection(election.id);
                await tx.wait();
                addNotification('Election resumed! ▶️', 'success');
            } else {
                addNotification('Pausing election... Confirm in MetaMask.', 'info');
                const tx = await contract.pauseElection(election.id);
                await tx.wait();
                addNotification('Election paused! ⏸️', 'success');
            }
            fetchElections();
        } catch (err) {
            console.error(err);
            addNotification(err.reason || 'Failed to toggle pause', 'error');
        }
    };

    // ─── Delete Election ───────────────────────────────────────────────────────
    const handleDeleteElection = async (id) => {
        if (!confirm('Move this election to trash? Voters will no longer see it.')) return;
        try {
            addNotification('Deleting election... Confirm in MetaMask.', 'info');
            const tx = await contract.deleteElection(id);
            await tx.wait();
            addNotification('Election moved to trash 🗑️', 'success');
            fetchElections();
        } catch (err) {
            console.error(err);
            addNotification(err.reason || 'Failed to delete election', 'error');
        }
    };

    // ─── Announcement ──────────────────────────────────────────────────────────
    const handleMakeAnnouncement = async (e) => {
        e.preventDefault();
        if (!announcementMsg.trim()) return;
        try {
            addNotification('Sending announcement... Confirm in MetaMask.', 'info');
            const tx = await contract.addAnnouncement(announcementMsg.trim(), announcementTarget);
            await tx.wait();
            addNotification('Announcement sent! 📣', 'success');
            setAnnouncementMsg('');
        } catch (err) {
            console.error(err);
            addNotification(err.reason || 'Failed to send announcement', 'error');
        }
    };

    const filteredElections = elections.filter(e => {
        const now = Date.now();
        if (activeTab === 'trash')    return e.isDeleted;
        if (e.isDeleted)              return false;
        if (activeTab === 'active')   return now >= e.startTime && now <= e.endTime;
        if (activeTab === 'upcoming') return now < e.startTime;
        if (activeTab === 'past')     return now > e.endTime;
        return true;
    });

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="adash" style={{ padding: '2rem 0' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* ── Header ── */}
                <header className="ad-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0c2340', letterSpacing: '-.02em', margin: 0 }}>
                            Admin Dashboard
                        </h1>
                        <p style={{ color: '#5ba8cc', marginTop: '.35rem', fontSize: '.95rem', fontWeight: 500 }}>
                            Manage elections and communicate with voters
                        </p>
                    </div>
                    <div className="ad-badge-wrap" style={{ borderRadius: 9999, padding: '.4rem 1.1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <span style={{ fontSize: '1rem' }}>🛡️</span>
                        <span className="ad-badge" style={{ fontWeight: 700, fontSize: '.875rem' }}>Administrator Mode</span>
                    </div>
                </header>

                {/* ── Announcement Panel ── */}
                <div className="ad-announce ad-fade-up ad-d1" style={{ borderRadius: '1.25rem', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0c2340', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: 0 }}>
                        <Send style={{ width: 18, height: 18, color: '#0ea5e9' }} />
                        Make Announcement
                    </h2>
                    <form onSubmit={handleMakeAnnouncement} style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            className="ad-input"
                            style={{ flex: '1 1 200px', borderRadius: '.6rem', padding: '.65rem 1rem', fontSize: '.9rem', fontFamily: 'inherit' }}
                            placeholder="Broadcast a message to voters..."
                            value={announcementMsg}
                            onChange={e => setAnnouncementMsg(e.target.value)}
                        />
                        <select
                            className="ad-select"
                            style={{ borderRadius: '.6rem', padding: '.65rem .85rem', fontSize: '.875rem', fontFamily: 'inherit', fontWeight: 600 }}
                            value={announcementTarget}
                            onChange={e => setAnnouncementTarget(Number(e.target.value))}
                        >
                            <option value={TargetGroup.All}>📢 All</option>
                            <option value={TargetGroup.VotersOnly}>🗳️ Voters Only</option>
                            <option value={TargetGroup.AdminsOnly}>🛡️ Admins Only</option>
                        </select>
                        <button
                            type="submit"
                            disabled={!announcementMsg.trim()}
                            className="ad-btn-send"
                            style={{ borderRadius: '.6rem', padding: '.65rem 1.5rem', fontSize: '.9rem', fontFamily: 'inherit' }}
                        >
                            Send
                        </button>
                    </form>
                </div>

                {/* ── Main Grid ── */}
                <div className="ad-fade-up ad-d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                    {/* ── Create Election Form ── */}
                    <div className="ad-glass" style={{ borderRadius: '1.25rem', padding: '1.75rem', alignSelf: 'start' }}>
                        <h2 className="ad-section-label" style={{ fontSize: '1.1rem', marginBottom: '1.5rem', marginTop: 0, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                            <Plus style={{ width: 18, height: 18, color: '#0ea5e9' }} />
                            New Election
                        </h2>
                        <form onSubmit={handleCreateElection} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                            <div>
                                <label className="ad-label" style={{ display: 'block', marginBottom: '.35rem' }}>Election Title *</label>
                                <input
                                    type="text" required
                                    className="ad-input"
                                    style={{ width: '100%', borderRadius: '.6rem', padding: '.65rem 1rem', fontSize: '.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                    placeholder="e.g. Class Monitor 2026"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="ad-label" style={{ display: 'block', marginBottom: '.35rem' }}>Description</label>
                                <textarea
                                    className="ad-input"
                                    style={{ width: '100%', borderRadius: '.6rem', padding: '.65rem 1rem', fontSize: '.875rem', fontFamily: 'inherit', height: 76, resize: 'none', boxSizing: 'border-box' }}
                                    placeholder="Brief description..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                                <div>
                                    <label className="ad-label" style={{ display: 'block', marginBottom: '.35rem' }}>Duration (min)</label>
                                    <input
                                        type="number" min="1"
                                        className="ad-input"
                                        style={{ width: '100%', borderRadius: '.6rem', padding: '.65rem 1rem', fontSize: '.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '.25rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '.6rem', width: '100%' }}>
                                        <div
                                            onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                                            className="ad-toggle-track"
                                            style={{
                                                position: 'relative', width: 40, height: 22, borderRadius: 999, cursor: 'pointer',
                                                background: formData.isPrivate
                                                    ? 'linear-gradient(135deg,#f87171,#ef4444)'
                                                    : 'linear-gradient(135deg,#38bdf8,#0ea5e9)',
                                                boxShadow: formData.isPrivate
                                                    ? '0 2px 8px rgba(239,68,68,0.35)'
                                                    : '0 2px 8px rgba(14,165,233,0.35)'
                                            }}
                                        >
                                            <span
                                                className="ad-toggle-thumb"
                                                style={{
                                                    position: 'absolute', top: 3, left: 3,
                                                    width: 16, height: 16, background: '#fff', borderRadius: '50%',
                                                    transform: formData.isPrivate ? 'translateX(18px)' : 'translateX(0)'
                                                }}
                                            />
                                        </div>
                                        <span style={{ fontSize: '.85rem', fontWeight: 600, color: '#0c2340', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                                            {formData.isPrivate
                                                ? <><Lock style={{ width: 13, height: 13, color: '#ef4444' }} /> Private</>
                                                : <><Globe style={{ width: 13, height: 13, color: '#0ea5e9' }} /> Public</>}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {formData.isPrivate && (
                                <div>
                                    <label className="ad-label-danger" style={{ display: 'flex', alignItems: 'center', gap: '.3rem', marginBottom: '.35rem' }}>
                                        <Users style={{ width: 13, height: 13 }} /> Allowed Voters (comma-separated addresses)
                                    </label>
                                    <textarea
                                        className="ad-input ad-input-danger"
                                        style={{ width: '100%', borderRadius: '.6rem', padding: '.65rem 1rem', fontSize: '.78rem', fontFamily: "'JetBrains Mono', monospace", height: 76, resize: 'none', boxSizing: 'border-box' }}
                                        placeholder="0x123..., 0x456..."
                                        value={formData.allowedVoters}
                                        onChange={e => setFormData({ ...formData, allowedVoters: e.target.value })}
                                    />
                                    <p className="ad-helper">You can add more voters after creation.</p>
                                </div>
                            )}

                            <div>
                                <label className="ad-label" style={{ display: 'block', marginBottom: '.35rem' }}>
                                    Candidates * <span style={{ fontWeight: 400, color: '#7ab8d8', fontSize: '.75rem' }}>(comma-separated)</span>
                                </label>
                                <input
                                    type="text" required
                                    className="ad-input"
                                    style={{ width: '100%', borderRadius: '.6rem', padding: '.65rem 1rem', fontSize: '.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                    placeholder="Alice, Bob, Charlie"
                                    value={formData.candidates}
                                    onChange={e => setFormData({ ...formData, candidates: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="ad-btn-primary"
                                style={{ width: '100%', borderRadius: '.7rem', padding: '.8rem 1.5rem', fontSize: '.925rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', marginTop: '.25rem' }}
                            >
                                <Plus style={{ width: 16, height: 16 }} />
                                Create Election
                            </button>
                        </form>
                    </div>

                    {/* ── Election List ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 className="ad-section-label" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '.5rem', margin: 0 }}>
                                <BarChart3 style={{ width: 18, height: 18, color: '#0ea5e9' }} />
                                Manage Elections
                            </h2>
                            <button
                                onClick={fetchElections}
                                className="ad-btn-refresh"
                                style={{ borderRadius: '.6rem', padding: '.45rem .55rem', display: 'flex', alignItems: 'center' }}
                                title="Refresh"
                            >
                                <RefreshCw style={{ width: 15, height: 15 }} className={loading ? 'ad-spin' : ''} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="ad-tabs" style={{ display: 'flex', gap: '.25rem', padding: '.3rem', borderRadius: '.85rem', width: 'fit-content' }}>
                            {['active', 'upcoming', 'past', 'trash'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`ad-tab${activeTab === tab ? ' ad-tab-active' : ''}`}
                                    style={{ padding: '.45rem 1rem', borderRadius: '.6rem', fontFamily: 'inherit' }}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Cards */}
                        {loading && elections.length === 0 ? (
                            <p className="ad-loading-text" style={{ textAlign: 'center', padding: '3rem 0', fontWeight: 600 }}>
                                Loading elections...
                            </p>
                        ) : filteredElections.length === 0 ? (
                            <div className="ad-empty" style={{ textAlign: 'center', padding: '4rem 1rem', borderRadius: '1.25rem', fontWeight: 600 }}>
                                No {activeTab} elections found.
                            </div>
                        ) : (
                            filteredElections.map((election) => {
                                const now = Date.now();
                                const isLive     = now >= election.startTime && now <= election.endTime;
                                const isEnded    = now > election.endTime;
                                const isUpcoming = now < election.startTime;

                                let pillClass = 'ad-pill-upcoming';
                                let pillLabel = 'UPCOMING';
                                if (election.isDeleted)  { pillClass = 'ad-pill-deleted'; pillLabel = 'DELETED'; }
                                else if (election.isPaused) { pillClass = 'ad-pill-paused'; pillLabel = 'PAUSED'; }
                                else if (isLive)  { pillClass = 'ad-pill-live';   pillLabel = 'LIVE'; }
                                else if (isEnded) { pillClass = 'ad-pill-closed'; pillLabel = 'CLOSED'; }

                                return (
                                    <div key={election.id} className="ad-glass" style={{ borderRadius: '1.1rem', padding: '1.4rem' }}>

                                        {/* Card header */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '.75rem' }}>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0c2340', margin: 0 }}>{election.name}</h3>
                                                    {election.isPrivate && (
                                                        <span className="ad-private-badge">
                                                            <Lock style={{ width: 11, height: 11, color: '#dc2626' }} />
                                                            <span style={{ fontSize: '.7rem', fontWeight: 700, color: '#dc2626' }}>Private</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <p style={{ fontSize: '.8rem', color: '#5ba8cc', marginTop: '.25rem', marginBottom: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                                    {election.description}
                                                </p>
                                            </div>
                                            <span className={`ad-pill ${pillClass}`}>
                                                {isLive && !election.isPaused && !election.isDeleted && <span className="ad-live-dot" />}
                                                {pillLabel}
                                            </span>
                                        </div>

                                        {/* Meta */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.5rem', marginBottom: '1rem' }}>
                                            {[
                                                { icon: <Calendar style={{ width: 13, height: 13, color: '#38bdf8', flexShrink: 0 }} />, text: new Date(election.startTime).toLocaleDateString() },
                                                { icon: <Clock    style={{ width: 13, height: 13, color: '#38bdf8', flexShrink: 0 }} />, text: new Date(election.endTime).toLocaleString() },
                                                { icon: <BarChart3 style={{ width: 13, height: 13, color: '#38bdf8' }} />,               text: `${election.totalVotes} votes` }
                                            ].map((m, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                                                    {m.icon}
                                                    <span style={{ fontSize: '.78rem', color: '#4a90b8', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{m.text}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        {!election.isDeleted && (
                                            <div className="ad-card-sep" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', borderTop: '1px solid', paddingTop: '1rem', flexWrap: 'wrap' }}>

                                                {(isLive || election.isPaused) && (
                                                    <button
                                                        onClick={() => handleTogglePause(election)}
                                                        className="ad-btn-pause"
                                                        style={{ borderRadius: '.55rem', padding: '.45rem .9rem', fontSize: '.78rem', fontFamily: 'inherit' }}
                                                    >
                                                        {election.isPaused ? '▶ Resume' : '⏸ Pause'}
                                                    </button>
                                                )}

                                                {isEnded && (
                                                    <>
                                                        {!election.isResultsPublished ? (
                                                            <button
                                                                onClick={() => handlePublishResults(election.id)}
                                                                className="ad-btn-publish"
                                                                style={{ flex: 1, borderRadius: '.55rem', padding: '.45rem .9rem', fontSize: '.78rem', fontFamily: 'inherit' }}
                                                            >
                                                                Publish Results
                                                            </button>
                                                        ) : (
                                                            <span className="ad-pill-success" style={{ flex: 1, textAlign: 'center', borderRadius: '.55rem', padding: '.45rem .9rem', display: 'inline-block' }}>
                                                                ✅ Results Published
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => handleRestartElection(election.id)}
                                                            className="ad-btn-extend"
                                                            style={{ borderRadius: '.55rem', padding: '.45rem .9rem', fontSize: '.78rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '.35rem' }}
                                                        >
                                                            <RefreshCw style={{ width: 12, height: 12 }} /> Extend
                                                        </button>
                                                    </>
                                                )}

                                                {(isLive || isUpcoming) && !election.isPaused && (
                                                    <span className="ad-pill-info" style={{ flex: 1, textAlign: 'center', borderRadius: '.55rem', padding: '.45rem .9rem', display: 'inline-block' }}>
                                                        Voting in Progress
                                                    </span>
                                                )}

                                                <button
                                                    onClick={() => handleDeleteElection(election.id)}
                                                    className="ad-btn-delete"
                                                    style={{ borderRadius: '.55rem', padding: '.45rem .65rem', display: 'flex', alignItems: 'center' }}
                                                    title="Move to Trash"
                                                >
                                                    <Trash2 style={{ width: 15, height: 15 }} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;