
import React, { useState } from "react";
// import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import "./login.css";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const BASEURL = import.meta.env.VITE_BASEURL;
  const logo = '/logo.png';

  const formHandler = async (e) => {
    e.preventDefault();
    try {
      const api = await axios.post(`${BASEURL}/auth/admin_login`, {
        email,
        password
      });
      setMessage(api.data.message);
      if (api.data.status) {
        localStorage.setItem("token", api.data.data);
        navigate("/dashboard/student");
      }
      
      setMessage(api.data.message);
    } 
    catch (error) {
      setMessage(error.response.data.message);
    }
  };

  return (
    <div className="form_box">
      <div className="logo">
        <img src={logo} alt="" />
        <h1>Khuddam Admin Portal</h1>
      </div>
      <form>
        <input
          type="email"
          placeholder="Enter Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="btnLogin"
          onClick={formHandler}
        >
          Go
        </button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Login;
