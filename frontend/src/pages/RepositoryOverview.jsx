import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { supabase } from "../supabase";
import "./RepositoryOverview.css";

export default function RepositoryOverview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialTab = () => {
    const tab = searchParams.get("tab");

    if (tab === "files" || location.state?.tab === "Files") {
      return "Files";
    }

    if (tab === "commits") {
      return "Commits";
    }

    return "Overview";
  };

  const [repository, setRepository] = useState(null);
  const [files, setFiles] = useState([]);
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [showAddFile, setShowAddFile] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState(null);

  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileLanguage, setFileLanguage] = useState("");
  const [filePath, setFilePath] = useState("");

  const [fileMessage, setFileMessage] = useState("");
  const [fileError, setFileError] = useState("");
  const [savingFile, setSavingFile] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab === "files") {
      setActiveTab("Files");
    } else if (tab === "commits") {
      setActiveTab("Commits");
    } else if (location.state?.tab === "Files") {
      setActiveTab("Files");
    }
  }, [searchParams, location.state]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (tab === "Files") {
      setSearchParams({ tab: "files" });
    } else if (tab === "Commits") {
      setSearchParams({ tab: "commits" });
    } else {
      setSearchParams({});
    }
  };

  useEffect(() => {
    const fetchRepository = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/repositories/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load repository");
        }

        setRepository(data.repository);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRepository();
  }, [id, navigate]);

  const fetchFiles = async () => {
    try {
      setFilesLoading(true);
      setFileError("");

      const response = await fetch(
        `http://localhost:5000/api/files/repository/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load files");
      }

      setFiles(data);
    } catch (err) {
      setFileError(err.message);
    } finally {
      setFilesLoading(false);
    }
  };

  const fetchCommits = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/commits/repository/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load commits");
      }

      setCommits(data.commits || []);
    } catch (err) {
      console.error("Failed to load commits:", err);
      setCommits([]);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [id]);

  useEffect(() => {
    fetchCommits();
  }, [id]);

  const handleAddFile = async (e) => {
    e.preventDefault();

    setFileMessage("");
    setFileError("");

    if (!fileName.trim()) {
      setFileError("File name is required");
      return;
    }

    try {
      setSavingFile(true);

      const response = await fetch("http://localhost:5000/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repositoryId: id,
          name: fileName.trim(),
          path: filePath.trim(),
          content: fileContent,
          language: fileLanguage.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create file");
      }

      setFileMessage("File created successfully");
      setFileName("");
      setFilePath("");
      setFileContent("");
      setFileLanguage("");
      setShowAddFile(false);

      await fetchFiles();
    } catch (err) {
      setFileError(err.message);
    } finally {
      setSavingFile(false);
    }
  };

  if (loading) {
    return (
      <div className="repo-loading">
        <div className="repo-loader"></div>
        <p>Initializing Secure Workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="repo-error-page">
        <div className="repo-error-box">
          <h2>Repository not found</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!repository) return null;

  const healthChecks = {
    readme: files.some((file) => file.name.toLowerCase() === "readme.md"),
    description: Boolean(repository.description?.trim()),
    activity: files.length > 0,
    stars: 0,
    profile: 0,
  };

  const languageCounts = {};

  files.forEach((file) => {
    const language = file.language?.trim() || "Plain Text";
    languageCounts[language] = (languageCounts[language] || 0) + 1;
  });

  const languageEntries = Object.entries(languageCounts);
  const totalLanguageFiles = files.length;

  const languagePercentages = languageEntries.map(([language, count]) => ({
    language,
    percentage:
      totalLanguageFiles > 0
        ? Math.round((count / totalLanguageFiles) * 100)
        : 0,
  }));

  const healthScore =
    (healthChecks.readme ? 25 : 0) +
    (healthChecks.description ? 20 : 0) +
    (healthChecks.activity ? 20 : 0) +
    15 +
    20;

  const healthSuggestions = [];

  if (!healthChecks.readme) {
    healthSuggestions.push("Add a README.md file");
  }

  if (!healthChecks.description) {
    healthSuggestions.push("Add a repository description");
  }

  if (!healthChecks.activity) {
    healthSuggestions.push("Add files to increase repository activity");
  }

  const finalHealthScore = Math.min(healthScore, 100);

  const createdDate = new Date(repository.createdAt).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

  return (
    <div className="repo-page">
      <div className="bg-ambient-glow glow-purple"></div>
      <div className="bg-ambient-glow glow-cyan"></div>

      <header className="repo-topbar">
        <div className="repo-brand" onClick={() => navigate("/dashboard")}>
          Repo<span>Sphere</span>
        </div>

        <div className="repo-top-actions">
          <div className="status-badge">
            <span className="pulse-dot"></span>
            Secure Workspace
          </div>

          <div className="repo-user-pill">
            <div className="repo-avatar">N</div>
            <strong>Nishit Patel</strong>
          </div>
        </div>
      </header>

      <main className="repo-main">
        <div className="repo-breadcrumb">
          <button onClick={() => navigate("/dashboard")}>Workspace</button>

          <span>/</span>

          <button onClick={() => navigate("/dashboard")}>
            My Repositories
          </button>

          <span>/</span>

          <strong>{repository.name}</strong>
        </div>

        <section className="repo-header-card">
          <div className="repo-header-top">
            <div className="repo-title-row">
              <div className="repo-folder-icon">▰</div>

              <div>
                <div className="repo-title">
                  <h1>{repository.name}</h1>

                  <span className="badge-outline">
                    {repository.visibility || "Public"}
                  </span>

                  <span className="badge-active">
                    <span className="pulse-dot"></span>
                    Active
                  </span>
                </div>

                <p className="repo-subtitle">
                  {repository.description ||
                    "No description provided for this repository."}
                </p>
              </div>
            </div>

            <div className="repo-header-buttons"></div>
          </div>

          <div className="repo-tabs-wrapper">
            <nav className="repo-tabs">
              {[
                "Overview",
                "Files",
                "Commits",
                "Branches",
                "Collaborators",
                "Settings",
              ].map((tab) => (
                <button
                  key={tab}
                  className={activeTab === tab ? "active" : ""}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab}
                </button>
              ))}
            </nav>

            <div className="collaborators-stack">
              <span>Collaborators</span>

              <div className="avatar-group">
                <div
                  className="mini-avatar"
                  style={{ background: "#6366f1" }}
                >
                  N
                  <span className="online-indicator"></span>
                </div>

                <div
                  className="mini-avatar"
                  style={{ background: "#06b6d4" }}
                >
                  A
                  <span className="online-indicator"></span>
                </div>

                <div
                  className="mini-avatar"
                  style={{ background: "#ec4899" }}
                >
                  R
                  <span className="online-indicator"></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {activeTab === "Overview" && (
          <section className="repo-grid">
            <div className="repo-left">
              <div className="repo-panel">
                <h2>About</h2>

                <p className="repo-about">
                  {repository.description ||
                    "A repository created with RepoSphere."}
                </p>

                <div className="wave-graph-box">
                  <svg viewBox="0 0 600 110" className="wave-svg">
                    <defs>
                      <linearGradient
                        id="neonLine"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>

                      <linearGradient
                        id="neonArea"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="rgba(6, 182, 212, 0.35)"
                        />
                        <stop
                          offset="100%"
                          stopColor="rgba(6, 182, 212, 0)"
                        />
                      </linearGradient>
                    </defs>

                    <path
                      d="M0,80 Q50,20 100,70 T200,50 T300,85 T400,30 T500,75 T600,40 L600,110 L0,110 Z"
                      fill="url(#neonArea)"
                    />

                    <path
                      d="M0,80 Q50,20 100,70 T200,50 T300,85 T400,30 T500,75 T600,40"
                      fill="none"
                      stroke="url(#neonLine)"
                      strokeWidth="3"
                      className="glowing-stroke"
                    />

                    <circle
                      cx="100"
                      cy="70"
                      r="4"
                      fill="#fff"
                      className="node-dot"
                    />

                    <circle
                      cx="200"
                      cy="50"
                      r="4"
                      fill="#fff"
                      className="node-dot"
                    />

                    <circle
                      cx="400"
                      cy="30"
                      r="4"
                      fill="#fff"
                      className="node-dot"
                    />

                    <circle
                      cx="500"
                      cy="75"
                      r="4"
                      fill="#fff"
                      className="node-dot"
                    />
                  </svg>

                  <div className="branch-overlay">
                    <span>Default Branch</span>
                    <strong>main</strong>
                  </div>
                </div>

                <div className="repo-info-list">
                  <div className="info-card">
                    <span>Total Commits</span>

                    <strong>
                      {commits.length}{" "}
                      <small className="trend-up">
                        {commits.length > 0 ? "↑ Active" : ""}
                      </small>
                    </strong>
                  </div>

                  <div className="info-card">
                    <span>Primary Language</span>

                    <strong>
                      <span className="lang-dot"></span>
                      {repository.language || "JavaScript"}
                    </strong>
                  </div>

                  <div className="info-card">
                    <span>Created On</span>

                    <strong>{createdDate}</strong>
                  </div>

                  <div className="info-card">
                    <span>Language Breakdown</span>

                    {languagePercentages.length === 0 ? (
                      <div className="lang-labels">
                        <span>No files</span>
                      </div>
                    ) : (
                      <div className="lang-bar-wrapper">
                        <div className="lang-bar">
                          {languagePercentages.map((item, index) => (
                            <div
                              key={item.language}
                              className={
                                index % 2 === 0 ? "bar-js" : "bar-css"
                              }
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          ))}
                        </div>

                        <div className="lang-labels">
                          {languagePercentages.map((item) => (
                            <span key={item.language}>
                              {item.language} {item.percentage}%
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="repo-panel">
                <div className="repo-panel-heading">
                  <div>
                    <h2>Commit History</h2>
                    <p>Recent commits in this repository.</p>
                  </div>

                  <span className="commit-count">
                    {commits.length} Commits
                  </span>
                </div>

                {commits.length === 0 ? (
                  <div className="empty-activity">
                    <div className="activity-icon">⚡</div>

                    <h3>No Commits Yet</h3>

                    <p>
                      Create your first commit to see commit history here.
                    </p>
                  </div>
                ) : (
                  <div className="commit-history">
                    {commits.map((commit) => (
                      <div className="commit-item" key={commit._id}>
                        <div className="commit-icon">✓</div>

                        <div className="commit-details">
                          <h3>{commit.message}</h3>

                          <div className="commit-meta">
                            <span>
                              👤{" "}
                              {commit.author?.username ||
                                commit.author ||
                                "Unknown"}
                            </span>

                            <span>
                              📅{" "}
                              {new Date(
                                commit.createdAt || commit.updatedAt
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="repo-right">
              <div className="repo-panel quick-actions">
                <h2>Quick Actions</h2>

                <button onClick={() => navigate(`/repository/${id}/ide`)}>
                  <span className="qa-icon purple-icon">⌘</span>

                  <div>
                    <strong>Open in IDE</strong>
                    <small>Open this repository in your editor</small>
                  </div>

                  <b>›</b>
                </button>

                <button
                  onClick={() => {
                    handleTabChange("Files");
                    setShowAddFile(true);
                  }}
                >
                  <span className="qa-icon cyan-icon">＋</span>

                  <div>
                    <strong>Add File</strong>
                    <small>Create a new file</small>
                  </div>

                  <b>›</b>
                </button>

                <button onClick={() => handleTabChange("Files")}>
                  <span className="qa-icon blue-icon">↑</span>

                  <div>
                    <strong>Upload File</strong>
                    <small>Upload files to repository</small>
                  </div>

                  <b>›</b>
                </button>

                <button>
                  <span className="qa-icon pink-icon">⑂</span>

                  <div>
                    <strong>Clone Repository</strong>
                    <small>Clone this repository</small>
                  </div>

                  <b>›</b>
                </button>
              </div>

              <div className="repo-panel">
                <h2>Live Event Feed</h2>

                <div className="live-feed-list">
                  <div className="feed-item">
                    <span className="feed-dot cyan"></span>

                    <div>
                      <p>
                        Workspace initialized by <strong>Nishit</strong>
                      </p>

                      <small>Just now</small>
                    </div>
                  </div>

                  <div className="feed-item">
                    <span className="feed-dot purple"></span>

                    <div>
                      <p>
                        Branch <strong>main</strong> created
                      </p>

                      <small>{createdDate}</small>
                    </div>
                  </div>
                </div>

                <div className="health-divider"></div>

                <div className="health-header">
                  <span>Repository Health</span>

                  <div className="health-score">
                    <strong>{finalHealthScore}</strong>
                    <span>/100</span>
                  </div>
                </div>

                <div className="health-progress">
                  <div
                    className="health-fill"
                    style={{ width: `${finalHealthScore}%` }}
                  ></div>
                </div>

                <div className="health-checks">
                  <div className="health-check-item">
                    <span>{healthChecks.readme ? "✓" : "⚠"}</span>

                    <p>
                      {healthChecks.readme
                        ? "README added"
                        : "Add a README.md file"}
                    </p>
                  </div>

                  <div className="health-check-item">
                    <span>{healthChecks.description ? "✓" : "⚠"}</span>

                    <p>
                      {healthChecks.description
                        ? "Description added"
                        : "Add repository description"}
                    </p>
                  </div>

                  <div className="health-check-item">
                    <span>{healthChecks.activity ? "✓" : "⚠"}</span>

                    <p>
                      {healthChecks.activity
                        ? "Repository is active"
                        : "Add files to repository"}
                    </p>
                  </div>
                </div>

                {healthSuggestions.length > 0 && (
                  <div className="health-suggestions">
                    <strong>Suggestions</strong>

                    {healthSuggestions.map((suggestion, index) => (
                      <p key={index}>• {suggestion}</p>
                    ))}
                  </div>
                )}

                <div className="health-progress">
                  <div
                    className="health-fill"
                    style={{
                      width: files.length > 0 ? "85%" : "40%",
                    }}
                  ></div>
                </div>
              </div>
            </aside>
          </section>
        )}

        {activeTab === "Files" && (
          <section className="files-section">
            <div className="repo-panel">
              <div className="files-header">
                <div>
                  <h2>Files</h2>

                  <p>
                    Manage files and source code in this repository.
                  </p>
                </div>

                <button
                  className="add-file-button"
                  onClick={() => {
                    setShowAddFile(true);
                    setFileMessage("");
                    setFileError("");
                  }}
                >
                  + Add File
                </button>
              </div>

              {fileMessage && (
                <div className="file-success">{fileMessage}</div>
              )}

              {fileError && <div className="file-error">{fileError}</div>}

              {showAddFile && (
                <form className="add-file-form" onSubmit={handleAddFile}>
                  <h3>Create New File</h3>

                  <div className="form-grid">
                    <div>
                      <label>File Name</label>

                      <input
                        type="text"
                        placeholder="Example: App.jsx"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label>File Path</label>

                      <input
                        type="text"
                        placeholder="Example: src"
                        value={filePath}
                        onChange={(e) => setFilePath(e.target.value)}
                      />
                    </div>

                    <div>
                      <label>Language</label>

                      <input
                        type="text"
                        placeholder="Example: JavaScript"
                        value={fileLanguage}
                        onChange={(e) => setFileLanguage(e.target.value)}
                      />
                    </div>
                  </div>

                  <label>File Content</label>

                  <textarea
                    rows="8"
                    placeholder="Write your code here..."
                    value={fileContent}
                    onChange={(e) => setFileContent(e.target.value)}
                  ></textarea>

                  <div className="file-form-buttons">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setShowAddFile(false)}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn-save"
                      disabled={savingFile}
                    >
                      {savingFile ? "Saving..." : "Create File"}
                    </button>
                  </div>
                </form>
              )}

              {filesLoading ? (
                <div className="files-loading">Loading files...</div>
              ) : files.length === 0 ? (
                <div className="files-empty">
                  <div className="empty-folder-icon">📁</div>

                  <h3>No files yet</h3>

                  <p>
                    Add your first file to start building this repository.
                  </p>

                  <button
                    className="add-file-button"
                    onClick={() => setShowAddFile(true)}
                  >
                    + Create First File
                  </button>
                </div>
              ) : (
                <div className="files-list">
                  <div className="files-list-header">
                    <span>Name</span>
                    <span>Language</span>
                    <span>Updated</span>
                  </div>

                  {files.map((file) => (
                    <div
                      className="file-row"
                      key={file._id}
                      onClick={() =>
                        navigate(`/repository/${id}/file/${file._id}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <div className="file-name-cell">
                        <span className="file-icon">📄</span>

                        <strong>
                          {file.path
                            ? `${file.path}/${file.name}`
                            : file.name}
                        </strong>
                      </div>

                      <span className="lang-tag">
                        {file.language || "Plain Text"}
                      </span>

                      <span className="date-cell">
                        {new Date(file.updatedAt).toLocaleDateString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "Commits" && (
          <section className="commits-section">
            <div className="repo-panel commits-panel">
              <div className="commits-header">
                <div>
                  <h2>Commit History</h2>
                  <p>All commits made in this repository.</p>
                </div>

                <span className="commit-count">
                  {commits.length}{" "}
                  {commits.length === 1 ? "Commit" : "Commits"}
                </span>
              </div>

              {commits.length === 0 ? (
                <div className="commits-empty">
                  <div className="commits-empty-icon">✓</div>

                  <h3>No Commits Yet</h3>

                  <p>
                    Create your first commit to see the commit history here.
                  </p>
                </div>
              ) : (
                <div className="commits-list">
                  {commits.map((commit) => (
                    <div
                      className="commit-card"
                      key={commit._id}
                      onClick={() => setSelectedCommit(commit)}
                    >
                      <div className="commit-card-icon">✓</div>

                      <div className="commit-card-content">
                        <h3>{commit.message}</h3>

                        <div className="commit-card-meta">
                          <span>
                            👤{" "}
                            {commit.author?.username ||
                              commit.author ||
                              "Unknown"}
                          </span>

                          <span>
                            📅{" "}
                            {new Date(
                              commit.createdAt || commit.updatedAt
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {selectedCommit && (
          <div
            className="commit-modal-overlay"
            onClick={() => setSelectedCommit(null)}
          >
            <div
              className="commit-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="commit-modal-header">
                <div>
                  <h2>Commit Details</h2>
                  <p>Commit information</p>
                </div>

                <button
                  className="commit-modal-close"
                  onClick={() => setSelectedCommit(null)}
                >
                  ×
                </button>
              </div>

              <div className="commit-detail-box">
                <span className="commit-detail-label">
                  Commit Message
                </span>

                <h3>{selectedCommit.message}</h3>
              </div>

              <div className="commit-detail-row">
                <div>
                  <span className="commit-detail-label">Author</span>

                  <p>
                    👤{" "}
                    {selectedCommit.author?.username ||
                      selectedCommit.author ||
                      "Unknown"}
                  </p>
                </div>

                <div>
                  <span className="commit-detail-label">Date</span>

                  <p>
                    📅{" "}
                    {new Date(
                      selectedCommit.createdAt ||
                        selectedCommit.updatedAt
                    ).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="commit-detail-box">
                <span className="commit-detail-label">Commit ID</span>

                <p className="commit-id">{selectedCommit._id}</p>
              </div>

              <button
                className="commit-modal-button"
                onClick={() => setSelectedCommit(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {activeTab !== "Overview" &&
          activeTab !== "Files" &&
          activeTab !== "Commits" && (
            <section className="repo-panel coming-soon-panel">
              <h2>{activeTab}</h2>

              <p>{activeTab} functionality will be connected next.</p>
            </section>
          )}
      </main>
    </div>
  );
}

