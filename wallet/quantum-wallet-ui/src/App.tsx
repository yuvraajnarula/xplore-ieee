import { useEffect, useState } from "react";

type TrustEntry = {
  identity_id: string;
  trust_score: number;
};

function App() {
  const [rank, setRank] = useState<TrustEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRank() {
      try {
        const res = await fetch("http://localhost:8001/rank");
        const data = await res.json();
        setRank(data.rank);
      } catch (err) {
        console.error("Failed to fetch trust scores", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRank();
    const interval = setInterval(fetchRank, 5000);
    return () => clearInterval(interval);
  }, []);

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
    loadingContainer: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      gap: "1.5rem",
      zIndex: 1,
    },
    loadingSpinner: {
      width: "50px",
      height: "50px",
      border: "3px solid rgba(138, 43, 226, 0.3)",
      borderTop: "3px solid #8A2BE2",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    loadingText: {
      color: "#B8B3E6",
      fontSize: "1.1rem",
      fontWeight: 300,
    },
    tableContainer: {
      width: "100%",
      maxWidth: "900px",
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(138, 43, 226, 0.1)",
      zIndex: 1,
      position: "relative" as const,
    },
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
    },
    thead: {
      background: "linear-gradient(135deg, rgba(138, 43, 226, 0.3) 0%, rgba(75, 0, 130, 0.3) 100%)",
      backdropFilter: "blur(10px)",
    },
    th: {
      padding: "1.5rem 2rem",
      textAlign: "left" as const,
      fontSize: "0.9rem",
      fontWeight: 600,
      letterSpacing: "0.05em",
      textTransform: "uppercase" as const,
      color: "#E8E3FF",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    },
    tr: {
      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
      transition: "all 0.3s ease",
      cursor: "pointer",
    },
    trHover: {
      background: "rgba(255, 255, 255, 0.05)",
      transform: "scale(1.01)",
    },
    td: {
      padding: "1.5rem 2rem",
      fontSize: "1rem",
      fontWeight: 400,
    },
    identityCell: {
      color: "#FF6B9D",
      fontFamily: "'SF Mono', 'Monaco', 'Cascadia Code', monospace",
      fontWeight: 500,
    },
    scoreCell: {
      color: "#E8E3FF",
      fontSize: "1.1rem",
      fontWeight: 600,
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
    },
    trustedBadge: {
      background: "linear-gradient(135deg, #00FF87 0%, #60EFFF 100%)",
      color: "#0B0B1A",
      animation: "pulse 2s ease-in-out infinite",
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

    .table-row {
      animation: fadeInUp 0.6s ease forwards;
    }

    .table-row:hover {
      background: rgba(255, 255, 255, 0.05) !important;
      transform: translateX(5px) !important;
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
  `;

  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.container}>
        {/* Background orbs */}
        <div style={styles.backgroundOrbs}>
          <div style={styles.orb1}></div>
          <div style={styles.orb2}></div>
          {/* Quantum particles */}
          {Array.from({ length: 15 }).map((_, i) => (
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
          <h1 style={styles.title}>Quantum Wallet</h1>
          <p style={styles.subtitle}>Decentralized Trust Network</p>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Synchronizing quantum trust scores...</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>Identity</th>
                  <th style={styles.th}>Trust Score</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rank.map((entry, index) => (
                  <tr
                    key={entry.identity_id}
                    className="table-row"
                    style={{
                      ...styles.tr,
                      animationDelay: `${index * 0.1}s`,
                      background: hoveredRow === entry.identity_id 
                        ? "rgba(255, 255, 255, 0.05)" 
                        : "transparent",
                      transform: hoveredRow === entry.identity_id 
                        ? "translateX(5px)" 
                        : "translateX(0)",
                    }}
                    onMouseEnter={() => setHoveredRow(entry.identity_id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={{ ...styles.td, ...styles.identityCell }}>
                      {entry.identity_id}
                    </td>
                    <td style={{ ...styles.td, ...styles.scoreCell }}>
                      {entry.trust_score.toFixed(3)}
                    </td>
                    <td style={styles.td}>
                      {entry.trust_score > 0.7 ? (
                        <span
                          style={{
                            ...styles.badge,
                            ...styles.trustedBadge,
                          }}
                        >
                          <span style={{ position: "relative", zIndex: 1 }}>
                            ✦ Trusted
                          </span>
                        </span>
                      ) : (
                        <span
                          style={{
                            ...styles.badge,
                            ...styles.lowTrustBadge,
                          }}
                        >
                          <span style={{ position: "relative", zIndex: 1 }}>
                            ⚠ Low Trust
                          </span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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