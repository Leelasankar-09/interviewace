import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';

// Layout
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DSA from './pages/DSA';
import Behavioral from './pages/Behavioral';
import SystemDesign from './pages/SystemDesign';
import MockInterview from './pages/MockInterview';
import ResumeATS from './pages/ResumeATS';
import Community from './pages/Community';
import Roles from './pages/Roles';
import RoleDetail from './pages/RoleDetail';
import VoiceEval from './pages/VoiceEval';
import CodingPlatforms from './pages/CodingPlatforms';
import Profile from './pages/Profile';
import QuestionGenerator from './pages/QuestionGenerator';
import History from './pages/History';
import Leaderboard from './pages/Leaderboard';

// Protected Route
const Protected = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// App Layout (with sidebar)
const AppLayout = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Topbar />
      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem', paddingTop: '1.5rem' }}>
        {children}
      </main>
    </div>
  </div>
);

function App() {
  const { theme } = useThemeStore();

  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={theme === 'light' ? 'light' : 'dark'}
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected */}
        <Route path="/dashboard" element={<Protected><AppLayout><Dashboard /></AppLayout></Protected>} />
        <Route path="/dsa" element={<Protected><AppLayout><DSA /></AppLayout></Protected>} />
        <Route path="/behavioral" element={<Protected><AppLayout><Behavioral /></AppLayout></Protected>} />
        <Route path="/system-design" element={<Protected><AppLayout><SystemDesign /></AppLayout></Protected>} />
        <Route path="/mock" element={<Protected><AppLayout><MockInterview /></AppLayout></Protected>} />
        <Route path="/resume" element={<Protected><AppLayout><ResumeATS /></AppLayout></Protected>} />
        <Route path="/community" element={<Protected><AppLayout><Community /></AppLayout></Protected>} />
        <Route path="/roles" element={<Protected><AppLayout><Roles /></AppLayout></Protected>} />
        <Route path="/roles/:roleId" element={<Protected><AppLayout><RoleDetail /></AppLayout></Protected>} />
        <Route path="/voice-eval" element={<Protected><AppLayout><VoiceEval /></AppLayout></Protected>} />
        <Route path="/platforms" element={<Protected><AppLayout><CodingPlatforms /></AppLayout></Protected>} />
        <Route path="/profile" element={<Protected><AppLayout><Profile /></AppLayout></Protected>} />
        <Route path="/questions" element={<Protected><AppLayout><QuestionGenerator /></AppLayout></Protected>} />
        <Route path="/history" element={<Protected><AppLayout><History /></AppLayout></Protected>} />
        <Route path="/leaderboard" element={<Protected><AppLayout><Leaderboard /></AppLayout></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
