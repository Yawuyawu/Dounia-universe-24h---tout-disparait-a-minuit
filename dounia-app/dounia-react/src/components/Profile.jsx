import {useState} from 'react'
export default function Profile(){
  const [videos] = useState([
    {id:1, url:'https://www.w3schools.com/html/mov_bbb.mp4', user:'@propulseur', desc:'Test Dounia #fyp', likes:'12.5K'},
    {id:2, url:'https://www.w3schools.com/html/movie.mp4', user:'@propulseur', desc:'Code sur mobile 🔥', likes:'8.2K'},
    {id:3, url:'https://www.w3schools.com/html/mov_bbb.mp4', user:'@propulseur', desc:'React + Vite 💜', likes:'25K'}
  ])
  const [current, setCurrent] = useState(0)
  
  return (<div style={{height:'calc(100vh - 60px)', overflow:'hidden', position:'relative', background:'#000'}}>
    {videos.map((v,i)=>(<div key={v.id} style={{height:'100%', display:i===current?'block':'none', position:'relative'}}>
      <video src={v.url} autoPlay loop muted style={{width:'100%', height:'100%', objectFit:'cover'}}/>
      <div style={{position:'absolute', bottom:'80px', left:'15px', right:'80px'}}>
        <div style={{fontWeight:'bold', fontSize:'16px', marginBottom:'5px'}}>{v.user}</div>
        <div style={{fontSize:'14px'}}>{v.desc}</div>
      </div>
      <div style={{position:'absolute', bottom:'80px', right:'15px', display:'flex', flexDirection:'column', gap:'20px', alignItems:'center'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'35px'}}>❤️</div>
          <div style={{fontSize:'12px'}}>{v.likes}</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'35px'}}>💬</div>
          <div style={{fontSize:'12px'}}>2.1K</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'35px'}}>📤</div>
          <div style={{fontSize:'12px'}}>Share</div>
        </div>
      </div>
    </div>))}
    <div onClick={()=>setCurrent((current+1)%videos.length)} style={{position:'absolute', top:0, left:0, right:0, bottom:0}}/>
  </div>)
}
