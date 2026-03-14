import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, Loader2, User, Mail, Hash } from 'lucide-react';
import axios from 'axios';

const FaceAuth = ({ account, isRegistration, onVerified, addNotification }) => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);       // Use ref instead of state to avoid stale closure in stopVideo
    const modelsLoadedRef = useRef(false); // Track if models already loaded

    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [step, setStep] = useState(isRegistration ? 'form' : 'scan');

    // Sync step with isRegistration prop
    useEffect(() => {
        setStep(isRegistration ? 'form' : 'scan');
    }, [isRegistration]);

    // Registration Form State
    const [formData, setFormData] = useState({ name: '', email: '', voterId: '' });

    // Stop camera
    const stopVideo = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    // Start camera
    const startVideo = useCallback(() => {
        // Prevent double-start
        if (streamRef.current) return;

        navigator.mediaDevices.getUserMedia({ video: { width: 288, height: 288 } })
            .then((currentStream) => {
                streamRef.current = currentStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = currentStream;
                }
            })
            .catch((err) => {
                console.error('Camera error:', err);
                addNotification('Please allow camera access to continue.', 'error');
            });
    }, [addNotification]);

    // Load face-api.js models ONCE on mount
    useEffect(() => {
        if (modelsLoadedRef.current) return; // Already loaded

        const loadModels = async () => {
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                ]);
                modelsLoadedRef.current = true;
                setIsModelsLoaded(true);
            } catch (error) {
                console.error('Error loading face models:', error);
                addNotification('Failed to load face detection models. Try refreshing.', 'error');
            }
        };

        loadModels();

        // Stop camera on component unmount
        return () => stopVideo();
    }, [addNotification, stopVideo]);

    // Start video when models are ready AND step is 'scan'
    useEffect(() => {
        if (isModelsLoaded && step === 'scan') {
            startVideo();
        }
        // Stop video when going back to form
        if (step === 'form') {
            stopVideo();
        }
    }, [isModelsLoaded, step, startVideo, stopVideo]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.voterId) {
            addNotification('Please fill in all fields before proceeding.', 'warning');
            return;
        }
        setStep('scan');
    };

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
                // Register new user — relative path goes through Vite proxy → http://localhost:5000
                const res = await axios.post('/api/auth/register', {
                    walletAddress: account,
                    name: formData.name,
                    email: formData.email,
                    voterId: formData.voterId,
                    faceDescriptor: descriptorArr,
                });

                if (res.data.success) {
                    addNotification('Registration successful! Welcome to VoteChain. 🎉', 'success');
                    stopVideo();
                    onVerified(res.data.user);
                }
            } else {
                // Verify returning user
                const res = await axios.post('/api/auth/verify', {
                    walletAddress: account,
                    loginDescriptor: descriptorArr,
                });

                if (res.data.success) {
                    addNotification('Face verified! Welcome back. ✅', 'success');
                    stopVideo();
                    onVerified(res.data.user);
                }
            }
        } catch (error) {
            console.error('Face auth error:', error);
            const msg = error.response?.data?.message || 'Authentication failed. Please try again.';
            addNotification(msg, 'error');

            // Registration failed with a 400 (e.g. duplicate email) → go back to form
            if (isRegistration && error.response?.status === 400) {
                stopVideo();
                setStep('form');
            }
        } finally {
            setIsScanning(false);
        }
    };

    // ─── Registration Form ───────────────────────────────────────────────────
    if (step === 'form') {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-800/50 rounded-2xl border border-gray-700 backdrop-blur-md w-full max-w-md mx-auto mt-10">
                <h2 className="text-2xl font-bold text-white mb-2">Voter Registration</h2>
                <p className="text-gray-400 text-center text-sm mb-6">
                    Enter your details to create your secure face ID.
                </p>

                <form onSubmit={handleFormSubmit} className="w-full space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="email"
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Voter ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Voter ID Card Number</label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="ABC1234567"
                                value={formData.voterId}
                                onChange={e => setFormData({ ...formData, voterId: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-6 py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        <Camera className="w-4 h-4" />
                        Proceed to Face Scan
                    </button>
                </form>
            </div>
        );
    }

    // ─── Face Scan Screen ────────────────────────────────────────────────────
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-800/50 rounded-2xl border border-gray-700 backdrop-blur-md max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold text-white mb-2">
                {isRegistration ? 'Register Your Face' : 'Verify Your Identity'}
            </h2>
            <p className="text-gray-400 text-center text-sm mb-6">
                {isRegistration
                    ? 'Look directly at the camera to set up your secure face ID.'
                    : 'Look at the camera to verify your identity before accessing the dashboard.'}
            </p>

            {/* Camera Preview */}
            <div className="relative rounded-xl overflow-hidden bg-black w-72 h-72 border-4 border-blue-500/30 flex items-center justify-center mb-6 shadow-2xl shadow-blue-900/20">
                {!isModelsLoaded ? (
                    <div className="flex flex-col items-center text-blue-400 gap-2">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-sm font-medium">Loading AI Models...</span>
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                )}
                {/* Scanning overlay */}
                {isScanning && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                            <span className="text-sm text-white font-medium">Processing...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Scan Button */}
            <button
                onClick={handleScan}
                disabled={!isModelsLoaded || isScanning}
                className={`w-full py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                    ${!isModelsLoaded || isScanning
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-blue-500/20'
                    }`}
            >
                {isScanning ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Face...</>
                ) : (
                    <><Camera className="w-5 h-5" /> Scan Face for {isRegistration ? 'Registration' : 'Login'}</>
                )}
            </button>

            {isRegistration && (
                <button
                    onClick={() => { stopVideo(); setStep('form'); }}
                    className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
                >
                    ← Back to Details Form
                </button>
            )}
        </div>
    );
};

export default FaceAuth;
