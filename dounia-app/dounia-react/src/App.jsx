import {useState} from 'react'
import Home from './components/Home'
import Cosmos from './components/Cosmos'
import Explore from './components/Explore'
import Create from './components/Create'
import Profile from './components/Profile'

export default function App() {
  const [tab, setTab] = useState('home')
  
  const tabs = {
    home: <Home/>,
    cosmos: <Cosmos/>,
    explore: <Explore/>,
    create: <Create/>,
    profile: <Profile/>
  }
  
  return (
    <div style={{background: '#000', color: '#fff', minHeight: '100vh'}}>
      <div style={{paddingBottom: '60px'}}>{tabs[tab]}</div>
      <div style={{position: 'fixed', bottom: 0, left: 0, right: 0, background: '#111', display: 'flex', borderTop: '1px solid #222', height: '60px', zIndex: 999}}>
        <div onClick={() => setTab('home')} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: tab === 'home'? '#764ba2' : '#666'}}>
          <div style={{fontSize: '22px'}}>🏠</div>
          <div style={{fontSize: '10px'}}>Accueil</div>
        </div>
        <div onClick={() => setTab('explore')} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: tab === 'explore'? '#764ba2' : '#666'}}>
          <div style={{fontSize: '22px'}}>🔍</div>
          <div style={{fontSize: '10px'}}>Insta</div>
        </div>
        <div onClick={() => setTab('create')} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: tab === 'create'? '#764ba2' : '#666'}}>
          <div style={{fontSize: '22px'}}>➕</div>
          <div style={{fontSize: '10px'}}>Snap</div>
        </div>
        <div onClick={() => setTab('cosmos')} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: tab === 'cosmos'? '#764ba2' : '#666'}}>
          <div style={{fontSize: '22px'}}>🌌</div>
          <div style={{fontSize: '10px'}}>Cosmos</div>
        </div>
        <div onClick={() => setTab('profile')} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: tab === 'profile'? '#764ba2' : '#666'}}>
          <div style={{fontSize: '22px'}}>👤</div>
          <div style={{fontSize: '10px'}}>TikTok</div>
        </div>
      </div>
    </div>
  )
}
