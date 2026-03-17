import { useEffect } from "react"

function Admin(){

  useEffect(()=>{
    const token = localStorage.getItem("token")

    if(!token){
      window.location.href = "/login"
    }
  },[])

  return(
    <div className="container mt-5">
      <h2>Dashboard Admin</h2>

      <p>Kelola dataset di sini</p>
    </div>
  )
}

export default Admin