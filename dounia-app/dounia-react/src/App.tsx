import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import CryptoJS from 'crypto-js'

const SECRET_KEY = 'dounia-24h-snapchat-whatsapp-2026'

type Post = { id: string; user_name: string; content: string; image_url: string; created_at: string }
type Story = { id: string; user_name: string; image_url: string; created_at: string }
type Message = { id: string; sender_id: string; receiver_id: string; content: string; created_at: string }
type User = { id: string; email: string }

function App() {
  const [session, setSession] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [msgContent, setMsgContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [storyFile, setStoryFile] = useState<File | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [viewStory, setViewStory] = useState<Story | null>(null)
  const [view, setView] = useState<'feed' | 'chat'>('feed')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    loadPosts(); loadStories(); loadUsers()
    const interval = setInterval(() => { loadPosts(); loadStories(); if(activeChat) loadMessages(activeChat) }, 5000)
    
    const preventSave = (e: Event) => e.preventDefault()
    document.addEventListener('contextmenu', preventSave)
    document.addEventListener('visibilitychange', () => {
      document.body.style.filter = document.hidden? 'blur(20px)' : 'none'
    })
    return () => clearInterval(interval)
  }, [activeChat])

  const loadPosts = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    if (data) setPosts(data.map(p => ({...p, content: p.content? CryptoJS.AES.decrypt(p.content, SECRET_KEY).toString(CryptoJS.enc.Utf8) : ''})))
  }

  const loadStories = async () => {
    const { data } = await supabase.from('stories').select('*').order('created_at', { ascending: false })
    if (data) setStories(data)
  }

  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('*')
    if (data) setUsers(data)
  }

  const loadMessages = async (userId: string) => {
    const { data } = await supabase.from('messages')
  .select('*')
  .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${session.user.id})`)
  .order('created_at', { ascending: true })
    if (data) setMessages(data.map(m => ({...m, content: CryptoJS.AES.decrypt(m.content, SECRET_KEY).toString(CryptoJS.enc.Utf8)})))
  }

  const handlePost = async () => {
    if (!content &&!file) return
    let image_url = ''
    if (file) {
      const fileName = `${uuidv4()}`
      await supabase.storage.from('posts').upload(fileName, file)
      image_url = supabase.storage.from('posts').getPublicUrl(fileName).data.publicUrl
    }
    const encryptedContent = content? CryptoJS.AES.encrypt(content, SECRET_KEY).toString() : ''
    await supabase.from('posts').insert({user_id: session.user.id, user_name: session.user_metadata.name, content: encryptedContent, image_url})
    setContent(''); setFile(null); setTimeout(loadPosts, 500)
  }

  const handleMessage = async () => {
    if (!msgContent ||!activeChat) return
    const encrypted = CryptoJS.AES.encrypt(msgContent, SECRET_KEY).toString()
    await supabase.from('messages').insert({sender_id: session.user.id, receiver_id: activeChat, content: encrypted})
    setMsgContent(''); loadMessages(activeChat)
  }

  const timeLeft = (created_at: string) => {
    const diff = 24 * 60 * 60 * 1000 - (Date.now() - new Date(created_at).getTime())
    if (diff <= 0) return '0h 0m'
    return `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`
  }

  if (!session) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gray-900 p-8 rounded-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-6">Dounia V4.3 🔒</h1>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 mb-3 bg-gray-800 text-white rounded"/>
        <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 mb-3 bg-gray-800 text-white rounded"/>
        {mode==='signup' && (
          <>
            <input type="text" placeholder="Nom" value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 mb-3 bg-gray-800 text-white rounded"/>
            <input type="text" placeholder="Téléphone" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full p-3 mb-3 bg-gray-800 text-white rounded"/>
          </>
        )}
        <button onClick={async()=>{
          if(mode==='login'){
            await supabase.auth.signInWithPassword({email,password})
          }else{
            await supabase.auth.signUp({email,password,options:{data:{name,phone}}})
          }
        }} className="w-full bg-purple-600 text-white p-3 rounded font-bold mb-3">
          {mode==='login'?'Se connecter':'S\'inscrire'}
        </button>
        <button onClick={()=>setMode(mode==='login'?'signup':'login')} className="w-full text-gray-400">
          {mode==='login'?'Pas de compte? S\'inscrire':'Déjà un compte? Se connecter'}
        </button>
      </div>
    </div>
  )

  if (view === 'chat' && activeChat) {
    const chatUser = users.find(u => u.id === activeChat)
    return (
      <div className="bg-black min-h-screen text-white flex-col">
        <div className="bg-gray-900 p-4 flex items-center gap-3 border-b border-gray-800">
          <button onClick={() => {setView('feed'); setActiveChat(null)}} className="text-purple-400">←</button>
          <span className="font-bold">{chatUser?.email}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.sender_id === session.user.id? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs p-3 rounded-lg ${m.sender_id === session.user.id? 'bg-purple-600' : 'bg-gray-800'}`}>
                <p>{m.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-gray-900 flex gap-2">
          <input value={msgContent} onChange={e=>setMsgContent(e.target.value)} placeholder="Message chiffré..." 
            className="flex-1 bg-gray-800 p-3 rounded text-white"/>
          <button onClick={handleMessage} className="bg-purple-600 px-4 rounded font-bold">Envoyer</button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-800 sticky top-0 z-10">
        <h1 className="text-xl font-bold">Dounia V4.3 🔒</h1>
        <button onClick={() => setView('chat')} className="text-green-500">💬 Chats</button>
      </div>
      
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-sm font-bold mb-3">Stories 24h</h3>
        <div className="flex gap-3 overflow-x-auto">
          <label className="flex-shrink-0 w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer">
            <input type="file" accept="image/*" onChange={async(e)=>{
              if(e.target.files?.[0]){
                const fileName=`${uuidv4()}`
                await supabase.storage.from('stories').upload(fileName,e.target.files[0])
                const url=supabase.storage.from('stories').getPublicUrl(fileName).data.publicUrl
                await supabase.from('stories').insert({user_id:session.user.id,user_name:session.user_metadata.name,image_url:url})
                setTimeout(loadStories,500)
              }
            }} className="hidden"/>
            <span className="text-2xl">+</span>
          </label>
          {stories.map(s=>(
            <div key={s.id} onClick={()=>setViewStory(s)} className="flex-shrink-0 text-center cursor-pointer">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500">
                <img src={s.image_url} className="w-full h-full object-cover"/>
              </div>
              <p className="text-xs mt-1">{s.user_name}</p>
              <p className="text-xs text-gray-500">{timeLeft(s.created_at)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="bg-gray-900 p-4 rounded-xl mb-4">
          <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Post chiffré 24h..." 
            className="w-full bg-gray-800 p-3 rounded text-white mb-3"/>
          <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} className="mb-3"/>
          <button onClick={handlePost} className="w-full bg-purple-600 p-3 rounded font-bold">Poster</button>
        </div>

        {posts.map(post=>(
          <div key={post.id} className="bg-gray-900 p-4 rounded-xl mb-4">
            <div className="flex justify-between mb-2">
              <span className="font-bold">{post.user_name}</span>
              <span className="text-xs text-gray-500">{timeLeft(post.created_at)}</span>
            </div>
            {post.content && <p className="mb-3">{post.content}</p>}
            {post.image_url && <img src={post.image_url} className="w-full rounded-lg"/>}
          </div>
        ))}
      </div>

      {viewStory && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" onClick={()=>setViewStory(null)}>
          <img src={viewStory.image_url} className="max-w-full max-h-full"/>
        </div>
      )}
    </div>
  )
}

export default App
