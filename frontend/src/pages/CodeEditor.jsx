import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CodeEditor.css";

export default function CodeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [repository, setRepository] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [bottomTab, setBottomTab] = useState("TERMINAL");
  const [terminalLogs, setTerminalLogs] = useState([
    "$ RepoSphere IDE initialized.",
    "$ Ready to edit and commit changes.",
  ]);
  const [runOutput, setRunOutput] = useState([]);

  const [showNewModal, setShowNewModal] = useState(false);
  const [newItemType, setNewItemType] = useState("file");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPath, setNewItemPath] = useState("src");

  const [showCommitModal, setShowCommitModal] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        setLoading(true);
        const [repoRes, filesRes] = await Promise.all([
          fetch(`http://localhost:5000/api/repositories/${id}`),
          fetch(`http://localhost:5000/api/files/repository/${id}`),
        ]);

        const repoData = await repoRes.json();
        const filesData = await filesRes.json();

        if (repoRes.ok) setRepository(repoData.repository);
        if (filesRes.ok) {
          setFiles(filesData);
          if (filesData.length > 0) {
            setSelectedFile(filesData[0]);
            setCode(filesData[0].content || "");
          }
        }
      } catch (err) {
        addTerminalLog(`Error loading workspace: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadWorkspace();
  }, [id]);

  const addTerminalLog = (msg) => {
    setTerminalLogs((prev) => [...prev, `$ ${msg}`]);
  };

  const handleSelectFile = (file) => {
    setSelectedFile(file);
    setCode(file.content || "");
    setCursorPos({ line: 1, col: 1 });
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    try {
      setSaving(true);
      const response = await fetch(
        `http://localhost:5000/api/files/${selectedFile._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: selectedFile.name,
            path: selectedFile.path,
            language: selectedFile.language,
            content: code,
          }),
        }
      );

      const updated = await response.json();
      if (!response.ok) throw new Error(updated.message || "Save failed");

      setSelectedFile(updated);
      setFiles((prev) => prev.map((f) => (f._id === updated._id ? updated : f)));
      addTerminalLog(`File '${updated.name}' saved successfully.`);
    } catch (err) {
      addTerminalLog(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const finalName =
      newItemType === "folder" ? ".gitkeep" : newItemName.trim();
    const finalPath =
      newItemType === "folder"
        ? newItemName.trim()
        : newItemPath.trim();

    try {
      const response = await fetch("http://localhost:5000/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repositoryId: id,
          name: finalName,
          path: finalPath,
          content: newItemType === "folder" ? "" : `// ${finalName}\n`,
          language: finalName.split(".").pop() || "Text",
        }),
      });

      const created = await response.json();
      if (!response.ok) throw new Error(created.message || "Creation failed");

      setFiles((prev) => [...prev, created]);
      setSelectedFile(created);
      setCode(created.content || "");
      addTerminalLog(
        `Created ${newItemType}: ${finalPath ? `${finalPath}/` : ""}${finalName}`
      );
      setNewItemName("");
      setShowNewModal(false);
    } catch (err) {
      addTerminalLog(`Error: ${err.message}`);
    }
  };

  const handleCommitSubmit = async (e) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;
    await handleSave();
    addTerminalLog(`Committed to main: "${commitMessage.trim()}"`);
    setCommitMessage("");
    setShowCommitModal(false);
  };

  const handleRunCode = () => {
    setBottomTab("OUTPUT");
    const logs = [];
    const customConsole = {
      log: (...args) => logs.push(args.map((a) => String(a)).join(" ")),
      error: (...args) => logs.push("Error: " + args.map((a) => String(a)).join(" ")),
    };

    try {
      const fn = new Function("console", code);
      fn(customConsole);
      if (logs.length === 0) logs.push("Process exited with code 0 (No output).");
    } catch (err) {
      logs.push(`Runtime Error: ${err.message}`);
    }
    setRunOutput(logs);
  };

  const updateCursorPosition = (e) => {
    const textBefore = e.target.value.substring(0, e.target.selectionStart);
    const lines = textBefore.split("\n");
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    });
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const updated = code.substring(0, start) + "    " + code.substring(end);
      setCode(updated);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const extractOutlineFunctions = (sourceCode) => {
    const regex = /function\s+([a-zA-Z0-9_$]+\s*\([^)]*\))|const\s+([a-zA-Z0-9_$]+)\s*=\s*\([^)]*\)\s*=>/g;
    const matches = [];
    let match;
    while ((match = regex.exec(sourceCode)) !== null) {
      matches.push(match[1] || `${match[2]}()`);
    }
    return matches;
  };

  if (loading) {
    return (
      <div className="ide-full-loading">
        <div className="ide-spinner"></div>
        <p>Loading RepoSphere IDE...</p>
      </div>
    );
  }

  const outlineFunctions = extractOutlineFunctions(code);
  const totalLines = (code || "").split("\n").length;

  return (
    <div className="rs-ide-page">
      <header className="rs-ide-topbar">
        <div className="rs-ide-left-nav">
          <button
            className="rs-ide-back"
            onClick={() => navigate(`/repository/${id}`)}
          >
            ← Overview
          </button>
          <div className="rs-ide-breadcrumbs">
            <span className="repo-pill">📁 {repository?.name || "Repository"}</span>
            {selectedFile?.path && (
              <>
                <span>/</span>
                <span>{selectedFile.path}</span>
              </>
            )}
            {selectedFile && (
              <>
                <span>/</span>
                <strong>{selectedFile.name}</strong>
              </>
            )}
          </div>
        </div>

        <div className="rs-ide-git-actions">
          <button className="git-btn primary-save" onClick={handleSave} disabled={saving}>
            💾 {saving ? "Saving..." : "Save"}
          </button>
          <button
            className="git-btn"
            onClick={() => addTerminalLog(`Staged ${selectedFile?.name || "changes"} for commit.`)}
          >
            ＋ Add
          </button>
          <button className="git-btn" onClick={() => setShowCommitModal(true)}>
            ✓ Commit
          </button>
          <button
            className="git-btn"
            onClick={() => addTerminalLog("Already up to date with origin/main.")}
          >
            ↓ Pull
          </button>
          <button
            className="git-btn accent-push"
            onClick={() => addTerminalLog("Pushed commits to origin/main successfully.")}
          >
            ↑ Push
          </button>
          <button className="git-btn run-code-btn" onClick={handleRunCode}>
            ▶ Run
          </button>
        </div>
      </header>

      <div className="rs-ide-body">
        <aside className="rs-ide-explorer">
          <div className="panel-title">EXPLORER</div>
          <div className="explorer-repo-name">
            ▾ {(repository?.name || "PROJECT").toUpperCase()}
          </div>

          <div className="explorer-tree">
            {files.map((file) => (
              <div
                key={file._id}
                className={`tree-file-row ${
                  selectedFile?._id === file._id ? "active" : ""
                }`}
                onClick={() => handleSelectFile(file)}
              >
                <span className="file-icon">📄</span>
                <span className="file-label">
                  {file.path ? `${file.path}/${file.name}` : file.name}
                </span>
              </div>
            ))}
          </div>

          <div className="explorer-footer-btns">
            <button
              onClick={() => {
                setNewItemType("file");
                setShowNewModal(true);
              }}
            >
              + New File
            </button>
            <button
              onClick={() => {
                setNewItemType("folder");
                setShowNewModal(true);
              }}
            >
              + New Folder
            </button>
          </div>
        </aside>

        <main className="rs-ide-center">
          <div className="editor-tabs-bar">
            {selectedFile && (
              <div className="open-file-tab">
                <span>📄 {selectedFile.name}</span>
                <span className="tab-close">×</span>
              </div>
            )}
          </div>

          <div className="code-area-wrapper">
            <div className="code-gutter">
              {Array.from({ length: totalLines }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            <textarea
              className="code-textarea"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                updateCursorPosition(e);
              }}
              onClick={updateCursorPosition}
              onKeyUp={updateCursorPosition}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              placeholder="// Start coding here..."
            />
          </div>

          <div className="editor-statusbar">
            <span>Ready</span>
            <div className="statusbar-right">
              <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
              <span>Spaces: 4</span>
              <span>UTF-8</span>
              <span>{selectedFile?.language || "JavaScript"}</span>
            </div>
          </div>

          <div className="rs-ide-bottom-panel">
            <div className="bottom-tabs">
              {["TERMINAL", "PROBLEMS", "OUTPUT"].map((tab) => (
                <button
                  key={tab}
                  className={bottomTab === tab ? "active" : ""}
                  onClick={() => setBottomTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="bottom-content">
              {bottomTab === "TERMINAL" &&
                terminalLogs.map((log, i) => (
                  <div key={i} className="log-row">
                    {log}
                  </div>
                ))}

              {bottomTab === "PROBLEMS" && (
                <div className="log-row muted">No problems have been detected in the workspace.</div>
              )}

              {bottomTab === "OUTPUT" &&
                (runOutput.length === 0 ? (
                  <div className="log-row muted">Click "▶ Run" in the top bar to see output.</div>
                ) : (
                  runOutput.map((out, i) => (
                    <div key={i} className="log-row output-highlight">
                      &gt; {out}
                    </div>
                  ))
                ))}
            </div>
          </div>
        </main>

        <aside className="rs-ide-outline">
          <div className="panel-title">OUTLINE</div>
          <div className="outline-list">
            {outlineFunctions.length === 0 ? (
              <div className="outline-empty">No functions detected</div>
            ) : (
              outlineFunctions.map((fn, idx) => (
                <div key={idx} className="outline-item">
                  <span className="fn-badge">ƒ</span>
                  <span>{fn}</span>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {showNewModal && (
        <div className="ide-modal-backdrop">
          <form className="ide-modal" onSubmit={handleCreateItem}>
            <h3>Create New {newItemType === "file" ? "File" : "Folder"}</h3>
            <label>{newItemType === "file" ? "File Name" : "Folder Name"}</label>
            <input
              type="text"
              placeholder={newItemType === "file" ? "e.g. calculator.js" : "e.g. utils"}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              autoFocus
            />
            {newItemType === "file" && (
              <>
                <label>Folder Path (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. src"
                  value={newItemPath}
                  onChange={(e) => setNewItemPath(e.target.value)}
                />
              </>
            )}
            <div className="modal-btns">
              <button type="button" onClick={() => setShowNewModal(false)}>
                Cancel
              </button>
              <button type="submit" className="confirm-btn">
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {showCommitModal && (
        <div className="ide-modal-backdrop">
          <form className="ide-modal" onSubmit={handleCommitSubmit}>
            <h3>Commit Changes to main</h3>
            <label>Commit Message</label>
            <input
              type="text"
              placeholder="Update functions and improve structure"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              autoFocus
            />
            <div className="modal-btns">
              <button type="button" onClick={() => setShowCommitModal(false)}>
                Cancel
              </button>
              <button type="submit" className="confirm-btn">
                Commit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}