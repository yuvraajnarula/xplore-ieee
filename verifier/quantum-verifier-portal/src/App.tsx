import { useState } from "react";

type TrustResponse = {
  identity_id: string;
  trust_score: number;
  updated_at: number;
};

function App() {
  const [identity, setIdentity] = useState("");
  const [data, setData] = useState<TrustResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  async function lookup() {
    if (!identity.trim()) return;
    
    setError(null);
    setData(null);
    setIsVerifying(true);
    
    try {
      const res = await fetch(`http://localhost:8001/trust/${identity}`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const d = await res.json();
      setData(d);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVerifying(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      lookup();
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0B0B1A 0%, #1A0B2E 50%, #2D1B69 100%)",
      color: "#E8E3FF",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative" as const,
      overflow: "hidden",
    },
    backgroundPattern: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        radial-gradient(circle at 20% 30%, rgba(138, 43, 226, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(75, 0, 130, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(255, 107, 157, 0.05) 0%, transparent 50%)
      `,
      zIndex: 0,
    },
    scanlines: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(138, 43, 226, 0.03) 3px,
        rgba(138, 43, 226, 0.03) 3px
      )`,
      pointerEvents: "none" as const,
      zIndex: 1,
    },
    mainContent: {
      zIndex: 2,
      position: "relative" as const,
      width: "100%",
      maxWidth: "600px",
      textAlign: "center" as const,
    },
    header: {
      marginBottom: "3rem",
    },
    title: {
      fontSize: "3.5rem",
      fontWeight: 700,
      background: "linear-gradient(135deg, #8A2BE2 0%, #FF6B9D 50%, #00BFFF 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "0.5rem",
      letterSpacing: "-0.02em",
      animation: "glow 3s ease-in-out infinite alternate",
    },
    subtitle: {
      fontSize: "1.2rem",
      color: "#B8B3E6",
      fontWeight: 300,
      opacity: 0.8,
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
    },
    verificationPanel: {
      background: "rgba(255, 255, 255, 0.08)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      borderRadius: "24px",
      padding: "2.5rem",
      boxShadow: `
        0 25px 50px rgba(0, 0, 0, 0.5),
        0 0 100px rgba(138, 43, 226, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1)
      `,
      marginBottom: "2rem",
    },
    inputContainer: {
      display: "flex",
      gap: "1rem",
      marginBottom: "2rem",
      flexWrap: "wrap" as const,
      justifyContent: "center",
    },
    input: {
      flex: "1",
      minWidth: "250px",
      padding: "1rem 1.5rem",
      fontSize: "1rem",
      background: inputFocused 
        ? "rgba(255, 255, 255, 0.1)" 
        : "rgba(255, 255, 255, 0.05)",
      border: inputFocused 
        ? "2px solid rgba(138, 43, 226, 0.6)" 
        : "2px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "16px",
      color: "#E8E3FF",
      outline: "none",
      transition: "all 0.3s ease",
      backdropFilter: "blur(10px)",
      fontFamily: "'SF Mono', 'Monaco', 'Cascadia Code', monospace",
    },
    button: {
      padding: "1rem 2.5rem",
      fontSize: "1rem",
      fontWeight: 600,
      background: isVerifying 
        ? "linear-gradient(135deg, #666 0%, #888 100%)"
        : "linear-gradient(135deg, #8A2BE2 0%, #FF6B9D 100%)",
      color: "#fff",
      border: "none",
      borderRadius: "16px",
      cursor: isVerifying ? "not-allowed" : "pointer",
      transition: "all 0.3s ease",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
      boxShadow: isVerifying 
        ? "0 8px 25px rgba(0, 0, 0, 0.3)"
        : "0 8px 25px rgba(138, 43, 226, 0.4), 0 0 30px rgba(138, 43, 226, 0.2)",
      transform: isVerifying ? "scale(0.98)" : "scale(1)",
      minWidth: "140px",
    },
    errorContainer: {
      background: "rgba(255, 107, 157, 0.1)",
      border: "1px solid rgba(255, 107, 157, 0.3)",
      borderRadius: "16px",
      padding: "1rem 1.5rem",
      marginTop: "1rem",
      backdropFilter: "blur(10px)",
      animation: "shake 0.5s ease-in-out",
    },
    errorText: {
      color: "#FF6B9D",
      fontSize: "0.95rem",
      fontWeight: 500,
    },
    resultCard: {
      background: "rgba(255, 255, 255, 0.08)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      borderRadius: "24px",
      padding: "2.5rem",
      boxShadow: `
        0 25px 50px rgba(0, 0, 0, 0.5),
        0 0 100px rgba(138, 43, 226, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1)
      `,
      animation: "slideUp 0.6s ease-out",
      minWidth: "400px",
    },
    resultHeader: {
      fontSize: "1.5rem",
      fontWeight: 700,
      color: "#FF6B9D",
      marginBottom: "1.5rem",
      fontFamily: "'SF Mono', 'Monaco', 'Cascadia Code', monospace",
      wordBreak: "break-all" as const,
    },
    resultGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "1.5rem",
      marginBottom: "2rem",
    },
    resultItem: {
      background: "rgba(255, 255, 255, 0.05)",
      padding: "1.25rem",
      borderRadius: "12px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
    resultLabel: {
      fontSize: "0.85rem",
      color: "#B8B3E6",
      fontWeight: 600,
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
      marginBottom: "0.5rem",
    },
    resultValue: {
      fontSize: "1.25rem",
      fontWeight: 700,
      color: "#E8E3FF",
    },
    consensusContainer: {
      textAlign: "center" as const,
      padding: "1.5rem",
      borderRadius: "16px",
      background: "rgba(255, 255, 255, 0.03)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
    consensusLabel: {
      fontSize: "0.9rem",
      color: "#B8B3E6",
      fontWeight: 600,
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
      marginBottom: "1rem",
    },
    validBadge: {
      padding: "0.75rem 2rem",
      background: "linear-gradient(135deg, #00FF87 0%, #60EFFF 100%)",
      color: "#0B0B1A",
      borderRadius: "25px",
      fontWeight: 700,
      fontSize: "1.1rem",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
      boxShadow: "0 8px 25px rgba(0, 255, 135, 0.3), 0 0 40px rgba(0, 255, 135, 0.2)",
      animation: "pulse 2s ease-in-out infinite",
      display: "inline-block",
    },
    weakBadge: {
      padding: "0.75rem 2rem",
      background: "linear-gradient(135deg, #FF6B9D 0%, #FFA500 100%)",
      color: "#0B0B1A",
      borderRadius: "25px",
      fontWeight: 700,
      fontSize: "1.1rem",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
      boxShadow: "0 8px 25px rgba(255, 107, 157, 0.3), 0 0 40px rgba(255, 107, 157, 0.2)",
      display: "inline-block",
    },
    loadingSpinner: {
      width: "24px",
      height: "24px",
      border: "3px solid rgba(255, 255, 255, 0.3)",
      borderTop: "3px solid #fff",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      display: "inline-block",
      marginRight: "0.5rem",
    },
  };

  const keyframes = `
    @keyframes glow {
      0% { text-shadow: 0 0 20px rgba(138, 43, 226, 0.5), 0 0 40px rgba(138, 43, 226, 0.3); }
      100% { text-shadow: 0 0 30px rgba(138, 43, 226, 0.8), 0 0 60px rgba(138, 43, 226, 0.4); }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0%, 100% { 
        box-shadow: 0 8px 25px rgba(0, 255, 135, 0.3), 0 0 40px rgba(0, 255, 135, 0.2);
        transform: scale(1);
      }
      50% { 
        box-shadow: 0 8px 30px rgba(0, 255, 135, 0.5), 0 0 60px rgba(0, 255, 135, 0.3);
        transform: scale(1.02);
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    @keyframes quantumRipple {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      100% {
        transform: scale(4);
        opacity: 0;
      }
    }

    .input-focused {
      box-shadow: 0 0 30px rgba(138, 43, 226, 0.4) !important;
      transform: scale(1.02) !important;
    }

    .button-hover:hover:not(:disabled) {
      transform: scale(1.05) !important;
      box-shadow: 0 12px 35px rgba(138, 43, 226, 0.6), 0 0 50px rgba(138, 43, 226, 0.3) !important;
    }

    .quantum-scan {
      position: relative;
      overflow: hidden;
    }

    .quantum-scan::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(138, 43, 226, 0.2), transparent);
      animation: scan 2s ease-in-out infinite;
    }

    @keyframes scan {
      0% { left: -100%; }
      100% { left: 100%; }
    }

    .floating-particles {
      position: absolute;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    .particle {
      position: absolute;
      width: 3px;
      height: 3px;
      background: #8A2BE2;
      border-radius: 50%;
      opacity: 0.4;
      animation: float 8s linear infinite;
    }

    @keyframes float {
      0% {
        transform: translateY(100vh) scale(0);
        opacity: 0;
      }
      10% { opacity: 0.4; }
      90% { opacity: 0.4; }
      100% {
        transform: translateY(-100vh) scale(1);
        opacity: 0;
      }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.container}>
        {/* Background effects */}
        <div style={styles.backgroundPattern} />
        <div style={styles.scanlines} />
        
        {/* Floating particles */}
        <div className="floating-particles">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${6 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div style={styles.mainContent}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>Quantum Verifier</h1>
            <p style={styles.subtitle}>Trust Consensus Portal</p>
          </div>

          {/* Verification Panel */}
          <div style={styles.verificationPanel} className="quantum-scan">
            <div style={styles.inputContainer}>
              <input
                type="text"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onKeyPress={handleKeyPress}
                placeholder="Enter quantum identity hash..."
                style={styles.input}
                className={inputFocused ? "input-focused" : ""}
                disabled={isVerifying}
              />
              <button
                onClick={lookup}
                disabled={isVerifying || !identity.trim()}
                style={styles.button}
                className="button-hover"
              >
                {isVerifying ? (
                  <>
                    <span style={styles.loadingSpinner} />
                    Verifying
                  </>
                ) : (
                  "⚡ Verify"
                )}
              </button>
            </div>

            {error && (
              <div style={styles.errorContainer}>
                <p style={styles.errorText}>⚠ {error}</p>
              </div>
            )}
          </div>

          {/* Results */}
          {data && (
            <div style={styles.resultCard}>
              <h2 style={styles.resultHeader}>{data.identity_id}</h2>
              
              <div style={styles.resultGrid}>
                <div style={styles.resultItem}>
                  <div style={styles.resultLabel}>Trust Score</div>
                  <div style={styles.resultValue}>{data.trust_score.toFixed(3)}</div>
                </div>
                
                <div style={styles.resultItem}>
                  <div style={styles.resultLabel}>Last Updated</div>
                  <div style={styles.resultValue}>
                    {new Date(data.updated_at * 1000).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div style={styles.consensusContainer}>
                <div style={styles.consensusLabel}>Consensus State</div>
                {data.trust_score > 0.7 ? (
                  <div style={styles.validBadge}>
                    ✦ Quantum Valid
                  </div>
                ) : (
                  <div style={styles.weakBadge}>
                    ⚠ Weak Consensus
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom quantum grid */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "150px",
            background: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 25px,
                rgba(138, 43, 226, 0.05) 26px,
                rgba(138, 43, 226, 0.05) 26px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 25px,
                rgba(138, 43, 226, 0.05) 26px,
                rgba(138, 43, 226, 0.05) 26px
              )
            `,
            opacity: 0.3,
            zIndex: 0,
          }}
        />
      </div>
    </>
  );
}

export default App;