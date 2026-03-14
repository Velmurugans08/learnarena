import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AiMentor from "./components/AiMentor";
import AuthPage from "./pages/AuthPage";
import BattleArena from "./pages/BattleArena";
import BattleResults from "./pages/BattleResults";
import CodingChallenge from "./pages/CodingChallenge";
import Dashboard from "./pages/Dashboard";
import IntroScreen from "./pages/IntroScreen";
import LandingPage from "./pages/LandingPage";
import Leaderboard from "./pages/Leaderboard";
import McqChallenge from "./pages/McqChallenge";
import TempleRunGame from "./pages/TempleRunGame";
import WorldMap from "./pages/WorldMap";
import WorldPage from "./pages/WorldPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const userId = localStorage.getItem("learnarena_userId");
  if (!userId) return <Navigate to="/auth" replace />;
  return (
    <>
      {children}
      <AiMentor />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IntroScreen />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/world-map"
          element={
            <ProtectedRoute>
              <WorldMap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/world/:worldId"
          element={
            <ProtectedRoute>
              <WorldPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/world/:worldId/mcq"
          element={
            <ProtectedRoute>
              <McqChallenge />
            </ProtectedRoute>
          }
        />
        <Route
          path="/world/:worldId/code"
          element={
            <ProtectedRoute>
              <CodingChallenge />
            </ProtectedRoute>
          }
        />
        <Route
          path="/battles"
          element={
            <ProtectedRoute>
              <BattleArena />
            </ProtectedRoute>
          }
        />
        <Route
          path="/battles/results"
          element={
            <ProtectedRoute>
              <BattleResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/runner"
          element={
            <ProtectedRoute>
              <TempleRunGame />
            </ProtectedRoute>
          }
        />
        <Route
          path="/runner/:level"
          element={
            <ProtectedRoute>
              <TempleRunGame />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
