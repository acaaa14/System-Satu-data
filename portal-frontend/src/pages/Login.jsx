import { useState } from "react"
import axios from "axios"

function Login(){

  const [username,setUsername] = useState("")
  const [password,setPassword] = useState("")

  const handleLogin = () => {

    axios.post("http://localhost:8081/api/login",{
      username,
      password
    })
    .then(res=>{
      localStorage.setItem("token", res.data.token)
      alert("Login berhasil")
      window.location.href = "/admin"
    })
    .catch(()=>{
      alert("Login gagal")
    })

  }

  return(
    <div className="container mt-5">
      <h2>Login Admin</h2>

      <input
        className="form-control mb-2"
        placeholder="Username"
        onChange={(e)=>setUsername(e.target.value)}
      />

      <input
        type="password"
        className="form-control mb-2"
        placeholder="Password"
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button className="btn btn-primary" onClick={handleLogin}>
        Login
      </button>
    </div>
  )
}

export default Login