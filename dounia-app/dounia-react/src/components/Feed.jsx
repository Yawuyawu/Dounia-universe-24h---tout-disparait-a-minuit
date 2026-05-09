import {useState, useEffect} from 'react'

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [showNew, setShowNew] = useState(false)
  const [newText, setNewText] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('dounia_posts')
    if(saved) setPosts(JSON.parse(saved))
    else setPosts([
      {id: 1, user: 'ProPulseur IA', text: 'Bienvenue sur Dounia Universe 🔥', likes: 12, liked: false, comments: ['Premier!']},
      {id: 2, user: 'Tech Benin', text: 'Le futur du réseau social africain', likes: 8, liked: false, comments: []},
      {id: 3, user: 'Dev Parakou', text: 'Code depuis Termux sur Android 💪', likes: 25, liked: false, comments: []}
    ])
  }, [])

  useEffect(() => {
    if(posts.length) localStorage.setItem('dounia_posts', JSON.stringify(posts))
  }, [posts])

  const toggleLike = (id) => {
    setPosts(posts.map(p => p.id === id? {...p, liked:!p.liked, likes: p.liked? p.likes - 1 : p.likes + 1} : p))
  }

  const addComment = (id) => {
    const text = prompt('Ton commentaire:')
    if(text) setPosts(posts.map(p => p.id === id? {...p, comments: [...p.comments, text]} : p))
  }

  const createPost = () => {
    if(!newText.trim()) return
    setPosts([{id: Date.now(), user: 'Toi', text: newText, likes: 0, liked: false, comments: []},...posts])
    setNewText('')
    setShowNew(false)
  }

  return (
    <div style={{padding: '10px', paddingBottom: '70px'}}>
      <div onClick={() => setShowNew(true)} style={{position: 'fixed', bottom: '70px', right: '20px', width: '56px', height: '56px', borderRadius: '50%', background: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', cursor: 'pointer', zIndex: 50}}>+</div>

      {showNew && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000e', zIndex: 100, padding: '20px'}}>
          <div style={{background: '#1a1a1a', padding: '15px', borderRadius: '8px'}}>
            <div style={{fontWeight: 'bold', marginBottom: '10px'}}>Nouveau post</div>
            <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder='Quoi de neuf?' style={{width: '100%', height: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', marginBottom: '10px'}} />
            <div style={{display: 'flex', gap: '10px'}}>
              <button onClick={() => setShowNew(false)} style={{flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#333', color: '#fff'}}>Annuler</button>
              <button onClick={createPost} style={{flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#1877f2', color: '#fff', fontWeight: 'bold'}}>Publier</button>
            </div>
          </div>
        </div>
      )}

      {posts.map(post => (
        <div key={post.id} style={{background: '#1a1a1a', borderRadius: '8px', padding: '12px', marginBottom: '10px'}}>
          <div style={{fontWeight: 'bold', marginBottom: '8px'}}>{post.user}</div>
          <div style={{marginBottom: '10px'}}>{post.text}</div>
          <div style={{display: 'flex', gap: '20px', color: '#aaa', fontSize: '14px', marginBottom: '8px'}}>
            <span onClick={() => toggleLike(post.id)} style={{cursor: 'pointer', color: post.liked? '#1877f2' : '#aaa'}}>👍 {post.likes}</span>
            <span onClick={() => addComment(post.id)} style={{cursor: 'pointer'}}>💬 {post.comments.length}</span>
            <span onClick={() => alert('Partagé!')} style={{cursor: 'pointer'}}>↗️ Share</span>
          </div>
          {post.comments.map((c,i) => <div key={i} style={{fontSize: '12px', color: '#aaa', marginLeft: '10px'}}>• {c}</div>)}
        </div>
      ))}
    </div>
  )
}
