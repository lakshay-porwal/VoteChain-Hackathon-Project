import React from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { useWeb3 } from '../App';

/* ─── Injected Styles ────────────────────────────────────────────────────── */
const injectStyles = () => {
    if (document.getElementById('notif-toast-styles')) return;
    const tag = document.createElement('style');
    tag.id = 'notif-toast-styles';
    tag.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    /* ── Keyframes ── */
    @keyframes ntSlideIn {
      from { opacity:0; transform:translateX(32px) scale(.96); }
      to   { opacity:1; transform:translateX(0)    scale(1);   }
    }
    @keyframes ntSlideOut {
      from { opacity:1; transform:translateX(0)    scale(1);   }
      to   { opacity:0; transform:translateX(32px) scale(.96); }
    }
    @keyframes ntProgress {
      from { width:100%; }
      to   { width:0%; }
    }
    @keyframes ntIconPop {
      0%   { transform:scale(0.6); opacity:0; }
      70%  { transform:scale(1.15); }
      100% { transform:scale(1); opacity:1; }
    }

    /* ── Toast container ── */
    .nt-stack {
      position: fixed;
      bottom: 1.25rem;
      right: 1.25rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: .6rem;
      pointer-events: none;
    }

    /* ── Single toast ── */
    .nt-toast {
      pointer-events: all;
      font-family: 'Plus Jakarta Sans', sans-serif;
      display: flex;
      align-items: center;
      gap: .75rem;
      padding: .75rem 1.1rem;
      border-radius: .9rem;
      border-width: 1px;
      border-style: solid;
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      min-width: 280px;
      max-width: 360px;
      position: relative;
      overflow: hidden;
      animation: ntSlideIn .38s cubic-bezier(.22,.68,0,1.2) both;
      box-shadow:
        0 1px 0 rgba(255,255,255,.90) inset,
        0 6px 24px rgba(14,165,233,.10);
    }

    /* ── Type variants ── */
    .nt-success {
      background: rgba(240,253,244,.88);
      border-color: rgba(52,211,153,.38);
      box-shadow: 0 1px 0 rgba(255,255,255,.92) inset, 0 6px 22px rgba(16,185,129,.12);
    }
    .nt-error {
      background: rgba(255,241,242,.88);
      border-color: rgba(252,165,165,.38);
      box-shadow: 0 1px 0 rgba(255,255,255,.92) inset, 0 6px 22px rgba(239,68,68,.10);
    }
    .nt-warning {
      background: rgba(255,251,235,.88);
      border-color: rgba(253,211,77,.40);
      box-shadow: 0 1px 0 rgba(255,255,255,.92) inset, 0 6px 22px rgba(251,191,36,.10);
    }
    .nt-info {
      background: rgba(240,249,255,.88);
      border-color: rgba(56,189,248,.38);
      box-shadow: 0 1px 0 rgba(255,255,255,.92) inset, 0 6px 22px rgba(14,165,233,.12);
    }

    /* ── Icon ── */
    .nt-icon {
      flex-shrink: 0;
      animation: ntIconPop .35s cubic-bezier(.22,.68,0,1.3) both;
      animation-delay: .08s;
    }
    .nt-icon-success { color: #059669; }
    .nt-icon-error   { color: #dc2626; }
    .nt-icon-warning { color: #d97706; }
    .nt-icon-info    { color: #0284c7; }

    /* ── Message ── */
    .nt-msg {
      font-size: .84rem;
      font-weight: 600;
      line-height: 1.45;
      flex: 1;
    }
    .nt-msg-success { color: #065f46; }
    .nt-msg-error   { color: #991b1b; }
    .nt-msg-warning { color: #92400e; }
    .nt-msg-info    { color: #0c4a6e; }

    /* ── Progress bar ── */
    .nt-bar {
      position: absolute;
      bottom: 0; left: 0;
      height: 2.5px;
      border-radius: 0 0 .9rem .9rem;
      animation: ntProgress 5s linear forwards;
    }
    .nt-bar-success { background: linear-gradient(90deg,#10b981,#34d399); }
    .nt-bar-error   { background: linear-gradient(90deg,#ef4444,#f87171); }
    .nt-bar-warning { background: linear-gradient(90deg,#f59e0b,#fcd34d); }
    .nt-bar-info    { background: linear-gradient(90deg,#0ea5e9,#38bdf8); }
  `;
    document.head.appendChild(tag);
};

// Inject once at module level
injectStyles();

const TYPE_CONFIG = {
    success: {
        icon: CheckCircle,
        toastClass:  'nt-success',
        iconClass:   'nt-icon-success',
        msgClass:    'nt-msg-success',
        barClass:    'nt-bar-success',
    },
    error: {
        icon: AlertCircle,
        toastClass:  'nt-error',
        iconClass:   'nt-icon-error',
        msgClass:    'nt-msg-error',
        barClass:    'nt-bar-error',
    },
    warning: {
        icon: AlertCircle,
        toastClass:  'nt-warning',
        iconClass:   'nt-icon-warning',
        msgClass:    'nt-msg-warning',
        barClass:    'nt-bar-warning',
    },
    info: {
        icon: Info,
        toastClass:  'nt-info',
        iconClass:   'nt-icon-info',
        msgClass:    'nt-msg-info',
        barClass:    'nt-bar-info',
    },
};

const Notification = () => {
    const { notifications } = useWeb3();
    if (notifications.length === 0) return null;

    return (
        <div className="nt-stack">
            {notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                const Icon = cfg.icon;

                return (
                    <div key={n.id} className={`nt-toast ${cfg.toastClass}`}>
                        {/* Icon */}
                        <span className={`nt-icon ${cfg.iconClass}`}>
                            <Icon style={{ width: 18, height: 18 }} />
                        </span>

                        {/* Message */}
                        <p className={`nt-msg ${cfg.msgClass}`}>{n.message}</p>

                        {/* Auto-dismiss progress bar */}
                        <div className={`nt-bar ${cfg.barClass}`} />
                    </div>
                );
            })}
        </div>
    );
};

export default Notification;