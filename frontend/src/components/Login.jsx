import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import "../styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        return alert(data.message || "Something went wrong");
      }

      localStorage.setItem("token", data.token);
      setEmail("");
      setPassword("");

      setTimeout(() => {
        if (data.user?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/bot");
        }
      }, 500);
    } catch (error) {
      console.log(error);
      alert("Server error");
      setLoading(false);
    }
  }


  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Google login failed");
        setGoogleLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      alert("Google login successful!");

      setTimeout(() => {
        if (data.user?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/bot");
        }
      }, 500);
    } catch (err) {
      console.error("Google login error:", err);
      alert("Something went wrong with Google login");
    } finally {
      setGoogleLoading(false);
    }
  };

  
  const handleGoogleFailure = () => {
    alert("Google login cancelled or failed");
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
      </div>

      <div className="auth-right">
        <form className="form-box" onSubmit={handleSubmit}>
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to continue</p>

          <div className="input-group">
            <FaEnvelope className="icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="botton">
            {loading ? "Signing in..." : "Login"}
          </button>

          <div style={{ margin: "20px 0", textAlign: "center" }}>
            <p style={{ color: "#aaa", marginBottom: "12px" }}> or  </p>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              useOneTap
              size="large"
              text="signin_with"
              shape="pill"
              logo_alignment="left"
           
              disabled={googleLoading}
            />
          </div>

          <p className="switch">
            Don’t have an account? <Link to="/signup">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}