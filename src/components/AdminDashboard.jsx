import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, BarChart3, Trash2, Check, ExternalLink, RefreshCw, Send, Lock, Unlock } from 'lucide-react';
import { useWeb3 } from '../App';

const AdminDashboard = () => {
    const { contract, addNotification } = useWeb3();
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('active'); // active, upcoming, past, trash

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: 5, // minutes
        candidates: '', // comma separated
        isPrivate: false,
        allowedVoters: '' // comma separated addresses
    });

    const [announcementMsg, setAnnouncementMsg] = useState('');

    const fetchElections = async (isLoaderNeeded = true) => {
        if (!contract) return;
        try {
            if (isLoaderNeeded) setLoading(true);
            const count = await contract.getElectionCount();
            const fetchedElections = [];
            const countNum = Number(count);

            // Loop latest 10 elections or all
            for (let i = countNum; i >= 1 && i > countNum - 10; i--) {
                const details = await contract.getElectionDetails(i);
                fetchedElections.push({
                    id: Number(details.id),
                    name: details.name,
                    description: details.description,
                    startTime: Number(details.startTime) * 1000,
                    endTime: Number(details.endTime) * 1000,
                    isResultsPublished: details.isResultsPublished,
                    isPrivate: details.isPrivate,
                    isDeleted: details.isDeleted,
                    totalVotes: Number(details.totalVotes),
                    candidateCount: Number(details.candidateCount)
                });
            }
            setElections(fetchedElections);
        } catch (error) {
            console.error(error);
            if (isLoaderNeeded) addNotification("Failed to load elections", "error");
        } finally {
            if (isLoaderNeeded) setLoading(false);
        }
    };

    useEffect(() => {
        fetchElections();
        const interval = setInterval(() => fetchElections(false), 10000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contract]);

    const handleCreateElection = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.candidates) {
            addNotification("Please fill required fields", "warning");
            return;
        }

        try {
            addNotification("Creating Election... Confirm transaction.", "info");

            const startTime = Math.floor(Date.now() / 1000); // Now
            const endTime = startTime + (formData.duration * 60); // + duration minutes
            const candidateList = formData.candidates.split(',').map(c => c.trim()).filter(c => c !== '');
            const voterList = formData.allowedVoters.split(',').map(v => v.trim()).filter(v => v !== '');

            if (candidateList.length < 2) {
                addNotification("Minimum 2 candidates required", "warning");
                return;
            }

            if (formData.isPrivate && voterList.length === 0) {
                if (!confirm("You are creating a Private election with NO voters. Are you sure?")) return;
            }

            const tx = await contract.createElection(
                formData.name,
                formData.description,
                startTime,
                endTime,
                candidateList,
                formData.isPrivate,
                voterList
            );

            addNotification("Transaction Sent. Waiting for confirmation...", "info");
            await tx.wait();
            addNotification("Election Created Successfully!", "success");

            // Reset form
            setFormData({ name: '', description: '', duration: 5, candidates: '', isPrivate: false, allowedVoters: '' });
            fetchElections(false);

        } catch (error) {
            console.error(error);
            addNotification("Failed to create election", "error");
        }
    };

    const handlePublishResults = async (id) => {
        try {
            const tx = await contract.publishResults(id);
            addNotification("Publishing results...", "info");
            await tx.wait();
            addNotification("Results Published!", "success");
            fetchElections(false);
        } catch (error) {
            console.error(error);
            addNotification("Failed to publish results", "error");
        }
    };

    const handleRestartElection = async (id) => {
        const duration = prompt("Enter duration to extend (in minutes):", "5");
        if (!duration) return;

        try {
            const newEndTime = Math.floor(Date.now() / 1000) + (parseInt(duration) * 60);
            const tx = await contract.restartElection(id, newEndTime);
            addNotification("Restarting election...", "info");
            await tx.wait();
            addNotification("Election Restarted!", "success");
            fetchElections(false);
        } catch (error) {
            console.error(error);
            addNotification("Failed to restart election", "error");
        }
    };

    const handleDeleteElection = async (id) => {
        if (!confirm("Are you sure you want to delete this election? It will be moved to trash and hidden from voters.")) return;
        try {
            const tx = await contract.deleteElection(id);
            addNotification("Deleting election...", "info");
            await tx.wait();
            addNotification("Election Moved to Trash!", "success");
            fetchElections(false);
        } catch (error) {
            console.error(error);
            addNotification("Failed to delete election", "error");
        }
    };

    const filteredElections = elections.filter(e => {
        const now = Date.now();
        if (activeTab === 'trash') return e.isDeleted;
        if (e.isDeleted) return false; // Don't show deleted in other tabs

        if (activeTab === 'active') return now >= e.startTime && now <= e.endTime;
        if (activeTab === 'upcoming') return now < e.startTime;
        if (activeTab === 'past') return now > e.endTime;
        return true;
    });

    const handleMakeAnnouncement = async (e) => {
        e.preventDefault();
        if (!announcementMsg.trim()) return;

        try {
            const tx = await contract.addAnnouncement(announcementMsg);
            addNotification("Sending announcement...", "info");
            await tx.wait();
            addNotification("Announcement Sent!", "success");
            setAnnouncementMsg('');
        } catch (error) {
            console.error(error);
            addNotification("Failed to send announcement", "error");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-gray-400">Manage elections and control voting timelines</p>
                </div>
                <div className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                    Administrator Mode
                </div>
            </header>

            {/* Announcement Section */}
            <div className="bg-blue-900/20 border border-blue-800/50 p-6 rounded-2xl backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Send className="w-5 h-5 text-blue-400" />
                    Make Announcement
                </h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type a message to all voters..."
                        value={announcementMsg}
                        onChange={(e) => setAnnouncementMsg(e.target.value)}
                    />
                    <button
                        onClick={handleMakeAnnouncement}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Send
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Election Form */}
                <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 h-fit">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-400" />
                        New Election
                    </h2>
                    <form onSubmit={handleCreateElection} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Election Title</label>
                            <input
                                type="text"
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Class Monitor 2026"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                            <textarea
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                placeholder="Brief description of the election..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Duration (min)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    min="1"
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center pt-6">
                                <label className="flex items-center cursor-pointer gap-2">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={formData.isPrivate}
                                        onChange={e => setFormData({ ...formData, isPrivate: e.target.checked })}
                                    />
                                    <span className="text-sm font-medium text-gray-300 flex items-center gap-1">
                                        {formData.isPrivate ? <Lock className="w-3 h-3 text-red-400" /> : <Unlock className="w-3 h-3 text-green-400" />}
                                        Private
                                    </span>
                                </label>
                            </div>
                        </div>

                        {formData.isPrivate && (
                            <div className="animate-in slide-in-from-top duration-300">
                                <label className="block text-sm font-medium text-red-400 mb-1">Allowed Voters (Address List)</label>
                                <textarea
                                    className="w-full bg-gray-900 border border-red-900/50 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 outline-none h-20 resize-none text-xs font-mono"
                                    placeholder="0x123..., 0x456..."
                                    value={formData.allowedVoters}
                                    onChange={e => setFormData({ ...formData, allowedVoters: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Separate addresses with commas. You can add more later.</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Candidates</label>
                            <input
                                type="text"
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Alice, Bob, Charlie"
                                value={formData.candidates}
                                onChange={e => setFormData({ ...formData, candidates: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create Election
                        </button>
                    </form>
                </div>

                {/* Election List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-purple-400" />
                            Manage Elections
                        </h2>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-2 bg-gray-800/50 p-1 rounded-lg w-fit mb-4">
                        {['active', 'upcoming', 'past', 'trash'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {loading && elections.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">Loading elections...</div>
                    ) : filteredElections.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-gray-800/20 rounded-xl border border-dashed border-gray-700">
                            No {activeTab} elections found.
                        </div>
                    ) : (
                        filteredElections.map((election) => {
                            const now = Date.now();
                            const isLive = now >= election.startTime && now <= election.endTime;
                            const isEnded = now > election.endTime;

                            return (
                                <div key={election.id} className="bg-gray-800/30 border border-gray-700 p-6 rounded-xl hover:border-gray-600 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-white max-w-[200px] truncate" title={election.name}>{election.name}</h3>
                                                {election.isPrivate && <Lock className="w-4 h-4 text-red-400" title="Private Election" />}
                                                {election.isDeleted && <Trash2 className="w-4 h-4 text-gray-500" title="Deleted" />}
                                            </div>
                                            <p className="text-sm text-gray-400 line-clamp-1">{election.description}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold
                                            ${election.isDeleted ? 'bg-gray-700 text-gray-400 border border-gray-600' :
                                                isLive ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                    isEnded ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'}
                                        `}>
                                            {election.isDeleted ? 'DELETED' : isLive ? 'LIVE' : isEnded ? 'CLOSED' : 'UPCOMING'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            <span>Start: {new Date(election.startTime).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            <span>End: {new Date(election.endTime).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <BarChart3 className="w-4 h-4" />
                                            <span>Votes: {election.totalVotes}</span>
                                        </div>
                                    </div>

                                    {!election.isDeleted && (
                                        <div className="flex items-center gap-2 border-t border-gray-700 pt-4 flex-wrap">
                                            {isEnded ? (
                                                <>
                                                    {!election.isResultsPublished ? (
                                                        <button
                                                            onClick={() => handlePublishResults(election.id)}
                                                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-all"
                                                        >
                                                            Publish Results
                                                        </button>
                                                    ) : (
                                                        <button disabled className="flex-1 bg-gray-700 text-gray-400 text-xs font-medium py-2 px-3 rounded-lg cursor-not-allowed">
                                                            Published
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleRestartElection(election.id)}
                                                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1"
                                                        title="Restart/Extend"
                                                    >
                                                        <RefreshCw className="w-3 h-3" />
                                                        Extend
                                                    </button>
                                                </>
                                            ) : (
                                                <button disabled className="flex-1 bg-gray-700 text-gray-400 text-xs font-medium py-2 px-3 rounded-lg cursor-not-allowed">
                                                    Voting in Progress
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDeleteElection(election.id)}
                                                className="px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 text-xs font-medium rounded-lg transition-all"
                                                title="Delete Election"
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
