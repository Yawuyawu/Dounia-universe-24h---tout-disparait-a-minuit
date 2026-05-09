import {useState, useEffect, useRef} from 'react'

export default function Techno() {
  const [tabInsta, setTabInsta] = useState('grid')
  const [follow, setFollow] = useState(false)
  const [followers, setFollowers] = useState(2400)
  const [storyView, setStoryView] = useState(null)
  const [photos, setPhotos] = useState([])
  const [profile, setProfile] = useState({name: 'Univers Dounia', bio: 'Code | Afrique | Tech 🌍', link: 'dounia.app', avatar: null})
  const [editMode, setEditMode] = useState(false)
  const [tempProfile, setTempProfile] = useState(profile)
  const fileInput = useRef(null)
  const avatarInput = useRef(null)
  const [uploadSlot, setUploadSlot] = useState(null)

  useEffect(() => {
    const savedFollow = localStorage.getItem('dounia_follow')
    const savedPhotos = localStorage.getItem('dounia_photos')
    const savedProfile = localStorage.getItem('dounia_profile')
    if(savedFollow) {
      setFollow(JSON.parse(savedFollow))
      setFollowers(2401)
    }
    if(savedPhotos) setPhotos(JSON.parse(savedPhotos))
    else setPhotos(Array(9).fill(null))
    if(savedProfile) {
      const p = JSON.parse(savedProfile)
      setProfile(p)
      setTempProfile(p)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('dounia_photos', JSON.stringify(photos))
  }, [photos])

  const toggleFollow = () => {
    const newFollow =!follow
    setFollow(newFollow)
    setFollowers(newFollow? 2401 : 2400)
    localStorage.setItem('dounia_follow', newFollow)
  }

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if(!file || uploadSlot === null) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const newPhotos = [...photos]
      newPhotos[uploadSlot] = ev.target.result
      setPhotos(newPhotos)
      setUploadSlot(null)
    }
    reader.readAsDataURL(file)
  }

  const handleAvatar = (e) => {
    const file = e.target.files[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setTempProfile({...tempProfile, avatar: ev.target.result})
    }
    reader.readAsDataURL(file)
  }

  const saveProfile = () => {
    setProfile(tempProfile)
    localStorage.setItem('dounia_profile', JSON.stringify(tempProfile))
    setEditMode(false)
  }

  const openUpload = (idx) => {
    setUploadSlot(idx)
    fileInput.current?.click()
  }

  const reels = Array.from({length: 6}, (_,i) => ({id: i+1, views: Math.floor(Math.random()*1000)}))

  return (
    <div>
      <input type='file' ref={fileInput} onChange={handleUpload} accept='image/*' style={{display: 'none'}} />
      <input type='file' ref={avatarInput} onChange={handleAvatar} accept='image/*' style={{display: 'none'}} />

      <div style={{display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px', borderBottom: '1px solid #222'}}>
        {Array.from({length: 8}).map((_,i) => (
          <div key={i} onClick={() => setStoryView(`utilisateur ${i+1}`)} style={{textAlign: 'center', minWidth: '70px', cursor: 'pointer'}}>
            <div style={{width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', padding: '2px'}}>
              <div style={{width: '100%', height: '100%', borderRadius: '50%', background: '#333', border: '2px solid #000'}}></div>
            </div>
            <span style={{fontSize: '11px', color: '#aaa'}}>utilisateur {i+1}</span>
          </div>
        ))}
      </div>

      {storyView && (
        <div onClick={() => setStoryView(null)} style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: '60px'}}>📱</div>
            <div>Story de {storyView}</div>
            <div style={{fontSize: '12px', color: '#666', marginTop: '20px'}}>Tape pour fermer</div>
          </div>
        </div>
      )}

      <div style={{padding: '15px', display: 'flex', alignItems: 'center', gap: '15px'}}>
        <div onClick={() => editMode && avatarInput.current?.click()} style={{width: '80px', height: '80px', borderRadius: '50%', background: tempProfile.avatar? `url(${tempProfile.avatar}) center/cover` : profile.avatar? `url(${profile.avatar}) center/cover` : '#333', cursor: editMode? 'pointer' : 'default', border: editMode? '2px dashed #0095f6' : 'none'}}>
          {editMode && <div style={{width: '100%', height: '100%', borderRadius: '50%', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'}}>📷</div>}
        </div>
        <div style={{flex: 1, display: 'flex', justifyContent: 'space-around', textAlign: 'center'}}>
          <div><div style={{fontWeight: 'bold'}}>{photos.filter(p=>p).length}</div><div style={{fontSize: '12px', color: '#aaa'}}>Posts</div></div>
          <div><div style={{fontWeight: 'bold'}}>{followers}</div><div style={{fontSize: '12px', color: '#aaa'}}>Abonnés</div></div>
          <div><div style={{fontWeight: 'bold'}}>314</div><div style={{fontSize: '12px', color: '#aaa'}}>Suivant</div></div>
        </div>
      </div>

      <div style={{padding: '0 15px 15px 15px'}}>
        {editMode? (
          <div>
            <input value={tempProfile.name} onChange={e => setTempProfile({...tempProfile, name: e.target.value})} placeholder='Nom' style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #333', background: '#111', color: '#fff', marginBottom: '8px'}} />
            <textarea value={tempProfile.bio} onChange={e => setTempProfile({...tempProfile, bio: e.target.value})} placeholder='Bio' style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #333', background: '#111', color: '#fff', marginBottom: '8px', height: '60px'}} />
            <input value={tempProfile.link} onChange={e => setTempProfile({...tempProfile, link: e.target.value})} placeholder='Lien' style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #333', background: '#111', color: '#fff', marginBottom: '10px'}} />
            <div style={{display: 'flex', gap: '8px'}}>
              <button onClick={() => {setEditMode(false); setTempProfile(profile)}} style={{flex: 1, padding: '7px', borderRadius: '8px', border: 'none', background: '#333', color: '#fff'}}>Annuler</button>
              <button onClick={saveProfile} style={{flex: 1, padding: '7px', borderRadius: '8px', border: 'none', background: '#0095f6', color: '#fff', fontWeight: 'bold'}}>Enregistrer</button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{fontWeight: 'bold'}}>{profile.name}</div>
            <div style={{fontSize: '14px', color: '#aaa', marginBottom: '4px'}}>{profile.bio}</div>
            {profile.link && <a href={`https://${profile.link}`} target='_blank' style={{fontSize: '14px', color: '#0095f6', textDecoration: 'none', display: 'block', marginBottom: '10px'}}>🔗 {profile.link}</a>}
            <div style={{display: 'flex', gap: '8px'}}>
              <button onClick={toggleFollow} style={{flex: 1, padding: '7px', borderRadius: '8px', border: 'none', background: follow? '#333' : '#0095f6', color: '#fff', fontWeight: 'bold'}}>
                {follow? 'Suivi ✓' : 'Suivre'}
              </button>
              <button onClick={() => setEditMode(true)} style={{padding: '7px 15px', borderRadius: '8px', border: '1px solid #333', background: 'transparent', color: '#fff'}}>Modifier</button>
            </div>
          </div>
        )}
      </div>

      <div style={{display: 'flex', borderTop: '1px solid #222'}}>
        <div onClick={() => setTabInsta('grid')} style={{flex: 1, textAlign: 'center', padding: '12px', borderBottom: tabInsta === 'grid'? '1px solid #fff' : '1px solid transparent', color: tabInsta === 'grid'? '#fff' : '#666', cursor: 'pointer'}}>⊞</div>
        <div onClick={() => setTabInsta('reels')} style={{flex: 1, textAlign: 'center', padding: '12px', borderBottom: tabInsta === 'reels'? '1px solid #fff' : '1px solid transparent', color: tabInsta === 'reels'? '#fff' : '#666', cursor: 'pointer'}}>▶️</div>
        <div onClick={() => setTabInsta('tagged')} style={{flex: 1, textAlign: 'center', padding: '12px', borderBottom: tabInsta === 'tagged'? '1px solid #fff' : '1px solid transparent', color: tabInsta === 'tagged'? '#fff' : '#666', cursor: 'pointer'}}>👤</div>
      </div>

      {tabInsta === 'grid' && (
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px'}}>
          {photos.map((photo, idx) => (
            <div key={idx} onClick={() => openUpload(idx)} style={{aspectRatio: '1', background: photo? `url(${photo}) center/cover` : '#222', position: 'relative', cursor: 'pointer'}}>
              {!photo && <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '24px', color: '#555'}}>+</div>}
            </div>
          ))}
        </div>
      )}
      {tabInsta === 'reels' && (
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px'}}>
          {reels.map(r => <div key={r.id} style={{aspectRatio: '9/16', background: '#222', position: 'relative'}}><span style={{position: 'absolute', bottom: '5px', left: '5px', fontSize: '10px'}}>👁️ {r.views}</span></div>)}
        </div>
      )}
      {tabInsta === 'tagged' && (
        <div style={{padding: '40px', textAlign: 'center', color: '#666'}}>
          <div style={{fontSize: '40px', marginBottom: '10px'}}>👤</div>
          <div>Aucune photo</div>
        </div>
      )}
    </div>
  )
}
