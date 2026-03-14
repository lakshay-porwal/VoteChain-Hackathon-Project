<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>VoteChain – Decentralized Voting System</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --blue-900: #0a1628;
    --blue-800: #0f2244;
    --blue-700: #1a3a6b;
    --blue-600: #1e4d9b;
    --blue-500: #2563eb;
    --blue-400: #3b82f6;
    --blue-300: #60a5fa;
    --blue-200: #bfdbfe;
    --blue-100: #dbeafe;
    --blue-50:  #eff6ff;
    --white: #ffffff;
    --gray-100: #f1f5f9;
    --gray-200: #e2e8f0;
    --gray-300: #cbd5e1;
    --gray-500: #64748b;
    --gray-700: #334155;
    --gray-900: #0f172a;
    --accent: #f59e0b;
    --accent-light: #fef3c7;
    --green: #10b981;
    --green-light: #d1fae5;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'Space Grotesk', sans-serif;
    background: var(--white);
    color: var(--gray-900);
    line-height: 1.7;
    font-size: 16px;
  }

  /* ─── HERO / WAVE ─────────────────────────────────────────── */
  .hero {
    background: linear-gradient(135deg, var(--blue-900) 0%, var(--blue-700) 50%, var(--blue-600) 100%);
    position: relative;
    padding: 72px 40px 0;
    overflow: hidden;
    text-align: center;
    min-height: 420px;
  }

  .hero-stars {
    position: absolute; inset: 0;
    background-image:
      radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 30% 60%, rgba(255,255,255,0.2) 0%, transparent 100%),
      radial-gradient(1.5px 1.5px at 55% 15%, rgba(255,255,255,0.35) 0%, transparent 100%),
      radial-gradient(1px 1px at 75% 40%, rgba(255,255,255,0.25) 0%, transparent 100%),
      radial-gradient(1px 1px at 88% 70%, rgba(255,255,255,0.2) 0%, transparent 100%),
      radial-gradient(1.5px 1.5px at 22% 80%, rgba(255,255,255,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 65% 85%, rgba(255,255,255,0.2) 0%, transparent 100%);
  }

  .hero-badge {
    display: inline-block;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    color: var(--blue-200);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 6px 16px;
    border-radius: 100px;
    margin-bottom: 20px;
  }

  .hero h1 {
    font-size: clamp(2.2rem, 5vw, 3.6rem);
    font-weight: 700;
    color: var(--white);
    letter-spacing: -0.02em;
    line-height: 1.15;
    margin-bottom: 16px;
    position: relative;
  }

  .hero h1 span { color: var(--blue-300); }

  .hero-sub {
    font-size: 1.15rem;
    color: var(--blue-200);
    max-width: 540px;
    margin: 0 auto 36px;
    font-weight: 400;
    opacity: 0.9;
  }

  .hero-badges {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 48px;
  }

  .badge {
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.18);
    color: var(--white);
    font-size: 13px;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 100px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .badge .dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--blue-300);
    flex-shrink: 0;
  }

  .wave-wrap {
    position: relative;
    margin-top: 8px;
    line-height: 0;
  }

  .wave-wrap svg { display: block; width: 100%; }

  /* ─── NAV ─────────────────────────────────────────────────── */
  .toc {
    background: var(--blue-50);
    border-bottom: 1px solid var(--blue-100);
    padding: 14px 40px;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 6px 20px;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .toc a {
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    color: var(--blue-700);
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .toc a:hover {
    background: var(--blue-200);
    color: var(--blue-900);
  }

  /* ─── LAYOUT ──────────────────────────────────────────────── */
  .page { max-width: 900px; margin: 0 auto; padding: 0 40px; }

  section { padding: 56px 0; border-bottom: 1px solid var(--gray-200); }
  section:last-child { border-bottom: none; }

  .section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--blue-500);
    margin-bottom: 8px;
  }

  h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--blue-900);
    letter-spacing: -0.01em;
    margin-bottom: 20px;
  }

  h3 {
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--blue-800);
    margin: 24px 0 10px;
  }

  p { color: var(--gray-700); margin-bottom: 12px; }

  /* ─── FEATURES GRID ───────────────────────────────────────── */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
    margin-top: 24px;
  }

  .feature-card {
    background: var(--blue-50);
    border: 1px solid var(--blue-100);
    border-radius: 14px;
    padding: 20px;
    transition: all 0.2s;
  }

  .feature-card:hover {
    border-color: var(--blue-300);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(37,99,235,0.08);
  }

  .feature-icon {
    width: 40px; height: 40px;
    background: var(--blue-100);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 12px;
    font-size: 20px;
  }

  .feature-card h4 {
    font-size: 14px;
    font-weight: 700;
    color: var(--blue-900);
    margin-bottom: 6px;
  }

  .feature-card p {
    font-size: 13px;
    color: var(--gray-500);
    margin: 0;
    line-height: 1.5;
  }

  /* ─── TECH STACK ──────────────────────────────────────────── */
  .tech-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-top: 24px;
  }

  @media (max-width: 640px) { .tech-grid { grid-template-columns: 1fr 1fr; } }

  .tech-group {
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: 14px;
    overflow: hidden;
  }

  .tech-group-header {
    background: var(--blue-600);
    color: var(--white);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 10px 16px;
  }

  .tech-group ul { list-style: none; padding: 12px 16px; }

  .tech-group li {
    font-size: 13px;
    color: var(--gray-700);
    padding: 4px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tech-group li::before {
    content: '';
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--blue-400);
    flex-shrink: 0;
  }

  /* ─── FLOWCHART SVG WRAPPER ───────────────────────────────── */
  .flowchart-wrap {
    margin-top: 28px;
    background: var(--blue-50);
    border: 1px solid var(--blue-100);
    border-radius: 18px;
    padding: 32px 20px;
    overflow-x: auto;
  }

  /* ─── SETUP STEPS ─────────────────────────────────────────── */
  .steps { margin-top: 24px; display: flex; flex-direction: column; gap: 0; }

  .step {
    display: flex;
    gap: 20px;
    position: relative;
  }

  .step:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 19px; top: 44px; bottom: 0;
    width: 2px;
    background: var(--blue-100);
  }

  .step-num {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: var(--blue-600);
    color: var(--white);
    font-weight: 700;
    font-size: 15px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }

  .step-body { padding: 8px 0 32px; }
  .step-body h4 { font-size: 15px; font-weight: 700; color: var(--blue-900); margin-bottom: 6px; }
  .step-body p { font-size: 14px; color: var(--gray-500); margin-bottom: 8px; }

  code {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    background: var(--gray-100);
    border: 1px solid var(--gray-200);
    color: var(--blue-700);
    padding: 2px 7px;
    border-radius: 5px;
  }

  pre {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    background: var(--gray-900);
    color: #a5f3fc;
    border-radius: 12px;
    padding: 16px 20px;
    overflow-x: auto;
    line-height: 1.6;
    margin-top: 8px;
  }

  pre .cmd { color: #86efac; }
  pre .comment { color: #6b7280; }

  /* ─── STRUCTURE ───────────────────────────────────────────── */
  .file-tree {
    background: var(--gray-900);
    border-radius: 14px;
    padding: 20px 24px;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    line-height: 2;
    color: #94a3b8;
    margin-top: 20px;
  }

  .ft-folder { color: #60a5fa; font-weight: 500; }
  .ft-file   { color: #a5f3fc; }
  .ft-config { color: #fbbf24; }

  /* ─── FUTURE ──────────────────────────────────────────────── */
  .future-list { list-style: none; margin-top: 20px; display: flex; flex-direction: column; gap: 10px; }

  .future-list li {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 15px;
    color: var(--gray-700);
    background: var(--blue-50);
    border: 1px solid var(--blue-100);
    border-radius: 10px;
    padding: 12px 16px;
  }

  .future-list li .tag {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--blue-100);
    color: var(--blue-700);
    padding: 3px 8px;
    border-radius: 100px;
    white-space: nowrap;
  }

  /* ─── CONTRIBUTORS ────────────────────────────────────────── */
  .contributors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-top: 24px;
  }

  .contributor-card {
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: 16px;
    padding: 24px 20px;
    text-align: center;
    transition: all 0.25s;
    position: relative;
    overflow: hidden;
  }

  .contributor-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--blue-50), transparent);
    opacity: 0;
    transition: opacity 0.25s;
  }

  .contributor-card:hover {
    border-color: var(--blue-300);
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(37,99,235,0.1);
  }

  .contributor-card:hover::before { opacity: 1; }

  .avatar {
    width: 60px; height: 60px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700;
    font-size: 22px;
    color: var(--white);
    margin: 0 auto 12px;
    position: relative;
  }

  .c1 .avatar { background: linear-gradient(135deg, var(--blue-600), var(--blue-400)); }
  .c2 .avatar { background: linear-gradient(135deg, #7c3aed, #a78bfa); }
  .c3 .avatar { background: linear-gradient(135deg, #059669, #34d399); }
  .c4 .avatar { background: linear-gradient(135deg, #dc2626, #f87171); }

  .contributor-card h4 {
    font-size: 15px;
    font-weight: 700;
    color: var(--blue-900);
    margin-bottom: 4px;
    position: relative;
  }

  .contributor-role {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--blue-500);
    position: relative;
  }

  .contributor-links {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 14px;
    position: relative;
  }

  .contributor-links a {
    text-decoration: none;
    font-size: 12px;
    font-weight: 600;
    color: var(--blue-600);
    background: var(--blue-50);
    border: 1px solid var(--blue-100);
    padding: 4px 10px;
    border-radius: 100px;
    transition: all 0.15s;
  }

  .contributor-links a:hover {
    background: var(--blue-600);
    color: var(--white);
    border-color: var(--blue-600);
  }

  /* ─── FOOTER ──────────────────────────────────────────────── */
  .footer {
    background: var(--blue-900);
    color: var(--blue-200);
    text-align: center;
    padding: 40px;
    font-size: 13px;
    position: relative;
    overflow: hidden;
  }

  .footer-wave {
    position: absolute;
    top: 0; left: 0; right: 0;
    line-height: 0;
    transform: rotate(180deg);
  }

  .footer-wave svg { display: block; width: 100%; }

  .footer-inner { position: relative; padding-top: 20px; }
  .footer strong { color: var(--white); }
  .footer a { color: var(--blue-300); text-decoration: none; }
  .footer a:hover { color: var(--white); }
  .footer-license {
    display: inline-block;
    margin-top: 12px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    padding: 4px 14px;
    border-radius: 100px;
    font-size: 12px;
    color: var(--blue-200);
  }

  /* ─── MISC ────────────────────────────────────────────────── */
  .divider { border: none; border-top: 1px solid var(--gray-200); margin: 0; }

  .highlight-box {
    background: var(--blue-50);
    border-left: 4px solid var(--blue-500);
    border-radius: 0 10px 10px 0;
    padding: 14px 18px;
    margin: 16px 0;
    font-size: 14px;
    color: var(--blue-800);
  }
</style>
</head>
<body>

<!-- ═══════════════ HERO ═══════════════ -->
<header class="hero">
  <div class="hero-stars"></div>
  <div class="hero-badge">Open Source · Hackathon Project</div>
  <h1>Vote<span>Chain</span></h1>
  <p class="hero-sub">A decentralized voting platform powered by Ethereum smart contracts — secure, transparent, and tamper-proof.</p>
  <div class="hero-badges">
    <span class="badge"><span class="dot"></span>Solidity Smart Contracts</span>
    <span class="badge"><span class="dot"></span>React + Vite Frontend</span>
    <span class="badge"><span class="dot"></span>Web3.js Integration</span>
    <span class="badge"><span class="dot"></span>MIT License</span>
  </div>
  <div class="wave-wrap">
    <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#ffffff"/>
    </svg>
  </div>
</header>

<!-- ═══════════════ NAV ═══════════════ -->
<nav class="toc">
  <a href="#features">Features</a>
  <a href="#tech">Tech Stack</a>
  <a href="#flowchart">Flowchart</a>
  <a href="#structure">Structure</a>
  <a href="#getting-started">Getting Started</a>
  <a href="#future">Roadmap</a>
  <a href="#contributors">Contributors</a>
</nav>

<!-- ═══════════════ CONTENT ═══════════════ -->
<main class="page">

  <!-- FEATURES -->
  <section id="features">
    <p class="section-label">What it does</p>
    <h2>Core Features</h2>
    <p>VoteChain brings the guarantees of blockchain to the voting process — every vote is recorded immutably on-chain, results are publicly verifiable, and no single authority can alter the outcome.</p>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">🔐</div>
        <h4>Decentralized Voting</h4>
        <p>Votes are cast directly to Ethereum smart contracts, removing any central point of failure or manipulation.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🧾</div>
        <h4>Immutable On-Chain Storage</h4>
        <p>Every vote is permanently recorded on-chain — no edits, no deletions, no tampering possible.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <h4>Fast React + Vite UI</h4>
        <p>Lightning-fast frontend with hot module replacement and optimized builds for an instant user experience.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔄</div>
        <h4>Optimized Gas Usage</h4>
        <p>Smart contract logic is engineered for minimal transaction fees without sacrificing security.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🌐</div>
        <h4>Web3 Integration</h4>
        <p>Seamless MetaMask wallet connection via Web3.js for a familiar and frictionless blockchain experience.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h4>Transparent Results</h4>
        <p>Anyone can query the smart contract to verify vote tallies — full transparency by design.</p>
      </div>
    </div>
  </section>

  <!-- TECH STACK -->
  <section id="tech">
    <p class="section-label">Built with</p>
    <h2>Tech Stack</h2>
    <div class="tech-grid">
      <div class="tech-group">
        <div class="tech-group-header">Frontend</div>
        <ul>
          <li>React</li>
          <li>Vite</li>
          <li>JavaScript</li>
          <li>HTML &amp; CSS</li>
        </ul>
      </div>
      <div class="tech-group">
        <div class="tech-group-header">Blockchain</div>
        <ul>
          <li>Solidity</li>
          <li>Ethereum</li>
          <li>Hardhat</li>
          <li>Web3.js</li>
        </ul>
      </div>
      <div class="tech-group">
        <div class="tech-group-header">Tools</div>
        <ul>
          <li>Node.js</li>
          <li>npm</li>
          <li>ESLint</li>
          <li>MetaMask</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- FLOWCHART -->
  <section id="flowchart">
    <p class="section-label">How it works</p>
    <h2>System Flowchart</h2>
    <p>The diagram below traces the complete lifecycle of a vote — from a user connecting their wallet, all the way to verified on-chain results.</p>
    <div class="flowchart-wrap">
      <svg viewBox="0 0 860 920" xmlns="http://www.w3.org/2000/svg" width="100%">
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M2 1.5L7.5 5L2 8.5" fill="none" stroke="#2563eb" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
          <marker id="arr-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M2 1.5L7.5 5L2 8.5" fill="none" stroke="#94a3b8" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
          <marker id="arr-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M2 1.5L7.5 5L2 8.5" fill="none" stroke="#dc2626" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
          <marker id="arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M2 1.5L7.5 5L2 8.5" fill="none" stroke="#059669" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
        </defs>

        <!-- ── ROW 1: User ── -->
        <!-- User box (rounded, start) -->
        <rect x="330" y="24" width="200" height="52" rx="26" fill="#1e4d9b" stroke="#2563eb" stroke-width="1.5"/>
        <text x="430" y="53" text-anchor="middle" dominant-baseline="central" font-family="'Space Grotesk',sans-serif" font-size="15" font-weight="700" fill="#ffffff">👤  User / Voter</text>

        <!-- arrow down -->
        <line x1="430" y1="76" x2="430" y2="110" stroke="#2563eb" stroke-width="1.5" marker-end="url(#arr)"/>

        <!-- ── ROW 2: Connect Wallet ── -->
        <rect x="310" y="112" width="240" height="52" rx="10" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
        <text x="430" y="134" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="14" font-weight="700" fill="#1e4d9b">Connect MetaMask Wallet</text>
        <text x="430" y="152" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="12" fill="#64748b">Web3.js detects provider</text>

        <!-- arrow down -->
        <line x1="430" y1="164" x2="430" y2="198" stroke="#2563eb" stroke-width="1.5" marker-end="url(#arr)"/>

        <!-- ── ROW 3: Auth Diamond ── -->
        <polygon points="430,200 560,252 430,304 300,252" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="430" y="248" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="13" font-weight="700" fill="#92400e">Wallet</text>
        <text x="430" y="265" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="13" font-weight="700" fill="#92400e">Connected?</text>

        <!-- No path: right side -->
        <path d="M560 252 L660 252" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arr-red)" fill="none"/>
        <text x="610" y="245" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="11" fill="#dc2626" font-weight="600">No</text>
        <rect x="662" y="230" width="150" height="44" rx="8" fill="#fef2f2" stroke="#fca5a5" stroke-width="1"/>
        <text x="737" y="250" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="12" font-weight="600" fill="#991b1b">Show Error</text>
        <text x="737" y="266" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="11" fill="#b91c1c">Prompt reconnect</text>

        <!-- Yes path: down -->
        <line x1="430" y1="304" x2="430" y2="338" stroke="#059669" stroke-width="1.5" marker-end="url(#arr-green)"/>
        <text x="445" y="325" font-family="'Space Grotesk',sans-serif" font-size="11" fill="#059669" font-weight="600">Yes</text>

        <!-- ── ROW 4: Load Candidates ── -->
        <rect x="310" y="340" width="240" height="52" rx="10" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
        <text x="430" y="362" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="14" font-weight="700" fill="#1e4d9b">Load Candidates</text>
        <text x="430" y="380" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="12" fill="#64748b">Read smart contract state</text>

        <line x1="430" y1="392" x2="430" y2="426" stroke="#2563eb" stroke-width="1.5" marker-end="url(#arr)"/>

        <!-- ── ROW 5: Cast Vote ── -->
        <rect x="310" y="428" width="240" height="52" rx="10" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
        <text x="430" y="450" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="14" font-weight="700" fill="#1e4d9b">User Selects &amp; Casts Vote</text>
        <text x="430" y="468" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="12" fill="#64748b">Sends transaction via Web3</text>

        <line x1="430" y1="480" x2="430" y2="514" stroke="#2563eb" stroke-width="1.5" marker-end="url(#arr)"/>

        <!-- ── ROW 6: Signed? Diamond ── -->
        <polygon points="430,516 560,568 430,620 300,568" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="430" y="564" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="13" font-weight="700" fill="#92400e">MetaMask</text>
        <text x="430" y="581" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="13" font-weight="700" fill="#92400e">Approved?</text>

        <!-- No: right -->
        <path d="M560 568 L660 568" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arr-red)" fill="none"/>
        <text x="610" y="560" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="11" fill="#dc2626" font-weight="600">No</text>
        <rect x="662" y="546" width="150" height="44" rx="8" fill="#fef2f2" stroke="#fca5a5" stroke-width="1"/>
        <text x="737" y="566" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="12" font-weight="600" fill="#991b1b">Rejected</text>
        <text x="737" y="582" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="11" fill="#b91c1c">Notify voter</text>

        <!-- Yes: down -->
        <line x1="430" y1="620" x2="430" y2="654" stroke="#059669" stroke-width="1.5" marker-end="url(#arr-green)"/>
        <text x="445" y="641" font-family="'Space Grotesk',sans-serif" font-size="11" fill="#059669" font-weight="600">Yes</text>

        <!-- ── ROW 7: Smart Contract ── -->
        <rect x="286" y="656" width="288" height="58" rx="10" fill="#1e4d9b" stroke="#2563eb" stroke-width="1.5"/>
        <text x="430" y="678" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="14" font-weight="700" fill="#ffffff">Ethereum Smart Contract</text>
        <text x="430" y="697" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="12" fill="#bfdbfe">Validates &amp; records vote on-chain</text>

        <line x1="430" y1="714" x2="430" y2="748" stroke="#2563eb" stroke-width="1.5" marker-end="url(#arr)"/>

        <!-- ── ROW 8: Duplicate? Diamond ── -->
        <polygon points="430,750 560,802 430,854 300,802" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="430" y="798" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="13" font-weight="700" fill="#92400e">Already</text>
        <text x="430" y="815" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="13" font-weight="700" fill="#92400e">Voted?</text>

        <!-- Yes: right = rejected -->
        <path d="M560 802 L660 802" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arr-red)" fill="none"/>
        <text x="610" y="794" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="11" fill="#dc2626" font-weight="600">Yes</text>
        <rect x="662" y="780" width="150" height="44" rx="8" fill="#fef2f2" stroke="#fca5a5" stroke-width="1"/>
        <text x="737" y="800" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="12" font-weight="600" fill="#991b1b">Tx Reverted</text>
        <text x="737" y="816" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="11" fill="#b91c1c">Duplicate blocked</text>

        <!-- No: down -->
        <line x1="430" y1="854" x2="430" y2="882" stroke="#059669" stroke-width="1.5" marker-end="url(#arr-green)"/>
        <text x="445" y="872" font-family="'Space Grotesk',sans-serif" font-size="11" fill="#059669" font-weight="600">No</text>

        <!-- ── ROW 9: Recorded ── -->
        <rect x="296" y="884" width="268" height="52" rx="10" fill="#d1fae5" stroke="#059669" stroke-width="1.5"/>
        <text x="430" y="906" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="14" font-weight="700" fill="#065f46">Vote Recorded ✓</text>
        <text x="430" y="924" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="12" fill="#047857">Immutable, publicly verifiable</text>

        <!-- Legend -->
        <rect x="30" y="24" width="200" height="130" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        <text x="130" y="46" text-anchor="middle" font-family="'Space Grotesk',sans-serif" font-size="12" font-weight="700" fill="#475569">Legend</text>
        <rect x="46" y="58" width="14" height="14" rx="3" fill="#1e4d9b"/>
        <text x="68" y="70" font-family="'Space Grotesk',sans-serif" font-size="11" fill="#475569">Process Step</text>
        <polygon points="52,88 60,96 52,104 44,96" fill="#fef3c7" stroke="#f59e0b" stroke-width="1"/>
        <text x="68" y="100" font-family="'Space Grotesk',sans-serif" font-size="11" fill="#475569">Decision</text>
        <rect x="44" y="112" width="18" height="14" rx="3" fill="#d1fae5" stroke="#059669" stroke-width="1"/>
        <text x="68" y="123" font-family="'Space Grotesk',sans-serif" font-size="11" fill="#475569">Success</text>
        <rect x="44" y="132" width="18" height="14" rx="3" fill="#fef2f2" stroke="#fca5a5" stroke-width="1"/>
        <text x="68" y="143" font-family="'Space Grotesk',sans-serif" font-size="11" fill="#475569">Error / Reject</text>
      </svg>
    </div>
  </section>

  <!-- PROJECT STRUCTURE -->
  <section id="structure">
    <p class="section-label">Codebase</p>
    <h2>Project Structure</h2>
    <p>The repository is organized to cleanly separate frontend concerns, smart contract logic, deployment scripts, and tests.</p>
    <div class="file-tree">
      <div><span class="ft-folder">VoteChain/</span></div>
      <div>&nbsp;&nbsp;├── <span class="ft-folder">src/</span></div>
      <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span class="ft-folder">components/</span> &nbsp;<span style="color:#6b7280;font-size:11px">— Reusable UI components</span></div>
      <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span class="ft-folder">pages/</span> &nbsp;<span style="color:#6b7280;font-size:11px">— Route-level page views</span></div>
      <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span class="ft-file">App.jsx</span> &nbsp;<span style="color:#6b7280;font-size:11px">— Root component &amp; routing</span></div>
      <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── <span class="ft-file">main.jsx</span> &nbsp;<span style="color:#6b7280;font-size:11px">— Entry point</span></div>
      <div>&nbsp;&nbsp;├── <span class="ft-folder">public/</span> &nbsp;<span style="color:#6b7280;font-size:11px">— Static assets</span></div>
      <div>&nbsp;&nbsp;├── <span class="ft-folder">contracts/</span> &nbsp;<span style="color:#6b7280;font-size:11px">— Solidity smart contracts</span></div>
      <div>&nbsp;&nbsp;├── <span class="ft-folder">scripts/</span> &nbsp;<span style="color:#6b7280;font-size:11px">— Deployment scripts (Hardhat)</span></div>
      <div>&nbsp;&nbsp;├── <span class="ft-folder">test/</span> &nbsp;<span style="color:#6b7280;font-size:11px">— Contract unit tests</span></div>
      <div>&nbsp;&nbsp;├── <span class="ft-config">package.json</span></div>
      <div>&nbsp;&nbsp;├── <span class="ft-config">vite.config.js</span></div>
      <div>&nbsp;&nbsp;└── <span class="ft-file">README.md</span></div>
    </div>
  </section>

  <!-- GETTING STARTED -->
  <section id="getting-started">
    <p class="section-label">Setup</p>
    <h2>Getting Started</h2>

    <div class="highlight-box">
      <strong>Prerequisites:</strong> Node.js v16 or higher, npm, and a MetaMask browser extension installed for blockchain interaction.
    </div>

    <div class="steps">
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-body">
          <h4>Clone the Repository</h4>
          <p>Get the source code from GitHub.</p>
          <pre><span class="cmd">git clone</span> https://github.com/lakshay-porwal/VoteChain-Hackathon-Project.git</pre>
        </div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-body">
          <h4>Navigate to the Project</h4>
          <pre><span class="cmd">cd</span> VoteChain</pre>
        </div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-body">
          <h4>Install Dependencies</h4>
          <p>Install all frontend and Hardhat dependencies.</p>
          <pre><span class="cmd">npm install</span></pre>
        </div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-body">
          <h4>Start the Development Server</h4>
          <p>Vite will spin up a hot-reloading server at <code>localhost:5173</code>.</p>
          <pre><span class="cmd">npm run dev</span></pre>
        </div>
      </div>
      <div class="step">
        <div class="step-num">5</div>
        <div class="step-body">
          <h4>Deploy Smart Contracts (optional)</h4>
          <p>Compile and deploy to a local Hardhat network for testing.</p>
          <pre><span class="cmd">npx hardhat compile</span>
<span class="cmd">npx hardhat node</span>
<span class="cmd">npx hardhat run</span> scripts/deploy.js --network localhost</pre>
        </div>
      </div>
    </div>
  </section>

  <!-- FUTURE -->
  <section id="future">
    <p class="section-label">What's next</p>
    <h2>Future Roadmap</h2>
    <ul class="future-list">
      <li><span class="tag">Auth</span> Role-based access control — Admin and Voter distinction in smart contracts</li>
      <li><span class="tag">Identity</span> Wallet-based voter authentication with on-chain eligibility checks</li>
      <li><span class="tag">Dashboard</span> Live election result dashboard with real-time vote tallies</li>
      <li><span class="tag">Scale</span> Support for multiple simultaneous elections with isolated contract instances</li>
      <li><span class="tag">Storage</span> IPFS integration for decentralized off-chain data (candidate metadata, images)</li>
    </ul>
  </section>

  <!-- CONTRIBUTORS -->
  <section id="contributors">
    <p class="section-label">The Team</p>
    <h2>Contributors</h2>
    <p>VoteChain was built by a four-person team for a hackathon, combining blockchain engineering, frontend development, and systems design.</p>
    <div class="contributors-grid">

      <div class="contributor-card c1">
        <div class="avatar">LP</div>
        <h4>Lakshay Porwal</h4>
        <div class="contributor-role">Lead Developer</div>
        <div class="contributor-links">
          <a href="https://github.com/lakshay-porwal" target="_blank">GitHub</a>
          <a href="https://www.linkedin.com/in/lakshay-porwal" target="_blank">LinkedIn</a>
        </div>
      </div>

      <div class="contributor-card c2">
        <div class="avatar">AS</div>
        <h4>Akshat Srivastava</h4>
        <div class="contributor-role">Smart Contracts</div>
        <div class="contributor-links">
          <a href="https://github.com/" target="_blank">GitHub</a>
          <a href="https://linkedin.com/" target="_blank">LinkedIn</a>
        </div>
      </div>

      <div class="contributor-card c3">
        <div class="avatar">RB</div>
        <h4>Riya Bansal</h4>
        <div class="contributor-role">Frontend Dev</div>
        <div class="contributor-links">
          <a href="https://github.com/" target="_blank">GitHub</a>
          <a href="https://linkedin.com/" target="_blank">LinkedIn</a>
        </div>
      </div>

      <div class="contributor-card c4">
        <div class="avatar">OG</div>
        <h4>Om Gupta</h4>
        <div class="contributor-role">Web3 Integration</div>
        <div class="contributor-links">
          <a href="https://github.com/" target="_blank">GitHub</a>
          <a href="https://linkedin.com/" target="_blank">LinkedIn</a>
        </div>
      </div>

    </div>
  </section>

</main>

<!-- ═══════════════ FOOTER ═══════════════ -->
<footer class="footer">
  <div class="footer-wave">
    <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,15 1440,30 L1440,60 L0,60 Z" fill="#0a1628"/>
    </svg>
  </div>
  <div class="footer-inner">
    <p>Built with ❤️ by <strong>Lakshay Porwal</strong>, Akshat Srivastava, Riya Bansal &amp; Om Gupta</p>
    <p style="margin-top:6px;opacity:0.7;">
      <a href="https://github.com/lakshay-porwal/VoteChain-Hackathon-Project">GitHub Repository</a>
      &nbsp;·&nbsp;
      <a href="https://github.com/lakshay-porwal">@lakshay-porwal</a>
    </p>
    <div class="footer-license">MIT License — open source &amp; free to use</div>
  </div>
</footer>

</body>
</html>
