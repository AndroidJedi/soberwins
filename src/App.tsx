import React from 'react';
import { useState } from 'react';
import { ArrowRight, Zap, DollarSign, Heart } from 'lucide-react';
import SkipDrinkModal from './components/SkipDrinkModal';

function App() {
  const [isSkipDrinkModalOpen, setIsSkipDrinkModalOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Image with Enhanced Styling */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{
            backgroundImage: 'url("/hero_image.jpg")'
          }}
        >
          {/* Sophisticated Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
        </div>

        {/* Top Bar - Single Container for Logo and Badge (All Screens) */}
        <div className="absolute top-8 inset-x-0 z-30">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-emerald-300 text-base font-semibold backdrop-blur-md shadow-lg">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span>Day 3 Sober</span>
            </div>
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full"></div>
                </div>
              </div>
              <div className="text-white">
                <div className="text-xl font-bold tracking-tight">SoberWins</div>
                <div className="text-emerald-300 text-xs font-medium -mt-0.5">Track your sober wins</div>
              </div>
            </div>
          </div>
        </div>

        

        {/* Main Content */}
        <div className="relative z-20 min-h-screen flex items-center pt-28 lg:pt-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
            <div className="max-w-2xl">

              

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-8 leading-[0.9] tracking-tight mt-32 sm:mt-0">
                Your first sober win{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  starts here
                </span>
              </h1>
              
              {/* Subheadline */}
              <p className="text-2xl lg:text-3xl text-gray-200 mb-12 leading-relaxed font-light">
                Soon you'll be able to track your own sober wins. Every skip adds up: calories avoided, money saved, energy regained.
              </p>
              
              {/* Enhanced Key Reasons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 hover:bg-white/15 transition-all duration-300 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">Skip a pint</div>
                    <div className="text-gray-300 text-sm">~200 calories saved</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 hover:bg-white/15 transition-all duration-300 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">Skip 3 cocktails</div>
                    <div className="text-gray-300 text-sm">~$25 saved</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 hover:bg-white/15 transition-all duration-300 group sm:col-span-2 lg:col-span-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">Every skip</div>
                    <div className="text-gray-300 text-sm">energy regained</div>
                  </div>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 mb-10">
                <button 
                  onClick={() => setIsSkipDrinkModalOpen(true)}
                  className="group relative inline-flex items-center justify-center gap-4 px-10 py-5 text-xl font-bold text-black bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-400/40 focus:outline-none focus:ring-4 focus:ring-emerald-400/50 shadow-xl min-w-[220px]"
                >
                  <span>Skip a Drink</span>
                  <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-300 to-teal-300 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </button>
                
                <button className="group inline-flex items-center justify-center gap-3 px-10 py-5 text-xl font-semibold text-white border-2 border-white/30 rounded-2xl transition-all duration-300 hover:border-white hover:bg-white/10 backdrop-blur-md min-w-[220px]">
                  <span>Get Early Access</span>
                </button>
              </div>
              
              {/* Bottom Text */}
              <div className="space-y-3">
                <p className="text-xl text-gray-200 font-medium">
                  Be among the first to join the sober wins movement
                </p>
                <p className="text-base text-gray-400">
                  Launching soon • Free to join • No credit card required
                </p>
                <p className="text-sm text-gray-500">
                  *Based on average beer/cocktail calories & prices
                </p>
              </div>
              
            </div>
          </div>
        </div>
        
        {/* Enhanced Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent pointer-events-none"></div>
      </section>
      
      {/* Psychology Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-24 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-transparent to-teal-500/20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            {/* Section Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-400/20 rounded-2xl text-emerald-300 text-base font-semibold mb-8 backdrop-blur-md">
              <span className="text-2xl">🧬</span>
              <span>Science-Backed</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-8 leading-tight tracking-tight">
              Why SoberWins Works
              <span className="block text-3xl sm:text-4xl lg:text-5xl bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-light">
                (Backed by Psychology)
              </span>
            </h2>
            <p className="text-2xl lg:text-3xl text-gray-200 max-w-4xl mx-auto mb-16 leading-relaxed font-light">
              Every time you mark a drink you could have had but didn't, you turn self-control into a visible win. This simple shift makes all the difference.
            </p>
          </div>
          
          {/* Enhanced Psychology Proof Points */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-blue-500/30">
                <span className="text-4xl">🧠</span>
              </div>
              <h3 className="text-white font-bold text-2xl mb-6 group-hover:text-blue-300 transition-colors">Loss Aversion Hack</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Skipping feels like a gain, not a sacrifice. Your brain rewards wins over avoiding losses.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-400/20 rounded-xl backdrop-blur-sm">
                <span className="text-blue-400 text-sm font-medium">Kahneman & Tversky, 1979</span>
              </div>
            </div>
            
            <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-emerald-500/30">
                <span className="text-4xl">🎉</span>
              </div>
              <h3 className="text-white font-bold text-2xl mb-6 group-hover:text-emerald-300 transition-colors">Instant Reward Loop</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Every tap gives you a dopamine boost that reinforces your choice. Immediate wins build lasting habits.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-400/20 rounded-xl backdrop-blur-sm">
                <span className="text-emerald-400 text-sm font-medium">Skinner, 1953</span>
              </div>
            </div>
            
            <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-orange-500/30">
                <span className="text-4xl">🔥</span>
              </div>
              <h3 className="text-white font-bold text-2xl mb-6 group-hover:text-orange-300 transition-colors">Streak Power</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Wins stack into streaks you don't want to break. The chain effect keeps you motivated long-term.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-400/20 rounded-xl backdrop-blur-sm">
                <span className="text-orange-400 text-sm font-medium">Milkman, 2021</span>
              </div>
            </div>
          </div>
          
          {/* Enhanced Key Insight */}
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-12 max-w-5xl mx-auto shadow-2xl">
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-400/30">
                <span className="text-3xl">💡</span>
              </div>
              <h4 className="text-3xl lg:text-4xl font-bold text-white">The Key Difference</h4>
            </div>
            <p className="text-2xl lg:text-3xl text-gray-200 leading-relaxed text-center font-light">
              You don't just count drinks consumed <span className="text-gray-400 italic">(that's depressing)</span>. 
              You mark the ones you{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-semibold">
                could have had but didn't
              </span>. 
              This flips the frame from loss → gain.
            </p>
          </div>
        </div>
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
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-400/30">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">💧</span>
                  <h4 className="text-white font-semibold">Skip a Drink</h4>
                </div>
                <p className="text-gray-300 text-sm">Tap to lock your sober win. Every skip counts.</p>
              </div>
              
              <div className="hidden md:block text-gray-500">→</div>
              
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-400/30">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">📈</span>
                  <h4 className="text-white font-semibold">Watch Your Wins Add Up</h4>
                </div>
                <p className="text-gray-300 text-sm">Track money saved, calories avoided, and days gained.</p>
              </div>
              
              <div className="hidden md:block text-gray-500">→</div>
              
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-400/30">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">🔥</span>
                  <h4 className="text-white font-semibold">Stay Motivated</h4>
                </div>
                <p className="text-gray-300 text-sm">See your streak grow, feel stronger, and celebrate progress.</p>
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