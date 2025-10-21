"use client";

import { useState } from 'react';
import { Briefcase, Sparkles, Lock, Mail, User } from 'lucide-react';

export default function SignUpPage() {
  const [step, setStep] = useState('selection'); // 'selection', 'form', 'loading'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    repeatPassword: ''
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  

  const handleNext = () => {
    setStep('loading');
    // Simulate loading
    setTimeout(() => {
      // Here you would typically proceed to the next step or complete signup
    }, 2000);
  };

  // Selection Screen
  if (step === 'selection') {
    return (
      <div className="min-h-screen bg-white">
        <header className="flex items-center justify-between px-8 py-6">
          <div className="text-3xl font-bold">K</div>
          <div className="flex gap-4">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Login
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-black rounded hover:bg-gray-800">
              Sign Up
            </button>
          </div>
        </header>

        <main className="flex flex-col items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 88px)' }}>
          <div className="w-full max-w-2xl">
            <h1 className="text-3xl font-bold text-center mb-2">
              Let's get you started!
            </h1>
            <p className="text-center text-gray-600 mb-12">
              Choose how you'd like to sign up. Are you registering as a Business or as an Influencer?
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <button 
                onClick={() => setStep('form')}
                className="flex flex-col items-center justify-center w-40 h-40 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:shadow-md transition-all"
              >
                <Briefcase className="w-12 h-12 mb-3" strokeWidth={1.5} />
                <span className="text-sm font-medium">As Business</span>
              </button>

              <button 
                onClick={() => setStep('form')}
                className="flex flex-col items-center justify-center w-40 h-40 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:shadow-md transition-all"
              >
                <Sparkles className="w-12 h-12 mb-3" strokeWidth={1.5} />
                <span className="text-sm font-medium">As an Influencer</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Form Screen
  if (step === 'form') {
    return (
      <div className="min-h-screen bg-white">
        <header className="flex items-center justify-between px-8 py-6">
          <div className="text-3xl font-bold">K</div>
          <div className="flex gap-4">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Login
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-black rounded hover:bg-gray-800">
              Sign Up
            </button>
          </div>
        </header>

        <main className="flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-black text-white rounded-full text-sm font-medium">
                  ✓
                </div>
                <div className="w-24 h-0.5 bg-gray-300"></div>
                <div className="flex items-center justify-center w-8 h-8 border-2 border-gray-300 rounded-full text-sm font-medium">
                  2
                </div>
              </div>
            </div>

            {/* Form Title */}
            <h1 className="text-2xl font-bold mb-2">Create your account</h1>
            <p className="text-sm text-gray-600 mb-8">
              Tell us a bit about yourself. Please fill in your personal information.
            </p>

            {/* Form */}
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="yourname@mail.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Repeat Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    name="repeatPassword"
                    placeholder="Repeat Password"
                    value={formData.repeatPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('selection')}
                  className="flex-1 py-2.5 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-2.5 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors"
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Loading Screen
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-8 py-6">
        <div className="text-3xl font-bold">K</div>
        <div className="flex gap-4">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
            Login
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-black rounded hover:bg-gray-800">
            Sign Up
          </button>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 88px)' }}>
        <div className="w-full max-w-md text-center">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-black text-white rounded-full text-sm font-medium">
                ✓
              </div>
              <div className="w-24 h-0.5 bg-black"></div>
              <div className="flex items-center justify-center w-8 h-8 bg-black text-white rounded-full text-sm font-medium">
                ✓
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2">We're setting things up for you...</h1>
          <p className="text-sm text-gray-600 mb-12">
            Hang tight! We're setting you up and getting things ready for you.
          </p>

          {/* Animated Loading Box */}
          <div className="flex justify-center">
            <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-gray-400 text-lg animate-pulse">
                LOADER ANIMATION HERE
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}