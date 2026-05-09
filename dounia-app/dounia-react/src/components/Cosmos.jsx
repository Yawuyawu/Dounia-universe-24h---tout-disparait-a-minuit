import {useState, useEffect, useRef} from 'react'

export default function Cosmos() {
  const [events, setEvents] = useState([])
  const [showNew, setShowNew] = useState(false)
  const [activeEvent, setActiveEvent] = useState(null)
  const [newEvent, setNewEvent] = useState({titre: '', date: '', lieu: '', desc: '', photo: null})
  const [chatTxt, setChatTxt] = useState('')
  const [notifs, setNotifs] = useState([])
  const photoInput = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem('dounia_cosmos')
    const savedNotifs = localStorage.getItem('dounia_notifs')
    if(saved) setEvents(JSON.parse(saved))
    else setEvents([
      {id: 1, titre: 'Manifestation Solaire', date: '15 Mai 2026', lieu: 'Parakou', desc: 'Éclipse totale visible', inscrit: false, participants: 234, photo: null, chat: [{id: 1, user: 'Tech Benin', text: 'Je serai là!', time: '14:30'}]},
      {id: 2, titre: 'Nuit des Étoiles', date: '22 Mai 2026', lieu: 'Natitingou', desc: 'Observation télescope géant', inscrit: true, participants: 89, photo: null, chat: []},
      {id: 3, titre: 'JJ Cosmos Meet', date: '30 Mai 2026', lieu: 'Cotonou', desc: 'Rencontre communauté Dounia Universe', inscrit: false, participants: 156, photo: null, chat: []}
    ])
    if(savedNotifs) setNotifs(JSON.parse(savedNotifs))
  }, [])

  useEffect(() => {
    if(events.length) localStorage.setItem('dounia_cosmos', JSON.stringify(events))
  }, [events])

  useEffect(() => {
    localStorage.setItem('dounia_notifs', JSON.stringify(notifs))
  }, [notifs])

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setNewEvent({...newEvent, photo: ev.target.result})
    reader.readAsDataURL(file)
  }

  const createEvent = () => {
    if(!newEvent.titre.trim()) return
    const event = {id: Date.now(),...newEvent, inscrit: false, participants: 0, chat: []}
    setEvents([event,...events])
    setNewEvent({titre: '', date: '', lieu: '', desc: '', photo: null})
    setShowNew(false)
    addNotif(`Event créé: ${event.titre}`)
  }

  const toggleInscription = (id) => {
    const event = events.find(e => e.id === id)
    const newInscrit =!event.inscrit
    setEvents(events.map(e => e.id === id? {...e, inscrit: newInscrit, participants: newInscrit? e.participants + 1 : e.participants - 1} : e))
    if(newInscrit) addNotif(`${event.titre}: +1 participant`)
  }

  const addNotif = (text) => {
    const n = {id: Date.now(), text, time: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}), read: false}
    setNotifs([n,...notifs].slice(0, 10))
    setTimeout(() => setNotifs(prev => prev.map(nf => nf.id === n.id? {...nf, read: true} : nf)), 3000)
  }

  const sendChat = () => {
    if(!chatTxt.trim() ||!activeEvent) return
    const msg = {id: Date.now(), user: 'ProPulseur IA', text: chatTxt, time: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
    setEvents(events.map(e => e.id === activeEvent.id? {...e, chat: [...e.chat, msg]} : e))
    setActiveEvent({...activeEvent, chat: [...activeEvent.chat, msg]})
    setChatTxt('')
  }

  const openMap = (lieu) => {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(lieu + ', Bénin')}`, '_blank')
  }

  if(activeEvent) {
    return (
      <div style={{display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)'}}>
        <div style={{padding: '15px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: '10px'}}>
          <span onClick={() => setActiveEvent(null)} style={{cursor: 'pointer', fontSize: '20px'}}>←</span>
          <div style={{flex: 1}}>
            <div style={{fontWeight: 'bold'}}>{activeEvent.titre}</div>
            <div style={{fontSize: '12px', color: '#aaa'}}>{activeEvent.participants} participants</div>
          </div>
          <button onClick={() => openMap(activeEvent.lieu)} style={{padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#764ba2', color: '#fff', fontSize: '12px'}}>🗺️ Map</button>
        </div>

        {activeEvent.photo && (
          <img src={activeEvent.photo} style={{width: '100%', maxHeight: '200px', objectFit: 'cover'}} />
        )}

        <div style={{padding: '10px', borderBottom: '1px solid #222', fontSize: '13px'}}>
          📅 {activeEvent.date} • 📍 {activeEvent.lieu}<br/>{activeEvent.desc}
        </div>

        <div style={{flex: 1, padding: '10px', overflowY: 'auto'}}>
          {activeEvent.chat.map(m => (
            <div key={m.id} style={{marginBottom: '12px'}}>
              <div style={{fontSize: '11px', color: '#764ba2', fontWeight: 'bold'}}>{m.user}</div>
              <div style={{background: '#1a1a1a', padding: '8px 12px', borderRadius: '8px', display: 'inline-block', marginTop: '4px'}}>
                <div>{m.text}</div>
                <div style={{fontSize: '10px', color: '#666', marginTop: '4px'}}>{m.time}</div>
              </div>
            </div>
          ))}
          {activeEvent.chat.length === 0 && <div style={{textAlign: 'center', color: '#666', padding: '40px'}}>Aucun message. Lance la discussion!</div>}
        </div>

        <div style={{display: 'flex', padding: '10px', borderTop: '1px solid #222', gap: '10px'}}>
          <input value={chatTxt} onChange={e => setChatTxt(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendChat()} placeholder='Message...' style={{flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #333', background: '#111', color: '#fff'}} />
          <button onClick={sendChat} style={{padding: '10px 20px', borderRadius: '20px', border: 'none', background: '#764ba2', color: '#fff'}}>Envoyer</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{padding: '10px', paddingBottom: '70px'}}>
      <div style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', borderRadius: '12px', marginBottom: '15px', textAlign: 'center', position: 'relative'}}>
        <div style={{fontSize: '40px', marginBottom: '8px'}}>🌌</div>
        <div style={{fontWeight: 'bold', fontSize: '18px'}}>Manifestations Cosmos</div>
        <div style={{fontSize: '12px', opacity: 0.8}}>Événements Univers Dounia</div>
        {notifs.filter(n =>!n.read).length > 0 && (
          <div style={{position: 'absolute', top: '10px', right: '10px', background: '#f00', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold'}}>
            {notifs.filter(n =>!n.read).length}
          </div>
        )}
      </div>

      {notifs.slice(0, 3).map(n => (
        <div key={n.id} style={{background: n.read? '#1a1a1a' : '#764ba2', padding: '8px 12px', borderRadius: '8px', marginBottom: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between'}}>
          <span>{n.text}</span>
          <span style={{color: '#aaa'}}>{n.time}</span>
        </div>
      ))}

      <input type='file' ref={photoInput} onChange={handlePhoto} accept='image/*' style={{display: 'none'}} />
      <div onClick={() => setShowNew(true)} style={{position: 'fixed', bottom: '70px', right: '20px', width: '56px', height: '56px', borderRadius: '50%', background: '#764ba2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', cursor: 'pointer', zIndex: 50}}> + </div>

      {showNew && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000e', zIndex: 100, padding: '20px', overflowY: 'auto'}}>
          <div style={{background: '#1a1a1a', padding: '15px', borderRadius: '8px'}}>
            <div style={{fontWeight: 'bold', marginBottom: '10px'}}>Nouvelle Manifestation</div>
            {newEvent.photo && <img src={newEvent.photo} style={{width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px'}} />}
            <button onClick={() => photoInput.current?.click()} style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px dashed #666', background: '#111', color: '#aaa', marginBottom: '8px'}}>📷 Ajouter photo</button>
            <input value={newEvent.titre} onChange={e => setNewEvent({...newEvent, titre: e.target.value})} placeholder='Titre événement' style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#111', color: '#fff', marginBottom: '8px'}} />
            <input value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} placeholder='Date: 15 Mai 2026' style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#111', color: '#fff', marginBottom: '8px'}} />
            <input value={newEvent.lieu} onChange={e => setNewEvent({...newEvent, lieu: e.target.value})} placeholder='Lieu: Parakou' style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#111', color: '#fff', marginBottom: '8px'}} />
            <textarea value={newEvent.desc} onChange={e => setNewEvent({...newEvent, desc: e.target.value})} placeholder='Description' style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#111', color: '#fff', marginBottom: '10px', height: '60px'}} />
            <div style={{display: 'flex', gap: '10px'}}>
              <button onClick={() => setShowNew(false)} style={{flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#333', color: '#fff'}}>Annuler</button>
              <button onClick={createEvent} style={{flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#764ba2', color: '#fff', fontWeight: 'bold'}}>Créer</button>
            </div>
          </div>
        </div>
      )}

      {events.map(event => (
        <div key={event.id} style={{background: '#1a1a1a', borderRadius: '12px', marginBottom: '12px', border: '1px solid #333', overflow: 'hidden'}}>
          {event.photo && <img src={event.photo} style={{width: '100%', height: '150px', objectFit: 'cover'}} />}
          <div style={{padding: '15px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
              <div style={{fontWeight: 'bold', fontSize: '16px'}}>{event.titre}</div>
              <div style={{fontSize: '12px', color: '#764ba2'}}>🌌</div>
            </div>
            <div style={{fontSize: '13px', color: '#aaa', marginBottom: '8px'}}>📅 {event.date} • 📍 {event.lieu}</div>
            <div style={{fontSize: '14px', marginBottom: '12px'}}>{event.desc}</div>
            <div style={{display: 'flex', gap: '8px', marginBottom: '12px'}}>
              <button onClick={() => toggleInscription(event.id)} style={{flex: 1, padding: '6px', borderRadius: '6px', border: 'none', background: event.inscrit? '#333' : '#764ba2', color: '#fff', fontSize: '12px', fontWeight: 'bold'}}>
                {event.inscrit? 'Inscrit ✓' : 'Participer'}
              </button>
              <button onClick={() => openMap(event.lieu)} style={{padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#333', color: '#fff', fontSize: '12px'}}>🗺️</button>
              <button onClick={() => setActiveEvent(event)} style={{padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#333', color: '#fff', fontSize: '12px'}}>💬 {event.chat.length}</button>
            </div>
            <div style={{fontSize: '12px', color: '#666'}}>👥 {event.participants} participants</div>
          </div>
        </div>
      ))}
    </div>
  )
}
