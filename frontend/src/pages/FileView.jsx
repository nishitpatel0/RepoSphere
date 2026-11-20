import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./FileView.css";

export default function FileView() {
  const { id, fileId } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/files/${fileId}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load file");
        }

        setFile(data);
        setEditedContent(data.content || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [fileId]);

  const handleCopy = () => {
    const content = isEditing ? editedContent : file?.content;

    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const handleEdit = () => {
    setEditedContent(file.content || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedContent(file.content || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/files/${fileId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: editedContent,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save file");
      }

      setFile(data);
      setEditedContent(data.content || "");
      setIsEditing(false);

      alert("File saved successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/files/${fileId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete file");
      }

      alert("File deleted successfully!");

      navigate(`/repository/${id}?tab=files`, {
        state: { tab: "Files" },
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBackToFiles = () => {
    navigate(`/repository/${id}?tab=files`, {
      state: { tab: "Files" },
    });
  };

  if (loading) {
    return (
      <div className="file-view-status">
        <div className="view-loader"></div>
        <p>Fetching file secure streams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="file-view-status error-state">
        <div className="error-icon">⚠️</div>
        <h2>Could not retrieve file</h2>
        <p>{error}</p>

        <button onClick={handleBackToFiles}>← Back to Files</button>
      </div>
    );
  }

  const currentContent = isEditing ? editedContent : file.content || "";

  const codeLines = currentContent.split("\n");

  return (
    <div className="file-view-page">
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

      <main className="file-view-container">
        <div className="file-top-nav">
          <button className="file-back-btn" onClick={handleBackToFiles}>
            ← Back to Files
          </button>

          <div className="breadcrumb-path">
            <span onClick={() => navigate("/dashboard")}>Workspace</span>

            <span>/</span>

            <span onClick={() => navigate("/dashboard")}>My Repositories</span>

            <span>/</span>

            <span onClick={handleBackToFiles}>Files</span>

            <span>/</span>

            <span className="current-path">
              {file.path ? `${file.path}/` : ""}
              {file.name}
            </span>
          </div>
        </div>

        <section className="file-meta-card">
          <div className="file-meta-left">
            <div className="file-main-icon">📄</div>

            <div>
              <div className="file-name-row">
                <h1>{file.name}</h1>

                <span className="lang-pill">
                  {file.language || "Plain Text"}
                </span>
              </div>

              <p className="file-path-sub">Path: {file.path || "root"}</p>
            </div>
          </div>

          <div className="file-meta-right">
            <div className="meta-info-item">
              <span>Updated</span>

              <strong>
                {file.updatedAt
                  ? new Date(file.updatedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </strong>
            </div>

            <div className="meta-info-item">
              <span>Size</span>

              <strong>
                {currentContent
                  ? `${(currentContent.length / 1024).toFixed(2)} KB`
                  : "0 KB"}
              </strong>
            </div>

            <button className="download-raw-btn" onClick={handleCopy}>
              📋 {copied ? "Copied" : "Raw"}
            </button>
          </div>
        </section>

        <div className="file-editor">
          <div className="editor-topbar">
            <div className="editor-file-name">
              <span className="file-sub-icon">📄</span>

              <strong>{file.name}</strong>

              <span className="file-size-badge">
                {codeLines.length} line
                {codeLines.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="editor-actions">
              <span className="editor-language">
                {file.language || "Plain Text"}
              </span>

              {!isEditing ? (
                <>
                  <button
                    className="editor-action-btn"
                    onClick={handleCopy}
                    title="Copy code"
                  >
                    {copied ? "✓ Copied" : "📋 Copy"}
                  </button>

                  <button
                    className="editor-action-btn edit-btn"
                    onClick={handleEdit}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className="editor-action-btn delete-btn"
                    onClick={handleDelete}
                  >
                    🗑️ Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="editor-action-btn cancel-btn"
                    onClick={handleCancelEdit}
                  >
                    ✕ Cancel
                  </button>

                  <button
                    className="editor-action-btn save-btn"
                    onClick={handleSave}
                  >
                    💾 Save
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="editor-workspace">
            <div className="line-numbers">
              {codeLines.map((_, index) => (
                <div key={index} className="line-num-item">
                  {index + 1}
                </div>
              ))}
            </div>

            <div className="editor-body">
              {isEditing ? (
                <textarea
                  className="file-code-editor"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  spellCheck="false"
                />
              ) : (
                <pre className="file-code">
                  <code>
                    {file.content || (
                      <span className="empty-text">// This file is empty.</span>
                    )}
                  </code>
                </pre>
              )}
            </div>
          </div>
        </div>

        <footer className="file-view-footer">
          <div className="footer-left">
            <span>Path: {file.path || "/"}</span>

            <span className="dot-divider">•</span>

            <span>Lines: {codeLines.length}</span>
          </div>

          <div className="footer-right">
            <span>Encoding: UTF-8</span>

            <span className="dot-divider">•</span>

            <span>
              Last update:{" "}
              {file.updatedAt
                ? new Date(file.updatedAt).toLocaleDateString("en-IN")
                : "N/A"}
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
