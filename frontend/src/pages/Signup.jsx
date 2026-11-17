
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "./auth.css";
import logo from "../assets/Logo.png";
import coderIllustration from "../assets/coder-illustration.png";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const signup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.session) {
        navigate("/dashboard");
      } else {
        setSuccess(
          "Account created! Please check your email to confirm your account, then sign in."
        );
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const socialSignup = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setError(error.message);
        setGoogleLoading(false);
      }
    } catch {
      setError("Google signup failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <main className="rs-auth">
      {/* LEFT SIDE */}
      <section className="rs-visual">
        <Link to="/" className="rs-logo">
          <img
            src={logo}
            alt="RepoSphere Logo"
            className="rs-brand-icon"
          />
          <span>
            Repo<span>Sphere</span>
          </span>
        </Link>

        <div className="rs-visual-content">
          <div className="rs-eyebrow">
            ⚡ &nbsp; YOUR DEVELOPER SPACE
          </div>

          <h1>
            Build. <span>Collaborate.</span>
            <br />
            Create.
          </h1>

          <p className="rs-intro">
            Join RepoSphere to showcase your projects, collaborate
            with developers, and discover new possibilities.
          </p>

          <div className="rs-features">
            <div>
              <b>&lt;/&gt;</b>
              <span>
                Project
                <br />
                Management
              </span>
            </div>

            <div>
              <b>♧</b>
              <span>
                Team
                <br />
                Collaboration
              </span>
            </div>

            <div>
              <b>▥</b>
              <span>
                Repository
                <br />
                Insights
              </span>
            </div>
          </div>

          {/* CODING PERSON IMAGE */}
          <div className="rs-coder-art-wrap">
            <img
              className="rs-coder-art"
              src={coderIllustration}
              alt="Developer coding on a laptop"
            />
          </div>

          <div className="rs-status">
            <span>✓ Project management</span>
            <span>✓ Team collaboration</span>
            <span>✓ Repository insights</span>
          </div>
        </div>

        <footer className="rs-visual-footer">
          © 2026 RepoSphere · Built for developers
        </footer>
      </section>

      {/* RIGHT SIDE */}
      <section className="rs-form-side">
        <div className="rs-login-panel">
          <div className="rs-panel-header">
            <Link to="/" className="rs-logo">
              <img
                src={logo}
                alt="RepoSphere Logo"
                className="rs-brand-icon"
              />
              <span>
                Repo<span>Sphere</span>
              </span>
            </Link>

            <div className="rs-signup-prompt">
              <span>Already have an account?</span>
              <Link to="/login">Sign in →</Link>
            </div>
          </div>

          <header className="rs-welcome">
            <h2>Create Account 🚀</h2>
            <p>Join RepoSphere and start building together</p>
          </header>

          {/* GOOGLE SIGNUP ONLY */}
          <div className="rs-oauth">
            <button
              type="button"
              onClick={socialSignup}
              disabled={googleLoading}
            >
              <svg
                className="rs-google-icon"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z"
                />
                <path
                  fill="#34A853"
                  d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.1c-1.8 1.2-4 2-6.8 2-5.2 0-9.6-3.5-11.2-8.2H5.9v5.3A20 20 0 0 0 24 44Z"
                />
                <path
                  fill="#FBBC05"
                  d="M12.8 27.8a12 12 0 0 1 0-7.6v-5.3H5.9a20 20 0 0 0 0 18.2l6.9-5.3Z"
                />
                <path
                  fill="#EA4335"
                  d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.9 14.9l6.9 5.3c1.6-4.7 6-8.1 11.2-8.1Z"
                />
              </svg>
              {googleLoading
                ? "Connecting to Google..."
                : "Continue with Google"}
            </button>
          </div>

          <div className="rs-or">
            <span />
            OR
            <span />
          </div>

          {/* SIGNUP FORM */}
          <form className="rs-login-form" onSubmit={signup}>
            <label htmlFor="signup-name">Full name</label>
            <div className="rs-field">
              <span>♙</span>
              <input
                id="signup-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <label htmlFor="signup-email">Email address</label>
            <div className="rs-field">
              <span>✉</span>
              <input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <label htmlFor="signup-password">Password</label>
            <div className="rs-field">
              <span>♙</span>
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
              <button
                className="rs-eye"
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <label htmlFor="signup-confirm-password">
              Confirm password
            </label>
            <div className="rs-field">
              <span>♙</span>
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
              <button
                className="rs-eye"
                type="button"
                onClick={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            {error && (
              <div className="rs-login-error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="rs-login-success" role="status">
                {success}
              </div>
            )}

            <button
              className="rs-login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <footer className="rs-panel-footer">
            <p>
              By creating an account, you agree to use RepoSphere
              responsibly.
            </p>

            <div>
              <Link to="/">Terms of Service</Link>
              <Link to="/">Privacy Policy</Link>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
