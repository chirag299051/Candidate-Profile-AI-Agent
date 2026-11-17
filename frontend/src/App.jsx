import { useEffect, useState } from "react";
import api from "./services/api";
import Auth from "./components/Auth";
import Chat from "./components/Chat";
import "./App.css";
function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data.user);
      } catch {
        setUser(null);
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, []);
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  if (checkingSession) {
    return <div className="app-loading">Checking your session...</div>;
  }
  if (!user) {
    return <Auth onAuthSuccess={setUser} />;
  }
  return (
    <>
      <header className="app-header">
        <span>Signed in as {user.name}</span>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <Chat />
    </>
  );
}
export default App;