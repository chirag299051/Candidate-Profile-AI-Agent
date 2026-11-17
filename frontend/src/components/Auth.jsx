
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import "./Auth.css";
function Auth({ onAuthSuccess }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const resetToken = searchParams.get("token");
  const [mode, setMode] = useState(resetToken ? "reset" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setSuccess("");
    setPassword("");
    setSearchParams({});
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (mode === "forgot") {
        const response = await api.post("/password/forgot", { email });
        setSuccess(response.data.message);
      } else if (mode === "reset") {
        const response = await api.post("/password/reset", {
          token: resetToken,
          password
        });
        setSuccess(response.data.message);
        setPassword("");
      } else {
        const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
        const payload = mode === "login"
          ? { email, password }
          : { name, email, password };
        const response = await api.post(endpoint, payload);
        onAuthSuccess(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = () => {
    window.location.href = `${api.defaults.baseURL}/auth/google`;
  };
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Candidate Profile AI Agent</h1>
        <p className="auth-subtitle">
          {mode === "forgot"
            ? "Enter your email to receive a password reset link."
            : mode === "reset"
              ? "Choose a new password for your account."
              : "Sign in to explore the candidate profile with AI."}
        </p>
        {mode === "login" || mode === "register" ? (
          <div className="auth-tabs">
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => changeMode("login")}
              type="button"
            >
              Login
            </button>
            <button
              className={mode === "register" ? "active" : ""}
              onClick={() => changeMode("register")}
              type="button"
            >
              Register
            </button>
          </div>
        ) : null}
        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          )}
          {mode !== "reset" && (
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
          {(mode === "login" || mode === "register" || mode === "reset") && (
            <input
              type="password"
              placeholder={mode === "reset" ? "New password (minimum 8 characters)" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              maxLength={128}
            />
          )}
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "forgot"
                ? "Send Reset Link"
                : mode === "reset"
                  ? "Reset Password"
                  : mode === "login"
                    ? "Login"
                    : "Create Account"}
          </button>
        </form>
        {mode === "login" && (
          <button
            className="auth-text-button"
            type="button"
            onClick={() => changeMode("forgot")}
          >
            Forgot Password?
          </button>
        )}
        {mode === "forgot" && (
          <button
            className="auth-text-button"
            type="button"
            onClick={() => changeMode("login")}
          >
            Back to Login
          </button>
        )}
        {mode === "reset" && success && (
          <button
            className="auth-text-button"
            type="button"
            onClick={() => changeMode("login")}
          >
            Return to Login
          </button>
        )}
        {(mode === "login" || mode === "register") && (
          <>
            <div className="auth-divider">
              <span>OR</span>
            </div>
            <button
              className="google-button"
              type="button"
              onClick={handleGoogleLogin}
            >
              Continue with Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}
export default Auth;
