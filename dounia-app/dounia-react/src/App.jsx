import {useState, useEffect} from 'react'

function use24hStorage(key, initial) {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(key)
    if (!saved) return initial
    const parsed = JSON.parse(saved)
    const now = Date.now()
    const filtered = parsed.filter(item => now - item.created < 86400000) // 24h
    return filtered.length? filtered : initial
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(data))
  }, [key, data])

  return [data, setData]
}

function Face() {
  const [faces, setFaces] = use24hStorage('dounia_faces', [])
  const [name, setName] = useState('')

  const addFace = () => {
    if (!name) return
    setFaces([...faces, {id: Date.now(), name, created: Date.now()}])
    setName('')
  }

  return (<div style={{padding:'20px'}}>
    <div style={{fontSize:'24px', fontWeight:'bold', marginBottom:'10px'}}>📖 Face</div>
    <div style={{fontSize:'12px', color:'#888', marginBottom:'15px'}}>Trombinoscope du jour. Disparaît à minuit.</div>
    <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ton nom aujourd'hui..."
      style={{width:'100%', padding:'12px', borderRadius:'8px', border:'none', background:'#1a1a1a', color:'#fff', marginBottom:'10px'}}/>
    <button onClick={addFace} style={{width:'100%', padding:'12px', borderRadius:'8px', border:'none', background:'#764ba2', color:'#fff', fontWeight:'bold', marginBottom:'20px'}}>
      Ajouter mon Face
    </button>
    <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px'}}>
      {faces.map(f=>(<div key={f.id} style={{background:'#1a1a1a', padding:'15px', borderRadius:'12px', textAlign:'center', border:'1px solid #333'}}>
        <div style={{fontSize:'40px', marginBottom:'5px'}}>😎</div>
        <div style={{fontSize:'12px'}}>{f.name}</div>
      </div>))}
    </div>
    {faces.length===0 && <div style={{textAlign:'center', color:'#666', marginTop:'40px'}}>Personne aujourd'hui. Sois le premier.</div>}
  </div>)
}

function Instant() {
  const [instants, setInstants] = use24hStorage('dounia_instants', [])
  const [caption, setCaption] = useState('')

  const addInstant = () => {
    if (!caption) return
    setInstants([{id:Date.now(), img:`https://picsum.photos/400?${Date.now()}`, caption, created:Date.now()},...instants])
    setCaption('')
  }

  return (<div style={{padding:'10px'}}>
    <div style={{fontSize:'24px', fontWeight:'bold', marginBottom:'5px'}}>⚡ Instant</div>
    <div style={{fontSize:'12px', color:'#888', marginBottom:'15px'}}>Photo du moment. Effacée dans 24h.</div>
    <div style={{background:'#1a1a1a', padding:'15px', borderRadius:'12px', marginBottom:'15px'}}>
      <input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Légende de l'instant..."
        style={{width:'100%', padding:'12px', borderRadius:'8px', border:'none', background:'#000', color:'#fff', marginBottom:'10px'}}/>
      <button onClick={addInstant} style={{width:'100%', padding:'12px', borderRadius:'8px', border:'none', background:'#f09433', color:'#fff', fontWeight:'bold'}}>
        Capturer l'Instant
      </button>
    </div>
    {instants.map(i=>(<div key={i.id} style={{background:'#1a1a1a', marginBottom:'15px', borderRadius:'12px', overflow:'hidden', border:'1px solid #333'}}>
      <img src={i.img} style={{width:'100%', height:'400px', objectFit:'cover'}}/>
      <div style={{padding:'10px', fontSize:'14px'}}>{i.caption}</div>
      <div style={{padding:'0 10px 10px', fontSize:'10px', color:'#666'}}>Expire dans {Math.round(24 - (Date.now()-i.created)/3600000)}h</div>
    </div>))}
  </div>)
}

function Snap() {
  const [snaps, setSnaps] = use24hStorage('dounia_snaps', [])
  const [msg, setMsg] = useState('')

  const sendSnap = () => {
    if(!msg) return
    setSnaps([...snaps, {id:Date.now(), text:msg, created:Date.now()}])
    setMsg('')
  }

  return (<div style={{padding:'20px', textAlign:'center'}}>
    <div style={{fontSize:'60px', marginBottom:'10px'}}>👻</div>
    <div style={{fontSize:'24px', fontWeight:'bold'}}>Snap</div>
    <div style={{fontSize:'12px', color:'#888', marginBottom:'20px'}}>Message fantôme. Disparaît en 24h.</div>
    <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Écris ton snap..."
      style={{width:'100%', padding:'12px', borderRadius:'8px', border:'none', background:'#1a1a1a', color:'#fff', marginBottom:'10px'}}/>
    <button onClick={sendSnap} style={{width:'100%', padding:'12px', borderRadius:'8px', border:'none', background:'#fffc00', color:'#000', fontWeight:'bold', marginBottom:'20px'}}>
      Envoyer Snap
    </button>
    {snaps.map(s=>(<div key={s.id} style={{background:'#333', padding:'15px', borderRadius:'12px', marginBottom:'10px', textAlign:'left'}}>
      <div>{s.text}</div>
      <div style={{fontSize:'10px', color:'#888', marginTop:'5px'}}>Meurt dans {Math.round(24 - (Date.now()-s.created)/3600000)}h</div>
    </div>))}
  </div>)
}

function Tick() {
  const [ticks, setTicks] = use24hStorage('dounia_ticks', [
    {id:1, desc:'Premier tick du jour', created:Date.now()-3600000},
    {id:2, desc:'Le temps passe', created:Date.now()-7200000}
  ])
  const [desc, setDesc] = useState('')
  const [current, setCurrent] = useState(0)

  const addTick = () => {
    if(!desc) return
    setTicks([{id:Date.now(), desc, created:Date.now()},...ticks])
    setDesc('')
    setCurrent(0)
  }

  return (<div style={{height:'calc(100vh - 60px)', overflow:'hidden', position:'relative', background:'#000'}}>
    {ticks.length? ticks.map((t,i)=>(<div key={t.id} style={{height:'100%', display:i===current?'flex':'none', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px', textAlign:'center'}}>
      <div style={{fontSize:'80px', marginBottom:'20px'}}>⏰</div>
      <div style={{fontSize:'24px', fontWeight:'bold', marginBottom:'10px'}}>TICK</div>
      <div style={{fontSize:'18px', marginBottom:'20px'}}>{t.desc}</div>
      <div style={{fontSize:'12px', color:'#888'}}>Expire dans {Math.round(24 - (Date.now()-t.created)/3600000)}h</div>
    </div>)) : <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#666'}}>Aucun Tick aujourd'hui</div>}

    <div style={{position:'absolute', bottom:'80px', left:'15px', right:'15px', background:'#1a1a1a', padding:'15px', borderRadius:'12px'}}>
      <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Ton tick de la seconde..."
        style={{width:'100%', padding:'12px', borderRadius:'8px', border:'none', background:'#000', color:'#fff', marginBottom:'10px'}}/>
      <button onClick={addTick} style={{width:'100%', padding:'12px', borderRadius:'8px', border:'none', background:'#ff0050', color:'#fff', fontWeight:'bold'}}>
        Lancer le Tick
      </button>
    </div>
    <div onClick={()=>setCurrent((current+1)%ticks.length)} style={{position:'absolute', top:0, left:0, right:0, bottom:180}}/>
  </div>)
}

function Cosmos() {
  const [events, setEvents] = use24hStorage('dounia_events', [
    {id:1, name:'Événement du Jour', desc:'Créé aujourd\'hui, mort demain', created:Date.now()}
  ])

  return (<div style={{padding:'20px'}}>
    <div style={{fontSize:'24px', fontWeight:'bold', marginBottom:'5px'}}>🌌 Cosmos</div>
    <div style={{fontSize:'12px', color:'#888', marginBottom:'15px'}}>Events éphémères. 24h pour vivre.</div>
    {events.map(e=>(<div key={e.id} style={{background:'#1a1a1a', padding:'20px', borderRadius:'12px', border:'1px solid #333', marginBottom:'15px'}}>
      <div style={{fontSize:'18px', fontWeight:'bold', marginBottom:'8px'}}>{e.name}</div>
      <div style={{fontSize:'14px', color:'#ccc', marginBottom:'10px'}}>{e.desc}</div>
      <div style={{fontSize:'10px', color:'#666'}}>Disparaît dans {Math.round(24 - (Date.now()-e.created)/3600000)}h</div>
    </div>))}
  </div>)
}

export default function App() {
  const [tab, setTab] = useState('face')

  const tabs = {
    face: <Face/>,
    instant: <Instant/>,
    snap: <Snap/>,
    tick: <Tick/>,
    cosmos: <Cosmos/>
  }

  return (
    <div style={{background: '#000', color: '#fff', minHeight: '100vh'}}>
      <div style={{paddingBottom: '60px'}}>{tabs[tab]}</div>
      <div style={{position: 'fixed', bottom: 0, left: 0, right: 0, background: '#111', display: 'flex', borderTop: '1px solid #222', height: '60px', zIndex: 999}}>
        <div onClick={() => setTab('face')} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: tab === 'face'? '#764ba2' : '#666'}}>
          <div style={{fontSize: '22px'}}>📖</div><div style={{fontSize: '10px'}}>Face</div>
        </div>
        <div onClick={() => setTab('instant')} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: tab === 'instant'? '#f09433' : '#666'}}>
          <div style={{fontSize: '22px'}}>⚡</div><div style={{fontSize: '10px'}}>Instant</div>
        </div>
        <div onClick={() => setTab('snap')} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: tab === 'snap'? '#fffc00' : '#666'}}>
          <div style={{fontSize: '22px'}}>👻</div><div style={{fontSize: '10px'}}>Snap</div>
        </div>
        <div onClick={() => setTab('tick')} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: tab === 'tick'? '#ff0050' : '#666'}}>
          <div style={{fontSize: '22px'}}>⏰</div><div style={{fontSize: '10px'}}>Tick</div>
        </div>
        <div onClick={() => setTab('cosmos')} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: tab === 'cosmos'? '#764ba2' : '#666'}}>
          <div style={{fontSize: '22px'}}>🌌</div><div style={{fontSize: '10px'}}>Cosmos</div>
        </div>
      </div>
    </div>
  )
}
