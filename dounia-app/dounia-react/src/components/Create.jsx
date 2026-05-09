import {useState} from 'react'
export default function Create(){
  const [msg, setMsg] = useState('')
  const [snaps, setSnaps] = useState([])
  
  const sendSnap = () => {
    if(!msg) return
    setSnaps([...snaps, {id:Date.now(), text:msg, time:10}])
    setMsg('')
  }
  
  return (<div style={{padding:'20px', textAlign:'center'}}>
    <div style={{fontSize:'60px', marginBottom:'20px'}}>👻</div>
    <div style={{fontSize:'24px', fontWeight:'bold', marginBottom:'10px'}}>Snap Dounia</div>
    <div style={{fontSize:'14px', color:'#aaa', marginBottom:'20px'}}>Messages qui disparaissent en 10s</div>
    
    <div style={{background:'#1a1a1a', padding:'15px', borderRadius:'12px', border:'1px solid #333', marginBottom:'15px'}}>
      <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Écris ton snap..." 
        style={{width:'100%', padding:'12px', borderRadius:'8px', border:'none', background:'#000', color:'#fff', marginBottom:'10px'}}/>
      <button onClick={sendSnap} style={{width:'100%', padding:'12px', borderRadius:'8px', border:'none', background:'#fffc00', color:'#000', fontWeight:'bold'}}>
        📸 Envoyer Snap
      </button>
    </div>
    
    {snaps.map(s=>(<div key={s.id} style={{background:'#ff0000', padding:'15px', borderRadius:'12px', marginBottom:'10px', animation:'fade 10s forwards'}}>
      <div style={{fontSize:'18px'}}>{s.text}</div>
      <div style={{fontSize:'12px', opacity:0.7}}>Disparaît dans {s.time}s...</div>
    </div>))}
    <style>{`@keyframes fade {0%{opacity:1} 90%{opacity:1} 100%{opacity:0}}`}</style>
  </div>)
}
