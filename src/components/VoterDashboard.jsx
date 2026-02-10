import React, { useState, useEffect } from 'react';
import { Vote, Clock, Crown, CheckCircle, Lock, Bell } from 'lucide-react';
import { useWeb3 } from '../App';

const VoterDashboard = () => {
    const { contract, account, addNotification } = useWeb3();
    const [activeTab, setActiveTab] = useState('active'); // active, closed, upcoming
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedElection, setSelectedElection] = useState(null); // For voting modal
    const [candidates, setCandidates] = useState([]);
    const [announcements, setAnnouncements] = useState([]);

    const fetchElections = async (isLoaderNeeded = true) => {
        if (!contract) return;
        try {
            if (isLoaderNeeded) setLoading(true);
            const count = await contract.getElectionCount();
            const fetchedElections = [];
            const countNum = Number(count);

            for (let i = countNum; i >= 1; i--) {
                const details = await contract.getElectionDetails(i);

                // Eligibility check for private elections
                let isEligible = true;
                if (details.isPrivate && account) {
                    // Check if function exists (robustness for old contracts)
                    if (contract.checkUserEligible) {
                        isEligible = await contract.checkUserEligible(i, account);
                    }
                }

                let hasVoted = false;
                if (account) {
                    hasVoted = await contract.checkUserVoted(i, account);
                }

                fetchedElections.push({
                    id: Number(details.id),
                    name: details.name,
                    description: details.description,
                    startTime: Number(details.startTime) * 1000,
                    endTime: Number(details.endTime) * 1000,
                    isResultsPublished: details.isResultsPublished,
                    isResultsPublished: details.isResultsPublished,
                    isPrivate: details.isPrivate,
                    isDeleted: details.isDeleted,
                    totalVotes: Number(details.totalVotes),
                    hasVoted,
                    isEligible
                });
            }
            setElections(fetchedElections);

            // Fetch Announcements
            if (contract.getAnnouncements) {
                const announcementsData = await contract.getAnnouncements();
                // announcementsData is array of structs
                const formattedAnnouncements = announcementsData.map(a => ({
                    id: Number(a.id),
                    message: a.message,
                    timestamp: Number(a.timestamp) * 1000
                })).reverse(); // Newest first
                setAnnouncements(formattedAnnouncements);
            }

        } catch (error) {
            console.error(error);
        } finally {
            if (isLoaderNeeded) setLoading(false);
        }
    };

    const fetchCandidates = async (electionId) => {
        try {
            const data = await contract.getCandidates(electionId);
            const ids = data[0];
            const names = data[1];
            const votes = data[2];

            const formatted = ids.map((id, index) => ({
                id: Number(id),
                name: names[index],
                votes: Number(votes[index])
            }));
            setCandidates(formatted);
        } catch (error) {
            console.error(error);
            addNotification("Failed to fetch candidates", "error");
        }
    };

    useEffect(() => {
        fetchElections();
        const interval = setInterval(() => fetchElections(false), 10000);
        return () => clearInterval(interval);
    }, [contract, account]);

    const handleOpenVote = async (election) => {
        if (election.isPrivate && !election.isEligible) {
            addNotification("You are not authorized to vote in this private election.", "error");
            return;
        }
        setSelectedElection(election);
        await fetchCandidates(election.id);
    };

    const handleVote = async (candidateId) => {
        if (!confirm("Are you sure you want to vote?")) return;

        try {
            addNotification("Casting Vote...", "info");
            const tx = await contract.vote(selectedElection.id, candidateId);
            addNotification("Analyzing transaction...", "info");
            await tx.wait();
            addNotification("Vote Cast Successfully!", "success");

            setSelectedElection(null);
            fetchElections(false);
        } catch (error) {
            console.error(error);
            addNotification(error.reason || "Vote Failed", "error");
        }
    };

    const filteredElections = elections.filter(e => {
        if (e.isDeleted) return false;

        const now = Date.now();
        if (activeTab === 'active') return now >= e.startTime && now <= e.endTime;
        if (activeTab === 'upcoming') return now < e.startTime;
        if (activeTab === 'closed') return now > e.endTime;
        return true;
    });

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">Voter Dashboard</h1>

            {/* AnnouncementsTicker */}
            {announcements.length > 0 && (
                <div className="mb-8 bg-blue-900/30 border border-blue-800/50 rounded-xl p-4 overflow-hidden relative">
                    <div className="flex items-center gap-3 text-blue-300 mb-2">
                        <Bell className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Latest Announcements</span>
                    </div>
                    <div className="space-y-2">
                        {announcements.slice(0, 3).map(a => (
                            <div key={a.id} className="text-sm text-gray-200 flex justify-between">
                                <span>{a.message}</span>
                                <span className="text-gray-500 text-xs">{new Date(a.timestamp).toLocaleTimeString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex items-center space-x-2 mb-8 bg-gray-800/50 w-fit p-1 rounded-lg border border-gray-700">
                {['active', 'upcoming', 'closed'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredElections.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-gray-800/20 rounded-xl border border-dashed border-gray-700">
                        No elections found in this category.
                    </div>
                ) : (
                    filteredElections.map(election => (
                        <div key={election.id} className="bg-gray-800/40 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all group relative overflow-hidden">
                            {election.isPrivate && (
                                <div className="absolute top-0 right-0 p-2">
                                    {election.isEligible ? (
                                        <span className="bg-green-500/10 text-green-400 text-[10px] px-2 py-1 rounded border border-green-500/20 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Eligible
                                        </span>
                                    ) : (
                                        <span className="bg-red-500/10 text-red-400 text-[10px] px-2 py-1 rounded border border-red-500/20 flex items-center gap-1">
                                            <Lock className="w-3 h-3" /> RESTRICTED
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-white mb-2">{election.name}</h3>
                                <p className="text-sm text-gray-400 line-clamp-2">{election.description}</p>
                            </div>

                            <div className="space-y-2 mb-6 text-sm text-gray-300">
                                <div className="flex items-center justify-between">
                                    <span>Status</span>
                                    <span className={`font-mono font-medium ${activeTab === 'active' ? 'text-green-400' :
                                        activeTab === 'upcoming' ? 'text-blue-400' : 'text-gray-400'
                                        }`}>
                                        {activeTab.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Your Status</span>
                                    {election.hasVoted ? (
                                        <span className="text-green-400 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Voted
                                        </span>
                                    ) : (
                                        <span className="text-yellow-400">Not Voted</span>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => handleOpenVote(election)}
                                disabled={(activeTab !== 'active' && activeTab !== 'closed') || (election.isPrivate && !election.isEligible)}
                                className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                                    ${activeTab === 'active' && (!election.isPrivate || election.isEligible)
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-blue-900/20'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 cursor-not-allowed opacity-70'
                                    }
                                `}
                            >
                                {election.isPrivate && !election.isEligible ? (
                                    <><Lock className="w-4 h-4" /> Not Authorized</>
                                ) : activeTab === 'active' ? (election.hasVoted ? 'View Choices' : 'Vote Now') :
                                    activeTab === 'closed' ? 'View Results' : 'Wait for Start'}
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Voting Modal */}
            {selectedElection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#1e293b] w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{selectedElection.name}</h2>
                                <p className="text-sm text-gray-400">
                                    {selectedElection.id} • {selectedElection.isResultsPublished ? 'Results Declared' : 'Polling In Progress'}
                                </p>
                            </div>
                            <button onClick={() => setSelectedElection(null)} className="text-gray-400 hover:text-white">
                                <span className="sr-only">Close</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {candidates.length === 0 ? (
                                <div className="text-center py-8">Loading candidates...</div>
                            ) : (
                                <div className="space-y-4">
                                    {candidates.map(candidate => (
                                        <div key={candidate.id} className="bg-gray-800/50 rounded-xl p-4 flex items-center justify-between border border-gray-700 hover:border-gray-500 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg">
                                                    {candidate.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-semibold text-white">{candidate.name}</h4>
                                                    <p className="text-sm text-gray-400">Candidate #{candidate.id}</p>
                                                </div>
                                            </div>

                                            {selectedElection.isResultsPublished ? (
                                                <div className="px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 flex items-center gap-2">
                                                    <span className="text-xl font-bold text-white">{candidate.votes}</span>
                                                    <span className="text-xs text-gray-400 uppercase tracking-wider">Votes</span>
                                                </div>
                                            ) : selectedElection.hasVoted ? (
                                                <div className="px-3 py-1 text-sm text-gray-500 italic">
                                                    Hidden until ends
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleVote(candidate.id)}
                                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <Vote className="w-4 h-4" />
                                                    Vote
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedElection.isResultsPublished && candidates.length > 0 && (
                                <div className="mt-8 p-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl flex items-center gap-6 animate-in slide-in-from-bottom duration-500">
                                    <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg shadow-orange-500/20">
                                        <Crown className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-green-400 font-bold uppercase tracking-wider mb-1">
                                            Election Result
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            {(() => {
                                                if (!candidates || candidates.length === 0) return "No Candidates";
                                                const maxVotes = Math.max(...candidates.map(c => c.votes));
                                                if (maxVotes === 0) return "No Votes Cast";
                                                const winners = candidates.filter(c => c.votes === maxVotes);
                                                if (winners.length === 1) return `Winner: ${winners[0].name}`;
                                                return `Tie: ${winners.map(w => w.name).join(' & ')}`;
                                            })()}
                                        </div>
                                        <div className="text-sm text-gray-400 mt-1">
                                            with {Math.max(...candidates.map(c => c.votes))} votes
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
