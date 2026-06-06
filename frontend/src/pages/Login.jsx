import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="bg-[#FAFAFA] min-h-screen flex items-center justify-center p-6 antialiased selection:bg-secondary-container selection:text-on-secondary-container">
      <main className="w-full max-w-[480px] bg-[#FFFFFF] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] p-8 md:p-container-padding flex flex-col items-center animate-fade-in-up">
        <header className="text-center w-full mb-12 animate-fade-in-up delay-100">
          <h1 className="font-display-md text-display-md text-[#1A1A1A] mb-4">VendorBridge</h1>
          <p className="font-body-md text-body-md text-[#1A1A1A]/70">Access your enterprise resource ecosystem.</p>
        </header>
        <form className="w-full flex flex-col gap-8">
          <div className="flex flex-col relative group animate-fade-in-up delay-200">
            <label className="font-label-caps text-label-caps text-[#1A1A1A]/70 mb-2 transition-colors group-focus-within:text-[#1A1A1A]" htmlFor="email">Email</label>
            <input autoComplete="email" className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 font-body-md text-body-md text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:ring-0 focus:border-[#EAE6DF] transition-colors duration-300" id="email" placeholder="name@enterprise.com" type="email"/>
          </div>
          <div className="flex flex-col relative group animate-fade-in-up delay-300">
            <label className="font-label-caps text-label-caps text-[#1A1A1A]/70 mb-2 transition-colors group-focus-within:text-[#1A1A1A]" htmlFor="password">Password</label>
            <input autoComplete="current-password" className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 font-body-md text-body-md text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:ring-0 focus:border-[#EAE6DF] transition-colors duration-300" id="password" placeholder="••••••••" type="password"/>
          </div>
          <div className="mt-4 w-full animate-fade-in-up delay-400">
            <Link to="/dashboard" className="w-full bg-[#1A1A1A] text-white rounded py-4 px-6 font-label-caps text-label-caps tracking-widest hover:bg-[#1A1A1A]/90 transition-colors duration-300 flex items-center justify-center gap-2 group">
              AUTHENTICATE
              <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>
          <div className="text-center w-full mt-2 animate-fade-in-up delay-500">
            <button className="font-label-caps text-label-caps text-[#1A1A1A]/70 hover:text-[#1A1A1A] transition-colors duration-200" type="button">
               Forgot credentials?
            </button>
            <div className="mt-4">
              <Link to="/signup" className="font-label-caps text-label-caps text-[#1A1A1A]/70 hover:text-[#1A1A1A] transition-colors duration-200">
                Create an account
              </Link>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Login;
