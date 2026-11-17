import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import logo from "../assets/Logo.png";
import "./Dashboard.css";

const navigation = [
  { name: "Dashboard", icon: "⌂" },
  { name: "My Repositories", icon: "▰" },
  { name: "Shared with me", icon: "⇄" },
  { name: "Starred", icon: "☆" },
  { name: "Project Showcase", icon: "▦" },
  { name: "Health Score", icon: "♡" },
  { name: "Collaborations", icon: "⚇" },
  { name: "Settings", icon: "⚙" },
];

function Dashboard() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("Dashboard");
  const [activeTab, setActiveTab] = useState("Overview");
  const [timeframe, setTimeframe] = useState("6M");
  const [repositories, setRepositories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [menuRepository, setMenuRepository] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    language: "JavaScript",
    visibility: "Private",
  });

  useEffect(() => {
    loadUser();
  }, []);

  const showNotice = (message) => {
    setNotice(message);
    setTimeout(() => {
      setNotice("");
    }, 3000);
  };

  const loadUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;

      if (!user) {
        navigate("/login");
        return;
      }

      setCurrentUser(user);
      await fetchRepositories(user);
    } catch (error) {
      console.error(error);
      showNotice("Unable to load user.");
      setLoading(false);
    }
  };

  const getOwner = (user) => {
    if (!user) return "";
    return "nishit-patel";
  };

  const fetchRepositories = async (user = currentUser) => {
    try {
      setLoading(true);
      if (!user) return;

      const owner = getOwner(user);
      const response = await fetch(
        `http://localhost:5000/api/repositories?owner=${encodeURIComponent(
          owner,
        )}`,
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load repositories");
      }

      setRepositories(data.repositories || []);
    } catch (error) {
      console.error(error);
      showNotice("Failed to load repositories.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setForm({
      name: "",
      description: "",
      language: "JavaScript",
      visibility: "Private",
    });
    setFormError("");
    setShowModal(true);
  };

  const createRepository = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Repository name is required.");
      return;
    }

    if (!currentUser) {
      setFormError("User session not found. Please login again.");
      return;
    }

    try {
      setFormLoading(true);
      const owner = getOwner(currentUser);

      const response = await fetch("http://localhost:5000/api/repositories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || "No description added yet.",
          language: form.language,
          visibility: form.visibility,
          initializeReadme: false,
          owner,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Repository creation failed.");
      }

      setShowModal(false);
      setActivePage("My Repositories");
      showNotice("Repository created successfully.");
      await fetchRepositories(currentUser);
    } catch (error) {
      console.error(error);
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const deleteRepository = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/repositories/${id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Repository deletion failed.");
      }

      setRepositories((current) =>
        current.filter((repository) => repository._id !== id),
      );
      setMenuRepository(null);
      showNotice("Repository deleted successfully.");
    } catch (error) {
      console.error(error);
      showNotice(error.message);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error) {
      console.error(error);
      showNotice("Logout failed.");
    }
  };

  const filteredRepositories = repositories.filter((repository) => {
    const name = repository.name || "";
    const description = repository.description || "";

    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      description.toLowerCase().includes(search.toLowerCase());

    if (activePage === "Starred") return false;
    if (activePage === "Project Showcase") return false;
    if (activePage === "Shared with me") return false;

    return matchesSearch;
  });

  const pageTitle = {
    Dashboard: "Recent Repositories",
    "My Repositories": "My Repositories",
    "Shared with me": "Shared Repositories",
    Starred: "Starred Repositories",
    "Project Showcase": "Project Showcase",
    "Health Score": "Repository Health",
    Collaborations: "Collaborations",
    Settings: "Workspace Settings",
  };

  const displayName =
    currentUser?.user_metadata?.full_name ||
    currentUser?.user_metadata?.name ||
    "Nishit Patel";

  const metrics = [
    {
      tag: "REPO",
      label: "Repositories",
      value: repositories.length,
      trend: "+1 active",
      trendType: "positive",
    },
    {
      tag: "TEAM",
      label: "Collaborators",
      value: "0",
      trend: "Invite team",
      trendType: "neutral",
    },
    {
      tag: "GIT",
      label: "Total Commits",
      value: "0",
      trend: "Ready to push",
      trendType: "neutral",
    },
    {
      tag: "STAR",
      label: "Showcase",
      value: "0",
      trend: "Feature work",
      trendType: "accent",
    },
  ];

  return (
    <div className="rs-app">
      {/* LEFT SIDEBAR */}
      <aside className="rs-sidebar">
        <div className="rs-sidebar-top">
          <button
            className="rs-brand"
            onClick={() => setActivePage("Dashboard")}
          >
            <img src={logo} alt="RepoSphere" className="rs-brand-logo" />

            <span className="rs-brand-text">
              Repo<span>Sphere</span>
            </span>
          </button>

          <div className="rs-nav-heading">WORKSPACE</div>

          <nav className="rs-navigation">
            {navigation.map((item) => (
              <button
                key={item.name}
                className={`rs-nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => setActivePage(item.name)}
              >
                <span className="rs-nav-icon">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="rs-sidebar-bottom">
          <button className="rs-logout" onClick={logout}>
            <span>⇥</span> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT SHELL */}
      <main className="rs-main">
        {/* TOP HEADER */}
        <header className="rs-topbar">
          <div className="rs-welcome-header">
            <h1>
              Welcome, <span>{displayName}</span>
            </h1>
            <p>Here&apos;s your workspace &amp; repository overview</p>
          </div>

          <div className="rs-topbar-right">
            <span className="rs-secure">
              <span className="rs-status-dot" />
              Secure Workspace
            </span>

            <button
              className="rs-icon-circle"
              aria-label="Notifications"
              onClick={() => showNotice("You are all caught up.")}
            >
              🔔
              <span className="rs-notif-dot" />
            </button>

            <button
              className="rs-icon-circle"
              aria-label="Settings"
              onClick={() => setActivePage("Settings")}
            >
              ⚙
            </button>

            <div
              className="rs-user-pill"
              onClick={() => setActivePage("Settings")}
            >
              <div className="rs-top-avatar">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="rs-user-meta">
                <strong>{displayName}</strong>
                <span>{currentUser?.email || "nishitjp@outlook.com"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* PILL SUB-TABS & SEARCH BAR */}
        <div className="rs-subbar">
          <div className="rs-pill-tabs">
            {["Overview", "Repositories", "AI Tools"].map((tab) => (
              <button
                key={tab}
                className={`rs-pill-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "Repositories") setActivePage("My Repositories");
                  if (tab === "Overview") setActivePage("Dashboard");
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="rs-search-pill">
            <span className="rs-sparkle">✦</span>
            <input
              type="search"
              placeholder="Search repositories or ask RepoSphere..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {notice && <div className="rs-toast">{notice}</div>}

        {/* DASHBOARD BENTO GRID VIEW */}
        {activePage === "Dashboard" ? (
          <>
            <div className="rs-bento-grid">
              {/* COLUMN 1: Workspace Score + Purple Glow Create Card */}
              <div className="rs-bento-col">
                <div className="rs-card rs-score-card">
                  <div className="rs-card-top">
                    <span className="rs-card-label">Workspace Score</span>
                    <span className="rs-pill-badge">98% Healthy</span>
                  </div>
                  <div className="rs-score-value">
                    <h2>
                      {repositories.length}{" "}
                      {repositories.length === 1 ? "Repo" : "Repos"}
                    </h2>
                    <span className="rs-trend-up">+100% this week</span>
                  </div>
                </div>

                <div className="rs-card rs-glow-card">
                  <div>
                    <h3>Build Faster with AI</h3>
                    <p>
                      Initialize a new repository with smart templates,
                      automated health checks &amp; team sync.
                    </p>
                  </div>
                  <button className="rs-glow-button" onClick={openCreateModal}>
                    ＋ Create New Repository
                  </button>
                </div>
              </div>

              {/* COLUMN 2: Recent Repositories Card (Helios Watchlist Style) */}
              <div className="rs-card rs-watchlist-card">
                <div className="rs-card-header">
                  <h3>Recent Repositories</h3>
                  <div className="rs-filter-pills">
                    <span className="active">Active</span>
                    <span>Public</span>
                  </div>
                </div>

                <div className="rs-repo-items">
                  {loading ? (
                    <p className="rs-muted-text">Loading repositories...</p>
                  ) : filteredRepositories.length === 0 ? (
                    <div className="rs-mini-empty">
                      <p>No repositories found</p>
                      <button
                        className="rs-glow-button"
                        onClick={openCreateModal}
                      >
                        ＋ New Repository
                      </button>
                    </div>
                  ) : (
                    filteredRepositories.slice(0, 3).map((repository) => (
                      <div className="rs-watchlist-item" key={repository._id}>
                        <div
                          className="rs-watchlist-left"
                          onClick={() =>
                            navigate(`/repository/${repository._id}`)
                          }
                        >
                          <div className="rs-lang-badge">
                            {(repository.language || "JS")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <strong>{repository.name}</strong>
                            <span>
                              {repository.description} ·{" "}
                              {repository.createdAt
                                ? new Date(
                                    repository.createdAt,
                                  ).toLocaleDateString("en-IN")
                                : "Recently"}
                            </span>
                          </div>
                        </div>

                        <div className="rs-watchlist-right">
                          <span className="rs-vis-tag">
                            {repository.visibility || "Public"}
                          </span>
                          <div className="rs-repo-menu-wrap">
                            <button
                              className="rs-repo-menu"
                              aria-label={`Options for ${repository.name}`}
                              onClick={() =>
                                setMenuRepository(
                                  menuRepository === repository._id
                                    ? null
                                    : repository._id,
                                )
                              }
                            >
                              ⋮
                            </button>

                            {menuRepository === repository._id && (
                              <div className="rs-dropdown">
                                <button
                                  onClick={() =>
                                    navigate(`/repository/${repository._id}`)
                                  }
                                >
                                  View repository
                                </button>
                                <button
                                  onClick={() => {
                                    setMenuRepository(null);
                                    showNotice(
                                      `${repository.name} selected for editing.`,
                                    );
                                  }}
                                >
                                  Edit details
                                </button>
                                <button
                                  className="rs-delete-action"
                                  onClick={() =>
                                    deleteRepository(repository._id)
                                  }
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  <button className="rs-add-dashed" onClick={openCreateModal}>
                    <span>＋</span> Add another project
                  </button>
                </div>

                <button
                  className="rs-card-footer-btn"
                  onClick={() => setActivePage("My Repositories")}
                >
                  View All Repositories →
                </button>
              </div>

              {/* COLUMN 3: 2x2 Workspace Metrics (Helios My Portfolio Style) */}
              <div className="rs-card rs-metrics-card">
                <div className="rs-card-header">
                  <h3>Workspace Metrics</h3>
                  <button
                    className="rs-see-all-pill"
                    onClick={() => setActivePage("My Repositories")}
                  >
                    See all ↗
                  </button>
                </div>

                <div className="rs-metrics-grid">
                  {metrics.map((m) => (
                    <div className="rs-metric-box" key={m.label}>
                      <div>
                        <strong>{m.value}</strong>
                        <span className={`rs-metric-sub ${m.trendType}`}>
                          {m.trend}
                        </span>
                      </div>
                      <div className="rs-metric-bottom">
                        <span className="rs-metric-tag">{m.tag}</span>
                        <span className="rs-metric-name">{m.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BOTTOM ACTIVITY CHART CARD */}
            <section className="rs-card rs-chart-card">
              <div className="rs-card-header">
                <div>
                  <h3>Commit &amp; Contribution Activity</h3>
                  <p className="rs-card-sub">
                    Code frequency across your workspace
                  </p>
                </div>

                <div className="rs-time-pills">
                  {["1D", "1W", "1M", "6M", "1Y"].map((tf) => (
                    <button
                      key={tf}
                      className={timeframe === tf ? "active" : ""}
                      onClick={() => setTimeframe(tf)}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rs-svg-chart-wrap">
                <svg
                  viewBox="0 0 800 170"
                  className="rs-svg-chart"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="heliosPurpleGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#a855f7"
                        stopOpacity="0.35"
                      />
                      <stop
                        offset="100%"
                        stopColor="#a855f7"
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,125 Q120,85 240,110 T480,75 T660,55 T800,35 L800,170 L0,170 Z"
                    fill="url(#heliosPurpleGrad)"
                  />
                  <path
                    d="M0,125 Q120,85 240,110 T480,75 T660,55 T800,35"
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="2.5"
                  />
                  <line
                    x1="480"
                    y1="75"
                    x2="480"
                    y2="170"
                    stroke="#a855f7"
                    strokeDasharray="4 4"
                    strokeOpacity="0.5"
                  />
                  <circle
                    cx="480"
                    cy="75"
                    r="5"
                    fill="#f3e8ff"
                    stroke="#a855f7"
                    strokeWidth="3"
                  />
                </svg>

                <div className="rs-chart-tooltip">
                  <span>17 Nov 2026</span>
                  <div>
                    <strong>{repositories.length} Active Repo</strong>
                    <em>+24%</em>
                  </div>
                </div>
              </div>

              <div className="rs-chart-axis">
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
              </div>
            </section>
          </>
        ) : (
          /* SUB-PAGES VIEW (My Repositories, Health Score, Settings, etc.) */
          <section className="rs-card rs-subpage-panel">
            <div className="rs-card-header">
              <div>
                <h2>{pageTitle[activePage] || activePage}</h2>
                <p className="rs-card-sub">
                  Explore and manage your repositories in one place.
                </p>
              </div>
              <button className="rs-glow-button" onClick={openCreateModal}>
                ＋ Create Repository
              </button>
            </div>

            {activePage === "Health Score" ? (
              <div className="rs-empty-state">
                <div className="rs-health-circle">
                  <strong>98%</strong>
                  <span>/ 100</span>
                </div>
                <h3>Repository Health Score</h3>
                <p>
                  Your workspace health is calculated based on README,
                  descriptions, and activity.
                </p>
              </div>
            ) : activePage === "Collaborations" ||
              activePage === "Shared with me" ? (
              <div className="rs-empty-state">
                <div className="rs-empty-icon">⚇</div>
                <h3>No collaborations yet</h3>
                <p>Shared projects and team members will appear here.</p>
              </div>
            ) : activePage === "Project Showcase" ||
              activePage === "Starred" ? (
              <div className="rs-empty-state">
                <div className="rs-empty-icon">
                  {activePage === "Starred" ? "☆" : "▦"}
                </div>
                <h3>
                  {activePage === "Starred"
                    ? "No starred repositories"
                    : "Explore the Project Showcase"}
                </h3>
                <p>
                  {activePage === "Starred"
                    ? "Repositories you star will appear here."
                    : "Feature your best projects to showcase them to others."}
                </p>
              </div>
            ) : activePage === "Settings" ? (
              <div className="rs-settings-content">
                <div className="rs-settings-avatar">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <h3>Workspace Profile</h3>
                <label className="rs-form-label">
                  Display name
                  <input value={displayName} readOnly />
                </label>
                <label className="rs-form-label">
                  Email address
                  <input
                    value={currentUser?.email || "nishitjp@outlook.com"}
                    readOnly
                  />
                </label>
              </div>
            ) : (
              <div className="rs-repo-items">
                {loading ? (
                  <p className="rs-muted-text">Loading repositories...</p>
                ) : filteredRepositories.length === 0 ? (
                  <div className="rs-empty-state">
                    <h3>No repositories found</h3>
                    <p>Create a repository or try another search.</p>
                    <button
                      className="rs-glow-button"
                      onClick={openCreateModal}
                    >
                      ＋ New Repository
                    </button>
                  </div>
                ) : (
                  filteredRepositories.map((repository) => (
                    <div className="rs-watchlist-item" key={repository._id}>
                      <div
                        className="rs-watchlist-left"
                        onClick={() =>
                          navigate(`/repository/${repository._id}`)
                        }
                      >
                        <div className="rs-lang-badge">
                          {(repository.language || "JS")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <strong>{repository.name}</strong>
                          <span>
                            {repository.description} ·{" "}
                            {repository.language || "Other"} ·{" "}
                            {repository.createdAt
                              ? new Date(
                                  repository.createdAt,
                                ).toLocaleDateString("en-IN")
                              : "Recently"}
                          </span>
                        </div>
                      </div>

                      <div className="rs-watchlist-right">
                        <span className="rs-vis-tag">
                          {repository.visibility || "Public"}
                        </span>
                        <div className="rs-repo-menu-wrap">
                          <button
                            className="rs-repo-menu"
                            onClick={() =>
                              setMenuRepository(
                                menuRepository === repository._id
                                  ? null
                                  : repository._id,
                              )
                            }
                          >
                            ⋮
                          </button>
                          {menuRepository === repository._id && (
                            <div className="rs-dropdown">
                              <button
                                onClick={() =>
                                  navigate(`/repository/${repository._id}`)
                                }
                              >
                                View repository
                              </button>
                              <button
                                className="rs-delete-action"
                                onClick={() => deleteRepository(repository._id)}
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        )}

        <footer className="rs-footer">
          <span>© 2026 RepoSphere</span>
          <span>
            Built for developers <b>♥</b>
          </span>
        </footer>
      </main>

      {/* CREATE REPOSITORY MODAL */}
      {showModal && (
        <div
          className="rs-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <form className="rs-modal" onSubmit={createRepository}>
            <div className="rs-modal-heading">
              <div>
                <div className="rs-eyebrow">NEW PROJECT</div>
                <h2>Create Repository</h2>
                <p>Set up a home for your project and code.</p>
              </div>

              <button
                type="button"
                className="rs-modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            {formError && <div className="rs-form-error">{formError}</div>}

            <label className="rs-form-label">
              Repository name
              <input
                autoFocus
                required
                maxLength={80}
                placeholder="e.g. my-awesome-project"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </label>

            <label className="rs-form-label">
              Description
              <textarea
                rows={3}
                maxLength={300}
                placeholder="What are you building?"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </label>

            <label className="rs-form-label">
              Primary language
              <select
                value={form.language}
                onChange={(event) =>
                  setForm({ ...form, language: event.target.value })
                }
              >
                <option>JavaScript</option>
                <option>TypeScript</option>
                <option>React</option>
                <option>Node.js</option>
                <option>Python</option>
                <option>Java</option>
                <option>PHP</option>
                <option>Kotlin</option>
                <option>HTML/CSS</option>
                <option>Other</option>
              </select>
            </label>

            <div className="rs-form-label">
              Visibility
              <div className="rs-visibility-options">
                {["Private", "Public"].map((visibility) => (
                  <button
                    type="button"
                    key={visibility}
                    className={`rs-visibility-option ${
                      form.visibility === visibility ? "selected" : ""
                    }`}
                    onClick={() => setForm({ ...form, visibility })}
                  >
                    <span>{visibility === "Private" ? "♙" : "◎"}</span>
                    <span>
                      <strong>{visibility}</strong>
                      <small>
                        {visibility === "Private"
                          ? "Only you can access"
                          : "Visible to everyone"}
                      </small>
                    </span>
                    <span className="rs-radio-mark">
                      {form.visibility === visibility ? "●" : "○"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rs-modal-actions">
              <button
                type="button"
                className="rs-cancel-button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rs-glow-button"
                disabled={formLoading}
              >
                {formLoading ? "Creating..." : "Create Repository →"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
