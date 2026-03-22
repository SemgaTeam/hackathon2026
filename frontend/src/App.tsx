import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import AdminMenu from "./components/AdminMenu";
import HostMenu from "./components/HostMenu";
import { useEffect, useState } from "react";
import { authProvider } from "./service/AuthProvider";
import { LayoutDashboard, Menu, ToolCase, LogOut, User } from 'lucide-react';
import { AuthForm } from "./components/AuthForm";
import GlobalPlayer from "./components/GlobalPlayer";

export default function App() {
  const [user, setUser] = useState<{ id: string; role: string; fullName?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await authProvider.checkAuth({});
        const identity = await authProvider.getIdentity();
        const role = await authProvider.getPermissions({});
        setUser({ ...identity, role });
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await authProvider.logout({});
      setUser(null);
      localStorage.removeItem('player-muted');
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-6 h-full flex items-center border-b-4 font-bold text-[11px] uppercase tracking-widest transition-all ${
      isActive
        ? "border-[#ff4d3d] text-[#ff4d3d]"
        : "border-transparent text-slate-400 hover:text-slate-600"
    }`;

  if (loading) return null;

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-[#62C5A5] flex items-center justify-center p-4">
        <AuthForm onLoginSuccess={(userData) => setUser(userData)} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#e6e6e6] flex flex-col font-sans">
        
        <nav className="h-16 bg-white border-b border-slate-100 px-8 flex items-center sticky top-0 z-50 shadow-sm">
          <div className="flex h-full space-x-2">
            <NavLink to="/" className={navLinkClass}>
              <div className="flex items-center gap-2"><LayoutDashboard size={14} /> Плеер</div>
            </NavLink>
            {['host', 'admin'].includes(user.role) && (
              <NavLink to="/host" className={navLinkClass}>
                <div className="flex items-center gap-2"><Menu size={14} /> Ведущий</div>
              </NavLink>
            )}
            {user.role === 'admin' && (
              <NavLink to="/admin" className={navLinkClass}>
                <div className="flex items-center gap-2"><ToolCase size={14} /> Админ</div>
              </NavLink>
            )}
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-[#ff4d3d]/10 flex items-center justify-center text-[#ff4d3d]">
                <User size={12} />
              </div>
              <div className="flex flex-col leading-tight text-left">
                <span className="text-[10px] font-black text-slate-800 uppercase truncate max-w-[120px]">
                  {user.fullName || "User"}
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                  {user.role}
                </span>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              title="Выйти из системы"
              className="p-2.5 text-slate-400 hover:text-[#ff4d3d] hover:bg-red-50 rounded-xl transition-all active:scale-90"
            >
              <LogOut size={18} />
            </button>
          </div>
        </nav>

        <main className="grow flex justify-center relative">
          <div className="w-full max-w-360 p-4 md:p-10 flex">
            <div className="w-full bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative">
              
              <GlobalPlayer />

              <Routes>
                <Route path="/" element={<div className="h-full w-full pointer-events-none" />} />
                
                <Route path="/host" element={
                  ['host', 'admin'].includes(user.role) ? <HostMenu /> : <Navigate to="/" />
                } />
                
                <Route path="/admin/*" element={
                  user.role === 'admin' ? <AdminMenu /> : <Navigate to="/" />
                } />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </main>

        <footer className="py-8">
          <p className="text-center text-slate-300 text-[10px] font-bold uppercase tracking-[0.3em]">
            © Semga Team 2026
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}