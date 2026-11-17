
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "./auth.css";
import logo from "../assets/Logo.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      navigate("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) {
        setError(error.message);
        setGoogleLoading(false);
      }
    } catch {
      setError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const forgotPassword = async () => {
    setError("");

    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        setError(error.message);
      } else {
        setError(
          "If the email is registered, a password reset link will be sent."
        );
      }
    } catch {
      setError("Unable to send the reset email. Please try again.");
    }
  };

  return (
    <main className="rs-auth">
      <section className="rs-visual">
        <Link to="/" className="rs-logo">
          <img src={logo} alt="RepoSphere Logo" className="rs-brand-icon" />
          <span>Repo<span>Sphere</span></span>
        </Link>

        <div className="rs-visual-content">
          <div className="rs-eyebrow">
            ⚡ &nbsp; YOUR DEVELOPER SPACE
          </div>

          <h1>
            Welcome <span>Back.</span>
            <br />
            Build More.
          </h1>

          <p className="rs-intro">
            Sign in to manage your repositories, showcase your projects,
            and keep collaborating with your developer community.
          </p>

          <div className="rs-features">
            <div>
              <b>&lt;/&gt;</b>
              <span>Project<br />Management</span>
            </div>

            <div>
              <b>♧</b>
              <span>Team<br />Collaboration</span>
            </div>

            <div>
              <b>▥</b>
              <span>Repository<br />Insights</span>
            </div>
          </div>

          <div className="rs-coder-art-wrap">
            <img
              className="rs-coder-art"
              src="/src/assets/coder-illustration.png"
              alt="Developer coding on a laptop"
            />
          </div>

          <div className="rs-status">
            <span>✓ Your projects</span>
            <span>✓ Your community</span>
            <span>✓ Your workspace</span>
          </div>
        </div>

        <footer className="rs-visual-footer">
          © 2026 RepoSphere · Built for developers
        </footer>
      </section>

      <section className="rs-form-side">
        <div className="rs-login-panel">
          <div className="rs-panel-header">
            <Link to="/" className="rs-logo">
              <img src={logo} alt="RepoSphere Logo" className="rs-brand-icon" />
              <span>Repo<span>Sphere</span></span>
            </Link>

            <div className="rs-signup-prompt">
              <span>New to RepoSphere?</span>
              <Link to="/signup">Create account →</Link>
            </div>
          </div>

          <header className="rs-welcome">
            <h2>Welcome Back 👋</h2>
            <p>Enter your details to access your account</p>
          </header>

          <div className="rs-oauth">
            <button
              type="button"
              onClick={googleLogin}
              disabled={googleLoading}
            >
              <svg className="rs-google-icon" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z" />
                <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.1c-1.8 1.2-4 2-6.8 2-5.2 0-9.6-3.5-11.2-8.2H5.9v5.3A20 20 0 0 0 24 44Z" />
                <path fill="#FBBC05" d="M12.8 27.8a12 12 0 0 1 0-7.6v-5.3H5.9a20 20 0 0 0 0 18.2l6.9-5.3Z" />
                <path fill="#EA4335" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.9 14.9l6.9 5.3c1.6-4.7 6-8.1 11.2-8.1Z" />
              </svg>
              {googleLoading ? "Connecting to Google..." : "Continue with Google"}
            </button>
          </div>

          <div className="rs-or">
            <span />
            OR CONTINUE WITH EMAIL
            <span />
          </div>

          <form className="rs-login-form" onSubmit={login}>
            <label htmlFor="login-email">Email address</label>

            <div className="rs-field">
              <span>✉</span>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <label htmlFor="login-password">Password</label>

            <div className="rs-field">
              <span>♙</span>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                className="rs-eye"
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="rs-login-options">
              <label className="rs-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="rs-forgot"
                onClick={forgotPassword}
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="rs-login-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="rs-login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <footer className="rs-panel-footer">
            <p>Secure access to your developer workspace.</p>
            <div>
              <Link to="/">Home</Link>
              <Link to="/signup">Create account</Link>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
