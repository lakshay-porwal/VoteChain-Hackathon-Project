import React from 'react';
import { X, Check, Trash2, BellOff, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { useWeb3 } from '../App';

const NotificationPanel = () => {
    const { history, isPanelOpen, togglePanel, markAsRead, markAllAsRead, removeNotification, clearHistory } = useWeb3();

    if (!isPanelOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
                onClick={togglePanel}
            />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#1e293b] border-l border-gray-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-900/50">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        Notifications
                        <span className="bg-blue-600 text-xs px-2 py-0.5 rounded-full">
                            {history.length}
                        </span>
                    </h2>
                    <button
                        onClick={togglePanel}
                        className="p-1 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Actions */}
                <div className="p-4 border-b border-gray-700 flex gap-2">
                    <button
                        onClick={markAllAsRead}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                        <Check className="w-3 h-3" /> Mark all read
                    </button>
                    <button
                        onClick={clearHistory}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                        <Trash2 className="w-3 h-3" /> Clear all
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                            <BellOff className="w-12 h-12 opacity-50" />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        history.map(item => (
                            <div
                                key={item.id}
                                className={`
                                    relative p-4 rounded-xl border transition-all group
                                    ${item.read
                                        ? 'bg-gray-800/30 border-gray-800 text-gray-400'
                                        : 'bg-gray-800 border-gray-700 text-gray-200 shadow-sm'
                                    }
                                `}
                            >
                                <div className="flex gap-3">
                                    <div className={`mt-1 flex-shrink-0
                                        ${item.type === 'success' ? 'text-green-400' :
                                            item.type === 'error' ? 'text-red-400' :
                                                item.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'}
                                    `}>
                                        {item.type === 'success' && <CheckCircle className="w-5 h-5" />}
                                        {item.type === 'error' && <AlertCircle className="w-5 h-5" />}
                                        {item.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                                        {item.type === 'info' && <Info className="w-5 h-5" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium break-words leading-snug">
                                            {item.message}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                                            {new Date(item.timestamp).toLocaleTimeString()}
                                            {!item.read && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeNotification(item.id); }}
                                            className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-red-400"
                                            title="Remove"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        {!item.read && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); markAsRead(item.id); }}
                                                className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-blue-400"
                                                title="Mark as read"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationPanel;
