import { useState } from "react";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [identity, setIdentity] = useState("");
  const [result, setResult] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [hoveredInput, setHoveredInput] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !identity) return;
    
    setUploading(true);
    
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const fid = hashArray[0] / 255; // crude pseudo-fidelity for demo
      
      const res = await fetch("http://localhost:8001/compute-trust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity_id: identity,
          agreement_rate: 0.95,
          biometric_fidelity: fid,
          witness_score: 0.9,
        }),
      });
      
      setResult(await res.json());
    } catch (error) {
      console.error("Failed to compute trust", error);
    } finally {
      setUploading(false);
    }
  }

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0B0B1A 0%, #1A0B2E 50%, #2D1B69 100%)",
      color: "#E8E3FF",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      padding: "2rem",
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative" as const,
      overflow: "hidden",
      width: '100%'
    },
    backgroundOrbs: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: "none" as const,
      zIndex: 0,
    },
    orb1: {
      position: "absolute" as const,
      top: "10%",
      right: "15%",
      width: "300px",
      height: "300px",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(138, 43, 226, 0.4) 0%, rgba(138, 43, 226, 0.1) 50%, transparent 70%)",
      filter: "blur(60px)",
      animation: "float 8s ease-in-out infinite",
    },
    orb2: {
      position: "absolute" as const,
      bottom: "20%",
      left: "10%",
      width: "250px",
      height: "250px",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(75, 0, 130, 0.3) 0%, rgba(75, 0, 130, 0.1) 50%, transparent 70%)",
      filter: "blur(40px)",
      animation: "float 6s ease-in-out infinite reverse",
    },
    orb3: {
      position: "absolute" as const,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "400px",
      height: "400px",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(255, 107, 157, 0.2) 0%, rgba(255, 107, 157, 0.05) 50%, transparent 70%)",
      filter: "blur(80px)",
      animation: "float 10s ease-in-out infinite",
    },
    header: {
      textAlign: "center" as const,
      marginBottom: "3rem",
      zIndex: 1,
      position: "relative" as const,
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
    },
    formContainer: {
      width: "100%",
      maxWidth: "500px",
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "20px",
      padding: "2.5rem",
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(138, 43, 226, 0.1)",
      zIndex: 1,
      position: "relative" as const,
      marginBottom: "2rem",
    },
    formTitle: {
      fontSize: "1.5rem",
      fontWeight: 600,
      color: "#E8E3FF",
      marginBottom: "2rem",
      textAlign: "center" as const,
      background: "linear-gradient(135deg, #FF6B9D 0%, #8A2BE2 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    inputGroup: {
      marginBottom: "1.5rem",
    },
    label: {
      display: "block",
      fontSize: "0.9rem",
      fontWeight: 500,
      color: "#B8B3E6",
      marginBottom: "0.5rem",
      letterSpacing: "0.02em",
      textTransform: "uppercase" as const,
    },
    input: {
      width: "100%",
      padding: "1rem 1.25rem",
      background: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "12px",
      color: "#E8E3FF",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      outline: "none",
      backdropFilter: "blur(10px)",
      fontFamily: "'SF Mono', 'Monaco', 'Cascadia Code', monospace",
      boxSizing: "border-box" as const,
    },
    inputFocus: {
      borderColor: "rgba(138, 43, 226, 0.5)",
      boxShadow: "0 0 20px rgba(138, 43, 226, 0.3)",
      background: "rgba(255, 255, 255, 0.08)",
    },
    fileInput: {
      width: "100%",
      padding: "1rem 1.25rem",
      background: "rgba(255, 255, 255, 0.05)",
      border: "2px dashed rgba(255, 255, 255, 0.2)",
      borderRadius: "12px",
      color: "#B8B3E6",
      fontSize: "0.95rem",
      transition: "all 0.3s ease",
      outline: "none",
      backdropFilter: "blur(10px)",
      cursor: "pointer",
      boxSizing: "border-box" as const,
    },
    fileInputHover: {
      borderColor: "rgba(255, 107, 157, 0.5)",
      background: "rgba(255, 255, 255, 0.08)",
    },
    button: {
      width: "100%",
      padding: "1.25rem 2rem",
      background: "linear-gradient(135deg, #8A2BE2 0%, #FF6B9D 100%)",
      border: "none",
      borderRadius: "12px",
      color: "#FFFFFF",
      fontSize: "1rem",
      fontWeight: 600,
      letterSpacing: "0.02em",
      textTransform: "uppercase" as const,
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 10px 30px rgba(138, 43, 226, 0.3)",
      position: "relative" as const,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    buttonDisabled: {
      background: "rgba(255, 255, 255, 0.1)",
      cursor: "not-allowed",
      boxShadow: "none",
    },
    loadingSpinner: {
      width: "20px",
      height: "20px",
      border: "2px solid rgba(255, 255, 255, 0.3)",
      borderTop: "2px solid #FFFFFF",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      marginRight: "0.5rem",
    },
    resultContainer: {
      width: "100%",
      maxWidth: "500px",
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "20px",
      padding: "2rem",
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(0, 255, 135, 0.1)",
      zIndex: 1,
      position: "relative" as const,
      animation: "fadeInUp 0.6s ease forwards",
    },
    resultTitle: {
      fontSize: "1.3rem",
      fontWeight: 600,
      color: "#E8E3FF",
      marginBottom: "1.5rem",
      textAlign: "center" as const,
      background: "linear-gradient(135deg, #00FF87 0%, #60EFFF 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    resultItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1rem 0",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    },
    resultLabel: {
      color: "#B8B3E6",
      fontSize: "0.95rem",
      fontWeight: 500,
    },
    resultValue: {
      color: "#E8E3FF",
      fontSize: "1rem",
      fontWeight: 600,
      fontFamily: "'SF Mono', 'Monaco', 'Cascadia Code', monospace",
    },
    trustScore: {
      fontSize: "1.5rem",
      fontWeight: 700,
      background: "linear-gradient(135deg, #00FF87 0%, #60EFFF 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    badge: {
      padding: "0.5rem 1rem",
      borderRadius: "25px",
      fontWeight: 600,
      fontSize: "0.85rem",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
      border: "2px solid transparent",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
      position: "relative" as const,
      overflow: "hidden",
      animation: "pulse 2s ease-in-out infinite",
    },
    trustedBadge: {
      background: "linear-gradient(135deg, #00FF87 0%, #60EFFF 100%)",
      color: "#0B0B1A",
    },
    lowTrustBadge: {
      background: "linear-gradient(135deg, #FF6B9D 0%, #FFA500 100%)",
      color: "#0B0B1A",
    },
  };

  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes glow {
      0% { text-shadow: 0 0 20px rgba(138, 43, 226, 0.5), 0 0 40px rgba(138, 43, 226, 0.3); }
      100% { text-shadow: 0 0 30px rgba(138, 43, 226, 0.8), 0 0 60px rgba(138, 43, 226, 0.4); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 255, 135, 0.3); }
      50% { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 255, 135, 0.5); }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .quantum-particle {
      position: absolute;
      width: 2px;
      height: 2px;
      background: #8A2BE2;
      border-radius: 50%;
      opacity: 0.6;
      animation: quantumMove 10s linear infinite;
    }

    @keyframes quantumMove {
      0% {
        transform: translate(0, 100vh) scale(0);
        opacity: 0;
      }
      10% {
        opacity: 0.6;
      }
      90% {
        opacity: 0.6;
      }
      100% {
        transform: translate(100vw, 0) scale(1);
        opacity: 0;
      }
    }

    .form-input:focus {
      border-color: rgba(138, 43, 226, 0.5) !important;
      box-shadow: 0 0 20px rgba(138, 43, 226, 0.3) !important;
      background: rgba(255, 255, 255, 0.08) !important;
    }

    .file-input:hover {
      border-color: rgba(255, 107, 157, 0.5) !important;
      background: rgba(255, 255, 255, 0.08) !important;
    }

    .upload-button:hover:not(:disabled) {
      transform: translateY(-2px) !important;
      box-shadow: 0 15px 40px rgba(138, 43, 226, 0.4) !important;
    }

    .upload-button:disabled {
      background: rgba(255, 255, 255, 0.1) !important;
      cursor: not-allowed !important;
      box-shadow: none !important;
      transform: none !important;
    }

    .scan-effect {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(138, 43, 226, 0.3), transparent);
      animation: scan 2s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes scan {
      0% { left: -100%; }
      100% { left: 100%; }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.container}>
        {/* Background orbs */}
        <div style={styles.backgroundOrbs}>
          <div style={styles.orb1}></div>
          <div style={styles.orb2}></div>
          <div style={styles.orb3}></div>
          {/* Quantum particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="quantum-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${8 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>Biometric Capture</h1>
          <p style={styles.subtitle}>Quantum Identity Verification</p>
        </div>

        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>Neural Identity Scan</h2>
          
          <div>
            <div style={styles.inputGroup}>
              <div style={styles.label}>Identity Signature</div>
              <input
                type="text"
                placeholder="Enter quantum identity ID"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                className="form-input"
                style={{
                  ...styles.input,
                  ...(hoveredInput === "identity" ? styles.inputFocus : {})
                }}
                onFocus={() => setHoveredInput("identity")}
                onBlur={() => setHoveredInput(null)}
              />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.label}>Biometric Data</div>
              <div style={{ position: "relative" }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="file-input"
                  style={{
                    ...styles.fileInput,
                    ...(hoveredInput === "file" ? styles.fileInputHover : {})
                  }}
                  onMouseEnter={() => setHoveredInput("file")}
                  onMouseLeave={() => setHoveredInput(null)}
                />
                {uploading && (
                  <div className="scan-effect"></div>
                )}
              </div>
              {file && (
                <p style={{ 
                  marginTop: "0.5rem", 
                  fontSize: "0.85rem", 
                  color: "#00FF87",
                  fontWeight: 500
                }}>
                  ✓ {file.name} loaded
                </p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!file || !identity || uploading}
              className="upload-button"
              style={{
                ...styles.button,
                ...((!file || !identity || uploading) ? styles.buttonDisabled : {})
              }}
            >
              {uploading ? (
                <>
                  <div style={styles.loadingSpinner}></div>
                  Quantum Processing...
                </>
              ) : (
                "◈ Initialize Trust Computation"
              )}
            </button>
          </div>
        </div>

        {result && (
          <div style={styles.resultContainer}>
            <h3 style={styles.resultTitle}>✦ Quantum Analysis Complete</h3>
            
            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Identity Verified</span>
              <span style={styles.resultValue}>{result.identity_id}</span>
            </div>
            
            <div style={{
              ...styles.resultItem, 
              borderBottom: "none", 
              justifyContent: "center", 
              flexDirection: "column", 
              gap: "1rem", 
              paddingTop: "1.5rem"
            }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                width: "100%" 
              }}>
                <span style={styles.resultLabel}>Quantum Trust Score</span>
                <span style={styles.trustScore}>{result.trust_score.toFixed(3)}</span>
              </div>
              
              <div style={{ textAlign: "center" }}>
                {result.trust_score > 0.7 ? (
                  <span style={{...styles.badge, ...styles.trustedBadge}}>
                    <span style={{ position: "relative", zIndex: 1 }}>
                      ✦ Quantum Verified
                    </span>
                  </span>
                ) : (
                  <span style={{...styles.badge, ...styles.lowTrustBadge}}>
                    <span style={{ position: "relative", zIndex: 1 }}>
                      ⚠ Trust Threshold Not Met
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quantum grid overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "200px",
            background: `
              linear-gradient(90deg, transparent 0%, rgba(138, 43, 226, 0.1) 50%, transparent 100%),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 20px,
                rgba(138, 43, 226, 0.05) 21px,
                rgba(138, 43, 226, 0.05) 21px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 20px,
                rgba(138, 43, 226, 0.05) 21px,
                rgba(138, 43, 226, 0.05) 21px
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