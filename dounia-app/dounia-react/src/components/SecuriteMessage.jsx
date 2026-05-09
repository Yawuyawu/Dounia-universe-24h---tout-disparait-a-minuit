import {useState, useEffect} from 'react'

export default function SecuriteMessage() {
  const [view, setView] = useState('chats')
  const [chats, setChats] = useState([])
  const [friends, setFriends] = useState([])
  const [pending, setPending] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [txt, setTxt] = useState('')

  // BASE DE DONNÉES FAKE POUR L'ALGO
  const allUsers = [
    {id: 1, name: 'Tech Benin', city: 'Parakou', interests: ['code', 'react'], friends: ['Dev Parakou', 'Code Africa']},
    {id: 2, name: 'Dev Parakou', city: 'Parakou', interests: ['mobile', 'react'], friends: ['Tech Benin', 'IA Bénin']},
    {id: 3, name: 'Code Africa', city: 'Cotonou', interests: ['code', 'startup'], friends: ['Tech Benin', 'Startup BJ']},
    {id: 4, name: 'IA Bénin', city: 'Parakou', interests: ['ia', 'python'], friends: ['Dev Parakou', 'ML Africa']},
    {id: 5, name: 'Startup BJ', city: 'Cotonou', interests: ['startup', 'business'], friends: ['Code Africa']},
    {id: 6, name: 'ML Africa', city: 'Abomey', interests: ['ia', 'data'], friends: ['IA Bénin']},
    {id: 7, name: 'ProPulseur IA', city: 'Parakou', interests: ['ia', 'react'], friends: []}
  ]

  useEffect(() => {
    const savedChats = localStorage.getItem('dounia_chats')
    const savedFriends = localStorage.getItem('dounia_friends')
    const savedPending = localStorage.getItem('dounia_pending')

    if(savedChats) setChats(JSON.parse(savedChats))
    else setChats([{id: 1, name: 'ProPulseur IA', lastMsg: 'Salut!', msgs: [{id: 1, text: 'Salut! Bienvenue sur Dounia 💬', me: false, time: '10:30'}]}])

    if(savedFriends) setFriends(JSON.parse(savedFriends))
    else setFriends(['Tech Benin'])

    if(savedPending) setPending(JSON.parse(savedPending))

    // LANCE L'ALGO FACEBOOK
    generateSuggestions(JSON.parse(savedFriends || '["Tech Benin"]'))
  }, [])

  useEffect(() => {
    if(chats.length) localStorage.setItem('dounia_chats', JSON.stringify(chats))
  }, [chats])

  useEffect(() => {
    localStorage.setItem('dounia_friends', JSON.stringify(friends))
    generateSuggestions(friends)
  }, [friends])

  useEffect(() => {
    localStorage.setItem('dounia_pending', JSON.stringify(pending))
  }, [pending])

  // ALGO FACEBOOK : SCORE = AMIS EN COMMUN x2 + MÊME VILLE +1 + INTÉRÊT COMMUN +1
  const generateSuggestions = (currentFriends) => {
    const myProfile = allUsers.find(u => u.name === 'ProPulseur IA') || {city: 'Parakou', interests: ['ia', 'react']}

    const scored = allUsers
     .filter(u =>!currentFriends.includes(u.name) && u.name!== 'ProPulseur IA')
     .map(user => {
        let score = 0
        let reason = []

        // Amis en commun
        const mutuals = user.friends.filter(f => currentFriends.includes(f))
        score += mutuals.length * 2
        if(mutuals.length > 0) reason.push(`${mutuals.length} ami(s) en commun`)

        // Même ville
        if(user.city === myProfile.city) {
          score += 1
          reason.push(`Vit à ${user.city}`)
        }

        // Intérêts communs
        const commonInterests = user.interests.filter(i => myProfile.interests.includes(i))
        score += commonInterests.length
        if(commonInterests.length > 0) reason.push(`Intérêt: ${commonInterests[0]}`)

        return {...user, score, reason: reason.join(' • '), mutuals}
      })
     .filter(u => u.score > 0)
     .sort((a, b) => b.score - a.score)
     .slice(0, 5)

    setSuggestions(scored)
  }

  const sendRequest = (name) => {
    if(!pending.includes(name) &&!friends.includes(name)) {
      setPending([...pending, name])
      setTimeout(() => {
        setPending(prev => prev.filter(p => p!== name))
        setFriends(prev => [...prev, name])
        setChats(prev => [...prev, {id: Date.now(), name, lastMsg: 'Vous êtes amis', msgs: []}])
      }, 2000)
    }
  }

  const send = () => {
    if(!txt.trim() ||!activeChat) return
    const now = new Date()
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2,'0')}`
    const newMsg = {id: Date.now(), text: txt, me: true, time}
    setChats(chats.map(c => c.id === activeChat.id? {...c, msgs: [...c.msgs, newMsg], lastMsg: txt} : c))
    setTxt('')
    setTimeout(() => {
      const reply = {id: Date.now()+1, text: 'Reçu ✅', me: false, time}
      setChats(prev => prev.map(c => c.id === activeChat.id? {...c, msgs: [...c.msgs, reply], lastMsg: 'Reçu ✅'} : c))
    }, 1000)
  }

  if(activeChat) {
    return (
      <div style={{display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)'}}>
        <div style={{padding: '15px', borderBottom: '1px solid #222', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px'}}>
          <span onClick={() => setActiveChat(null)} style={{cursor: 'pointer'}}>←</span>
          {activeChat.name}
        </div>
        <div style={{flex: 1, padding: '10px', overflowY: 'auto'}}>
          {activeChat.msgs.map(m => (
            <div key={m.id} style={{marginBottom: '10px', textAlign: m.me? 'right' : 'left'}}>
              <div style={{display: 'inline-block', background: m.me? '#005c4b' : '#222', padding: '8px 12px', borderRadius: '8px', maxWidth: '70%'}}>
                <div>{m.text}</div>
                <div style={{fontSize: '10px', color: '#aaa', marginTop: '4px'}}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{display: 'flex', padding: '10px', borderTop: '1px solid #222', gap: '10px'}}>
          <input value={txt} onChange={e => setTxt(e.target.value)} onKeyPress={e => e.key === 'Enter' && send()} placeholder='Message...' style={{flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #333', background: '#111', color: '#fff'}} />
          <button onClick={send} style={{padding: '10px 20px', borderRadius: '20px', border: 'none', background: '#005c4b', color: '#fff'}}>Envoyer</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{display: 'flex', borderBottom: '1px solid #222'}}>
        <div onClick={() => setView('chats')} style={{flex: 1, textAlign: 'center', padding: '15px', borderBottom: view === 'chats'? '2px solid #fff' : 'none', fontWeight: view === 'chats'? 'bold' : 'normal'}}>Chats</div>
        <div onClick={() => setView('friends')} style={{flex: 1, textAlign: 'center', padding: '15px', borderBottom: view === 'friends'? '2px solid #fff' : 'none', fontWeight: view === 'friends'? 'bold' : 'normal'}}>Amis</div>
        <div onClick={() => setView('suggestions')} style={{flex: 1, textAlign: 'center', padding: '15px', borderBottom: view === 'suggestions'? '2px solid #fff' : 'none', fontWeight: view === 'suggestions'? 'bold' : 'normal'}}>Suggestions</div>
      </div>

      {view === 'chats' && (
        <div>
          {chats.map(chat => (
            <div key={chat.id} onClick={() => setActiveChat(chat)} style={{padding: '15px', borderBottom: '1px solid #222', cursor: 'pointer'}}>
              <div style={{fontWeight: 'bold'}}>{chat.name}</div>
              <div style={{fontSize: '12px', color: '#aaa'}}>{chat.lastMsg}</div>
            </div>
          ))}
        </div>
      )}

      {view === 'friends' && (
        <div style={{padding: '10px'}}>
          <div style={{fontSize: '12px', color: '#aaa', marginBottom: '10px'}}>Tes amis ({friends.length})</div>
          {friends.map((friend, i) => (
            <div key={i} style={{padding: '12px', background: '#1a1a1a', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span>{friend}</span>
              <button onClick={() => setActiveChat(chats.find(c => c.name === friend))} style={{padding: '5px 15px', borderRadius: '6px', border: 'none', background: '#0095f6', color: '#fff', fontSize: '12px'}}>Message</button>
            </div>
          ))}
        </div>
      )}

      {view === 'suggestions' && (
        <div style={{padding: '10px'}}>
          <div style={{fontSize: '12px', color: '#aaa', marginBottom: '10px'}}>Personnes que vous pourriez connaître</div>
          {suggestions.map(user => (
            <div key={user.id} style={{padding: '12px', background: '#1a1a1a', borderRadius: '8px', marginBottom: '8px'}}>
              <div style={{fontWeight: 'bold', marginBottom: '4px'}}>{user.name}</div>
              <div style={{fontSize: '11px', color: '#666', marginBottom: '8px'}}>{user.reason}</div>
              {pending.includes(user.name)? (
                <button style={{width: '100%', padding: '6px', borderRadius: '6px', border: 'none', background: '#333', color: '#aaa', fontSize: '12px'}}>Demande envoyée</button>
              ) : (
                <button onClick={() => sendRequest(user.name)} style={{width: '100%', padding: '6px', borderRadius: '6px', border: 'none', background: '#1877f2', color: '#fff', fontSize: '12px', fontWeight: 'bold'}}>Ajouter</button>
              )}
            </div>
          ))}
          {suggestions.length === 0 && <div style={{textAlign: 'center', color: '#666', padding: '40px'}}>Plus de suggestions pour l'instant</div>}
        </div>
      )}
    </div>
  )
}
