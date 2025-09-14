import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000/demos";

// === CSS-in-JS ===
const container: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0B0B1A 0%, #1A0B2E 50%, #2D1B69 100%)",
  color: "#E8E3FF",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "2rem",
  fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
  position: "relative",
  overflow: "hidden",
};

const header: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "2rem",
  position: "relative",
  zIndex: 1,
};

const title: React.CSSProperties = {
  fontSize: "3rem",
  fontWeight: 700,
  background: "linear-gradient(135deg, #8A2BE2 0%, #FF6B9D 50%, #00BFFF 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  marginBottom: "0.5rem",
  letterSpacing: "-0.02em",
  animation: "glow 3s ease-in-out infinite alternate",
};

const subtitle: React.CSSProperties = {
  fontSize: "1.2rem",
  color: "#B8B3E6",
  fontWeight: 300,
  opacity: 0.8,
};

const table: React.CSSProperties = {
  width: "100%",
  maxWidth: "900px",
  borderCollapse: "collapse",
};

const th: React.CSSProperties = {
  padding: "1rem 1.5rem",
  textAlign: "left",
  fontWeight: 600,
  color: "#E8E3FF",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
};

const td: React.CSSProperties = {
  padding: "1rem 1.5rem",
};

const badge: React.CSSProperties = {
  padding: "0.3rem 0.8rem",
  borderRadius: "25px",
  fontWeight: 600,
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  display: "inline-block",
};

const trustedBadge: React.CSSProperties = {
  ...badge,
  background: "linear-gradient(135deg, #00FF87 0%, #60EFFF 100%)",
  color: "#0B0B1A",
};

const lowTrustBadge: React.CSSProperties = {
  ...badge,
  background: "linear-gradient(135deg, #FF6B9D 0%, #FFA500 100%)",
  color: "#0B0B1A",
};

// --- Keyframes ---
const style = `
@keyframes glow {
  0% { text-shadow: 0 0 20px rgba(138,43,226,0.5), 0 0 40px rgba(138,43,226,0.3);}
  100% { text-shadow: 0 0 30px rgba(138,43,226,0.8),0 0 60px rgba(138,43,226,0.4);}
}
@keyframes fadeInUp {
  from {opacity: 0; transform: translateY(30px);}
  to {opacity: 1; transform: translateY(0);}
}
.table-row {
  animation: fadeInUp 0.6s ease forwards;
}
.table-row:hover {
  background: rgba(255, 255, 255, 0.05) !important;
  transform: translateX(5px) !important;
}
`;

// === App Component ===
export default function App() {
  const [bb84, setBb84] = useState<any>(null);
  const [attack, setAttack] = useState<any>(null);
  const [swarm, setSwarm] = useState<any[]>([]);
  const [shards, setShards] = useState<any>(null);

  const fetchDemos = async () => {
    try {
      const bb84Res = await axios.get(`${API_BASE}/bb84-simulator?qubits=16`);
      setBb84(bb84Res.data);

      const attackRes = await axios.get(`${API_BASE}/identity-attack-sim?identity_id=alice`);
      setAttack(attackRes.data);

      const swarmRes = await axios.get(`${API_BASE}/swarm-demo?num_nodes=10`);
      setSwarm(swarmRes.data.swarm);

      const shardRes = await axios.get(`${API_BASE}/shard-status?total_shards=20`);
      setShards(shardRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-refresh every 5s
  useEffect(() => {
    fetchDemos();
    const interval = setInterval(fetchDemos, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={container}>
      <style>{style}</style>
      <div style={header}>
        <h1 style={title}>Quantum Identity Demos</h1>
        <p style={subtitle}>BB84 | Attack Simulation | Swarm Visualization | Shards</p>
      </div>

      {bb84 && (
        <div style={{ marginBottom: "2rem" }}>
          <h3>BB84 QKD Simulator</h3>
          <p>Shared Key: {bb84.shared_key}</p>
          <p>Qubit States: {bb84.qubits.join(", ")}</p>
        </div>
      )}

      {attack && (
        <div style={{ marginBottom: "2rem" }}>
          <h3>Identity Attack Simulation</h3>
          <p>Identity: {attack.identity_id}</p>
          <p>Attack Success Probability: {attack.attack_success_prob.toFixed(2)}</p>
          <p>New Trust Score: {attack.new_trust_score.toFixed(2)}</p>
        </div>
      )}

      {swarm.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h3>Swarm Visualization</h3>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Identity</th>
                <th style={th}>Trust</th>
                <th style={th}>Position</th>
              </tr>
            </thead>
            <tbody>
              {swarm.map((s) => (
                <tr key={s.identity_id} className="table-row">
                  <td style={{ ...td, color: "#FF6B9D" }}>{s.identity_id}</td>
                  <td style={td}>{s.trust_score.toFixed(2)}</td>
                  <td style={td}>
                    ({s.position.x.toFixed(0)}, {s.position.y.toFixed(0)})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {shards && (
        <div style={{ marginBottom: "2rem" }}>
          <h3>Quantum Shard Status</h3>
          <p>
            Locked: {shards.locked}, Unlocked: {shards.unlocked}
          </p>
          <p>Unlocked Indices: {shards.unlocked_indices.join(", ")}</p>
        </div>
      )}
    </div>
  );
}
