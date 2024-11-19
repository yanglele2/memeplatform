import React, { useState } from 'react'
import { 
  registerWithEmailAndPassword, 
  loginWithEmailAndPassword, 
  signInWithGoogle 
} from '../firebase'

function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      if (isRegister) {
        await registerWithEmailAndPassword(email, password)
      } else {
        await loginWithEmailAndPassword(email, password)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isRegister ? '注册' : '登录'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="邮箱" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="密码" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            minLength="6"
          />
          <button type="submit">
            {isRegister ? '注册' : '登录'}
          </button>
        </form>
        
        <div className="login-actions">
          <button 
            className="toggle-btn" 
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
          
          <button 
            className="google-login-btn" 
            onClick={handleGoogleLogin}
          >
            <img 
              src="/google-logo.svg" 
              alt="Google Logo" 
            /> 
            使用Google登录
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
