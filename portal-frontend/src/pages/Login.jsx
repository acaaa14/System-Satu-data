import { useState } from "react"
import axios from "axios"
import API_BASE_URL from "../utils/api"
import "../styles/pages/login.css"

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = () => {
    axios
      .post(`${API_BASE_URL}/api/login`, {
        username,
        password,
      })
      .then((res) => {
        localStorage.setItem("token", res.data.token)
        alert("Login berhasil")
        window.location.href = "/admin"
      })
      .catch(() => {
        alert("Login gagal")
      })
  }

  return (
    <section className="login-page">
      <div className="login-card">
        <h2 className="login-card__title">Login Admin</h2>

        <input
          className="form-control"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="form-control"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn btn-primary" onClick={handleLogin}>
          Login
        </button>
      </div>
    </section>
  )
}

export default Login
