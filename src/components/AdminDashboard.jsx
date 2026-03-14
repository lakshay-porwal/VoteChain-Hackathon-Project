import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, BarChart3, Trash2, RefreshCw, Send, Lock, Unlock, Users, Globe } from 'lucide-react';
import { useWeb3 } from '../App';

// TargetGroup enum matching the deployed contract
// 0 = All, 1 = VotersOnly, 2 = AdminsOnly
const TargetGroup = { All: 0, VotersOnly: 1, AdminsOnly: 2 };

const AdminDashboard = () => {
    const { contract, addNotification } = useWeb3();
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('active');

    // Create Election Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: 60,      // minutes
        candidates: '',    // comma-separated
        isPrivate: false,
        allowedVoters: '' // comma-separated addresses
    });

    // Announcement State
    const [announcementMsg, setAnnouncementMsg] = useState('');
    const [announcementTarget, setAnnouncementTarget] = useState(0); // TargetGroup enum value

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

        const voterList = formData.allowedVoters
            .split(',').map(v => v.trim()).filter(Boolean);

        if (formData.isPrivate && voterList.length === 0) {
            if (!confirm('You are creating a Private election with NO allowed voters. Continue?')) return;
        }

        try {
            addNotification('Creating election... Confirm in MetaMask.', 'info');
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + Number(formData.duration) * 60;

            const tx = await contract.createElection(
                formData.name,
                formData.description,
                startTime,
                endTime,
                candidateList,
                formData.isPrivate,
                voterList
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
            // addAnnouncement(string _message, TargetGroup _targetGroup) — matches deployed ABI
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
        if (activeTab === 'trash') return e.isDeleted;
        if (e.isDeleted) return false;
        if (activeTab === 'active') return now >= e.startTime && now <= e.endTime;
        if (activeTab === 'upcoming') return now < e.startTime;
        if (activeTab === 'past') return now > e.endTime;
        return true;
    });

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-gray-400 mt-1">Manage elections and communicate with voters</p>
                </div>
                <div className="text-sm text-purple-300 bg-purple-900/30 px-4 py-1.5 rounded-full border border-purple-700/50">
                    🛡️ Administrator Mode
                </div>
            </header>

            {/* Announcement Panel */}
            <div className="bg-blue-900/20 border border-blue-800/50 p-6 rounded-2xl backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Send className="w-5 h-5 text-blue-400" />
                    Make Announcement
                </h2>
                <form onSubmit={handleMakeAnnouncement} className="flex gap-3 flex-wrap">
                    <input
                        type="text"
                        className="flex-1 min-w-[200px] bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Broadcast a message to voters..."
                        value={announcementMsg}
                        onChange={e => setAnnouncementMsg(e.target.value)}
                    />
                    {/* Target Group Picker */}
                    <select
                        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                    >
                        Send
                    </button>
                </form>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Election Form */}
                <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 h-fit">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-400" />
                        New Election
                    </h2>
                    <form onSubmit={handleCreateElection} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Election Title *</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="e.g. Class Monitor 2026"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                            <textarea
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none transition-all"
                                placeholder="Brief description..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Duration (min)</label>
                                <input
                                    type="number" min="1"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                />
                            </div>
                            <div className="flex items-end pb-1">
                                <label className="flex items-center cursor-pointer gap-2 w-full">
                                    <div
                                        onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                                        className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${formData.isPrivate ? 'bg-red-500' : 'bg-gray-600'}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${formData.isPrivate ? 'translate-x-5' : ''}`} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-300 flex items-center gap-1">
                                        {formData.isPrivate ? <Lock className="w-3 h-3 text-red-400" /> : <Globe className="w-3 h-3 text-green-400" />}
                                        {formData.isPrivate ? 'Private' : 'Public'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        {formData.isPrivate && (
                            <div className="animate-in slide-in-from-top duration-200">
                                <label className="block text-sm font-medium text-red-400 mb-1 flex items-center gap-1">
                                    <Users className="w-3 h-3" /> Allowed Voters (comma-separated addresses)
                                </label>
                                <textarea
                                    className="w-full bg-gray-900 border border-red-900/50 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 outline-none h-20 resize-none text-xs font-mono transition-all"
                                    placeholder="0x123..., 0x456..."
                                    value={formData.allowedVoters}
                                    onChange={e => setFormData({ ...formData, allowedVoters: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">You can add more voters after creation.</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Candidates * <span className="text-xs text-gray-500">(comma-separated)</span></label>
                            <input
                                type="text"
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Alice, Bob, Charlie"
                                value={formData.candidates}
                                onChange={e => setFormData({ ...formData, candidates: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                        >
                            <Plus className="w-4 h-4" />
                            Create Election
                        </button>
                    </form>
                </div>

                {/* Election List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-purple-400" />
                            Manage Elections
                        </h2>
                        <button onClick={fetchElections} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-all" title="Refresh">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-xl w-fit border border-gray-700/50">
                        {['active', 'upcoming', 'past', 'trash'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Election Cards */}
                    {loading && elections.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 animate-pulse">Loading elections...</div>
                    ) : filteredElections.length === 0 ? (
                        <div className="text-center py-16 text-gray-500 bg-gray-800/20 rounded-2xl border border-dashed border-gray-700">
                            No {activeTab} elections found.
                        </div>
                    ) : (
                        filteredElections.map(election => {
                            const now = Date.now();
                            const isLive = now >= election.startTime && now <= election.endTime;
                            const isEnded = now > election.endTime;
                            const isUpcoming = now < election.startTime;

                            let statusLabel = 'UPCOMING';
                            let statusColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                            if (election.isDeleted) { statusLabel = 'DELETED'; statusColor = 'bg-gray-700 text-gray-400 border-gray-600'; }
                            else if (election.isPaused) { statusLabel = 'PAUSED'; statusColor = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'; }
                            else if (isLive) { statusLabel = '🟢 LIVE'; statusColor = 'bg-green-500/20 text-green-400 border-green-500/30'; }
                            else if (isEnded) { statusLabel = 'CLOSED'; statusColor = 'bg-red-500/20 text-red-400 border-red-500/30'; }

                            return (
                                <div key={election.id} className="bg-gray-800/30 border border-gray-700 p-6 rounded-2xl hover:border-gray-500 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-lg font-bold text-white">{election.name}</h3>
                                                {election.isPrivate && <Lock className="w-4 h-4 text-red-400" title="Private" />}
                                                {election.isPaused && <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">PAUSED</span>}
                                            </div>
                                            <p className="text-sm text-gray-400 line-clamp-1 mt-0.5">{election.description}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${statusColor}`}>
                                            {statusLabel}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 mb-5 text-sm">
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span className="truncate">{new Date(election.startTime).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span className="truncate">{new Date(election.endTime).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <BarChart3 className="w-3.5 h-3.5" />
                                            <span>{election.totalVotes} votes</span>
                                        </div>
                                    </div>

                                    {!election.isDeleted && (
                                        <div className="flex items-center gap-2 border-t border-gray-700 pt-4 flex-wrap">
                                            {/* Pause / Resume button — available while live */}
                                            {(isLive || election.isPaused) && (
                                                <button
                                                    onClick={() => handleTogglePause(election)}
                                                    className="px-3 py-2 bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-400 border border-yellow-900/50 text-xs font-medium rounded-lg transition-all"
                                                >
                                                    {election.isPaused ? '▶ Resume' : '⏸ Pause'}
                                                </button>
                                            )}

                                            {isEnded && (
                                                <>
                                                    {!election.isResultsPublished ? (
                                                        <button
                                                            onClick={() => handlePublishResults(election.id)}
                                                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-all"
                                                        >
                                                            Publish Results
                                                        </button>
                                                    ) : (
                                                        <span className="flex-1 text-center text-xs text-green-400 bg-green-900/20 py-2 px-3 rounded-lg border border-green-900/30">
                                                            ✅ Results Published
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => handleRestartElection(election.id)}
                                                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1"
                                                    >
                                                        <RefreshCw className="w-3 h-3" /> Extend
                                                    </button>
                                                </>
                                            )}

                                            {(isLive || isUpcoming) && !election.isPaused && (
                                                <span className="flex-1 text-center text-xs text-blue-400 bg-blue-900/10 py-2 px-3 rounded-lg border border-blue-900/20">
                                                    Voting in Progress
                                                </span>
                                            )}

                                            <button
                                                onClick={() => handleDeleteElection(election.id)}
                                                className="px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 text-xs font-medium rounded-lg transition-all"
                                                title="Move to Trash"
                                            >
                                                <Trash2 className="w-4 h-4" />
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
    );
};

export default AdminDashboard;
