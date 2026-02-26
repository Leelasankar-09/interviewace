import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import { useEffect } from 'react';

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

// Protected Route Component
const Protected = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Apple-inspired App Layout
const AppLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-10 py-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toastTheme = theme === 'dark' || theme === 'glass' ? 'dark' : 'light';

  return (
    <BrowserRouter>
      <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
        {/* Apple Shifting Gradient Background */}
        <div className="absolute inset-0 opacity-40 dark:opacity-20 animate-pulse-slow bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[100px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        theme={toastTheme}
        toastClassName="glass !rounded-2xl !bg-black/80 !text-white !border-white/10"
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
