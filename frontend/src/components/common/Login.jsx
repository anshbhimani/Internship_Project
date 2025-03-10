import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie
import { API_BASE_URL } from "../../App";

export const Login = ({ setUserRole }) => {
  const [email, setEmail] = useState("");  
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      });

      if (response.data.role) {
        setUserRole(response.data.role);
        
        // Save userId to cookies with 60-minute expiration
        Cookies.set('userId', response.data.user_id, { expires: 1/24 });
        Cookies.set('role', response.data.role, { expires: 1/24 });
        

        navigate(`/profile/${response.data.role}`);
      } else {
        alert("Login failed: Role not assigned");
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.detail || "Invalid credentials!");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="text"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>
    </div>
  );
};
