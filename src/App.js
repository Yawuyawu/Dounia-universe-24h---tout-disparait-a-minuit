import { useState } from 'react';
import Feed from './Feed';

function App() {
  const [showFeed, setShowFeed] = useState(false);

  const handleStarter = () => setShowFeed(true);
  const handlePro = () => alert("Paiement Selar bientôt disponible. Tu seras notifié.");

  if (showFeed) return <Feed onBack={() => setShowFeed(false)} />;

  const cardStyle = {backgroundColor: "#1a1a1a",border: "1px solid #333",borderRadius: "20px",padding: "28px",margin: "20px 0"};
  const proCardStyle = {...cardStyle,border: "2px solid #8B5CF6",background: "linear-gradient(135deg, #1a1a1a 0%, #2d1b69 100%)"};
  const buttonStyle = {width: "100%",padding: "14px",borderRadius: "12px",border: "none",fontWeight: "bold",fontSize: "16px",cursor: "pointer",marginTop: "16px"};

  return (
    <div style={{backgroundColor: "#000",color: "#fff",minHeight: "100vh",padding: "24px",fontFamily: "system-ui, -apple-system, Arial"}}>
      <div style={{ maxWidth: "420px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "32px", margin: "0 0 8px 0" }}>Dounia Universe</h1>
          <p style={{ color: "#888", fontSize: "16px", lineHeight: "1.5" }}>
            Le feed de Facebook + la tech d'Instagram<br/>
            La sécurité de Snap + l'algo de TikTok
          </p>
        </div>

        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <h2 style={{ margin: "0 0 4px 0", fontSize: "24px" }}>Starter</h2>
              <div style={{ color: "#10B981", fontWeight: "bold" }}>GRATUIT</div>
            </div>
            <div style={{ fontSize: "36px", fontWeight: "bold" }}>0F</div>
          </div>
          <div style={{ margin: "20px 0", lineHeight: "2", color: "#ccc" }}>
            <div>✓ Feed social illimité</div>
            <div>✓ Stories 24h chiffrées</div>
            <div>✓ 5 messages IA/jour</div>
            <div>✓ Avec publicités</div>
          </div>
          <button onClick={handleStarter} style={{...buttonStyle, backgroundColor: "#333", color: "#fff"}}>
            Commencer gratuitement
          </button>
        </div>

        <div style={proCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <h2 style={{ margin: "0 0 4px 0", fontSize: "24px" }}>Pro</h2>
              <div style={{backgroundColor: "#8B5CF6",padding: "2px 8px",borderRadius: "6px",fontSize: "12px",display: "inline-block"}}>POPULAIRE</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "36px", fontWeight: "bold" }}>3210F</div>
              <div style={{ color: "#888", fontSize: "14px" }}>≈ 5€/mois</div>
            </div>
          </div>
          <div style={{ margin: "20px 0", lineHeight: "2", color: "#ccc" }}>
            <div>✓ Feed + Algo TikTok boosté</div>
            <div>✓ Messages IA illimités</div>
            <div>✓ Zéro pub, zéro tracking</div>
            <div>✓ Stories HD + Analytics</div>
            <div>✓ Badge Pro vérifié</div>
          </div>
          <button onClick={handlePro} style={{...buttonStyle, backgroundColor: "#8B5CF6", color: "#fff"}}>
            Passer Pro
          </button>
        </div>

        <p style={{ textAlign: "center", color: "#555", fontSize: "12px", marginTop: "30px" }}>
          Version Beta • Paiement bientôt activé
        </p>
      </div>
    </div>
  );
}

export default App;
