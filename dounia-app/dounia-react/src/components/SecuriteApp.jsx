import {useState} from 'react'

export default function SecuriteApp() {
  const [snapView, setSnapView] = useState(null)
  const snaps = Array.from({length: 6}, (_,i) => ({id: i+1, user: `User${i+1}`, time: `${i+1}h`}))
  
  return (
    <div style={{padding: '10px'}}>
      <div style={{background: '#1a1a1a', padding: '15px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center'}}>
        <div style={{fontSize: '48px'}}>👻</div>
        <div style={{fontWeight: 'bold'}}>Snap Dounia</div>
        <div style={{fontSize: '12px', color: '#aaa'}}>Disparaît dans 24h</div>
      </div>
      
      {snapView && (
        <div onClick={() => setSnapView(null)} style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: '80px'}}>📸</div>
            <div>Snap de {snapView.user}</div>
            <div style={{fontSize: '12px', color: '#666', marginTop: '20px'}}>Tape pour fermer</div>
          </div>
        </div>
      )}
      
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
        {snaps.map(s => (
          <div key={s.id} onClick={() => setSnapView(s)} style={{aspectRatio: '9/16', background: '#222', borderRadius: '8px', position: 'relative', cursor: 'pointer'}}>
            <div style={{position: 'absolute', bottom: '8px', left: '8px', fontSize: '12px', background: '#000a', padding: '4px 8px', borderRadius: '4px'}}>
              {s.user} • {s.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
