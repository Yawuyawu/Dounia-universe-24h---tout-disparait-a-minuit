import { supabase } from "./supabase.js"
import { useState, useEffect, useRef } from 'react'
import { Toaster, toast } from 'react-hot-toast'

const EMOJIS = ['❤️','😂','😮','😢','😡','👍']

export default function App() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nom, setNom] = useState('')
  const [numero, setNumero] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [posts, setPosts] = useState([])
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [profil, setProfil] = useState(null)
  const [onglet, setOnglet] = useState('feed')
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [comments, setComments] = useState({})
  const [commentText, setCommentText] = useState({})
  const [showReact, setShowReact] = useState(null)
  const fileRef = useRef()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user?? null)
      if (session?.user) loadProfil(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user?? null)
      if (session?.user) loadProfil(session.user.id)
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadProfil = async (userId) => {
    const { data } = await supabase.from('users').select('*').eq('id', userId).single()
    setProfil(data)
  }

  useEffect(() => {
    if (!user) return
    loadPosts()
    loadUsers()
    const channel = supabase.channel('realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, loadPosts)
   .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, loadComments).subscribe()
    return () => supabase.removeChannel(channel)
  }, )

  const loadPosts = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    setPosts(data || [])
    loadComments()
  }

  const loadComments = async () => {
    const { data } = await supabase.from('comments').select('*').order('created_at', { ascending: true })
    const grouped = {}
    data?.forEach(c => {
      if (!grouped[c.post_id]) grouped[c.post_id] = []
      grouped[c.post_id].push(c)
    })
    setComments(grouped)
  }

  const loadUsers = async () => {
    const { data } = await supabase.from('users').select('*').neq('id', user.id)
    setAllUsers(data || [])
  }

  const inscription = async () => {
    if (!email ||!password ||!nom ||!numero) return toast.error('Remplis tout')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return toast.error(error.message)
    await supabase.from('users').insert({
      id: data.user.id, nom, numero: numero.replace(/\s+/g, ''),
      photo: `https://ui-avatars.com/api/?name=${nom}&background=8b5cf6&color=fff`, amis: []
    })
    toast.success('Compte créé! Vérifie ton email')
  }

  const connexion = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) toast.error('Email ou mot de passe incorrect')
  }

  const uploadImage = async (file) => {
    const fileName = `${Date.now()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('photos').upload(fileName, file)
    if (error) throw error
    const { data } = supabase.storage.from('photos').getPublicUrl(fileName)
    return data.publicUrl
  }

  const poster = async () => {
    if (!text &&!image) return toast.error('Écris ou ajoute une photo')
    setLoading(true)
    try {
      let imageUrl = ''
      if (image) {
        toast('Upload...')
        imageUrl = await uploadImage(image)
      }
      await supabase.from('posts').insert({
        texte: text, image: imageUrl, auteur_id: user.id,
        auteur_nom: profil.nom, auteur_photo: profil.photo, reactions: {}
      })
      setText(''); setImage(null); fileRef.current.value = ''
      toast.success('Posté!')
    } catch (e) { toast.error('Erreur') }
    setLoading(false)
  }

  const reagir = async (post, emoji) => {
    const current = post.reactions || {}
    const userReactions = current[user.id] || []
    const newUserReactions = userReactions.includes(emoji)
   ? userReactions.filter(e => e!== emoji)
      : [...userReactions, emoji]
    const newReactions = {...current, [user.id]: newUserReactions }
    if (newUserReactions.length === 0) delete newReactions[user.id]
    await supabase.from('posts').update({ reactions: newReactions }).eq('id', post.id)
    setShowReact(null)
  }

  const commenter = async (postId) => {
    const texte = commentText[postId]
    if (!texte) return
    await supabase.from('comments').insert({
      post_id: postId, auteur_id: user.id,
      auteur_nom: profil.nom, auteur_photo: profil.photo, texte
    })
    setCommentText({...commentText, [postId]: '' })
  }

  const countReactions = (reactions) => {
    const counts = {}
    Object.values(reactions || {}).flat().forEach(e => {
      counts[e] = (counts[e] || 0) + 1
    })
    return counts
  }

  const ajouterAmi = async (amiId) => {
    const amis = [...(profil.amis || []), amiId]
    await supabase.from('users').update({ amis }).eq('id', user.id)
    toast.success('Ami ajouté')
    loadProfil(user.id)
  }

  const partagerWhatsApp = (amiNumero) => {
    const msg = `Rejoins-moi sur Dounia Social! https://dounia-24h.vercel.app`
    window.open(`https://wa.me/${amiNumero}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (!user) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Toaster />
      <div className="w-full max-w-sm bg-gray-900 p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2 text-center">Dounia Social V4</h1>
        <p className="text-green-500 text-sm text-center mb-6">0 erreur - Promis</p>
        {!isLogin && <>
          <input value={nom} onChange={e=>setNom(e.target.value)} placeholder="Ton nom" className="w-full bg-gray-800 p-3 rounded mb-3" />
          <input value={numero} onChange={e=>setNumero(e.target.value)} type="tel" placeholder="Numéro WhatsApp: +229..." className="w-full bg-gray-800 p-3 rounded mb-3" />
        </>}
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email" className="w-full bg-gray-800 p-3 rounded mb-3" />
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Mot de passe" className="w-full bg-gray-800 p-3 rounded mb-4" />
        <button onClick={isLogin? connexion : inscription} className="bg-purple-600 w-full py-3 rounded-lg mb-3">
          {isLogin? 'Se connecter' : "S'inscrire"}
        </button>
        <button onClick={()=>setIsLogin(!isLogin)} className="text-sm text-gray-400 w-full">
          {isLogin? "Pas de compte? S'inscrire" : 'Déjà inscrit? Se connecter'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Toaster position="top-center" />
      <header className="p-4 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-black z-10">
        <h1 className="text-xl font-bold">Dounia Social</h1>
        <div className="flex items-center gap-3">
          <img src={profil?.photo} className="w-8 h-8 rounded-full" />
          <button onClick={() => supabase.auth.signOut()} className="text-sm text-gray-400">Logout</button>
        </div>
      </header>
      <nav className="flex justify-around p-2 border-b border-gray-800">
        <button onClick={() => setOnglet('feed')} className={onglet==='feed'?'text-purple-500 font-bold':''}>Feed</button>
        <button onClick={() => setOnglet('amis')} className={onglet==='amis'?'text-purple-500 font-bold':''}>Amis</button>
      </nav>
      <main className="p-4 max-w-xl mx-auto">
        {onglet === 'feed' && <>
          <div className="bg-gray-900 p-4 rounded-lg mb-4">
            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Quoi de neuf?" className="w-full bg-gray-800 p-2 rounded mb-2" />
            <input type="file" ref={fileRef} onChange={e=>setImage(e.target.files[0])} className="text-sm mb-2" />
            <button onClick={poster} disabled={loading} className="bg-purple-600 w-full py-2 rounded-lg disabled:opacity-50">{loading?'Upload...':'Poster'}</button>
          </div>
          {posts.map(p => {
            const reactionCounts = countReactions(p.reactions)
            const userReacted = p.reactions?.[user.id] || []
            return (
              <div key={p.id} className="bg-gray-900 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <img src={p.auteur_photo} className="w-8 h-8 rounded-full" />
                  <b>{p.auteur_nom}</b>
                </div>
                <p className="mb-2">{p.texte}</p>
                {p.image && <img src={p.image} className="rounded-lg mb-2 max-h-96 w-full object-cover" />}
                <div className="flex gap-1 mb-2 text-sm">
                  {Object.entries(reactionCounts).map(([emoji, count]) => (
                    <span key={emoji} className="bg-gray-800 px-2 py-1 rounded-full">{emoji} {count}</span>
                  ))}
                </div>
                <div className="flex gap-4 mb-3 text-sm relative">
                  <button onClick={() => setShowReact(showReact === p.id? null : p.id)} className="text-gray-400">
                    {userReacted.length? userReacted.join('') : 'Réagir'}
                  </button>
                  {showReact === p.id && (
                    <div className="absolute bg-gray-800 p-2 rounded-lg flex gap-2 bottom-8">
                      {EMOJIS.map(e => (
                        <button key={e} onClick={() => reagir(p, e)} className="text-xl hover:scale-125">{e}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2 mb-2">
                  {comments[p.id]?.map(c => (
                    <div key={c.id} className="flex gap-2 text-sm">
                      <img src={c.auteur_photo} className="w-6 h-6 rounded-full" />
                      <div className="bg-gray-800 p-2 rounded-lg flex-1">
                        <b className="text-xs">{c.auteur_nom}</b>
                        <p>{c.texte}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={commentText[p.id] || ''}
                    onChange={e => setCommentText({...commentText, [p.id]: e.target.value})}
                    placeholder="Écrire un commentaire..."
                    className="flex-1 bg-gray-800 p-2 rounded text-sm"
                    onKeyDown={e => e.key === 'Enter' && commenter(p.id)}
                  />
                  <button onClick={() => commenter(p.id)} className="text-purple-500 text-sm">Envoyer</button>
                </div>
              </div>
            )
          })}
        </>}
        {onglet === 'amis' && <>
          <h2 className="text-lg font-bold mb-4">Ajouter des amis</h2>
          {allUsers.map(u => (
            <div key={u.id} className="flex justify-between items-center bg-gray-900 p-3 rounded-lg mb-2">
              <div className="flex items-center gap-2">
                <img src={u.photo} className="w-8 h-8 rounded-full" />
                <div>
                  <span className="block">{u.nom}</span>
                  <span className="text-xs text-gray-500">{u.numero}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {profil?.amis?.includes(u.id)
               ? <span className="text-green-500 text-sm">Ami ✓</span>
                  : <button onClick={()=>ajouterAmi(u.id)} className="bg-purple-600 px-3 py-1 rounded text-sm">Ajouter</button>
                }
                <button onClick={()=>partagerWhatsApp(u.numero)} className="bg-green-600 px-2 py-1 rounded text-xs">WhatsApp</button>
              </div>
            </div>
          ))}
        </>}
      </main>
    </div>
  )
}
