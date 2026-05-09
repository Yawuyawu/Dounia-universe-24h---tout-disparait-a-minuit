export default function UpgradePro({ userPlan, onUpgrade }) {
  if (userPlan === 'pro') return null
  
  return (
    <button 
      className="btn-pro-upgrade" 
      onClick={() => onUpgrade('pro')}
      style={{
        width: '100%', 
        marginTop: '20px', 
        padding: '16px', 
        background: 'linear-gradient(45deg, #f09433, #e6683c)', 
        border: 'none', 
        borderRadius: '8px', 
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: '16px', 
        cursor: 'pointer'
      }}
    >
      👑 Passer Pro - Supprimer les pubs
    </button>
  )
}
