import React, { useState } from 'react';
import { X, Plus, Minus, ArrowRight, CheckCircle, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Drink {
  id: string;
  name: string;
  emoji: string;
  calories: number;
  price: number;
  category: string;
}

interface Snack {
  id: string;
  name: string;
  emoji: string;
  calories: number;
  price: number;
  category: string;
}

interface SkipDrinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const drinks: Drink[] = [
  // Core Drinks
  { id: 'beer', name: 'Beer', emoji: '🍺', calories: 150, price: 6, category: 'core' },
  { id: 'wine', name: 'Wine Glass', emoji: '🍷', calories: 125, price: 8, category: 'core' },
  { id: 'whiskey', name: 'Whiskey', emoji: '🥃', calories: 100, price: 10, category: 'core' },
  { id: 'vodka', name: 'Vodka Shot', emoji: '🍸', calories: 95, price: 8, category: 'core' },
  { id: 'cocktail', name: 'Cocktail', emoji: '🍸', calories: 200, price: 12, category: 'core' },
  { id: 'margarita', name: 'Margarita', emoji: '🍹', calories: 250, price: 14, category: 'core' },
  
  // Popular Additions
  { id: 'cider', name: 'Cider', emoji: '🍺', calories: 200, price: 7, category: 'popular' },
  { id: 'hard-seltzer', name: 'Hard Seltzer', emoji: '🥤', calories: 100, price: 5, category: 'popular' },
  { id: 'tequila', name: 'Tequila Shot', emoji: '🥃', calories: 100, price: 8, category: 'popular' },
  { id: 'gin-tonic', name: 'Gin & Tonic', emoji: '🍸', calories: 150, price: 10, category: 'popular' },
  { id: 'rum-coke', name: 'Rum & Coke', emoji: '🥤', calories: 180, price: 9, category: 'popular' },
  { id: 'champagne', name: 'Champagne', emoji: '🥂', calories: 90, price: 12, category: 'popular' },
  { id: 'sangria', name: 'Sangria', emoji: '🍷', calories: 200, price: 10, category: 'popular' },
  { id: 'long-island', name: 'Long Island Tea', emoji: '🍹', calories: 250, price: 14, category: 'popular' },
];

const snacks: Snack[] = [
  // Core Snacks
  { id: 'chips', name: 'Chips', emoji: '🍟', calories: 150, price: 4, category: 'core' },
  { id: 'nuts', name: 'Mixed Nuts', emoji: '🥜', calories: 180, price: 5, category: 'core' },
  { id: 'pizza', name: 'Pizza Slice', emoji: '🍕', calories: 300, price: 8, category: 'core' },
  { id: 'wings', name: 'Chicken Wings', emoji: '🍗', calories: 250, price: 12, category: 'core' },
  { id: 'nachos', name: 'Nachos', emoji: '🧀', calories: 350, price: 10, category: 'core' },
  { id: 'pretzels', name: 'Pretzels', emoji: '🥨', calories: 120, price: 3, category: 'core' },
  
  // Fast Food
  { id: 'fries', name: 'French Fries', emoji: '🍟', calories: 300, price: 6, category: 'fast-food' },
  { id: 'burger', name: 'Burger', emoji: '🍔', calories: 500, price: 12, category: 'fast-food' },
  { id: 'onion-rings', name: 'Onion Rings', emoji: '🧅', calories: 350, price: 8, category: 'fast-food' },
  { id: 'hot-dog', name: 'Hot Dog', emoji: '🌭', calories: 350, price: 9, category: 'fast-food' },
  
  // Extras
  { id: 'cheese-platter', name: 'Cheese Platter', emoji: '🧀', calories: 400, price: 15, category: 'extras' },
  { id: 'ice-cream', name: 'Ice Cream', emoji: '🍦', calories: 250, price: 6, category: 'extras' },
  { id: 'chocolate', name: 'Chocolate Bar', emoji: '🍫', calories: 220, price: 3, category: 'extras' },
  { id: 'milkshake', name: 'Milkshake', emoji: '🥤', calories: 400, price: 7, category: 'extras' },
];

export default function SkipDrinkModal({ isOpen, onClose }: SkipDrinkModalProps) {
  const [step, setStep] = useState(1);
  const [selectedDrinks, setSelectedDrinks] = useState<Record<string, number>>({});
  const [selectedSnacks, setSelectedSnacks] = useState<Record<string, number>>({});
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showMoreDrinks, setShowMoreDrinks] = useState(false);
  const [showMoreSnacks, setShowMoreSnacks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const updateDrinkQuantity = (drinkId: string, change: number) => {
    setSelectedDrinks(prev => {
      const current = prev[drinkId] || 0;
      const newQuantity = Math.max(0, current + change);
      if (newQuantity === 0) {
        const { [drinkId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [drinkId]: newQuantity };
    });
  };

  const updateSnackQuantity = (snackId: string, change: number) => {
    setSelectedSnacks(prev => {
      const current = prev[snackId] || 0;
      const newQuantity = Math.max(0, current + change);
      if (newQuantity === 0) {
        const { [snackId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [snackId]: newQuantity };
    });
  };

  const calculateTotals = () => {
    const drinkTotals = Object.entries(selectedDrinks).reduce(
      (acc, [drinkId, quantity]) => {
        const drink = drinks.find(d => d.id === drinkId);
        if (drink) {
          acc.calories += drink.calories * quantity;
          acc.price += drink.price * quantity;
        }
        return acc;
      },
      { calories: 0, price: 0 }
    );

    const snackTotals = Object.entries(selectedSnacks).reduce(
      (acc, [snackId, quantity]) => {
        const snack = snacks.find(s => s.id === snackId);
        if (snack) {
          acc.calories += snack.calories * quantity;
          acc.price += snack.price * quantity;
        }
        return acc;
      },
      { calories: 0, price: 0 }
    );

    return {
      totalCalories: drinkTotals.calories + snackTotals.calories,
      totalPrice: drinkTotals.price + snackTotals.price,
    };
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (!supabase) {
        throw new Error('Database not configured');
      }
      const { error } = await supabase.from('early_access_leads').insert({ email });
      if (error) throw error;
      setIsSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setSelectedDrinks({});
    setSelectedSnacks({});
    setEmail('');
    setIsSubmitted(false);
    setShowMoreDrinks(false);
    setShowMoreSnacks(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const hasSelectedDrinks = Object.keys(selectedDrinks).length > 0;
  const totals = calculateTotals();

  const coreDrinks = drinks.filter(d => d.category === 'core');
  const popularDrinks = drinks.filter(d => d.category === 'popular');
  const visibleDrinks = showMoreDrinks ? drinks : coreDrinks;

  const coreSnacks = snacks.filter(s => s.category === 'core');
  const otherSnacks = snacks.filter(s => s.category !== 'core');
  const visibleSnacks = showMoreSnacks ? snacks : coreSnacks;

  const renderItemGrid = (
    items: (Drink | Snack)[],
    selectedItems: Record<string, number>,
    updateQuantity: (id: string, change: number) => void,
    isDrink: boolean = true
  ) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-gray-800 border border-gray-600 rounded-xl p-4 hover:border-green-500/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <h3 className="text-white font-semibold">{item.name}</h3>
                <p className="text-gray-400 text-sm">{item.calories} cal • ${item.price}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Quantity:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, -1)}
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white transition-colors"
                disabled={!selectedItems[item.id]}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-white font-semibold w-8 text-center">
                {selectedItems[item.id] || 0}
              </span>
              <button
                onClick={() => updateQuantity(item.id, 1)}
                className="w-8 h-8 bg-green-600 hover:bg-green-500 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {step === 1 && "What drinks are you skipping?"}
            {step === 2 && "Any snacks you're avoiding too?"}
            {step === 3 && "🎉 Your Sober Win!"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step 1: Drink Selection */}
        {step === 1 && (
          <div className="p-6">
            <p className="text-gray-300 mb-6">Select the drinks you're choosing to skip today:</p>
            
            {renderItemGrid(visibleDrinks, selectedDrinks, updateDrinkQuantity, true)}
            
            {/* Show More/Less Button */}
            {!showMoreDrinks && popularDrinks.length > 0 && (
              <button
                onClick={() => setShowMoreDrinks(true)}
                className="w-full mt-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>Show More Drinks ({popularDrinks.length} more)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
            
            {showMoreDrinks && (
              <button
                onClick={() => setShowMoreDrinks(false)}
                className="w-full mt-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>Show Less</span>
                <ChevronUp className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!hasSelectedDrinks}
              className="w-full mt-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Snack Selection */}
        {step === 2 && (
          <div className="p-6">
            <p className="text-gray-300 mb-6">Often drinks come with snacks. Skip those too?</p>
            
            {renderItemGrid(visibleSnacks, selectedSnacks, updateSnackQuantity, false)}
            
            {/* Show More/Less Button */}
            {!showMoreSnacks && otherSnacks.length > 0 && (
              <button
                onClick={() => setShowMoreSnacks(true)}
                className="w-full mt-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>Show More Options ({otherSnacks.length} more)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
            
            {showMoreSnacks && (
              <button
                onClick={() => setShowMoreSnacks(false)}
                className="w-full mt-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>Show Less</span>
                <ChevronUp className="w-4 h-4" />
              </button>
            )}

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>See My Win</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Win Summary */}
        {step === 3 && !isSubmitted && (
          <div className="p-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Amazing Choice!</h3>
              <p className="text-gray-300">Here's what you just gained by skipping:</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">
                  {totals.totalCalories.toLocaleString()}
                </div>
                <div className="text-red-300 font-semibold">Calories Avoided</div>
                <div className="text-gray-400 text-sm mt-1">That's like a 30min walk!</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  ${totals.totalPrice.toFixed(2)}
                </div>
                <div className="text-green-300 font-semibold">Money Saved</div>
                <div className="text-gray-400 text-sm mt-1">Put it towards something better!</div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 mb-8">
              <h4 className="text-white font-semibold mb-4">🎯 Your Skip Summary:</h4>
              <div className="space-y-2">
                {Object.entries(selectedDrinks).map(([drinkId, quantity]) => {
                  const drink = drinks.find(d => d.id === drinkId);
                  return drink ? (
                    <div key={drinkId} className="flex justify-between text-gray-300">
                      <span>{drink.emoji} {quantity}x {drink.name}</span>
                      <span>{drink.calories * quantity} cal • ${(drink.price * quantity).toFixed(2)}</span>
                    </div>
                  ) : null;
                })}
                {Object.entries(selectedSnacks).map(([snackId, quantity]) => {
                  const snack = snacks.find(s => s.id === snackId);
                  return snack ? (
                    <div key={snackId} className="flex justify-between text-gray-300">
                      <span>{snack.emoji} {quantity}x {snack.name}</span>
                      <span>{snack.calories * quantity} cal • ${(snack.price * quantity).toFixed(2)}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            {/* Coming Soon: Progress Charts */}
            <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 mb-8">
              <h4 className="text-white font-semibold mb-4">📊 Coming Soon: See Your Progress</h4>
              <p className="text-gray-400 text-sm mb-6">Track your wins with charts & streaks when the app launches</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Calories Over Time Graph */}
                <div className="relative">
                  <div className="bg-gray-700 rounded-lg p-4 opacity-40 blur-sm">
                    <div className="h-24 relative">
                      {/* Mock line graph */}
                      <svg className="w-full h-full" viewBox="0 0 100 50">
                        <polyline
                          points="5,45 20,35 35,30 50,20 65,15 80,10 95,5"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                        />
                        <circle cx="95" cy="5" r="2" fill="#10b981" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-green-400 font-semibold text-sm">Calories Avoided</div>
                      <div className="text-gray-400 text-xs">Track how many calories you avoid</div>
                    </div>
                  </div>
                </div>

                {/* Money Saved Bar Chart */}
                <div className="relative">
                  <div className="bg-gray-700 rounded-lg p-4 opacity-40 blur-sm">
                    <div className="h-24 flex items-end justify-between gap-1">
                      <div className="bg-yellow-500 w-3 h-8 rounded-t"></div>
                      <div className="bg-yellow-500 w-3 h-12 rounded-t"></div>
                      <div className="bg-yellow-500 w-3 h-16 rounded-t"></div>
                      <div className="bg-yellow-500 w-3 h-20 rounded-t"></div>
                      <div className="bg-yellow-500 w-3 h-24 rounded-t"></div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-yellow-400 font-semibold text-sm">Money Saved</div>
                      <div className="text-gray-400 text-xs">See your savings add up</div>
                    </div>
                  </div>
                </div>

                {/* Streak Heatmap */}
                <div className="relative">
                  <div className="bg-gray-700 rounded-lg p-4 opacity-40 blur-sm">
                    <div className="grid grid-cols-7 gap-1 h-24">
                      {Array.from({ length: 35 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-sm ${
                            Math.random() > 0.3 ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-green-400 font-semibold text-sm">Streak Calendar</div>
                      <div className="text-gray-400 text-xs">Celebrate every proud sober day</div>
                    </div>
                  </div>
                </div>

                {/* Mental Clarity Graph */}
                <div className="relative">
                  <div className="bg-gray-700 rounded-lg p-4 opacity-30 blur-md">
                    <div className="h-24 flex items-center justify-center">
                      {/* Mock brain/focus visualization */}
                      <div className="flex items-end gap-1">
                        <div className="bg-blue-500 w-4 h-8 rounded-t"></div>
                        <div className="bg-blue-500 w-4 h-12 rounded-t"></div>
                        <div className="bg-blue-500 w-4 h-16 rounded-t"></div>
                        <div className="bg-blue-500 w-4 h-20 rounded-t"></div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-blue-400 font-semibold text-sm">Mental Clarity</div>
                      <div className="text-gray-400 text-xs">Feel sharper — measure focus wins soon</div>
                    </div>
                  </div>
                </div>

                {/* Energy Levels Graph */}
                <div className="relative">
                  <div className="bg-gray-700 rounded-lg p-4 opacity-30 blur-md">
                    <div className="h-24 relative">
                      {/* Mock energy wave */}
                      <svg className="w-full h-full" viewBox="0 0 100 50">
                        <path
                          d="M5,40 Q25,20 45,30 T85,15"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="3"
                        />
                        <circle cx="85" cy="15" r="3" fill="#f59e0b" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-amber-400 font-semibold text-sm">Energy Levels</div>
                      <div className="text-gray-400 text-xs">Track your daily energy boost</div>
                    </div>
                  </div>
                </div>

                {/* Mood & Confidence Graph */}
                <div className="relative">
                  <div className="bg-gray-700 rounded-lg p-4 opacity-30 blur-md">
                    <div className="h-24 flex items-center justify-center">
                      {/* Mock mood percentage circle */}
                      <div className="relative w-16 h-16">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#374151"
                            strokeWidth="2"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#ec4899"
                            strokeWidth="2"
                            strokeDasharray="75, 100"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-pink-400 text-xs font-bold">75%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-pink-400 font-semibold text-sm">Mood & Pride</div>
                      <div className="text-gray-400 text-xs">Log wins and watch confidence grow</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-medium">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                  Unlock these features when you join
                </div>
              </div>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Want to track more wins like this? Join our early access:
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-gray-800 border border-gray-600 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Get Early Access'}
              </button>
            </form>

            {submitError && (
              <p className="text-red-400 text-sm mt-3">{submitError}</p>
            )}

            <p className="text-gray-400 text-sm text-center mt-4">
              Free to join • No spam • Launching soon
            </p>
          </div>
        )}

        {/* Success State */}
        {step === 3 && isSubmitted && (
          <div className="p-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">You're In! 🎉</h3>
            <p className="text-gray-300 mb-6">
              Thanks for joining the sober wins movement. We'll notify you as soon as the app launches!
            </p>
            <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 mb-6">
              <p className="text-green-400 font-semibold">Today's Win Recap:</p>
              <p className="text-white text-lg">
                {totals.totalCalories} calories avoided • ${totals.totalPrice.toFixed(2)} saved
              </p>
            </div>
            <button
              onClick={handleClose}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-8 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}