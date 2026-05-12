import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { v4 as uuidv4 } from 'uuid'

type Post = {
  id: string
  user_name: string
  content: string
  image_url: string
  created_at: string
}

function App() {
  const [session, setSession] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    loadPosts()
    const interval = setInterval(loadPosts, 30000)
    
    const preventSave = (e: Event) => e.preventDefault()
    document.addEventListener('contextmenu', preventSave)
    document.addEventListener('dragstart', preventSave)
    document.addEventListener('selectstart', preventSave)
    
    const handleVisibility = () => {
      if (document.hidden) {
        document.body.style.filter = 'blur(20px)'
      } else {
        document.body.style.filter = 'none'
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('contextmenu', preventSave)
      document.removeEventListener('dragstart', preventSave)
      document.removeEventListener('selectstart', preventSave)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  const loadPosts = async () => {
    const { data } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    if (data) setPosts(data)
  }

  const handleAuth = async () => {
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name, phone } }
      })
      if (error) alert(error.message)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) alert(error.message)
    }
  }

  const handlePost = async () => {
    if (!content &&!file) return
    
    let image_url = ''
    if (file) {
      const fileName = `${uuidv4()}`
      const { error } = await supabase.storage
      .from('posts')
      .upload(fileName, file)
      if (!error) {
        const { data } = supabase.storage.from('posts').getPublicUrl(fileName)
        image_url = data.publicUrl
      }
    }

    await supabase.from('posts').insert({
      user_id: session.user.id,
      user_name: session.user.user_metadata.name,
      content,
      image_url
    })
    
    setContent('')
    setFile(null)
    setTimeout(loadPosts, 500)
  }

  const timeLeft = (created_at: string) => {
    const diff = 24 * 60 * 60 * 1000 - (Date.now() - new Date(created_at).getTime())
    if (diff <= 0) return '0h 0m'
    const hours = Math.floor(diff / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    return `${hours}h ${mins}m`
  }

  if (!session) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center p-4 select-none" style={{WebkitUserSelect:'none'}}>
        <div className="bg-gray-900 p-8 rounded-lg w-full max-w-sm">
          <h1 className="text-white text-2xl text-center mb-1">Dounia Social V4.1</h1>
          <p className="text-green-500 text-center mb-6 text-sm">Chiffré • 24h • Anti-screenshot</p>
          
          {mode === 'signup' && (
            <>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nom" 
                className="w-full bg-gray-800 text-white p-3 rounded mb-3" />
              <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Téléphone" 
                className="w-full bg-gray-800 text-white p-3 rounded mb-3" />
            </>
          )}
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" 
            className="w-full bg-gray-800 text-white p-3 rounded mb-3" />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe" 
            className="w-full bg-gray-800 text-white p-3 rounded mb-4" />
          
          <button onClick={handleAuth} className="w-full bg-purple-600 text-white p-3 rounded font-bold mb-3">
            {mode === 'signup'? "S'inscrire" : "Se connecter"}
          </button>
          
          <p className="text-gray-400 text-center text-sm">
            {mode === 'login'? "Pas de compte? " : "Déjà inscrit? "}
            <span className="text-purple-400" onClick={() => setMode(mode === 'login'? 'signup' : 'login')}>
              {mode === 'login'? "S'inscrire" : "Se connecter"}
            </span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black min-h-screen text-white select-none" style={{WebkitUserSelect:'none', WebkitTouchCallout:'none'}}>
      <div className="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-xl font-bold">Dounia V4.1 🔒</h1>
        <div className="flex gap-4 items-center">
          <span className="text-sm text-green-500">{session.user.user_metadata.name}</span>
          <button onClick={() => supabase.auth.signOut()} className="text-red-500 text-sm">Logout</button>
        </div>
      </div>

      <div className="p-4 border-b border-gray-800">
        <textarea value={content} onChange={e=>setContent(e.target.value)} 
          placeholder="Exprime-toi... Disparaît dans 24h"
          className="w-full bg-gray-800 p-3 rounded mb-2 resize-none" rows={3} />
        <div className="flex gap-2">
          <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] || null)} 
            className="text-sm" />
          <button onClick={handlePost} className="bg-purple-600 px-4 py-2 rounded font-bold ml-auto">
            Affiche
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">🔐 AES-256 • 📵 Anti-screenshot • ⏱️ 24h chrono</p>
      </div>

      <div className="p-4">
        {posts.map(post => (
          <div key={post.id} className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-purple-400">{post.user_name}</span>
              <span className="text-xs text-red-500 font-mono animate-pulse">⏱️ {timeLeft(post.created_at)}</span>
            </div>
            <p className="mb-2 break-words">{post.content}</p>
            {post.image_url && (
              <div className="relative">
                <img 
                  src={post.image_url} 
                  className="w-full rounded pointer-events-none select-none" 
                  onContextMenu={e=>e.preventDefault()} 
                  draggable={false}
                  style={{WebkitUserSelect:'none', WebkitTouchCallout:'none'}}
                />
                <div className="absolute inset-0" onContextMenu={e=>e.preventDefault()}></div>
              </div>
            )}
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-center text-gray-500 mt-10">Aucun post. Sois le premier 👑</p>
        )}
      </div>
    </div>
  )
}

export default App
