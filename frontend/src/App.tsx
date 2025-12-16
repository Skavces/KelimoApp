import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AuthSuccess from "./pages/AuthSuccess";
import Dashboard from "./pages/Dashboard";
import Learn from "./pages/Learn";
import MyWords from "./pages/MyWords";
import Settings from "./pages/Settings"; 
import Profile from "./pages/Profile";   
import { ThemeProvider } from "./context/ThemeContext";
import PracticeSelect from "./pages/PracticeSelect";
import QuizGame from "./pages/QuizGame"; 
import WordScramble from "./pages/WordScramble";
import FillBlankGame from "./pages/FillBlankGame";
import MemoryGame from "./pages/MemoryGame";
import DictationGame from "./pages/DictationGame";
import Progress from "./pages/Progress";

function RequireAuth({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/success" element={<AuthSuccess />} />

          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />

          <Route
            path="/learn"
            element={
              <RequireAuth>
                <Learn />
              </RequireAuth>
            }
          />
          
          <Route
            path="/my-words"
            element={
              <RequireAuth>
                <MyWords />
              </RequireAuth>
            }
          />

          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />

          <Route
            path="/settings"
            element={
              <RequireAuth>
                <Settings />
              </RequireAuth>
            }
          />

          <Route 
            path="/practice" 
            element={
              <RequireAuth>
                <PracticeSelect />
              </RequireAuth>
            }
          />

          <Route 
            path="/practice/game" 
            element={
              <RequireAuth>
                <QuizGame />
              </RequireAuth>
            }
          />

          <Route 
            path="/practice/scramble" 
            element={
              <RequireAuth>
                <WordScramble />
              </RequireAuth>
            }
          />  

          <Route 
            path="/practice/fill-blank" 
            element={
              <RequireAuth>
                <FillBlankGame />
              </RequireAuth>
            } 
          />

          <Route 
            path="/practice/memory" 
            element={
              <RequireAuth>
                <MemoryGame />
              </RequireAuth>
            } 
          />

          <Route 
            path="/practice/dictation" 
            element={
              <RequireAuth>
                <DictationGame />
              </RequireAuth>
            } 
          />

          <Route 
            path="/progress" 
            element={
              <RequireAuth>
                <Progress />
              </RequireAuth>
            } 
          />

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}