import React, { useState } from "react";
import { authProvider } from "../service/AuthProvider";
import { User, Lock, Eye, EyeOff, ShieldCheck, UserPlus, LogIn, Loader2 } from "lucide-react";

interface AuthFormProps {
  onLoginSuccess: (user: { id: string; role: string; fullName?: string }) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({ 
    username: "", 
    fullname: "", 
    password: "", 
    passwordConfirm: "" 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isLogin && formData.password !== formData.passwordConfirm) {
      setError("Пароли не совпадают");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await authProvider.login({ 
          username: formData.username, 
          password: formData.password 
        });
      } else {
        await authProvider.register({ 
          username: formData.username,
          fullname: formData.fullname,
          password: formData.password 
        });
        await authProvider.login({ 
          username: formData.username, 
          password: formData.password 
        });
      }
      
      const identity = await authProvider.getIdentity();
      const role = await authProvider.getPermissions();
      onLoginSuccess({ id: String(identity.id), fullName: identity.fullName, role });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка доступа";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] bg-white rounded-[40px] p-10 shadow-2xl border border-white transition-all duration-500 animate-in fade-in zoom-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between w-full mb-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-slate-900 rounded-[18px] flex items-center justify-center text-white shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="font-black italic text-xl">S</span>
          </div>
          <div>
            <span className="block font-black text-slate-900 tracking-tighter text-lg leading-none">Semga Stream</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engine v2.0</span>
          </div>
        </div>
        <div className="text-right opacity-60">
          <div className="text-[#FF4231] font-black text-xl leading-none italic tracking-tighter">TTK.</div>
          <div className="text-[8px] uppercase font-black text-slate-400 tracking-tight">ТрансТелеКом</div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          {isLogin ? "С возвращением" : "Создать аккаунт"}
        </h2>
        <p className="text-slate-400 text-sm font-medium mt-1">
          {isLogin ? "Введите данные для входа в систему" : "Заполните поля для регистрации в Semga"}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-2xl flex items-center gap-3 animate-bounce">
          <div className="text-red-500 font-bold text-[11px] uppercase tracking-wider">{error}</div>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF4231] transition-colors">
              <User size={18} />
            </div>
            <input
              name="fullname"
              type="text"
              required
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Ваше ФИО"
              className="w-full pl-14 pr-5 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] text-slate-900 font-bold placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-100 focus:ring-4 focus:ring-slate-50 transition-all text-sm"
            />
          </div>
        )}

        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF4231] transition-colors">
            <ShieldCheck size={18} />
          </div>
          <input
            name="username"
            type="text"
            required
            value={formData.username}
            onChange={handleChange}
            placeholder="Логин пользователя"
            className="w-full pl-14 pr-5 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] text-slate-900 font-bold placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-100 focus:ring-4 focus:ring-slate-50 transition-all text-sm"
          />
        </div>

        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF4231] transition-colors">
            <Lock size={18} />
          </div>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Пароль"
            className="w-full pl-14 pr-14 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] text-slate-900 font-bold placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-100 focus:ring-4 focus:ring-slate-50 transition-all text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {!isLogin && (
          <div className="relative animate-in slide-in-from-top-2">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock size={18} />
            </div>
            <input
              name="passwordConfirm"
              type={showPassword ? "text" : "password"}
              required
              value={formData.passwordConfirm}
              onChange={handleChange}
              placeholder="Подтвердите пароль"
              className="w-full pl-14 pr-5 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] text-slate-900 font-bold placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-100 focus:ring-4 focus:ring-slate-50 transition-all text-sm"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-[#FF4231] text-white font-black rounded-[24px] transition-all shadow-xl shadow-red-200 mt-6 uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 disabled:active:scale-100 hover:shadow-red-300 hover:-translate-y-0.5"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
              {isLogin ? "Войти в панель" : "Создать профиль"}
            </>
          )}
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-slate-50 text-center">
        <p className="text-slate-400 text-sm font-semibold mb-3">
          {isLogin ? "Впервые у нас?" : "Уже есть профиль?"}
        </p>
        <button
          onClick={() => { setIsLogin(!isLogin); setError(null); }}
          className="px-8 py-3 rounded-2xl bg-slate-50 text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors"
        >
          {isLogin ? "Регистрация" : "Ко входу"}
        </button>
      </div>

      <div className="mt-10 flex flex-col items-center gap-2">
        <div className="h-1 w-12 bg-slate-100 rounded-full" />
        <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.4em]">
          Semga Team
        </p>
      </div>
    </div>
  );
}
