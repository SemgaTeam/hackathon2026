import React, { useState } from "react";
import { api } from "../api/instance";
import type { AuthResponse } from "../types/auth"; //

interface AuthFormProps {
  onLoginSuccess: (user: any) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: "", password: "" });

  return (
    <div className="w-full h-screen md:h-auto md:max-w-[380px] bg-white rounded-none md:rounded-[32px] p-8 md:p-10 shadow-none md:shadow-xl flex flex-col transition-all">
      <div className="flex items-center justify-between w-full mb-12 mt-4 md:mt-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-[#0A1F33] rounded-full flex items-center justify-center text-white font-bold italic text-sm">
            S
          </div>
          <span className="font-bold text-base md:text-lg text-slate-800">
            Semga Stream
          </span>
        </div>
        <div className="text-right">
          <div className="text-[#FF4231] font-black text-lg md:text-xl leading-none italic">
            TTK.
          </div>
          <div className="text-[7px] md:text-[8px] uppercase font-extrabold text-slate-400 tracking-tighter">
            ТрансТелеКом
          </div>
        </div>
      </div>

      <h2 className="text-2xl md:text-2xl font-bold text-slate-900 mb-8">
        {isLogin ? "Вход" : "Регистрация"}
      </h2>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Логин"
          className="w-full px-5 py-4 bg-[#F1F3F6] border-none rounded-xl text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-200 transition-all"
        />

        <div className="relative">
          <input
            type="password"
            placeholder="Пароль"
            className="w-full px-5 py-4 bg-[#F1F3F6] border-none rounded-xl text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-200 transition-all"
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer text-sm">
            👁️
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative inline-flex items-center">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#4ADE80] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
            </div>
            <span className="text-[11px] md:text-xs font-bold text-slate-700 uppercase tracking-tight">
              Запомнить меня
            </span>
          </label>
          <button
            type="button"
            className="text-[11px] md:text-xs font-bold text-[#3B82F6] hover:underline uppercase tracking-tight">
            Забыли пароль?
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-[#FF4231] text-white font-bold rounded-xl hover:bg-[#e63b2c] transition-all shadow-lg shadow-red-100 mt-4">
          {isLogin ? "Войти" : "Создать аккаунт"}
        </button>
      </form>

      <div className="mt-auto md:mt-12 text-center pb-8 md:pb-0">
        <p className="text-slate-500 text-sm mb-1">Нет аккаунта?</p>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-[#3B82F6] font-bold text-sm hover:underline">
          {isLogin ? "Зарегистрироваться" : "Войти"}
        </button>
        <div className="flex flex-col items-center mt-6 md:hidden">
          <div className="w-12 h-12 bg-[#0A1F33] rounded-full flex items-center justify-center text-white font-bold italic mb-4">
            S
          </div>
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
            © Semga Team 2026
          </p>
        </div>
      </div>

      <p className="hidden md:block mt-10 text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
        © Semga Team 2026
      </p>
    </div>
  );
};

export default AuthForm;
