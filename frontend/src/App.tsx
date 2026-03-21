import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import AdminMenu from './components/AdminMenu';
import PlayerMenu from './components/PlayerMenu';
import HostMenu from './components/HostMenu';

export default function App() {
    const user = { role: 'admin' };

    const navLinkClass = ({ isActive }) =>
        `px-6 h-full flex items-center border-b-4 font-bold text-[11px] uppercase tracking-widest transition-all ${
            isActive ? 'border-[#ff4d3d] text-[#ff4d3d]' : 'border-transparent text-slate-400 hover:text-slate-600'
        }`;

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-[#e6e6e6] flex flex-col font-sans">
                
                <nav className="h-16 bg-white border-b border-slate-100 px-8 flex items-center sticky top-0 z-20 shadow-sm">
                    <div className="flex h-full space-x-2">
                        <NavLink to="/" className={navLinkClass}>Плеер</NavLink>
                        {['host', 'admin'].includes(user.role) && (
                            <NavLink to="/host" className={navLinkClass}>Меню Ведущего</NavLink>
                        )}
                        {user.role === 'admin' && (
                            <NavLink to="/admin" className={navLinkClass}>Администрация</NavLink>
                        )}
                    </div>
                    <div className="ml-auto px-4 py-1.5 border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase">
                        {user.role}
                    </div>
                </nav>

                <main className="grow flex justify-center bg-[#e6e6e6]">
                    <div className="w-full max-w-360 bg-[#62c5a5] p-4 md:p-10 flex">
                        <div className="w-full bg-white rounded-sm shadow-2xl flex flex-col min-h-[80vh] overflow-hidden border border-white">
                            <Routes>
                                <Route path="/" element={<PlayerMenu />} />
                                <Route path="/host" element={['host', 'admin'].includes(user.role) ? <HostMenu /> : <Navigate to="/" />} />
                                <Route path="/admin/*" element={user.role === 'admin' ? <AdminMenu /> : <Navigate to="/" />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </div>
                    </div>
                </main>

                <footer className="py-8 bg-[#e6e6e6]">
                    <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                        © Semga Team 2026
                    </p>
                </footer>
            </div>
        </BrowserRouter>
    );
}