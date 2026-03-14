import React, { useState, useEffect } from 'react';
import { Vote, Clock, Crown, CheckCircle, Lock, Bell, RefreshCw, Calendar } from 'lucide-react';
import { useWeb3 } from '../App';

const VoterDashboard = () => {
    const { contract, account, addNotification } = useWeb3();
    const [activeTab, setActiveTab] = useState('active');
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedElection, setSelectedElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [announcements, setAnnouncements] = useState([]);

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
                        try {
                            isEligible = await contract.checkUserEligible(i, account);
                        } catch { isEligible = false; }
                    }

                    let hasVoted = false;
                    if (account) {
                        try {
                            hasVoted = await contract.checkUserVoted(i, account);
                        } catch { hasVoted = false; }
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

            // Fetch announcements (each announcement has targetGroup: 0=All,1=VotersOnly,2=AdminsOnly)
            try {
                const raw = await contract.getAnnouncements();
                const formatted = raw
                    .filter(a => Number(a.targetGroup) !== 2) // hide AdminsOnly
                    .map(a => ({
                        id: Number(a.id),
                        message: a.message,
                        timestamp: Number(a.timestamp) * 1000
                    }))
                    .reverse();
                setAnnouncements(formatted);
            } catch { /* announcements optional */ }

        } catch (err) {
            console.error('fetchElections error:', err);
        } finally {
            setLoading(false);
        }
    };

    // ─── Fetch candidates for a specific election ──────────────────────────────
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
        setCandidates([]); // clear stale candidates
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
        if (activeTab === 'active') return now >= e.startTime && now <= e.endTime && !e.isPaused;
        if (activeTab === 'upcoming') return now < e.startTime;
        if (activeTab === 'closed') return now > e.endTime || e.isPaused;
        return true;
    });

    // Winner helper
    const getWinner = (candidates) => {
        if (!candidates || candidates.length === 0) return 'No candidates';
        const maxVotes = Math.max(...candidates.map(c => c.votes));
        if (maxVotes === 0) return 'No votes cast';
        const winners = candidates.filter(c => c.votes === maxVotes);
        return winners.length === 1
            ? `🏆 ${winners[0].name} (${maxVotes} votes)`
            : `🤝 Tie: ${winners.map(w => w.name).join(' & ')}`;
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Voter Dashboard</h1>
                <button
                    onClick={fetchElections}
                    className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-all"
                    title="Refresh"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Announcements Banner */}
            {announcements.length > 0 && (
                <div className="mb-8 bg-blue-900/30 border border-blue-800/50 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-blue-300 mb-3">
                        <Bell className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Announcements</span>
                    </div>
                    <div className="space-y-2">
                        {announcements.slice(0, 3).map((a, i) => (
                            <div key={a.id ?? i} className="text-sm text-gray-200 flex items-start justify-between gap-4">
                                <span>📢 {a.message}</span>
                                <span className="text-gray-500 text-xs whitespace-nowrap flex-shrink-0">
                                    {new Date(a.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex items-center space-x-1 mb-8 bg-gray-800/50 w-fit p-1 rounded-xl border border-gray-700/50">
                {['active', 'upcoming', 'closed'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Election Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && filteredElections.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500 animate-pulse">Loading elections...</div>
                ) : filteredElections.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-gray-500 bg-gray-800/20 rounded-2xl border border-dashed border-gray-700">
                        No {activeTab} elections found.
                    </div>
                ) : (
                    filteredElections.map(election => {
                        const now = Date.now();
                        const isActive = now >= election.startTime && now <= election.endTime && !election.isPaused;

                        return (
                            <div key={election.id} className="bg-gray-800/40 border border-gray-700 rounded-2xl p-6 hover:border-gray-500 transition-all group relative overflow-hidden flex flex-col">
                                {/* Private/Eligibility badge */}
                                {election.isPrivate && (
                                    <div className="absolute top-3 right-3">
                                        {election.isEligible ? (
                                            <span className="bg-green-500/10 text-green-400 text-[10px] px-2 py-1 rounded-full border border-green-500/20 flex items-center gap-1">
                                                <CheckCircle className="w-2.5 h-2.5" /> Eligible
                                            </span>
                                        ) : (
                                            <span className="bg-red-500/10 text-red-400 text-[10px] px-2 py-1 rounded-full border border-red-500/20 flex items-center gap-1">
                                                <Lock className="w-2.5 h-2.5" /> Restricted
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="mb-4 flex-1">
                                    <h3 className="text-xl font-bold text-white mb-1 pr-16">{election.name}</h3>
                                    <p className="text-sm text-gray-400 line-clamp-2">{election.description}</p>
                                </div>

                                <div className="space-y-1.5 mb-5 text-sm">
                                    <div className="flex items-center justify-between text-gray-400">
                                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Ends</span>
                                        <span>{new Date(election.endTime).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-gray-400">
                                        <span className="flex items-center gap-1"><Vote className="w-3.5 h-3.5" /> Total Votes</span>
                                        <span>{election.totalVotes}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Your Status</span>
                                        {election.hasVoted ? (
                                            <span className="text-green-400 flex items-center gap-1 text-xs font-medium">
                                                <CheckCircle className="w-3 h-3" /> Voted
                                            </span>
                                        ) : (
                                            <span className="text-yellow-400 text-xs font-medium">Not Voted</span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleOpenVote(election)}
                                    disabled={(!isActive && activeTab !== 'closed') || (election.isPrivate && !election.isEligible)}
                                    className={`w-full py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm
                                        ${isActive && (!election.isPrivate || election.isEligible)
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-blue-900/20'
                                            : activeTab === 'closed'
                                                ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600'
                                                : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-60'
                                        }`}
                                >
                                    {election.isPrivate && !election.isEligible ? (
                                        <><Lock className="w-4 h-4" /> Not Authorized</>
                                    ) : election.isPaused ? (
                                        '⏸ Election Paused'
                                    ) : isActive ? (
                                        election.hasVoted ? '✓ Already Voted' : <><Vote className="w-4 h-4" /> Vote Now</>
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

            {/* Vote / Results Modal */}
            {selectedElection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#1e293b] w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{selectedElection.name}</h2>
                                <p className="text-sm text-gray-400 mt-0.5">
                                    {selectedElection.totalVotes} votes • {selectedElection.isResultsPublished ? '✅ Results Declared' : 'Polling Open'}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedElection(null)}
                                className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700 transition-all text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Candidates */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
                            {candidates.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 animate-pulse">Loading candidates...</div>
                            ) : (
                                candidates.map(candidate => (
                                    <div
                                        key={candidate.id}
                                        className="bg-gray-800/50 rounded-xl p-4 flex items-center justify-between border border-gray-700 hover:border-gray-500 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg">
                                                {candidate.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="text-base font-semibold text-white">{candidate.name}</h4>
                                                <p className="text-xs text-gray-400">Candidate #{candidate.id}</p>
                                            </div>
                                        </div>

                                        {selectedElection.isResultsPublished ? (
                                            <div className="px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 text-center min-w-[70px]">
                                                <div className="text-xl font-bold text-white">{candidate.votes}</div>
                                                <div className="text-[10px] text-gray-400 uppercase tracking-wider">votes</div>
                                            </div>
                                        ) : selectedElection.hasVoted ? (
                                            <span className="text-xs text-gray-500 italic px-3">Hidden until end</span>
                                        ) : (
                                            <button
                                                onClick={() => handleVote(candidate.id)}
                                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
                                            >
                                                <Vote className="w-4 h-4" /> Vote
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}

                            {/* Winner Card */}
                            {selectedElection.isResultsPublished && candidates.length > 0 && (
                                <div className="mt-6 p-5 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl flex items-center gap-5">
                                    <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg shadow-orange-500/30 flex-shrink-0">
                                        <Crown className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-green-400 font-bold uppercase tracking-wider mb-1">
                                            Election Result
                                        </div>
                                        <div className="text-xl font-bold text-white">
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
