import React from 'react';
import { X, Check, Trash2, BellOff, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { useWeb3 } from '../App';

/* ─── Injected Styles ────────────────────────────────────────────────────── */
const injectStyles = () => {
    if (document.getElementById('notif-panel-styles')) return;
    const tag = document.createElement('style');
    tag.id = 'notif-panel-styles';
    tag.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

    /* ── Keyframes ── */
    @keyframes npSlideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    @keyframes npFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes npItemIn {
      from { opacity: 0; transform: translateX(14px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    /* ── Backdrop ── */
    .np-backdrop {
      position: fixed; inset: 0; z-index: 40;
      background: rgba(10, 30, 70, 0.25);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      animation: npFadeIn .25s ease both;
    }

    /* ── Panel ── */
    .np-panel {
      font-family: 'Plus Jakarta Sans', sans-serif;
      position: fixed; inset-y: 0; right: 0;
      width: 100%; max-width: 384px;
      background: linear-gradient(170deg, #f4faff 0%, #eaf4ff 55%, #f8fbff 100%);
      border-left: 1px solid rgba(147, 210, 255, 0.50);
      box-shadow:
        -8px 0 40px rgba(14, 165, 233, 0.12),
        -1px 0 0 rgba(255,255,255, 0.80) inset;
      z-index: 50;
      display: flex; flex-direction: column;
      animation: npSlideIn .32s cubic-bezier(.22,.68,0,1.15) both;
    }

    /* ── Header ── */
    .np-header {
      padding: 1.1rem 1.25rem;
      border-bottom: 1px solid rgba(147, 210, 255, 0.40);
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(255,255,255,0.70);
      backdrop-filter: blur(12px);
      flex-shrink: 0;
    }
    .np-header-title {
      font-size: 1.05rem; font-weight: 800;
      color: #0c2340; letter-spacing: -.015em;
      display: flex; align-items: center; gap: .55rem; margin: 0;
    }
    .np-count-badge {
      background: linear-gradient(135deg, #0ea5e9, #38bdf8);
      color: #fff; font-size: .7rem; font-weight: 700;
      padding: .15rem .55rem; border-radius: 9999px;
      box-shadow: 0 2px 8px rgba(14,165,233,.35);
    }
    .np-close-btn {
      width: 32px; height: 32px; border-radius: .5rem;
      display: flex; align-items: center; justify-content: center;
      background: rgba(14,165,233,.07);
      border: 1px solid rgba(147,210,255,.38);
      color: #5ba8cc; cursor: pointer;
      transition: background .2s, color .2s, border-color .2s;
    }
    .np-close-btn:hover {
      background: rgba(239,68,68,.10);
      border-color: rgba(239,68,68,.28);
      color: #dc2626;
    }

    /* ── Action bar ── */
    .np-actions {
      padding: .85rem 1.25rem;
      border-bottom: 1px solid rgba(147,210,255,.35);
      display: flex; gap: .6rem;
      background: rgba(255,255,255,.55);
      flex-shrink: 0;
    }
    .np-btn-read {
      flex: 1; padding: .5rem .75rem;
      font-size: .78rem; font-weight: 700;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #0369a1;
      background: rgba(14,165,233,.10);
      border: 1px solid rgba(14,165,233,.28);
      border-radius: .6rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: .35rem;
      transition: background .2s, border-color .2s, transform .18s;
    }
    .np-btn-read:hover {
      background: rgba(14,165,233,.20);
      border-color: rgba(14,165,233,.45);
      transform: translateY(-1px);
    }
    .np-btn-clear {
      flex: 1; padding: .5rem .75rem;
      font-size: .78rem; font-weight: 700;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #dc2626;
      background: rgba(239,68,68,.08);
      border: 1px solid rgba(239,68,68,.25);
      border-radius: .6rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: .35rem;
      transition: background .2s, border-color .2s, transform .18s;
    }
    .np-btn-clear:hover {
      background: rgba(239,68,68,.18);
      border-color: rgba(239,68,68,.42);
      transform: translateY(-1px);
    }

    /* ── List ── */
    .np-list {
      flex: 1; overflow-y: auto; padding: 1rem 1.1rem;
      display: flex; flex-direction: column; gap: .6rem;
    }
    .np-list::-webkit-scrollbar { width: 4px; }
    .np-list::-webkit-scrollbar-track { background: rgba(147,210,255,.12); border-radius: 99px; }
    .np-list::-webkit-scrollbar-thumb { background: rgba(56,189,248,.35); border-radius: 99px; }

    /* ── Empty state ── */
    .np-empty {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; height: 100%; gap: .85rem;
      color: #93c4e0;
    }
    .np-empty-icon {
      width: 56px; height: 56px; border-radius: 9999px;
      background: rgba(147,210,255,.18);
      border: 1.5px dashed rgba(147,210,255,.50);
      display: flex; align-items: center; justify-content: center;
    }
    .np-empty p { font-size: .875rem; font-weight: 600; color: #7ab8d8; margin: 0; }

    /* ── Notification item ── */
    .np-item {
      position: relative; border-radius: .85rem;
      border-width: 1px; border-style: solid;
      padding: .9rem 1rem;
      display: flex; gap: .75rem;
      backdrop-filter: blur(10px);
      transition: border-color .2s, box-shadow .2s, transform .2s;
      animation: npItemIn .3s cubic-bezier(.22,.68,0,1.15) both;
    }
    .np-item:hover { transform: translateX(-2px); }

    /* read */
    .np-item-read {
      background: rgba(255,255,255,.50);
      border-color: rgba(147,210,255,.30);
      box-shadow: none;
    }
    /* unread */
    .np-item-unread {
      background: rgba(255,255,255,.80);
      border-color: rgba(56,189,248,.40);
      box-shadow: 0 2px 12px rgba(14,165,233,.09), 0 1px 0 rgba(255,255,255,.90) inset;
    }
    .np-item-unread:hover {
      border-color: rgba(56,189,248,.60);
      box-shadow: 0 4px 20px rgba(14,165,233,.14), 0 1px 0 rgba(255,255,255,.92) inset;
    }

    /* ── Item icon ── */
    .np-item-icon { flex-shrink: 0; margin-top: .1rem; }
    .np-icon-success { color: #059669; }
    .np-icon-error   { color: #dc2626; }
    .np-icon-warning { color: #d97706; }
    .np-icon-info    { color: #0284c7; }

    /* ── Item body ── */
    .np-item-body { flex: 1; min-width: 0; }
    .np-item-msg {
      font-size: .845rem; font-weight: 600; line-height: 1.45;
      word-break: break-word; margin: 0;
    }
    .np-msg-read   { color: #7ab8d8; }
    .np-msg-unread { color: #0c2340; }

    .np-item-time {
      font-size: .72rem; font-weight: 500; margin-top: .4rem;
      font-family: 'JetBrains Mono', monospace; color: #93c4e0;
      display: flex; align-items: center; gap: .45rem;
    }
    .np-unread-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: linear-gradient(135deg,#0ea5e9,#38bdf8);
      box-shadow: 0 0 0 2px rgba(56,189,248,.25);
      flex-shrink: 0;
    }

    /* ── Item actions ── */
    .np-item-actions {
      display: flex; flex-direction: column; gap: .3rem;
      opacity: 0; transition: opacity .18s;
    }
    .np-item:hover .np-item-actions { opacity: 1; }

    .np-action-btn {
      width: 26px; height: 26px; border-radius: .4rem;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid transparent; cursor: pointer; background: transparent;
      transition: background .18s, border-color .18s, color .18s;
    }
    .np-action-remove { color: #93c4e0; }
    .np-action-remove:hover {
      background: rgba(239,68,68,.10);
      border-color: rgba(239,68,68,.25);
      color: #dc2626;
    }
    .np-action-read { color: #93c4e0; }
    .np-action-read:hover {
      background: rgba(14,165,233,.10);
      border-color: rgba(14,165,233,.25);
      color: #0ea5e9;
    }

    /* ── Dark Mode Overrides ── */
    html.dark .np-backdrop { background: rgba(2,6,23,0.6); }
    html.dark .np-panel { background: linear-gradient(170deg, #0f172a 0%, #1e293b 100%); border-left-color: rgba(56,189,248,0.2); box-shadow: -8px 0 40px rgba(0,0,0,0.5), -1px 0 0 rgba(255,255,255,0.05) inset; }
    html.dark .np-header { background: rgba(15,23,42,0.8); border-bottom-color: rgba(56,189,248,0.2); }
    html.dark .np-header-title { color: #f8fafc; }
    html.dark .np-close-btn { background: rgba(14,165,233,0.15); border-color: rgba(14,165,233,0.3); color: #bae6fd; }
    html.dark .np-close-btn:hover { background: rgba(239,68,68,0.2); color: #f87171; border-color: rgba(239,68,68,0.4); }
    html.dark .np-actions { background: rgba(30,41,59,0.5); border-bottom-color: rgba(56,189,248,0.2); }
    html.dark .np-btn-read { background: rgba(14,165,233,0.15); border-color: rgba(14,165,233,0.3); color: #7dd3fc; }
    html.dark .np-btn-read:hover { background: rgba(14,165,233,0.25); border-color: rgba(14,165,233,0.5); }
    html.dark .np-btn-clear { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); color: #fca5a5; }
    html.dark .np-btn-clear:hover { background: rgba(239,68,68,0.25); border-color: rgba(239,68,68,0.5); }
    
    html.dark .np-list::-webkit-scrollbar-track { background: rgba(56,189,248,0.1); }
    html.dark .np-list::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.3); }
    html.dark .np-empty p { color: #94a3b8; }
    html.dark .np-empty-icon { background: rgba(56,189,248,0.1); border-color: rgba(56,189,248,0.2); }
    
    html.dark .np-item-read { background: rgba(30,41,59,0.5); border-color: rgba(56,189,248,0.1); }
    html.dark .np-item-unread { background: rgba(30,41,59,0.9); border-color: rgba(56,189,248,0.3); box-shadow: 0 2px 12px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.05) inset; }
    html.dark .np-item-unread:hover { border-color: rgba(56,189,248,0.5); box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset; }
    html.dark .np-msg-read { color: #94a3b8; }
    html.dark .np-msg-unread { color: #f8fafc; }
    html.dark .np-item-time { color: #64748b; }
    html.dark .np-action-remove { color: #64748b; }
    html.dark .np-action-read { color: #64748b; }
  `;
    document.head.appendChild(tag);
};

injectStyles();

const ICON_MAP = {
    success: { Icon: CheckCircle, cls: 'np-icon-success' },
    error:   { Icon: AlertCircle, cls: 'np-icon-error'   },
    warning: { Icon: AlertCircle, cls: 'np-icon-warning' },
    info:    { Icon: Info,        cls: 'np-icon-info'    },
};

const NotificationPanel = () => {
    const { history, isPanelOpen, togglePanel, markAsRead, markAllAsRead, removeNotification, clearHistory } = useWeb3();

    if (!isPanelOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="np-backdrop" onClick={togglePanel} />

            {/* Panel */}
            <div className="np-panel">

                {/* Header */}
                <div className="np-header">
                    <h2 className="np-header-title">
                        Notifications
                        <span className="np-count-badge">{history.length}</span>
                    </h2>
                    <button className="np-close-btn" onClick={togglePanel} title="Close">
                        <X style={{ width: 16, height: 16 }} />
                    </button>
                </div>

                {/* Actions */}
                <div className="np-actions">
                    <button className="np-btn-read" onClick={markAllAsRead}>
                        <Check style={{ width: 12, height: 12 }} /> Mark all read
                    </button>
                    <button className="np-btn-clear" onClick={clearHistory}>
                        <Trash2 style={{ width: 12, height: 12 }} /> Clear all
                    </button>
                </div>

                {/* List */}
                <div className="np-list">
                    {history.length === 0 ? (
                        <div className="np-empty">
                            <div className="np-empty-icon">
                                <BellOff style={{ width: 24, height: 24 }} />
                            </div>
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        history.map((item, idx) => {
                            const { Icon, cls } = ICON_MAP[item.type] || ICON_MAP.info;
                            return (
                                <div
                                    key={item.id}
                                    className={`np-item ${item.read ? 'np-item-read' : 'np-item-unread'}`}
                                    style={{ animationDelay: `${idx * 0.04}s` }}
                                    onClick={() => !item.read && markAsRead(item.id)}
                                >
                                    {/* Icon */}
                                    <span className={`np-item-icon ${cls}`}>
                                        <Icon style={{ width: 17, height: 17 }} />
                                    </span>

                                    {/* Body */}
                                    <div className="np-item-body">
                                        <p className={`np-item-msg ${item.read ? 'np-msg-read' : 'np-msg-unread'}`}>
                                            {item.message}
                                        </p>
                                        <div className="np-item-time">
                                            {new Date(item.timestamp).toLocaleTimeString()}
                                            {!item.read && <span className="np-unread-dot" />}
                                        </div>
                                    </div>

                                    {/* Per-item actions */}
                                    <div className="np-item-actions">
                                        <button
                                            className="np-action-btn np-action-remove"
                                            onClick={(e) => { e.stopPropagation(); removeNotification(item.id); }}
                                            title="Remove"
                                        >
                                            <X style={{ width: 13, height: 13 }} />
                                        </button>
                                        {!item.read && (
                                            <button
                                                className="np-action-btn np-action-read"
                                                onClick={(e) => { e.stopPropagation(); markAsRead(item.id); }}
                                                title="Mark as read"
                                            >
                                                <Check style={{ width: 13, height: 13 }} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationPanel;