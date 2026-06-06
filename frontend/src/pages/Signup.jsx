import React from 'react';
import { Link } from 'react-router-dom';

const Signup = () => {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col md:flex-row font-body-md antialiased selection:bg-surface-dim selection:text-primary">
      {/* Left Image Column */}
      <div className="hidden md:block md:w-5/12 lg:w-1/2 relative min-h-screen overflow-hidden bg-surface-container-low">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200&h=1600')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5 mix-blend-multiply"></div>
      </div>
      
      {/* Right Form Column */}
      <div className="w-full md:w-7/12 lg:w-1/2 min-h-screen flex items-center justify-center p-6 md:p-container-padding bg-[#FAFAFA] relative overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-surface-container-low blur-3xl opacity-50 pointer-events-none"></div>
        
        <div className="w-full max-w-[540px] bg-[#FFFFFF] rounded-xl soft-shadow p-8 md:p-12 lg:p-[56px] relative z-10 flex flex-col gap-[40px]">
          <div className="flex flex-col gap-4 animate-fade-in-up delay-100">
            <h1 className="font-display-md text-display-md text-primary tracking-tight">VendorBridge <span className="text-on-surface-variant font-light">Master</span></h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Elevate your vendor management experience. Establish your master profile to gain access to the curated ecosystem.</p>
          </div>
          
          <form className="flex flex-col gap-element-gap">
            <div className="flex flex-col md:flex-row gap-element-gap animate-fade-in-up delay-200">
              <div className="flex flex-col gap-2 w-full group">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase group-focus-within:text-primary transition-colors" htmlFor="firstName">First Name</label>
                <input className="input-minimal font-body-md text-body-md text-on-surface placeholder:text-surface-tint" id="firstName" placeholder="Jane" required type="text"/>
              </div>
              <div className="flex flex-col gap-2 w-full group">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase group-focus-within:text-primary transition-colors" htmlFor="lastName">Last Name</label>
                <input className="input-minimal font-body-md text-body-md text-on-surface placeholder:text-surface-tint" id="lastName" placeholder="Doe" required type="text"/>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-element-gap animate-fade-in-up delay-300">
              <div className="flex flex-col gap-2 w-full group">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase group-focus-within:text-primary transition-colors" htmlFor="email">Corporate Email</label>
                <input className="input-minimal font-body-md text-body-md text-on-surface placeholder:text-surface-tint" id="email" placeholder="jane.doe@company.com" required type="email"/>
              </div>
              <div className="flex flex-col gap-2 w-full group">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase group-focus-within:text-primary transition-colors" htmlFor="password">Password</label>
                <input className="input-minimal font-body-md text-body-md text-on-surface placeholder:text-surface-tint" id="password" placeholder="••••••••" required type="password"/>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-element-gap animate-fade-in-up delay-400">
              <div className="flex flex-col gap-2 w-full group">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase group-focus-within:text-primary transition-colors" htmlFor="phone">Phone Number</label>
                <input className="input-minimal font-body-md text-body-md text-on-surface placeholder:text-surface-tint" id="phone" placeholder="+1 (555) 000-0000" type="tel"/>
              </div>
              <div className="flex flex-col gap-2 w-full group">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase group-focus-within:text-primary transition-colors" htmlFor="jobTitle">Job Title</label>
                <input className="input-minimal font-body-md text-body-md text-on-surface placeholder:text-surface-tint" id="jobTitle" placeholder="Director of Procurement" type="text"/>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 w-full animate-fade-in-up delay-500 group">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase group-focus-within:text-primary transition-colors" htmlFor="country">Country</label>
              <input className="input-minimal font-body-md text-body-md text-on-surface placeholder:text-surface-tint" id="country" list="countries" placeholder="Select Country" type="text"/>
              <datalist id="countries">
                <option value="United States"></option>
                <option value="United Kingdom"></option>
                <option value="Canada"></option>
                <option value="Australia"></option>
                <option value="Singapore"></option>
              </datalist>
            </div>
            
            <div className="flex flex-col gap-2 w-full animate-fade-in-up delay-600 group">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase group-focus-within:text-primary transition-colors" htmlFor="additionalInfo">Additional Information</label>
              <textarea className="input-minimal font-body-md text-body-md text-on-surface placeholder:text-surface-tint resize-none" id="additionalInfo" placeholder="Briefly describe your primary supply chain focus..." rows="3"></textarea>
            </div>
            
            <div className="mt-4 flex flex-col gap-6 animate-fade-in-up delay-700">
              <Link to="/login" className="w-full bg-primary-container text-on-secondary font-label-caps text-label-caps py-4 rounded hover:bg-tertiary-container transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-widest">
                Initialize Profile
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
              </Link>
              <p className="text-center font-mono-data text-mono-data text-on-surface-variant">
                Already have an account? <Link className="text-primary hover:text-on-surface transition-colors border-b border-transparent hover:border-primary pb-0.5" to="/login">Sign In</Link>
              </p>
            </div>
          </form>
        </div>
        <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
          <p className="font-mono-data text-mono-data text-surface-tint">© 2024 VendorBridge. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
