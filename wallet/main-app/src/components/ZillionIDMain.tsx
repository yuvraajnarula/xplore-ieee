import React, { useState, useEffect } from 'react';
import { Shield, Scan, Wallet, ArrowRight, Zap, Lock, Eye, Database } from 'lucide-react';

interface MousePosition {
  x: number;
  y: number;
}

const ZillionIDMain: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Hide intro after animation completes
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const navigateTo = (service: string) => {
    if (service === 'biometric') {
      // Open biometric analysis app in new tab
      window.open('http://localhost:3001', '_blank');
    } else if (service === 'wallet') {
      // Open quantum wallet app in new tab
      window.open('http://localhost:3002', '_blank');
    }
  };

  const IntroAnimation: React.FC = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        {/* Animated particles background */}
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

        {/* Flying logo animation */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Shield icon flying in from left */}
          <div 
            className="mb-8 transform"
            style={{
              animation: 'flyInLeft 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
            }}
          >
            <Shield className="w-20 h-20 text-purple-400 drop-shadow-2xl" />
          </div>

          {/* ZillionID text flying in from right with stagger */}
          <div className="flex items-center space-x-4 overflow-hidden">
            <div 
              className="transform"
              style={{
                animation: 'flyInRight 1.5s 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) both',
              }}
            >
              <span className="text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl">
                Zillion
              </span>
            </div>
            <div 
              className="transform"
              style={{
                animation: 'flyInRight 1.5s 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) both',
              }}
            >
              <span className="text-8xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">
                ID
              </span>
            </div>
          </div>

          {/* Subtitle appearing with fade */}
          <div 
            className="mt-6 transform"
            style={{
              animation: 'fadeInUp 1s 1.2s both',
            }}
          >
            <p className="text-2xl text-gray-300 font-light tracking-widest">
              NEXT-GEN SECURITY
            </p>
          </div>

          {/* Glowing effect */}
          <div 
            className="absolute inset-0 -z-10"
            style={{
              background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 50%)',
              animation: 'pulse 3s infinite',
            }}
          />
        </div>

        {/* CSS animations */}
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

  const ParticleField: React.FC = () => {
    return (
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
            }}
          />
        ))}
      </div>
    );
  };

  const GlowEffect: React.FC = () => {
    return (
      <div
        className="fixed pointer-events-none z-10"
        style={{
          left: mousePosition.x - 300,
          top: mousePosition.y - 300,
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
          borderRadius: '50%',
          transition: 'all 0.1s ease-out',
        }}
      />
    );
  };

  return (
    <>
      {showIntro && <IntroAnimation />}
      <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden transition-opacity duration-1000 ${showIntro ? 'opacity-0' : 'opacity-100'}`}>
        <ParticleField />
        <GlowEffect />
        
        <div className="relative z-20 container mx-auto px-6 py-12">
          {/* Header */}
          <header className="text-center mb-16">
            <div className="flex justify-center items-center mb-6">
              <Shield className="w-12 h-12 mr-4 text-purple-400" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                ZillionID Hub
              </h1>
            </div>
            <p className="text-xl text-gray-300 font-light tracking-wide">
              Next-Generation Identity & Asset Protection
            </p>
            <div className="mt-6 w-32 h-1 bg-gradient-to-r from-purple-400 to-cyan-400 mx-auto rounded-full"></div>
          </header>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
            {/* Biometric Analysis Card */}
            <div
              className="group relative bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 cursor-pointer transition-all duration-500 hover:scale-105 hover:bg-black/30"
              onMouseEnter={() => setHoveredCard('biometric')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigateTo('biometric')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <Scan className="w-12 h-12 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-white group-hover:translate-x-2 transition-all" />
                </div>
                
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Advanced Biometric Analysis
                </h3>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Multi-factor biometric quality assessment with advanced identity signature verification and real-time analysis capabilities.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-400">
                    <Eye className="w-4 h-4 mr-3 text-purple-400" />
                    Identity Signature Scanning
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Database className="w-4 h-4 mr-3 text-purple-400" />
                    Quality Assessment Engine
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Zap className="w-4 h-4 mr-3 text-purple-400" />
                    Real-time Processing
                  </div>
                </div>
                
                <div className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-full inline-block">
                  <span className="text-purple-300 font-medium">Launch Scanner</span>
                </div>
              </div>
            </div>

            {/* Quantum Wallet Card */}
            <div
              className="group relative bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 cursor-pointer transition-all duration-500 hover:scale-105 hover:bg-black/30"
              onMouseEnter={() => setHoveredCard('wallet')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigateTo('wallet')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <Wallet className="w-12 h-12 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-white group-hover:translate-x-2 transition-all" />
                </div>
                
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Quantum Wallet
                </h3>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Decentralized trust network with quantum-secured identity verification and advanced cryptographic protection protocols.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-400">
                    <Lock className="w-4 h-4 mr-3 text-cyan-400" />
                    Quantum Encryption
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Shield className="w-4 h-4 mr-3 text-cyan-400" />
                    Decentralized Trust
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Zap className="w-4 h-4 mr-3 text-cyan-400" />
                    Instant Verification
                  </div>
                </div>
                
                <div className="mt-6 px-6 py-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-400/30 rounded-full inline-block">
                  <span className="text-cyan-300 font-medium">Access Wallet</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center bg-black/10 backdrop-blur-sm border border-white/5 rounded-xl p-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">99.9%</div>
              <div className="text-gray-400 text-sm">Security Accuracy</div>
            </div>
            <div className="text-center bg-black/10 backdrop-blur-sm border border-white/5 rounded-xl p-6">
              <div className="text-3xl font-bold text-cyan-400 mb-2">&lt;100ms</div>
              <div className="text-gray-400 text-sm">Processing Time</div>
            </div>
            <div className="text-center bg-black/10 backdrop-blur-sm border border-white/5 rounded-xl p-6">
              <div className="text-3xl font-bold text-pink-400 mb-2">256-bit</div>
              <div className="text-gray-400 text-sm">Quantum Encryption</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ZillionIDMain;