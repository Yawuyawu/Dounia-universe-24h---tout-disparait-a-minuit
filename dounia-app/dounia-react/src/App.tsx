import { useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  const handleSignup = async () => {
    setMsg('Envoi...')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, phone } }
    })
    if (error) setMsg('Erreur: ' + error.message)
    else setMsg('Compte créé ! Check Supabase')
  }

  return (
    <div className="bg-black min-h-screen flex items-center justify-center p-4">
      <div className="bg-gray-900 p-8 rounded-lg w-full max-w-sm">
        <h1 className="text-white text-2xl text-center mb-1">Dounia Social V4</h1>
        <p className="text-green-500 text-center mb-6 text-sm">0 erreur - Promesse</p>
        
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nom" 
          className="w-full bg-gray-800 text-white p-3 rounded mb-3" />
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Téléphone" 
          className="w-full bg-gray-800 text-white p-3 rounded mb-3" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" 
          className="w-full bg-gray-800 text-white p-3 rounded mb-3" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe" 
          className="w-full bg-gray-800 text-white p-3 rounded mb-4" />
        
        <button onClick={handleSignup} 
          className="w-full bg-purple-600 text-white p-3 rounded font-bold">
          S'inscrire
        </button>
        
        {msg && <p className="text-white text-center mt-4 text-sm">{msg}</p>}
      </div>
    </div>
  )
}

export default App
