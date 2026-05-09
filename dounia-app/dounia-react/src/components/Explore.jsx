import {useState} from 'react'
export default function Explore(){
  const [posts] = useState([
    {id:1, user:'@devgirl', img:'https://picsum.photos/400?1', likes:234, caption:'Coding night 🌙'},
    {id:2, user:'@benin_tech', img:'https://picsum.photos/400/400?2', likes:891, caption:'Parakou vibes 🇧🇯'},
    {id:3, user:'@propulseur', img:'https://picsum.photos/400/400?3', likes:1567, caption:'Dounia Universe arrive'}
  ])
  const [stories] = useState(['@toi','@devgirl','@benin_tech','@coder','@design'])
  
  return (<div style={{padding:'10px'}}>
    <div style={{display:'flex', gap:'10px', overflowX:'auto', padding:'10px 0', marginBottom:'10px'}}>
      {stories.map((s,i)=>(<div key={i} style={{textAlign:'center'}}>
        <div style={{width:'60px', height:'60px', borderRadius:'50%', background:'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', padding:'2px'}}>
          <div style={{width:'100%', height:'100%', borderRadius:'50%', background:'#000', display:'flex', alignItems:'center', justifyContent:'center'}}>😎</div>
        </div>
        <div style={{fontSize:'10px', marginTop:'4px'}}>{s}</div>
      </div>))}
    </div>
    {posts.map(p=>(<div key={p.id} style={{background:'#1a1a1a', marginBottom:'15px', borderRadius:'12px', overflow:'hidden', border:'1px solid #333'}}>
      <div style={{padding:'10px', display:'flex', alignItems:'center', gap:'8px'}}>
        <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#764ba2'}}>👤</div>
        <div style={{fontWeight:'bold', fontSize:'14px'}}>{p.user}</div>
      </div>
      <img src={p.img} style={{width:'100%', height:'400px', objectFit:'cover'}}/>
      <div style={{padding:'10px'}}>
        <div style={{display:'flex', gap:'15px', fontSize:'24px', marginBottom:'8px'}}>
          <div>❤️</div><div>💬</div><div>📤</div>
        </div>
        <div style={{fontWeight:'bold', fontSize:'14px'}}>{p.likes} likes</div>
        <div style={{fontSize:'14px'}}><b>{p.user}</b> {p.caption}</div>
      </div>
    </div>))}
  </div>)
}
