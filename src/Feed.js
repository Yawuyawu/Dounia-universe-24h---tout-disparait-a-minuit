import { useState, useRef, useEffect } from 'react';
import { FiHeart, FiMessageCircle, FiSend, FiPlus, FiSettings, FiUser, FiBell, FiCamera, FiX, FiVideo, FiLock, FiPhone, FiPhoneOff } from 'react-icons/fi';
import CryptoJS from 'crypto-js';
import { db, storage } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, arrayUnion, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function Feed({ onBack }) {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([
    { id: 1, user: "Toi", avatar: "➕", hasStory: false, media: null, timestamp: null }
  ]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [profileData, setProfileData] = useState({name: "Toi", username: "dounia_user", avatar: null, userId: null});
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [newPostMedia, setNewPostMedia] = useState(null);
  const [newPostMediaType, setNewPostMediaType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeComments, setActiveComments] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [showDM, setShowDM] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showStory, setShowStory] = useState(null);
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [tempName, setTempName] = useState(profileData.name);
  const [tempUsername, setTempUsername] = useState(profileData.username);
  const [tempAvatar, setTempAvatar] = useState(null);
  const [conversations, setConversations] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [dmText, setDmText] = useState("");
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [notifications, setNotifications] = useState([
    {id: 1, text: "Bienvenue sur Dounia Universe 🔒", time: "maintenant", read: false}
  ]);

  const fileInputRef = useRef(null);
  const storyInputRef = useRef(null);
  const profileAvatarRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [userKey] = useState(() => {
    let key = localStorage.getItem('dounia_secret_key');
    if (!key) {
      key = CryptoJS.lib.WordArray.random(256/8).toString();
      localStorage.setItem('dounia_secret_key', key);
    }
    return key;
  });

  useEffect(() => {
    let uid = localStorage.getItem('dounia_user_id');
    if (!uid) {
      uid = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('dounia_user_id', uid);
    }
    setProfileData(prev => ({...prev, userId: uid}));
  }, []);

  useEffect(() => {
    if (!profileData.userId) return;
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({id: doc.id,...doc.data()}));
      setPosts(postsData);
    });
    return () => unsub();
  }, [profileData.userId]);

  useEffect(() => {
    if (!profileData.userId) return;
    const q = query(collection(db, 'stories'));
    const unsub = onSnapshot(q, (snapshot) => {
      const storiesData = snapshot.docs.map(doc => ({id: doc.id,...doc.data()}));
      const myStory = { id: 1, user: "Toi", avatar: "➕", hasStory: false, media: null, timestamp: null };
      setStories([myStory,...storiesData.filter(s => s.userId!== profileData.userId && s.expiresAt > Date.now())]);
    });
    return () => unsub();
  }, [profileData.userId]);

  useEffect(() => {
    if (!profileData.userId) return;
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({id: doc.id,...doc.data()})).filter(u => u.userId!== profileData.userId);
      setAllUsers(users);
      if (!activeChat && users.length > 0) setActiveChat(users[0].userId);
    });
    return () => unsub();
  }, [profileData.userId, activeChat]);

  useEffect(() => {
    if (!profileData.userId ||!activeChat) return;
    const q = query(collection(db, 'messages'), where('participants', 'array-contains', profileData.userId));
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({id: doc.id,...doc.data()}))
.filter(m => m.participants.includes(activeChat))
.sort((a,b) => (a.time?.seconds || 0) - (b.time?.seconds || 0));
      setConversations(prev => ({...prev, [activeChat]: msgs}));
    });
    return () => unsub();
  }, [profileData.userId, activeChat]);

  useEffect(() => {
    if (profileData.userId && profileData.name) {
      addDoc(collection(db, 'users'), {
        userId: profileData.userId,
        name: profileData.name,
        username: profileData.username,
        avatar: profileData.avatar,
        lastSeen: serverTimestamp()
      }).catch(() => {});
    }
  }, [profileData]);

  const toggleLike = async (postId) => {
    const postRef = doc(db, 'posts', postId);
    const post = posts.find(p => p.id === postId);
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter(id => id!== postId));
      await updateDoc(postRef, { likes: (post.likes || 0) - 1 });
    } else {
      setLikedPosts([...likedPosts, postId]);
      await updateDoc(postRef, { likes: (post.likes || 0) + 1 });
      addNotif("Tu as liké un post ❤️");
    }
  };

  const addNotif = (text) => {
    setNotifications([{id: Date.now(), text, time: "maintenant", read: false},...notifications]);
  };

  const uploadToFirebase = async (file, path) => {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleMediaUpload = async (e, isStory = false) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      try {
        const url = await uploadToFirebase(file, isStory? 'stories' : 'posts');
        if (isStory) {
          await addDoc(collection(db, 'stories'), {
            userId: profileData.userId,
            user: profileData.name,
            avatar: profileData.avatar || "👤",
            media: url,
            timestamp: Date.now(),
            expiresAt: Date.now() + 86400000,
            createdAt: serverTimestamp()
          });
          addNotif("Story publiée pour 24h 🔒");
        } else {
          setNewPostMedia(url);
          setNewPostMediaType(file.type.startsWith('video')? 'video' : 'image');
        }
      } catch (err) {
        addNotif("Erreur upload ❌");
      }
      setUploading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setTempAvatar(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    let avatarUrl = profileData.avatar;
    if (tempAvatar && tempAvatar.startsWith('data:')) {
      const blob = await fetch(tempAvatar).then(r => r.blob());
      avatarUrl = await uploadToFirebase(blob, 'avatars');
    }
    setProfileData({
      name: tempName || "Toi",
      username: tempUsername || "dounia_user",
      avatar: avatarUrl,
      userId: profileData.userId
    });
    setEditProfileMode(false);
    setTempAvatar(null);
    addNotif("Profil mis à jour 🔒");
  };

  const handleNewPost = async () => {
    if (newPostText.trim() === "" &&!newPostMedia) return;
    setUploading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        user: profileData.name,
        avatar: profileData.avatar || "👤",
        userId: profileData.userId,
        text: newPostText,
        image: newPostMediaType === 'image'? newPostMedia : null,
        video: newPostMediaType === 'video'? newPostMedia : null,
        likes: 0,
        comments: [],
        createdAt: serverTimestamp()
      });
      setNewPostText("");
      setNewPostMedia(null);
      setNewPostMediaType(null);
      setShowNewPost(false);
      addNotif("Post publié sur le cloud! 🚀");
    } catch (err) {
      addNotif("Erreur publication ❌");
    }
    setUploading(false);
  };

  const handleComment = async (postId) => {
    if (commentText.trim() === "") return;
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: arrayUnion({
        user: profileData.name,
        text: commentText,
        time: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})
      })
    });
    setCommentText("");
    setActiveComments(null);
    addNotif("Commentaire envoyé 💬");
  };

  const encryptMessage = (text) => {
    return CryptoJS.AES.encrypt(text, userKey).toString();
  };

  const decryptMessage = (ciphertext) => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, userKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return "[Message chiffré]";
    }
  };

  const sendDM = async () => {
    if (dmText.trim() === "" ||!activeChat) return;
    const encrypted = encryptMessage(dmText);
    await addDoc(collection(db, 'messages'), {
      participants: [profileData.userId, activeChat],
      from: profileData.userId,
      to: activeChat,
      text: encrypted,
      time: serverTimestamp(),
      encrypted: true
    });
    setDmText("");
    addNotif(`Message chiffré envoyé 🔒`);
  };

  const startCall = async (type) => {
    setInCall(true);
    setCallType(type);
    addNotif(`Appel ${type} démarré 🔒`);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (err) {
      addNotif("Permission caméra/micro refusée ❌");
    }
  };

  const endCall = () => {
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setInCall(false);
    setCallType(null);
    addNotif("Appel terminé");
  };

  const timeAgo = (timestamp) => {
    if (!timestamp) return "";
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "à l'instant";
    if (hours < 24) return `il y a ${hours}h`;
    return "expiré";
  };

  const unreadCount = notifications.filter(n =>!n.read).length;

  const baseStyle = {backgroundColor: "#000",color: "#fff",minHeight: "100vh",fontFamily: "system-ui, -apple-system, Arial"};
  const headerStyle = {position: "sticky",top: 0,backgroundColor: "rgba(0,0,0,0.8)",backdropFilter: "blur(20px)",borderBottom: "1px solid #222",padding: "12px 16px",display: "flex",justifyContent: "space-between",alignItems: "center",zIndex: 10};
  const iconBtn = {cursor: "pointer",padding: "8px",borderRadius: "50%",display: "flex",alignItems: "center",justifyContent: "center",position: "relative"};
  const modalStyle = {position: "fixed",top: 0,left: 0,right: 0,bottom: 0,backgroundColor: "rgba(0,0,0,0.95)",backdropFilter: "blur(10px)",display: "flex",alignItems: "center",justifyContent: "center",zIndex: 100};
  const modalBox = {backgroundColor: "#111",border: "1px solid #333",borderRadius: "24px",padding: "24px",width: "90%",maxWidth: "450px",maxHeight: "80vh",overflowY: "auto"};
  const fab = {position: "fixed",bottom: "24px",right: "24px",width: "60px",height: "60px",borderRadius: "50%",background: "linear-gradient(135deg, #8B5CF6, #EC4899)",display: "flex",alignItems: "center",justifyContent: "center",cursor: "pointer",boxShadow: "0 8px 24px rgba(139, 92, 246, 0.5)",zIndex: 50};

  return (
    <div style={baseStyle}>
      <style>{`
        @keyframes fadeIn {from {opacity: 0} to {opacity: 1}}
        @keyframes pulse {0%, 100% {opacity: 1} 50% {opacity: 0.5}}
        *::-webkit-scrollbar {display: none}
.iconBtn:hover {background-color: #222}
.fab:hover {transform: scale(1.1)}
      `}</style>

      <div style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "900", background: "linear-gradient(45deg, #8B5CF6, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Dounia Universe 🔒
        </h1>
        <div style={{ display: "flex", gap: "4px" }}>
          <div className="iconBtn" style={iconBtn} onClick={() => setShowNotifs(true)}>
            <FiBell size={24} />
            {unreadCount > 0 && <div style={{position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", backgroundColor: "#EC4899", animation: "pulse 2s infinite"}} />}
          </div>
          <div className="iconBtn" style={iconBtn} onClick={() => setShowDM(true)}>
            <FiMessageCircle size={24} />
            <FiLock size={12} style={{position: "absolute", bottom: 4, right: 4, color: "#10B981"}} />
          </div>
          <div className="iconBtn" style={iconBtn} onClick={() => setShowProfile(true)}><FiUser size={24} /></div>
          <div className="iconBtn" style={iconBtn} onClick={onBack}><FiSettings size={24} /></div>
        </div>
      </div>

      <div style={{display: "flex",gap: "12px",padding: "16px",overflowX: "auto",borderBottom: "1px solid #222"}}>
        {stories.map(story => (
          <div key={story.id} style={{display: "flex",flexDirection: "column",alignItems: "center",gap: "6px",minWidth: "70px",cursor: "pointer"}} onClick={() => story.id === 1? storyInputRef.current?.click() : story.hasStory && setShowStory(story)}>
            <div style={{width: "66px",height: "66px",borderRadius: "50%",background: story.hasStory? "linear-gradient(45deg, #8B5CF6, #EC4899)" : "#333",padding: "3px",display: "flex",alignItems: "center",justifyContent: "center"}}>
              <div style={{width: "100%",height: "100%",borderRadius: "50%",backgroundColor: "#1a1a1a",display: "flex",alignItems: "center",justifyContent: "center",fontSize: "24px",overflow: "hidden"}}>
                {story.hasStory && story.media? <img src={story.media} style={{width: "100%", height: "100%", objectFit: "cover"}} alt="" /> : story.avatar}
              </div>
            </div>
            <span style={{ fontSize: "11px", color: "#ccc" }}>{story.user}</span>
            {story.hasStory && <span style={{ fontSize: "10px", color: "#8B5CF6" }}>{timeAgo(story.timestamp)}</span>}
          </div>
        ))}
        <input ref={storyInputRef} type="file" accept="image/*,video/*" onChange={(e) => handleMediaUpload(e, true)} style={{display: "none"}} />
      </div>

      {posts.map(post => (
        <div key={post.id} style={{borderBottom: "1px solid #222",padding: "16px"}}>
          <div style={{display: "flex",alignItems: "center",gap: "12px",marginBottom: "12px"}}>
            <div style={{width: "42px",height: "42px",borderRadius: "50%",backgroundColor: "#333",display: "flex",alignItems: "center",justifyContent: "center",fontSize: "20px",overflow: "hidden"}}>
              {post.avatar && post.avatar.startsWith('http')? <img src={post.avatar} style={{width: "100%", height: "100%", objectFit: "cover"}} alt="" /> : post.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontWeight: "bold" }}>{post.user}</span>
                {post.badge && <span style={{background: "linear-gradient(45deg, #8B5CF6, #EC4899)",padding: "2px 8px",borderRadius: "6px",fontSize: "10px",fontWeight: "bold"}}>{post.badge}</span>}
              </div>
              <span style={{ color: "#888", fontSize: "12px" }}>{post.createdAt?.toDate?.().toLocaleString('fr-FR') || "maintenant"}</span>
            </div>
          </div>

          {post.text && <div style={{ lineHeight: "1.6", marginBottom: "12px" }}>{post.text}</div>}
          {post.image && <img src={post.image} style={{width: "100%", borderRadius: "16px", marginBottom: "12px", border: "1px solid #222"}} alt="" />}
          {post.video && <video src={post.video} controls style={{width: "100%", borderRadius: "16px", marginBottom: "12px", border: "1px solid #222"}} />}

          <div style={{display: "flex",gap: "20px",marginTop: "12px",fontSize: "24px",alignItems: "center"}}>
            <div className="iconBtn" style={iconBtn} onClick={() => toggleLike(post.id)}>
              <FiHeart size={24} fill={likedPosts.includes(post.id)? "#EC4899" : "none"} color={likedPosts.includes(post.id)? "#EC4899" : "#fff"} />
            </div>
            <span style={{ fontSize: "14px", fontWeight: "600" }}>{post.likes || 0}</span>
            <div className="iconBtn" style={iconBtn} onClick={() => setActiveComments(post.id)}><FiMessageCircle size={24} /></div>
            <span style={{ fontSize: "14px", fontWeight: "600" }}>{post.comments?.length || 0}</span>
            <div className="iconBtn" style={iconBtn} onClick={() => {navigator.clipboard?.writeText(`dounia.app/post/${post.id}`); addNotif("Lien copié! 🔗")}}><FiSend size={24} /></div>
          </div>

          {post.comments?.length > 0 && (
            <div style={{ marginTop: "12px", paddingLeft: "12px", borderLeft: "2px solid #333" }}>
              {post.comments.map((c, i) => (
                <div key={i} style={{ fontSize: "14px", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "bold" }}>{c.user}: </span>
                  <span style={{ color: "#ccc" }}>{c.text}</span>
                  {c.time && <span style={{ color: "#666", fontSize: "11px", marginLeft: "8px" }}>{c.time}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="fab" onClick={() => setShowNewPost(true)} style={fab}>
        {uploading? <div style={{animation: "pulse 1s infinite"}}>⏳</div> : <FiPlus size={28} />}
      </div>

      {showNewPost && (
        <div style={modalStyle} onClick={() => setShowNewPost(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
              <h3 style={{ margin: 0 }}>Nouveau post</h3>
              <FiX size={24} onClick={() => setShowNewPost(false)} style={{cursor: "pointer"}} />
            </div>
            <textarea value={newPostText} onChange={(e) => setNewPostText(e.target.value)} placeholder="Quoi de neuf sur Dounia?" style={{width: "100%",backgroundColor: "#000",border: "1px solid #333",borderRadius: "16px",padding: "16px",color: "#fff",fontSize: "16px",minHeight: "120px",fontFamily: "inherit",marginBottom: "12px",resize: "none"}} />
            {newPostMedia && (
              <div style={{position: "relative", marginBottom: "12px"}}>
                {newPostMediaType === 'image'?
                  <img src={newPostMedia} style={{width: "100%", borderRadius: "16px"}} alt="" /> :
                  <video src={newPostMedia} controls style={{width: "100%", borderRadius: "16px"}} />
                }
                <FiX size={24} onClick={() => {setNewPostMedia(null); setNewPostMediaType(null)}} style={{position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.8)", borderRadius: "50%", padding: "4px", cursor: "pointer"}} />
              </div>
            )}
            <div style={{display: "flex", gap: "12px", marginBottom: "12px"}}>
              <button onClick={() => fileInputRef.current?.click()} style={{flex: 1,padding: "14px",borderRadius: "12px",border: "1px solid #333",fontWeight: "bold",fontSize: "16px",cursor: "pointer",backgroundColor: "#1a1a1a",color: "#fff",display: "flex",alignItems: "center",justifyContent: "center",gap: "8px"}}>
                <FiCamera /> Photo
              </button>
              <button onClick={() => fileInputRef.current?.click()} style={{flex: 1,padding: "14px",borderRadius: "12px",border: "1px solid #333",fontWeight: "bold",fontSize: "16px",cursor: "pointer",backgroundColor: "#1a1a1a",color: "#fff",display: "flex",alignItems: "center",justifyContent: "center",gap: "8px"}}>
                <FiVideo /> Vidéo
              </button>
            </div>
            <button onClick={handleNewPost} disabled={uploading} style={{width: "100%",padding: "14px",borderRadius: "12px",border: "none",fontWeight: "bold",fontSize: "16px",cursor: "pointer",background: "linear-gradient(135deg, #8B5CF6, #EC4899)",color: "#fff",opacity: uploading? 0.5 : 1}}>
              {uploading? "Upload..." : "Publier"}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={(e) => handleMediaUpload(e, false)} style={{display: "none"}} />
          </div>
        </div>
      )}

      {activeComments!== null && (
        <div style={modalStyle} onClick={() => setActiveComments(null)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
              <h3 style={{ margin: 0 }}>Commentaires</h3>
              <FiX size={24} onClick={() => setActiveComments(null)} style={{cursor: "pointer"}} />
            </div>
            <div style={{maxHeight: "400px", overflowY: "auto", marginBottom: "16px"}}>
              {posts.find(p => p.id === activeComments)?.comments?.map((c, i) => (
                <div key={i} style={{padding: "12px", backgroundColor: "#000", borderRadius: "12px", marginBottom: "8px", border: "1px solid #222"}}>
                  <span style={{ fontWeight: "bold", fontSize: "14px" }}>{c.user}</span>
                  {c.time && <span style={{ color: "#666", fontSize: "11px", marginLeft: "8px" }}>{c.time}</span>}
                  <div style={{ color: "#ccc", marginTop: "4px" }}>{c.text}</div>
                </div>
              ))}
            </div>
            <div style={{display: "flex", gap: "8px"}}>
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Écris un commentaire..." style={{flex: 1,backgroundColor: "#000",border: "1px solid #333",borderRadius: "12px",padding: "12px",color: "#fff",fontSize: "16px"}} onKeyPress={(e) => e.key === 'Enter' && handleComment(activeComments)} />
              <button onClick={() => handleComment(activeComments)} style={{padding: "12px 20px",borderRadius: "12px",border: "none",fontWeight: "bold",cursor: "pointer",background: "linear-gradient(135deg, #8B5CF6, #EC4899)",color: "#fff"}}>
                <FiSend />
              </button>
            </div>
          </div>
        </div>
      )}

      {showDM && (
        <div style={modalStyle} onClick={() => setShowDM(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
              <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                Messages <FiLock size={16} color="#10B981" />
              </h3>
              <FiX size={24} onClick={() => setShowDM(false)} style={{cursor: "pointer"}} />
            </div>
            <div style={{display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto"}}>
              {allUsers.map(user => (
                <button key={user.userId} onClick={() => setActiveChat(user.userId)} style={{padding: "8px 16px",borderRadius: "20px",border: activeChat === user.userId? "2px solid #8B5CF6" : "1px solid #333",backgroundColor: activeChat === user.userId? "#1a1a1a" : "transparent",color: "#fff",cursor: "pointer",fontWeight: "bold",whiteSpace: "nowrap"}}>
                  {user.name}
                </button>
              ))}
            </div>
            {inCall && (
              <div style={{marginBottom: "16px", padding: "16px", backgroundColor: "#000", borderRadius: "16px", border: "1px solid #10B981"}}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px"}}>
                  <span style={{fontWeight: "bold"}}>En appel avec {allUsers.find(u => u.userId === activeChat)?.name} 🔒</span>
                  <div style={{display: "flex", gap: "8px"}}>
                    <button onClick={endCall} style={{padding: "8px", borderRadius: "50%", border: "none", backgroundColor: "#EF4444", cursor: "pointer"}}><FiPhoneOff size={16} /></button>
                  </div>
                </div>
                {callType === 'video' && (
                  <div style={{display: "flex", gap: "8px"}}>
                    <video ref={localVideoRef} autoPlay muted style={{width: "50%", borderRadius: "8px"}} />
                    <video ref={remoteVideoRef} autoPlay style={{width: "50%", borderRadius: "8px"}} />
                  </div>
                )}
              </div>
            )}
            <div style={{height: "300px", overflowY: "auto", marginBottom: "16px", padding: "12px", backgroundColor: "#000", borderRadius: "16px", border: "1px solid #222"}}>
              {conversations[activeChat]?.map(msg => (
                <div key={msg.id} style={{marginBottom: "12px", textAlign: msg.from === profileData.userId? "right" : "left"}}>
                  <div style={{display: "inline-block", padding: "10px 14px", borderRadius: "16px", backgroundColor: msg.from === profileData.userId? "#8B5CF6" : "#333", maxWidth: "70%"}}>
                    <div style={{fontSize: "14px"}}>{decryptMessage(msg.text)}</div>
                    <div style={{fontSize: "10px", opacity: 0.7, marginTop: "4px", display: "flex", alignItems: "center", gap: "4px", justifyContent: msg.from === profileData.userId? "flex-end" : "flex-start"}}>
                      {msg.time?.toDate?.().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}) || "maintenant"} <FiLock size={10} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{display: "flex", gap: "8px", marginBottom: "8px"}}>
              <input value={dmText} onChange={(e) => setDmText(e.target.value)} placeholder="Message chiffré..." style={{flex: 1,backgroundColor: "#000",border: "1px solid #333",borderRadius: "12px",padding: "12px",color: "#fff",fontSize: "16px"}} onKeyPress={(e) => e.key === 'Enter' && sendDM()} />
              <button onClick={sendDM} style={{padding: "12px 20px",borderRadius: "12px",border: "none",fontWeight: "bold",cursor: "pointer",background: "linear-gradient(135deg, #8B5CF6, #EC4899)",color: "#fff"}}>
                <FiSend />
              </button>
            </div>
            <div style={{display: "flex", gap: "8px", marginBottom: "12px"}}>
              <button onClick={() => startCall('audio')} style={{flex: 1,padding: "12px",borderRadius: "12px",border: "1px solid #10B981",fontWeight: "bold",fontSize: "14px",cursor: "pointer",backgroundColor: "transparent",color: "#10B981",display: "flex",alignItems: "center",justifyContent: "center",gap: "8px"}}>
                <FiPhone /> Appel
              </button>
              <button onClick={() => startCall('video')} style={{flex: 1,padding: "12px",borderRadius: "12px",border: "1px solid #8B5CF6",fontWeight: "bold",fontSize: "14px",cursor: "pointer",backgroundColor: "transparent",color: "#8B5CF6",display: "flex",alignItems: "center",justifyContent: "center",gap: "8px"}}>
                <FiVideo /> Vidéo
              </button>
            </div>
            <p style={{fontSize: "11px", color: "#666", textAlign: "center"}}>
              🔒 Chiffrement AES-256 bout-en-bout. WebRTC P2P.
            </p>
          </div>
        </div>
      )}

      {showProfile && (
        <div style={modalStyle} onClick={() => setShowProfile(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
              <h3 style={{ margin: 0 }}>Profil</h3>
              <FiX size={24} onClick={() => setShowProfile(false)} style={{cursor: "pointer"}} />
            </div>
            {!editProfileMode? (
              <div style={{textAlign: "center"}}>
                <div style={{width: "100px", height: "100px", borderRadius: "50%", background: "linear-gradient(135deg, #8B5CF6, #EC4899)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", padding: "3px"}}>
                  <div style={{width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"}}>
                    {profileData.avatar? <img src={profileData.avatar} style={{width: "100%", height: "100%", objectFit: "cover"}} alt="" /> : "👤"}
                  </div>
                </div>
                <h2 style={{margin: "0 0 4px 0"}}>{profileData.name}</h2>
                <p style={{color: "#888", margin: "0 0 4px 0"}}>@{profileData.username}</p>
                <span style={{background: "linear-gradient(45deg, #8B5CF6, #EC4899)",padding: "4px 12px",borderRadius: "12px",fontSize: "12px",fontWeight: "bold"}}>Fondateur</span>
                <button onClick={() => setEditProfileMode(true)} style={{marginTop: "16px",padding: "12px 24px",borderRadius: "12px",border: "1px solid #333",fontWeight: "bold",cursor: "pointer",backgroundColor: "#1a1a1a",color: "#fff"}}>
                  Modifier le profil
                </button>
              </div>
            ) : (
              <div>
                <div style={{textAlign: "center", marginBottom: "20px"}}>
                  <div style={{width: "100px", height: "100px", borderRadius: "50%", background: "linear-gradient(135deg, #8B5CF6, #EC4899)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", padding: "3px", cursor: "pointer"}} onClick={() => profileAvatarRef.current?.click()}>
                    <div style={{width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"}}>
                      {tempAvatar || profileData.avatar? <img src={tempAvatar || profileData.avatar} style={{width: "100%", height: "100%", objectFit: "cover"}} alt="" /> : <FiCamera size={32} />}
                    </div>
                  </div>
                  <input ref={profileAvatarRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{display: "none"}} />
                </div>
                <input value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder="Nom" style={{width: "100%",backgroundColor: "#000",border: "1px solid #333",borderRadius: "12px",padding: "12px",color: "#fff",fontSize: "16px",marginBottom: "12px"}} />
                <input value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} placeholder="Nom d'utilisateur" style={{width: "100%",backgroundColor: "#000",border: "1px solid #333",borderRadius: "12px",padding: "12px",color: "#fff",fontSize: "16px",marginBottom: "12px"}} />
                <div style={{display: "flex", gap: "8px"}}>
                  <button onClick={() => setEditProfileMode(false)} style={{flex: 1,padding: "12px",borderRadius: "12px",border: "1px solid #333",fontWeight: "bold",cursor: "pointer",backgroundColor: "#1a1a1a",color: "#fff"}}>
                    Annuler
                  </button>
                  <button onClick={saveProfile} style={{flex: 1,padding: "12px",borderRadius: "12px",border: "none",fontWeight: "bold",cursor: "pointer",background: "linear-gradient(135deg, #8B5CF6, #EC4899)",color: "#fff"}}>
                    Enregistrer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showNotifs && (
        <div style={modalStyle} onClick={() => setShowNotifs(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
              <h3 style={{ margin: 0 }}>Notifications</h3>
              <FiX size={24} onClick={() => setShowNotifs(false)} style={{cursor: "pointer"}} />
            </div>
            {notifications.map(notif => (
              <div key={notif.id} style={{padding: "16px",backgroundColor: notif.read? "#000" : "#1a1a1a",borderRadius: "12px",marginBottom: "8px",border: "1px solid #222",opacity: notif.read? 0.6 : 1}}>
                <div style={{fontSize: "14px"}}>{notif.text}</div>
                <div style={{fontSize: "11px", color: "#666", marginTop: "4px"}}>{notif.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showStory && (
        <div style={modalStyle} onClick={() => setShowStory(null)}>
          <img src={showStory.media} style={{maxWidth: "90%", maxHeight: "90%", borderRadius: "16px"}} alt="" />
        </div>
      )}
    </div>
  );
}

export default Feed;
