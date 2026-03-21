import React, { useState } from "react";
import { authProvider } from "../service/AuthProvider";

interface AuthFormProps {
  onLoginSuccess: (user: any) => void;
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
        const identity = await authProvider.getIdentity();
        const role = await authProvider.getPermissions({});
        onLoginSuccess({ ...identity, role });
      } else {

        console.log("Регистрация:", formData);
        alert("Запрос на регистрацию отправлен (реализуйте метод в API)");
      }
    } catch (err: any) {
      setError(err.message || "Ошибка. Проверьте данные.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen md:h-auto md:max-w-[400px] bg-white rounded-none md:rounded-[32px] p-8 md:p-10 shadow-none md:shadow-xl flex flex-col transition-all">
      <div className="flex items-center justify-between w-full mb-8">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#0A1F33] rounded-full flex items-center justify-center text-white font-bold italic text-sm">S</div>
          <span className="font-bold text-slate-800 tracking-tight">Semga Stream</span>
        </div>
        <div className="text-right">
          <div className="text-[#FF4231] font-black text-lg leading-none italic">TTK.</div>
          <div className="text-[7px] uppercase font-extrabold text-slate-400 tracking-tighter">ТрансТелеКом</div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">
        {isLogin ? "Вход" : "Регистрация"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 text-[11px] font-bold rounded-xl border border-red-100 uppercase tracking-wide">
          {error}
        </div>
      )}

      <form className="space-y-3" onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            name="fullname"
            type="text"
            required
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Ваше ФИО"
            className="w-full px-5 py-4 bg-[#F1F3F6] border-none rounded-2xl text-slate-700 outline-none focus:ring-2 focus:ring-slate-200 transition-all"
          />
        )}

        <input
          name="username"
          type="text"
          required
          value={formData.username}
          onChange={handleChange}
          placeholder="Логин"
          className="w-full px-5 py-4 bg-[#F1F3F6] border-none rounded-2xl text-slate-700 outline-none focus:ring-2 focus:ring-slate-200 transition-all"
        />

        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Пароль"
            className="w-full px-5 py-4 bg-[#F1F3F6] border-none rounded-2xl text-slate-700 outline-none focus:ring-2 focus:ring-slate-200 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"
          >
            {showPassword ? "🔒" : "👁️"}
          </button>
        </div>

        {/* Поле подтверждения пароля - только для регистрации */}
        {!isLogin && (
          <input
            name="passwordConfirm"
            type={showPassword ? "text" : "password"}
            required
            value={formData.passwordConfirm}
            onChange={handleChange}
            placeholder="Повторите пароль"
            className="w-full px-5 py-4 bg-[#F1F3F6] border-none rounded-2xl text-slate-700 outline-none focus:ring-2 focus:ring-slate-200 transition-all"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 bg-[#FF4231] text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-100 mt-4 uppercase text-xs tracking-widest ${
            loading ? "opacity-50" : "hover:bg-[#e63b2c]"
          }`}
        >
          {loading ? "Загрузка..." : isLogin ? "Войти" : "Создать аккаунт"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-slate-500 text-sm mb-1">{isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}</p>
        <button
          onClick={() => { setIsLogin(!isLogin); setError(null); }}
          className="text-[#3B82F6] font-bold text-sm hover:underline"
        >
          {isLogin ? "Зарегистрироваться" : "Вернуться ко входу"}
        </button>
      </div>

      <p className="mt-10 text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] text-center">
        © Semga Team 2026
      </p>
    </div>
  );
}