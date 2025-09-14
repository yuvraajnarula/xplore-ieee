import React, { useState, useEffect } from "react";
import {
  Shield,
  Scan,
  Wallet,
  ArrowRight,
  Zap,
  Lock,
  Eye,
  Database,
  ChevronDown,
  Menu,
  Cpu,
  Network,
  Globe,
  Atom,
  Binary,
  Layers,
} from "lucide-react";

interface MousePosition {
  x: number;
  y: number;
}

const ZillionIDMain: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  // Smooth scroll function
  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest' 
      });
    }
    setNavOpen(false); // Close mobile nav
  };

  useEffect(() => {
    if (showIntro) return;
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [showIntro]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const navigateTo = (service: string) => {
    if (service === "biometric") {
      window.open("http://localhost:3001", "_blank");
    } else if (service === "wallet") {
      window.open("http://localhost:3002", "_blank");
    }
  };

  // Intro animation
  const IntroAnimation: React.FC = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-purple-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div
            className="mb-8 transform"
            style={{
              animation:
                "flyInLeft 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards",
            }}
          >
            <Shield className="w-20 h-20 text-purple-400 drop-shadow-2xl" />
          </div>

          <div className="flex items-center space-x-4 overflow-hidden">
            <div
              className="transform"
              style={{
                animation:
                  "flyInRight 1.5s 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) both",
              }}
            >
              <span className="text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl">
                Zillion
              </span>
            </div>
            <div
              className="transform"
              style={{
                animation:
                  "flyInRight 1.5s 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) both",
              }}
            >
              <span className="text-8xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">
                ID
              </span>
            </div>
          </div>

          <div
            className="mt-6 transform"
            style={{
              animation: "fadeInUp 1s 1.2s both",
            }}
          >
            <p className="text-2xl text-gray-300 font-light tracking-widest">
              NEXT-GEN SECURITY
            </p>
          </div>

          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 50%)",
              animation: "pulse 3s infinite",
            }}
          />
        </div>

        <style jsx>{`
          @keyframes flyInLeft {
            0% {
              transform: translateX(-200vw) rotate(-360deg) scale(0);
              opacity: 0;
            }
            70% {
              transform: translateX(20px) rotate(10deg) scale(1.1);
              opacity: 1;
            }
            100% {
              transform: translateX(0) rotate(0deg) scale(1);
              opacity: 1;
            }
          }

          @keyframes flyInRight {
            0% {
              transform: translateX(200vw) rotate(360deg) scale(0);
              opacity: 0;
            }
            70% {
              transform: translateX(-20px) rotate(-10deg) scale(1.1);
              opacity: 1;
            }
            100% {
              transform: translateX(0) rotate(0deg) scale(1);
              opacity: 1;
            }
          }

          @keyframes fadeInUp {
            0% {
              transform: translateY(50px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  };

  const ParticleField: React.FC = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );

  const GlowEffect: React.FC = () => {
    const size = 280;
    const x = mousePosition.x - size / 2;
    const y = mousePosition.y - size / 2;
    return (
      <div
        className="fixed pointer-events-none z-10"
        style={{
          transform: `translate3d(${x}px, ${y}px, 0)`,
          width: size,
          height: size,
          background:
            "radial-gradient(circle, rgba(147,51,234,0.12) 0%, transparent 70%)",
          borderRadius: "50%",
          transition: "transform 120ms linear, opacity 200ms",
          opacity: 1,
        }}
      />
    );
  };

  const BlockchainBlock: React.FC<{ index: number; isActive: boolean }> = ({ index, isActive }) => (
    <div className={`relative flex items-center justify-center w-16 h-16 rounded-lg border-2 transition-all duration-500 ${
      isActive 
        ? 'bg-gradient-to-br from-purple-600/30 to-cyan-600/30 border-cyan-400 shadow-lg shadow-cyan-400/30' 
        : 'bg-black/40 border-gray-600'
    }`}>
      <div className="text-xs font-mono text-gray-300">
        #{index}
      </div>
      {index > 1 && (
        <div className={`absolute -left-4 top-1/2 w-4 h-0.5 transition-all duration-500 ${
          isActive ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' : 'bg-gray-600'
        }`} style={{ transform: 'translateY(-50%)' }} />
      )}
    </div>
  );

  const faqData = [
    {
      q: "What problem does ZillionID solve?",
      a: "Centralized national identity systems are a single-point-of-failure and vulnerable to outages and attacks; emerging quantum computers also threaten current crypto (RSA/ECC). ZillionID builds a decentralized, resilient identity layer to avoid those risks.",
    },
    {
      q: "How does the Trust Layer work?",
      a: "Trust Layer uses post-quantum primitives (e.g., Kyber/Dilithium for encryption/signatures), QRNG-supplied nonces, and a consensus trust model where nodes agree on an identity trust score before it is published.",
    },
    {
      q: "What is the expected demo flow (MVP)?",
      a: "Wallet Layer: enroll (biometric → hash → trust score). Backend: API maps biometric hash → trust score, consensus decides Achieved/Broken. Verifier: external portal reads the immutable trust score. Tamper events drop the score to show how consensus reacts.",
    },
    {
      q: "Is ZillionID quantum-resistant?",
      a: "The design targets quantum resistance via PQC and QRNG; QKD hardware is possible in the future for additional protection.",
    },
    {
      q: "How do third-party sites integrate?",
      a: "Sites redirect users to ZillionID for authentication; ZillionID returns an immutable trust score and proofs the verifier can query – acting as an added security layer rather than a standalone app.",
    },
  ];

  const toggleFaq = (i: number) =>
    setFaqOpenIndex(faqOpenIndex === i ? null : i);

  return (
    <>
      {showIntro && <IntroAnimation />}

      <div
        className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden transition-opacity duration-700 ${
          showIntro ? "opacity-0" : "opacity-100"
        }`}
      >
        {!showIntro && <ParticleField />}
        {!showIntro && <GlowEffect />}

        {/* NAVBAR - Fixed positioning */}
        <nav className="fixed w-full top-0 z-50 px-4 py-2 bg-black/20 backdrop-blur-md border-b border-white/5">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-purple-400" />
              <div className="text-sm md:text-base">
                <div className="font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  ZillionID
                </div>
                <div className="text-xs text-gray-400 -mt-1">
                  Quantum-secure auth layer
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8 text-sm">
              <button onClick={() => smoothScrollTo('how')} className="hover:text-purple-400 transition-colors text-gray-200">
                How it works
              </button>
              <button onClick={() => smoothScrollTo('quantum')} className="hover:text-purple-400 transition-colors text-gray-200">
                Quantum Tech
              </button>
              <button onClick={() => smoothScrollTo('apps')} className="hover:text-purple-400 transition-colors text-gray-200">
                Applications
              </button>
              <button onClick={() => smoothScrollTo('faq')} className="hover:text-purple-400 transition-colors text-gray-200">
                FAQ
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigateTo("biometric")}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-purple-500/25"
              >
                Authenticate
              </button>

              <button
                onClick={() => setNavOpen(!navOpen)}
                className="md:hidden p-2 rounded-full bg-black/20 border border-white/10"
                aria-label="menu"
              >
                <Menu className="w-5 h-5 text-gray-200" />
              </button>
            </div>
          </div>

          {navOpen && (
            <div className="md:hidden mt-2 max-w-7xl mx-auto px-4">
              <div className="bg-black/30 backdrop-blur-xl rounded-xl p-4 border border-white/10 flex flex-col space-y-3">
                <button onClick={() => smoothScrollTo('how')} className="py-2 px-3 rounded hover:bg-white/5 text-left">
                  How it works
                </button>
                <button onClick={() => smoothScrollTo('quantum')} className="py-2 px-3 rounded hover:bg-white/5 text-left">
                  Quantum Tech
                </button>
                <button onClick={() => smoothScrollTo('apps')} className="py-2 px-3 rounded hover:bg-white/5 text-left">
                  Applications
                </button>
                <button onClick={() => smoothScrollTo('faq')} className="py-2 px-3 rounded hover:bg-white/5 text-left">
                  FAQ
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* MAIN CONTENT - Proper top padding to account for fixed navbar */}
        <div className="relative z-20 pt-24">
          {/* HERO SECTION - Better spacing and centering */}
          <section className="container mx-auto px-6 py-16">
            <header className="text-center mb-16">
              <div className="flex justify-center items-center mb-8">
                <Shield className="w-16 h-16 mr-4 text-purple-400 animate-pulse" />
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  ZillionID Hub
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide max-w-4xl mx-auto leading-relaxed">
                Next-Generation Identity & Asset Protection – an authentication
                layer websites redirect to for secure verification.
              </p>
              <div className="mt-8 w-40 h-1 bg-gradient-to-r from-purple-400 to-cyan-400 mx-auto rounded-full animate-pulse" />
            </header>

            {/* Services Grid */}
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-20">
              <div
                className="group relative bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 cursor-pointer transition-all duration-500 hover:scale-105 hover:bg-black/30 hover:border-purple-400/30"
                onMouseEnter={() => setHoveredCard("biometric")}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => navigateTo("biometric")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <Scan className="w-12 h-12 text-purple-400 group-hover:text-purple-300 transition-colors" />
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-white group-hover:translate-x-2 transition-all" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Advanced Biometric Analysis
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Multi-factor biometric quality assessment with identity
                    signature verification and real-time analysis.
                  </p>
                  <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Eye className="w-5 h-5 mr-3 text-purple-400" /> Identity
                      Signature Scanning
                    </div>
                    <div className="flex items-center">
                      <Database className="w-5 h-5 mr-3 text-purple-400" />
                      Quality Assessment Engine
                    </div>
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 mr-3 text-purple-400" /> Real-time
                      Processing
                    </div>
                  </div>
                  <div className="mt-6 inline-block px-6 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-full">
                    <span className="text-purple-300 font-medium">
                      Launch Scanner
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="group relative bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 cursor-pointer transition-all duration-500 hover:scale-105 hover:bg-black/30 hover:border-cyan-400/30"
                onMouseEnter={() => setHoveredCard("wallet")}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => navigateTo("wallet")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <Wallet className="w-12 h-12 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-white group-hover:translate-x-2 transition-all" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Quantum Wallet
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Decentralized trust network with quantum-secured identity
                    verification and advanced cryptographic protection protocols.
                  </p>
                  <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Lock className="w-5 h-5 mr-3 text-cyan-400" /> Quantum
                      Encryption
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 mr-3 text-cyan-400" />
                      Decentralized Trust
                    </div>
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 mr-3 text-cyan-400" /> Instant
                      Verification
                    </div>
                  </div>
                  <div className="mt-6 inline-block px-6 py-3 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-400/30 rounded-full">
                    <span className="text-cyan-300 font-medium">
                      Access Wallet
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-24">
              <div className="text-center bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:scale-105 transition-transform">
                <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-3">
                  99.9%
                </div>
                <div className="text-gray-400">Security Accuracy</div>
              </div>
              <div className="text-center bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:scale-105 transition-transform">
                <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-3">
                  &lt;100ms
                </div>
                <div className="text-gray-400">Processing Time</div>
              </div>
              <div className="text-center bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:scale-105 transition-transform">
                <div className="text-3xl md:text-4xl font-bold text-pink-400 mb-3">
                  256-bit
                </div>
                <div className="text-gray-400">Quantum Encryption</div>
              </div>
            </div>
          </section>

          {/* Flow Diagram */}
          <section id="how" className="container mx-auto px-6 py-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent mb-12">
              How ZillionID Works
            </h2>

            <div className="flex flex-col md:flex-row items-center justify-center md:space-x-8 space-y-8 md:space-y-0 max-w-6xl mx-auto">
              <div className="bg-black/30 border border-purple-400/40 backdrop-blur-xl rounded-2xl p-6 w-72 hover:scale-105 transition-transform">
                <Wallet className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">User Wallet</h3>
                <p className="text-sm text-gray-400">
                  Submits biometric & token → local hash + badge
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="hidden md:block w-24 h-1 rounded-full bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400" />
                <div className="p-3 rounded-full bg-gradient-to-r from-purple-600/25 to-cyan-600/25">
                  <ArrowRight className="w-6 h-6 text-cyan-300" />
                </div>
              </div>

              <div className="bg-black/30 border border-cyan-400/40 backdrop-blur-xl rounded-2xl p-6 w-72 hover:scale-105 transition-transform">
                <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Trust Layer</h3>
                <p className="text-sm text-gray-400">
                  PQC + consensus validate the hash & assign trust score
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="hidden md:block w-24 h-1 rounded-full bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400" />
                <div className="p-3 rounded-full bg-gradient-to-r from-cyan-600/25 to-pink-600/25">
                  <ArrowRight className="w-6 h-6 text-pink-300" />
                </div>
              </div>

              <div className="bg-black/30 border border-pink-400/40 backdrop-blur-xl rounded-2xl p-6 w-72 hover:scale-105 transition-transform">
                <Scan className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Verifier</h3>
                <p className="text-sm text-gray-400">
                  Reads immutable trust score & consensus proof
                </p>
              </div>
            </div>

            <p className="mt-8 text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Flow summary: Wallet enrolls (biometric → hash), Trust Layer uses
              PQC & consensus to produce an immutable trust score, Verifier
              reads that score. Works as a plug-in authentication layer for
              websites.
            </p>
          </section>

          {/* REAL QUANTUM TECH STACK - Your Actual Architecture! */}
          <section id="quantum" className="container mx-auto px-6 py-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
                Quantum-Classical Hybrid Architecture
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Real quantum simulation powered by <span className="text-cyan-400 font-bold">Google Cirq</span>, ML tamper detection, and dynamic trust consensus
              </p>
            </div>

            <div className="max-w-7xl mx-auto">
              {/* Entanglement Sharding Visualization */}
              <div className="bg-black/30 backdrop-blur-xl border border-cyan-400/20 rounded-3xl p-8 mb-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl" />
                
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-cyan-400 mb-2 flex items-center justify-center">
                      <Atom className="w-8 h-8 mr-3 animate-spin" />
                      Cirq Entanglement Sharding Engine
                    </h3>
                    <p className="text-gray-400">Live quantum state collapse simulation for consensus</p>
                  </div>

                  {/* Real Quantum Circuit Visualization */}
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-black/50 rounded-xl p-6 border border-cyan-400/30">
                      <h4 className="text-lg font-bold text-cyan-400 mb-4 flex items-center">
                        <Binary className="w-5 h-5 mr-2" />
                        Quantum Circuit State
                      </h4>
                      <div className="font-mono text-sm space-y-2">
                        <div className="text-cyan-300">|ψ⟩ = α|0000⟩ + β|1111⟩</div>
                        <div className="text-gray-400">Entangled 4-qubit consensus state</div>
                        <div className="mt-4 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Agreement Rate:</span>
                            <span className="text-green-400 font-bold">94.7%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Collapse Pattern:</span>
                            <span className="text-cyan-400">|1111⟩</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Tamper Detection:</span>
                            <span className="text-green-400">✓ Clean</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/50 rounded-xl p-6 border border-purple-400/30">
                      <h4 className="text-lg font-bold text-purple-400 mb-4 flex items-center">
                        <Layers className="w-5 h-5 mr-2" />
                        Temporal Lock Status
                      </h4>
                      <div className="space-y-3">
                        {[
                          { node: 'Node-A', status: 'LOCKED', expiry: '14:23:45', color: 'green' },
                          { node: 'Node-B', status: 'ACTIVE', expiry: '14:25:12', color: 'cyan' },
                          { node: 'Node-C', status: 'LOCKED', expiry: '14:24:01', color: 'green' },
                          { node: 'Node-D', status: 'ACTIVE', expiry: '14:26:33', color: 'cyan' }
                        ].map((node, i) => (
                          <div key={i} className="flex justify-between items-center bg-black/30 rounded p-2">
                            <span className="font-mono text-xs">{node.node}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                node.color === 'green' ? 'bg-green-600/20 text-green-400' : 'bg-cyan-600/20 text-cyan-400'
                              }`}>
                                {node.status}
                              </span>
                              <span className="text-xs text-gray-500">{node.expiry}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Live Blockchain Visualization */}
                  <div className="flex justify-center space-x-2 mb-8">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <BlockchainBlock 
                        key={index} 
                        index={index} 
                        isActive={index <= 3} 
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* ML Dual-Layer Verification */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-black/30 backdrop-blur-xl border border-purple-400/20 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-purple-400 mb-6 flex items-center">
                    <Cpu className="w-8 h-8 mr-3" />
                    ML Dual-Layer Verification
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-black/40 rounded-xl p-4 border border-purple-400/30">
                      <h4 className="text-lg font-semibold text-purple-300 mb-2">Layer 1: ID Image Verification</h4>
                      <p className="text-gray-400 text-sm">Neural network validates document authenticity, detects deepfakes and forgeries</p>
                      <div className="mt-3 flex justify-between text-xs">
                        <span className="text-gray-500">Accuracy:</span>
                        <span className="text-green-400 font-bold">98.7%</span>
                      </div>
                    </div>
                    <div className="bg-black/40 rounded-xl p-4 border border-cyan-400/30">
                      <h4 className="text-lg font-semibold text-cyan-300 mb-2">Layer 2: Metadata Analysis</h4>
                      <p className="text-gray-400 text-sm">Scrapes and verifies embedded metadata to confirm no tampering occurred</p>
                      <div className="mt-3 flex justify-between text-xs">
                        <span className="text-gray-500">Detection Rate:</span>
                        <span className="text-green-400 font-bold">99.2%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
                    <Network className="w-8 h-8 mr-3" />
                    Dynamic Trust Engine
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {[
                        { label: 'Agreement Rate', value: 94.7, color: 'cyan' },
                        { label: 'Biometric Fidelity', value: 87.3, color: 'purple' },
                        { label: 'Witness Score', value: 91.8, color: 'pink' },
                        { label: 'Entropy Factor', value: 96.1, color: 'green' }
                      ].map((metric, i) => (
                        <div key={i} className="bg-black/40 rounded p-3">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-400 text-sm">{metric.label}</span>
                            <span className={`font-bold text-${metric.color}-400`}>{metric.value}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`bg-gradient-to-r from-${metric.color}-400 to-${metric.color}-600 h-2 rounded-full transition-all duration-1000`}
                              style={{ width: `${metric.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Architecture Stack */}
              <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-center text-white mb-8">Complete System Architecture</h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="bg-purple-600/20 rounded-xl p-4 mb-4 border border-purple-400/30">
                      <Scan className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <h4 className="font-semibold text-purple-300">Biometric Layer</h4>
                      <p className="text-xs text-gray-400 mt-2">Image → Hash → Quantum Features</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-cyan-600/20 rounded-xl p-4 mb-4 border border-cyan-400/30">
                      <Atom className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                      <h4 className="font-semibold text-cyan-300">Cirq Simulation</h4>
                      <p className="text-xs text-gray-400 mt-2">Entanglement Sharding + Consensus</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-pink-600/20 rounded-xl p-4 mb-4 border border-pink-400/30">
                      <Database className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                      <h4 className="font-semibold text-pink-300">Trust Engine</h4>
                      <p className="text-xs text-gray-400 mt-2">Dynamic Scoring + Entropy</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-600/20 rounded-xl p-4 mb-4 border border-green-400/30">
                      <Globe className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <h4 className="font-semibold text-green-300">Verifier Portal</h4>
                      <p className="text-xs text-gray-400 mt-2">External Trust Validation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Applications Section */}
          <section id="apps" className="container mx-auto px-6 py-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent mb-8">
                Real-World Applications
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                ZillionID serves as a quantum-secure authentication layer that websites and services can redirect to for verified identity checks
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
              <div className="bg-black/30 backdrop-blur-xl border border-purple-400/20 rounded-2xl p-8 hover:scale-105 transition-transform">
                <div className="w-16 h-16 bg-purple-600/20 rounded-xl flex items-center justify-center mb-6">
                  <Lock className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-purple-300 mb-4">Financial Services</h3>
                <p className="text-gray-400 mb-4">Banks and fintech companies integrate ZillionID for quantum-resistant KYC and fraud prevention</p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Digital banking authentication</li>
                  <li>• High-value transaction verification</li>
                  <li>• Regulatory compliance (KYC/AML)</li>
                </ul>
              </div>

              <div className="bg-black/30 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-8 hover:scale-105 transition-transform">
                <div className="w-16 h-16 bg-cyan-600/20 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-cyan-300 mb-4">Government & Public Services</h3>
                <p className="text-gray-400 mb-4">Digital identity verification for citizen services and secure document access</p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Digital passport verification</li>
                  <li>• Healthcare record access</li>
                  <li>• Voting system authentication</li>
                </ul>
              </div>

              <div className="bg-black/30 backdrop-blur-xl border border-pink-400/20 rounded-2xl p-8 hover:scale-105 transition-transform">
                <div className="w-16 h-16 bg-pink-600/20 rounded-xl flex items-center justify-center mb-6">
                  <Globe className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-pink-300 mb-4">Enterprise Security</h3>
                <p className="text-gray-400 mb-4">Corporate identity management and secure access control for sensitive systems</p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Employee access management</li>
                  <li>• Secure document sharing</li>
                  <li>• Zero-trust architecture</li>
                </ul>
              </div>
            </div>

            {/* Integration Flow */}
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-5xl mx-auto">
              <h3 className="text-2xl font-bold text-center text-white mb-8">Simple Integration Process</h3>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-400">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Redirect User</h4>
                  <p className="text-gray-400 text-sm">Your app redirects users to ZillionID authentication endpoint</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-cyan-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-cyan-400">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">Quantum Verification</h4>
                  <p className="text-gray-400 text-sm">ZillionID performs biometric analysis and quantum consensus</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-pink-400">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Return Trust Score</h4>
                  <p className="text-gray-400 text-sm">Receive immutable trust score and consensus proof for your decision making</p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="container mx-auto px-6 py-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Everything you need to know about our quantum-secure identity system
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {faqData.map((faq, i) => (
                <div key={i} className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <span className="font-semibold text-left text-lg">{faq.q}</span>
                    <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${
                      faqOpenIndex === i ? 'rotate-180' : ''
                    }`} />
                  </button>
                  {faqOpenIndex === i && (
                    <div className="px-8 pb-6 border-t border-white/10">
                      <p className="text-gray-400 leading-relaxed pt-4">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="container mx-auto px-6 py-16 text-center border-t border-white/10">
            <div className="flex justify-center items-center mb-8">
              <Shield className="w-12 h-12 mr-4 text-purple-400" />
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  ZillionID
                </div>
                <div className="text-gray-400 text-sm">Quantum-Secure Identity Layer</div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
              <div>
                <h4 className="font-semibold mb-4 text-purple-300">Technology Stack</h4>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>Google Cirq Quantum Simulation</li>
                  <li>FastAPI Microservices</li>
                  <li>React + TypeScript Frontend</li>
                  <li>ML Tamper Detection</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-cyan-300">Architecture</h4>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>Entanglement Sharding</li>
                  <li>Temporal Lock System</li>
                  <li>Dynamic Trust Engine</li>
                  <li>Quantum-Classical Hybrid</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-pink-300">Services</h4>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>Trust Calculator API</li>
                  <li>Quantum Oracle Service</li>
                  <li>Biometric Analysis</li>
                  <li>Verifier Portal</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center space-x-6 mb-8">
              <button
                onClick={() => navigateTo("biometric")}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:scale-105 transition-all shadow-lg"
              >
                Try Authentication
              </button>
              <button
                onClick={() => navigateTo("wallet")}
                className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full font-semibold hover:scale-105 transition-all shadow-lg"
              >
                Access Wallet
              </button>
            </div>

            <p className="text-gray-500 text-sm">
              © 2024 ZillionID. Quantum-secured identity verification for the post-quantum era.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default ZillionIDMain;