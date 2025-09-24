import React from 'react';
import { useState } from 'react';
import { ArrowRight, Zap, DollarSign, Heart } from 'lucide-react';
import SkipDrinkModal from './components/SkipDrinkModal';

function App() {
  const [isSkipDrinkModalOpen, setIsSkipDrinkModalOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Logo - Top Right */}
        <div className="absolute top-8 right-8 flex items-center gap-4 z-20">
          <div className="relative">
            {/* Hexagon Background */}
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 transform rotate-45 rounded-lg shadow-lg"></div>
            {/* Inner Symbol */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-sm transform -rotate-45 flex items-center justify-center">
                <div className="w-3 h-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-white text-xl font-bold tracking-tight">SoberWins</span>
            <span className="text-emerald-300 text-xs font-medium -mt-1">Track your sober wins</span>
          </div>
        </div>
        
        {/* Logo - Top Right */}
        <div className="absolute top-8 right-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
            </div>
          </div>
          <span className="text-white text-xl font-bold">SoberWins</span>
        </div>
        
        {/* Logo - Top Right */}
        <div className="absolute top-8 right-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
            </div>
          </div>
          <span className="text-white text-xl font-bold">SoberWins</span>
        </div>
        
        {/* Logo */}
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
            </div>
          </div>
          <span className="text-white text-xl font-bold">SoberWins</span>
        </div>
        
        {/* Logo */}
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
            </div>
          </div>
          <span className="text-white text-xl font-bold">SoberWins</span>
        </div>
        
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/hero_image.jpg")'
          }}
        >
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        </div>
        
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/hero_image.jpg")'
          }}
        >
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="absolute left-8 lg:left-16 top-1/2 transform -translate-y-1/2 z-10 max-w-xl">
          {/* Main Headline */}
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full text-green-300 text-sm font-semibold mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Day 3 Sober
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Your first sober win{' '}
            <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              starts here
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-base sm:text-lg text-gray-200 mb-6 leading-relaxed font-medium max-w-lg">
            Soon you'll be able to track your own sober wins. Every skip adds up: calories avoided, money saved, energy regained.
          </p>
          
          {/* Proof Points */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-400/20 rounded-lg px-3 py-2">
              <Zap className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-red-400 font-bold text-sm">Skip a pint</div>
                <div className="text-red-300 text-xs">~200 calories saved*</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-400/20 rounded-lg px-3 py-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-green-400 font-bold text-sm">Skip 3 cocktails</div>
                <div className="text-green-300 text-xs">~$25 saved*</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-pink-500/10 border border-pink-400/20 rounded-lg px-3 py-2">
              <Heart className="w-5 h-5 text-pink-400" />
              <div>
                <div className="text-pink-400 font-bold text-sm">Every skip</div>
                <div className="text-pink-300 text-xs">energy regained</div>
              </div>
            </div>
          </div>
          
          {/* Value proof disclaimer */}
          <p className="text-xs text-gray-500 mb-4">
            *Based on average beer/cocktail calories & prices
          </p>
          
          {/* Primary CTA Button */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Primary CTA Button */}
            <button 
              onClick={() => setIsSkipDrinkModalOpen(true)}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-black bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-400/40 focus:outline-none focus:ring-4 focus:ring-green-400/50 shadow-lg"
            >
              <span>Skip a Drink</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl"></div>
            </button>
            
            {/* Secondary CTA */}
            <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-white/30 rounded-full transition-all duration-300 hover:border-white hover:bg-white/10">
              <span>Get Early Access</span>
            </button>
          </div>
          
          {/* Secondary Text */}
          <p className="text-sm text-gray-400 mb-2">
            Be among the first to join the sober wins movement
          </p>
          <p className="text-xs text-gray-500">
            Launching soon • Free to join • No credit card required
          </p>
        </div>
        
        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
      </section>
      
      {/* Features Section */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Track Your Wins, Not Your Slips
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Join the sober-curious movement. Every skip makes you stronger.
            </p>
            
            {/* Social Proof */}
            <div className="flex items-center justify-center gap-8 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span>Building something special</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">💪</span>
                </div>
                <span>Every choice counts</span>
              </div>
            </div>
          </div>
          
          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Streak Power */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">🔥</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Current Streak</h3>
              <p className="text-3xl font-bold text-green-400 mb-2">47 days</p>
              <p className="text-gray-400 text-sm">Personal best!</p>
            </div>
            
            {/* Money Saved */}
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">💰</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Money Saved</h3>
              <p className="text-3xl font-bold text-yellow-400 mb-2">$1,127</p>
              <p className="text-gray-400 text-sm">Last 47 days</p>
            </div>
            
            {/* Health Gains */}
            <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Calories Avoided</h3>
              <p className="text-3xl font-bold text-red-400 mb-2">6,580</p>
              <p className="text-gray-400 text-sm">That's 2 lbs!</p>
            </div>
            
            {/* Pride Level */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">💪</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Pride Level</h3>
              <p className="text-3xl font-bold text-purple-400 mb-2">High</p>
              <p className="text-gray-400 text-sm">Growing daily</p>
            </div>
          </div>
          
          {/* How It Works */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-8">Build Your Streak in 3 Steps</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Choose Yourself</h4>
                <p className="text-gray-400 text-sm">Skip the drink, tap to celebrate it</p>
              </div>
              
              <div className="hidden md:block text-gray-500">→</div>
              
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h4 className="text-white font-semibold mb-2">See Your Progress</h4>
                <p className="text-gray-400 text-sm">Track savings, health gains, and growing confidence</p>
              </div>
              
              <div className="hidden md:block text-gray-500">→</div>
              
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Feel Proud</h4>
                <p className="text-gray-400 text-sm">Build momentum, gain strength, inspire yourself</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Skip Drink Modal */}
      <SkipDrinkModal 
        isOpen={isSkipDrinkModalOpen} 
        onClose={() => setIsSkipDrinkModalOpen(false)} 
      />
      
      {/* Additional Content Section (for demo purposes) */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Be first to track your sober wins
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the waitlist and be among the first to experience the power of tracking your progress.
          </p>
          
          <button className="group relative inline-flex items-center justify-center gap-3 px-12 py-6 text-xl font-bold text-black bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-400/40 focus:outline-none focus:ring-4 focus:ring-green-400/50 shadow-lg">
            <span>Get Early Access</span>
            <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl"></div>
          </button>
        </div>
      </section>
    </div>
  );
}

export default App;