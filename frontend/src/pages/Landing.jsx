import { Link } from "react-router-dom";
import "./landing.css";
import logo from "../assets/Logo.png";

const features = [
    { icon: "⌘", title: "Code Repository", text: "Host your code, manage versions and organize projects.", color: "purple" },
    { icon: "♧", title: "Collaboration", text: "Work together with your team and build better, faster.", color: "green" },
    { icon: "⬡", title: "Health Score", text: "Track repository health and improve code quality.", color: "blue" },
    { icon: "☆", title: "Project Showcase", text: "Showcase your best work and get discovered.", color: "gold" },
    { icon: "ϟ", title: "Fast & Secure", text: "Keep your projects organized and protected.", color: "pink" },
    { icon: "▣", title: "Modern IDE", text: "Code and manage your projects in one place.", color: "indigo" },
    { icon: "☁", title: "Cloud Storage", text: "Access your project files whenever you need them.", color: "cyan" },
    { icon: "♧", title: "Developer Community", text: "Discover projects and connect with developers.", color: "violet" },
];

export default function Landing() {
    return (
        <div className="landing">
            <header className="landing-nav">
                <a className="landing-logo" href="#home">
                    <img src={logo} alt="RepoSphere Logo" className="landing-logo-img" />
                    <span>RepoSphere</span>
                </a>

                <nav className="landing-links">
                    <a className="selected" href="#home">Home</a>
                    <a href="#features">Features</a>
                    <a href="#explore">Explore</a>
                    <a href="#about">About</a>
                    <a href="#pricing">Pricing</a>
                </nav>

                <div className="landing-auth">
                    <Link className="signin-link" to="/login">Sign In</Link>
                    <Link className="nav-cta" to="/signup">Get Started</Link>
                </div>
            </header>

            <main>
                <section className="landing-hero" id="home">
                    <div className="hero-copy">
                        <div className="hero-pill">⌘ &nbsp; Build &nbsp; • &nbsp; Collaborate &nbsp; • &nbsp; Grow</div>

                        <h1>
                            Your Code.<br />
                            Your Projects.<br />
                            <span>Your Future.</span>
                        </h1>

                        <p>
                            RepoSphere is a modern platform for developers to create,
                            manage, and collaborate on projects. Build together, achieve more.
                        </p>

                        <div className="hero-buttons">
                            <Link className="primary-cta" to="/signup">🚀 Get Started Free →</Link>
                            <a className="secondary-cta" href="#explore">⌕ Explore Projects</a>
                        </div>

                        <div className="hero-note">
                            <span>✓ Easy to use</span>
                            <span>✓ Built for developers</span>
                        </div>
                    </div>

                    <div className="hero-visual" aria-label="Developer coding illustration">
                        <div className="glow-orb orb-one" />
                        <div className="glow-orb orb-two" />
                        <div className="floating-symbol symbol-one">⌘</div>
                        <div className="floating-symbol symbol-two">☁</div>
                        <div className="floating-symbol symbol-three">♧</div>

                        <div className="code-window">
                            <div className="window-bar">
                                <i /><i /><i />
                                <span>my-project</span>
                            </div>
                            <div className="code-content">
                                <div className="code-tree">
                                    <p>▾ src</p>
                                    <p>　▸ components</p>
                                    <p>　▸ pages</p>
                                    <p>　▸ utils</p>
                                    <p>　 App.jsx</p>
                                    <p>　 main.jsx</p>
                                    <p>▸ package.json</p>
                                </div>
                                <div className="code-lines">
                                    <b />
                                    <b />
                                    <b />
                                    <b />
                                    <b />
                                    <b />
                                    <b />
                                    <b />
                                    <b />
                                </div>
                            </div>
                        </div>

                        <div className="developer-card">
                            <div className="developer-head">◉</div>
                            <div className="developer-body">👨🏻‍💻</div>
                            <div className="developer-laptop">{"</>"}</div>
                        </div>
                        <div className="plant">🌿</div>
                    </div>
                </section>

                <section className="features-section" id="features">
                    <div className="section-intro">
                        <div>
                            <span className="section-label">OUR FEATURES</span>
                            <h2>Everything you need<br />for modern development</h2>
                        </div>
                        <p>
                            RepoSphere gives you the tools to manage your code, track
                            progress, and work with your team — all in one place.
                        </p>
                    </div>

                    <div className="feature-grid">
                        {features.map((feature) => (
                            <article className="feature-card" key={feature.title}>
                                <div className={`feature-icon ${feature.color}`}>{feature.icon}</div>
                                <div>
                                    <h3>{feature.title}</h3>
                                    <p>{feature.text}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="about-section" id="about">
                    <div className="about-art">
                        <div className="about-glow" />
                        <div className="about-monitor">
                            <span>⬡</span>
                            <div className="monitor-base" />
                        </div>
                        <div className="about-plant">🌱</div>
                    </div>

                    <div className="about-copy">
                        <span className="section-label">ABOUT US</span>
                        <h2>Building a Better<br />Developer Experience</h2>
                        <p>
                            RepoSphere was created with a simple mission — to make
                            development more collaborative, productive, and enjoyable.
                            We believe in the power of open source, community, and modern
                            tools to help developers turn their ideas into reality.
                        </p>

                        <div className="about-stats">
                            <div><strong>Build</strong><span>Better Projects</span></div>
                            <div><strong>Connect</strong><span>With Developers</span></div>
                            <div><strong>Grow</strong><span>Your Skills</span></div>
                        </div>
                    </div>

                    <div className="about-values">
                        <div><span>♢</span><section><h3>Our Mission</h3><p>Empower developers with simple, collaborative tools.</p></section></div>
                        <div><span>⌘</span><section><h3>Our Vision</h3><p>A global community where everyone can build and grow together.</p></section></div>
                        <div><span>♡</span><section><h3>Our Values</h3><p>Open source, collaboration, innovation and users first.</p></section></div>
                    </div>
                </section>

                <section className="explore-section" id="explore">
                    <div>
                        <span className="section-label">EXPLORE</span>
                        <h2>Discover what developers are building</h2>
                        <p>Explore projects, share ideas and get inspired by the community.</p>
                    </div>
                    <Link className="secondary-cta" to="/signup">Explore the Community →</Link>
                </section>

                <section className="pricing-section" id="pricing">
                    <span className="section-label">GET STARTED</span>
                    <h2>Your next project starts here.</h2>
                    <p>Create your account and start organizing your development journey with RepoSphere.</p>
                    <Link className="primary-cta" to="/signup">Create a Free Account →</Link>
                </section>
            </main>

            <footer className="landing-footer">

                <a className="landing-logo" href="#home">
                    <img
                        src={logo}
                        alt="RepoSphere Logo"
                        className="landing-logo-img"
                    />
                    <span>RepoSphere</span>
                </a>

                <div>
                    <a href="#home">Home</a>
                    <a href="#features">Features</a>
                    <a href="#explore">Explore</a>
                    <a href="#about">About</a>
                    <a href="#pricing">Pricing</a>
                </div>
                <p>© {new Date().getFullYear()} RepoSphere. All rights reserved.</p>
            </footer>
        </div>
    );
}
