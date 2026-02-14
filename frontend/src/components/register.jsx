import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import "../styles/register.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Signup failed");
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/login");

    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false); 
    }
  };


  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/google",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            credential: credentialResponse.credential,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Google login failed");
        return;
      }

      localStorage.setItem("token", data.token);
     
      navigate("/bot");

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
      <div className="auth-left register-bg"></div>

      <div className="auth-right">
        <form className="form-box" onSubmit={handleSignup}>
          <h2>Register</h2>

          <div className="input-group">
            <FaUser className="icon" />
            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
            {loading ? "Creating..." : "Register"}
          </button>

          <div style={{ margin: "20px 0", textAlign: "center" }}>
            <p style={{ color: "#aaa", marginBottom: "12px" }}>or</p>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              size="large"
              text="signup_with"
              shape="pill"
              disabled={googleLoading}
            />
          </div>
           

          <p className="switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
