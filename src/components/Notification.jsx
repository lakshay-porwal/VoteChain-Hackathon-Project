import React from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { useWeb3 } from '../App';

const Notification = () => {
    const { notifications, setNotifications } = useWeb3();

    // If setNotifications is not exposed in context, we might need to adjust App.jsx or just read.
    // In App.jsx I exposed `notifications` and `addNotification`. I didn't expose `setNotifications` directly but `addNotification` handles removal.
    // Wait, I need a way to dismiss manually?
    // In App.jsx: `const addNotification = ... setTimeout ...`
    // I didn't expose a remove function. I should probably just let them auto-dismiss for now to keep it simple, 
    // or realized I can't dismiss manually without exposing a remove function.
    // For now, I'll just display them.

    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {notifications.map((n) => (
                <div
                    key={n.id}
                    className={`
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-md border animate-in slide-in-from-right fade-in duration-300
            ${n.type === 'success' ? 'bg-green-500/10 border-green-500/20' : ''}
            ${n.type === 'error' ? 'bg-red-500/10 border-red-500/20' : ''}
            ${n.type === 'info' ? 'bg-blue-500/10 border-blue-500/20' : ''}
            ${n.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' : ''}
          `}
                >
                    {n.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {n.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                    {n.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-400" />}
                    {n.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}

                    <p className="text-sm font-medium text-gray-200">{n.message}</p>
                </div>
            ))}
        </div>
    );
};

export default Notification;
