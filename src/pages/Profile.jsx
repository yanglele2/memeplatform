import React from 'react'
import { Link } from 'react-router-dom'
import { logout } from '../firebase'

function Profile({ user }) {
  return (
    <div className="profile-container">
      <h1>个人中心</h1>
      <div className="profile-info">
        <img 
          src={user.photoURL || '/default-avatar.png'} 
          alt="用户头像" 
          className="profile-avatar" 
        />
        <p>邮箱: {user.email}</p>
        <p>用户ID: {user.uid}</p>
      </div>
      <div className="profile-actions">
        <Link to="/" className="btn">返回Meme生成器</Link>
        <button onClick={logout} className="logout-btn">
          退出登录
        </button>
      </div>
    </div>
  )
}

export default Profile
