import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../App";
import "./Login.css"; // Ensure you have the correct styles

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
        Cookies.set("userId", response.data.user_id, { expires: 1 / 24 });
        Cookies.set("role", response.data.role, { expires: 1 / 24 });
        Cookies.set("name", response.data.name, { expires: 1 / 24 });
        navigate(`/profile/${response.data.role}?tab=home`);
      } else {
        alert("Login failed: Role not assigned");
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.detail || "Invalid credentials!");
    }
  };

  return (
    <div className="login-container">
      <div className="overlay">
        <form onSubmit={handleLogin}>
          <div className="con">
            <header className="head-form">
              <h2>Log In</h2>
              <p>Login here using your email and password</p>
            </header>
            <br />
            <div className="field-set">
              <span className="input-item">
                <i className="fa fa-user-circle" />
              </span>
              <input
                className="form-input"
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <br />
              <span className="input-item">
                <i className="fa fa-key" />
              </span>
              <input
                className="form-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span>
                <i className="fa fa-eye" aria-hidden="true" type="button" id="eye" />
              </span>
              <br />
              <button type="submit" className="log-in"> Log In </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
