import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, Loader2, User, Mail, Hash } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../config';

/* ─── Injected Styles ────────────────────────────────────────────────────── */
const injectStyles = () => {
    if (document.getElementById('faceauth-styles')) return;
    const tag = document.createElement('style');
    tag.id = 'faceauth-styles';
    tag.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

    /* ── Keyframes ── */
    @keyframes faFadeUp {
      from { opacity:0; transform:translateY(22px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes faSpin     { to { transform:rotate(360deg); } }
    @keyframes faShimmer  {
      0%   { background-position:-200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes faScanLine {
      0%   { top: 0%; }
      50%  { top: 90%; }
      100% { top: 0%; }
    }
    @keyframes faRingPulse {
      0%,100% { box-shadow: 0 0 0 0  rgba(56,189,248,.40); }
      50%      { box-shadow: 0 0 0 10px rgba(56,189,248,.00); }
    }
    @keyframes faCornerBlink {
      0%,100% { opacity:1; }
      50%      { opacity:.35; }
    }

    .fa-fade-up { animation: faFadeUp .5s cubic-bezier(.22,.68,0,1.15) both; }
    .fa-d1 { animation-delay:.06s; }
    .fa-d2 { animation-delay:.12s; }
    .fa-spin { animation: faSpin .9s linear infinite; }

    /* ── Outer wrapper ── */
    .fa-wrap {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: rgba(255,255,255,0.78);
      border: 1px solid rgba(147,210,255,0.50);
      backdrop-filter: blur(22px);
      -webkit-backdrop-filter: blur(22px);
      border-radius: 1.5rem;
      padding: 2.25rem 2rem;
      width: 100%; max-width: 420px;
      box-shadow:
        0 1px 0 rgba(255,255,255,.95) inset,
        0 8px 40px rgba(14,165,233,.13),
        0 2px 8px rgba(14,165,233,.07);
      display: flex; flex-direction: column; align-items: center;
    }

    /* ── Title ── */
    .fa-title {
      font-size: 1.5rem; font-weight: 800; color: #0c2340;
      letter-spacing: -.02em; margin: 0 0 .4rem; text-align: center;
    }
    .fa-subtitle {
      font-size: .85rem; color: #5ba8cc; text-align: center;
      line-height: 1.6; margin: 0 0 1.75rem;
    }

    /* ── Form ── */
    .fa-form { width: 100%; display: flex; flex-direction: column; gap: .95rem; }

    .fa-label {
      display: block; font-size: .8rem; font-weight: 700;
      color: #3a7fa8; margin-bottom: .35rem; letter-spacing: .01em;
    }

    .fa-input-wrap { position: relative; }
    .fa-input-icon {
      position: absolute; left: .85rem; top: 50%; transform: translateY(-50%);
      color: #93c4e0; pointer-events: none;
      display: flex; align-items: center;
    }
    .fa-input {
      width: 100%; background: rgba(255,255,255,.88);
      border: 1.5px solid rgba(147,210,255,.52);
      border-radius: .65rem; padding: .65rem 1rem .65rem 2.5rem;
      font-size: .875rem; color: #0c2340;
      font-family: 'Plus Jakarta Sans', sans-serif;
      outline: none; box-sizing: border-box;
      transition: border-color .2s, box-shadow .2s, background .2s;
    }
    .fa-input::placeholder { color: #93c4e0; }
    .fa-input:focus {
      background: #fff;
      border-color: #38bdf8;
      box-shadow: 0 0 0 3px rgba(56,189,248,.18);
    }

    /* ── Primary button ── */
    .fa-btn-primary {
      width: 100%; margin-top: .5rem;
      padding: .8rem 1.5rem; border-radius: .8rem;
      background: linear-gradient(135deg,#0ea5e9 0%,#38bdf8 55%,#0284c7 100%);
      background-size: 200% 200%; background-position: 0% 50%;
      border: none; color: #fff;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: .925rem; font-weight: 800; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: .5rem;
      box-shadow: 0 4px 16px rgba(14,165,233,.38), 0 1px 0 rgba(255,255,255,.22) inset;
      transition: background-position .4s, box-shadow .25s, transform .18s;
    }
    .fa-btn-primary:hover {
      background-position: 100% 50%;
      box-shadow: 0 6px 26px rgba(14,165,233,.55), 0 1px 0 rgba(255,255,255,.22) inset;
      transform: translateY(-1px);
    }
    .fa-btn-primary:disabled {
      background: rgba(147,210,255,.30); border:1px solid rgba(147,210,255,.38);
      color: #7ab8d8; cursor: not-allowed; box-shadow:none; transform:none;
    }

    /* ── Camera viewport ── */
    .fa-camera-ring {
      position: relative;
      width: 272px; height: 272px;
      border-radius: 1.1rem; overflow: hidden;
      background: linear-gradient(135deg,#e0f2fe,#f0f9ff);
      border: 2.5px solid rgba(56,189,248,.45);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 28px rgba(14,165,233,.18);
      animation: faRingPulse 3s ease-in-out infinite;
    }

    /* Corner brackets */
    .fa-corner {
      position: absolute; width: 22px; height: 22px;
      border-color: #0ea5e9; border-style: solid;
      animation: faCornerBlink 2.2s ease-in-out infinite;
    }
    .fa-corner-tl { top:8px; left:8px;  border-width:3px 0 0 3px; border-radius:4px 0 0 0; }
    .fa-corner-tr { top:8px; right:8px; border-width:3px 3px 0 0; border-radius:0 4px 0 0; }
    .fa-corner-bl { bottom:8px; left:8px;  border-width:0 0 3px 3px; border-radius:0 0 0 4px; }
    .fa-corner-br { bottom:8px; right:8px; border-width:0 3px 3px 0; border-radius:0 0 4px 0; }

    /* Scan line */
    .fa-scan-line {
      position: absolute; left:0; right:0; height:2px;
      background: linear-gradient(90deg,transparent,rgba(14,165,233,.80),transparent);
      animation: faScanLine 2.2s ease-in-out infinite;
      pointer-events: none;
    }

    /* Loading state inside camera */
    .fa-camera-loader {
      display:flex; flex-direction:column; align-items:center; gap:.65rem;
      color:#5ba8cc;
    }
    .fa-camera-loader span { font-size:.82rem; font-weight:600; }

    /* Scanning overlay */
    .fa-scan-overlay {
      position:absolute; inset:0;
      background: rgba(14,165,233,.12);
      backdrop-filter:blur(2px);
      display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.6rem;
    }
    .fa-scan-overlay span { font-size:.82rem; font-weight:700; color:#0369a1; }

    /* video */
    .fa-video { width:100%; height:100%; object-fit:cover; }

    /* ── Back link ── */
    .fa-back-link {
      margin-top:1rem; font-size:.82rem; font-weight:600;
      color:#7ab8d8; background:none; border:none; cursor:pointer;
      font-family:inherit; padding:.3rem .5rem; border-radius:.4rem;
      transition:color .2s, background .2s;
    }
    .fa-back-link:hover { color:#0ea5e9; background:rgba(14,165,233,.08); }

    /* ── Dark Mode Overrides ── */
    html.dark .fa-wrap {
      background: rgba(30,41,59,0.85);
      border-color: rgba(56,189,248,0.3);
      box-shadow: 0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 40px rgba(0,0,0,0.5);
    }
    html.dark .fa-title { color: #f8fafc; }
    html.dark .fa-subtitle { color: #cbd5e1; }
    html.dark .fa-label { color: #bae6fd; }
    
    html.dark .fa-input {
      background: rgba(15,23,42,0.8);
      border-color: rgba(56,189,248,0.3);
      color: #f8fafc;
    }
    html.dark .fa-input:focus { background: rgba(30,41,59,0.9); }
    html.dark .fa-input::placeholder { color: #64748b; }
    html.dark .fa-input-icon { color: #7dd3fc; }
    
    html.dark .fa-camera-ring {
      background: linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.9));
      border-color: rgba(56,189,248,0.3);
      box-shadow: 0 4px 28px rgba(0,0,0,0.4);
    }
    html.dark .fa-camera-loader, html.dark .fa-scan-overlay span { color: #bae6fd; }
    html.dark .fa-scan-overlay { background: rgba(15,23,42,0.4); }
    html.dark .fa-back-link { color: #94a3b8; }
    html.dark .fa-back-link:hover { color: #e2e8f0; background: rgba(56,189,248,0.15); }
  `;
    document.head.appendChild(tag);
};

const FaceAuth = ({ account, isRegistration, onVerified, addNotification }) => {
    const videoRef   = useRef(null);
    const streamRef  = useRef(null);
    const modelsLoadedRef = useRef(false);

    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [isScanning,     setIsScanning]     = useState(false);
    const [step, setStep] = useState(isRegistration ? 'form' : 'scan');

    const [formData, setFormData] = useState({ name: '', email: '', voterId: '' });

    useEffect(() => { injectStyles(); }, []);
    useEffect(() => { setStep(isRegistration ? 'form' : 'scan'); }, [isRegistration]);

    // ── Camera helpers ──────────────────────────────────────────────────────
    const stopVideo = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    }, []);

    const startVideo = useCallback(() => {
        if (streamRef.current) return;
        navigator.mediaDevices.getUserMedia({ video: { width: 272, height: 272 } })
            .then((s) => {
                streamRef.current = s;
                if (videoRef.current) videoRef.current.srcObject = s;
            })
            .catch((err) => {
                console.error('Camera error:', err);
                addNotification('Please allow camera access to continue.', 'error');
            });
    }, [addNotification]);

    // ── Load models ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (modelsLoadedRef.current) return;
        const load = async () => {
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                ]);
                modelsLoadedRef.current = true;
                setIsModelsLoaded(true);
            } catch (error) {
                console.error('Model load error:', error);
                addNotification('Failed to load face detection models. Try refreshing.', 'error');
            }
        };
        load();
        return () => stopVideo();
    }, [addNotification, stopVideo]);

    useEffect(() => {
        if (isModelsLoaded && step === 'scan') startVideo();
        if (step === 'form') stopVideo();
    }, [isModelsLoaded, step, startVideo, stopVideo]);

    // ── Form submit ─────────────────────────────────────────────────────────
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.voterId) {
            addNotification('Please fill in all fields before proceeding.', 'warning');
            return;
        }
        setStep('scan');
    };

    // ── Scan ────────────────────────────────────────────────────────────────
    const handleScan = async () => {
        if (!isModelsLoaded || !videoRef.current) return;
        setIsScanning(true);
        addNotification('Scanning face, please hold still...', 'info');
        try {
            const detection = await faceapi
                .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                addNotification('No face detected. Ensure good lighting and look at the camera.', 'warning');
                setIsScanning(false);
                return;
            }

            const descriptorArr = Array.from(detection.descriptor);

            if (isRegistration) {
                const res = await axios.post(`${API_BASE}/api/auth/register`, {
                    walletAddress: account, ...formData, faceDescriptor: descriptorArr,
                });
                if (res.data.success) {
                    addNotification('Registration successful! Welcome to VoteChain. 🎉', 'success');
                    stopVideo(); onVerified(res.data.user);
                }
            } else {
                const res = await axios.post(`${API_BASE}/api/auth/verify`, {
                    walletAddress: account, loginDescriptor: descriptorArr,
                });
                if (res.data.success) {
                    addNotification('Face verified! Welcome back. ✅', 'success');
                    stopVideo(); onVerified(res.data.user);
                }
            }
        } catch (error) {
            console.error('Face auth error:', error);
            const msg = error.response?.data?.message || 'Authentication failed. Please try again.';
            addNotification(msg, 'error');
            if (isRegistration && error.response?.status === 400) { stopVideo(); setStep('form'); }
        } finally {
            setIsScanning(false);
        }
    };

    // ── Registration form ───────────────────────────────────────────────────
    if (step === 'form') {
        return (
            <div className="fa-wrap fa-fade-up">
                <h2 className="fa-title">Voter Registration</h2>
                <p className="fa-subtitle">Enter your details to create your secure face ID.</p>

                <form className="fa-form" onSubmit={handleFormSubmit}>
                    {/* Full Name */}
                    <div>
                        <label className="fa-label">Full Name</label>
                        <div className="fa-input-wrap">
                            <span className="fa-input-icon"><User style={{ width:15, height:15 }} /></span>
                            <input
                                type="text" required
                                className="fa-input"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="fa-label">Email Address</label>
                        <div className="fa-input-wrap">
                            <span className="fa-input-icon"><Mail style={{ width:15, height:15 }} /></span>
                            <input
                                type="email" required
                                className="fa-input"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Voter ID */}
                    <div>
                        <label className="fa-label">Voter ID Card Number</label>
                        <div className="fa-input-wrap">
                            <span className="fa-input-icon"><Hash style={{ width:15, height:15 }} /></span>
                            <input
                                type="text" required
                                className="fa-input"
                                placeholder="ABC1234567"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                value={formData.voterId}
                                onChange={e => setFormData({ ...formData, voterId: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="fa-btn-primary">
                        <Camera style={{ width:16, height:16 }} />
                        Proceed to Face Scan
                    </button>
                </form>
            </div>
        );
    }

    // ── Face scan screen ────────────────────────────────────────────────────
    return (
        <div className="fa-wrap fa-fade-up">
            <h2 className="fa-title">
                {isRegistration ? 'Register Your Face' : 'Verify Your Identity'}
            </h2>
            <p className="fa-subtitle">
                {isRegistration
                    ? 'Look directly at the camera to set up your secure face ID.'
                    : 'Look at the camera to verify your identity before accessing the dashboard.'}
            </p>

            {/* Camera viewport */}
            <div className="fa-camera-ring">
                {/* Corner brackets */}
                <span className="fa-corner fa-corner-tl" />
                <span className="fa-corner fa-corner-tr" />
                <span className="fa-corner fa-corner-bl" />
                <span className="fa-corner fa-corner-br" />

                {!isModelsLoaded ? (
                    <div className="fa-camera-loader">
                        <Loader2 style={{ width:32, height:32 }} className="fa-spin" />
                        <span>Loading AI Models…</span>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay muted playsInline
                            className="fa-video"
                        />
                        {/* Animated scan line (idle) */}
                        {!isScanning && <div className="fa-scan-line" />}
                    </>
                )}

                {/* Scanning overlay */}
                {isScanning && (
                    <div className="fa-scan-overlay">
                        <Loader2 style={{ width:36, height:36 }} className="fa-spin" />
                        <span>Analyzing…</span>
                    </div>
                )}
            </div>

            {/* Scan button */}
            <button
                className="fa-btn-primary"
                style={{ width: 272 }}
                onClick={handleScan}
                disabled={!isModelsLoaded || isScanning}
            >
                {isScanning ? (
                    <><Loader2 style={{ width:17, height:17 }} className="fa-spin" /> Analyzing Face…</>
                ) : (
                    <><Camera style={{ width:17, height:17 }} /> Scan Face for {isRegistration ? 'Registration' : 'Login'}</>
                )}
            </button>

            {isRegistration && (
                <button
                    className="fa-back-link"
                    onClick={() => { stopVideo(); setStep('form'); }}
                >
                    ← Back to Details Form
                </button>
            )}
        </div>
    );
};

export default FaceAuth;