import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import RepositoryOverview from "./pages/RepositoryOverview";
import FileView from "./pages/FileView";
import CodeEditor from "./pages/CodeEditor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/repository/:id" element={<RepositoryOverview />} />
        <Route path="/repository/:id/file/:fileId" element={<FileView />}/>
        <Route path="/repository/:id/ide" element={<CodeEditor />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
