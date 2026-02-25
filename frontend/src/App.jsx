import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';

// Layout
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';

// Pages
import Login from './pages/auth/Login';
import Home from './pages/Home';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import DSA from './pages/practice/DSA';
import Behavioral from './pages/practice/Behavioral';
import SystemDesign from './pages/practice/SystemDesign';
import MockInterview from './pages/practice/MockInterview';
import ResumeATS from './pages/resume/ResumeATS';
import Community from './pages/community/Community';
import Roles from './pages/practice/Roles';
import RoleDetail from './pages/practice/RoleDetail';
import VoiceEval from './pages/practice/VoiceEval';
import CodingPlatforms from './pages/practice/CodingPlatforms';
import Profile from './pages/profile/Profile';
import QuestionGenerator from './pages/practice/QuestionGenerator';
import History from './pages/dashboard/History';
import Leaderboard from './pages/dashboard/Leaderboard';
import Badges from './pages/dashboard/Badges';
import TextEval from './pages/practice/TextEval';
import EvaluationReport from './pages/reports/EvaluationReport';
import Tracker from './pages/dashboard/Tracker';
import VocabularyCoach from './pages/practice/VocabularyCoach';
import CompanyPrep from './pages/practice/CompanyPrep';
import PostDetail from './pages/community/PostDetail';

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Home />} />

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
        <Route path="/badges" element={<Protected><AppLayout><Badges /></AppLayout></Protected>} />
        <Route path="/text-eval" element={<Protected><AppLayout><TextEval /></AppLayout></Protected>} />
        <Route path="/tracker" element={<Protected><AppLayout><Tracker /></AppLayout></Protected>} />
        <Route path="/vocabulary" element={<Protected><AppLayout><VocabularyCoach /></AppLayout></Protected>} />
        <Route path="/company-prep" element={<Protected><AppLayout><CompanyPrep /></AppLayout></Protected>} />
        <Route path="/community/post/:id" element={<Protected><AppLayout><PostDetail /></AppLayout></Protected>} />
        <Route path="/evaluation/:id" element={<Protected><AppLayout><EvaluationReport /></AppLayout></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
