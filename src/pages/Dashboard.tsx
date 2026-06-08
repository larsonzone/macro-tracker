import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Meal, DailyGoals as DailyGoalsType, DailyTotals } from '../types';
import Navbar from '../components/Navbar';
import MacroCard from '../components/MacroCard';
import AddMealForm from '../components/AddMealForm';
import MealList from '../components/MealList';
import DailyGoals from '../components/DailyGoals';
import NutritionPanel from '../components/NutritionPanel';
import { format, parseISO, subDays, addDays } from 'date-fns';
import { Plus, ChevronLeft, ChevronRight, LayoutDashboard, CalendarDays, BarChart3, Flame } from 'lucide-react';

const DEFAULT_GOALS: DailyGoalsType = { calories: 2000, protein: 150, carbs: 200, fat: 65 };
type Tab = 'today' | 'history' | 'report';

export default function Dashboard() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealsLoading, setMealsLoading] = useState(true);
  const [goals, setGoals] = useState<DailyGoalsType>(DEFAULT_GOALS);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMeal, setEditMeal] = useState<Meal | null>(null);
  const [tab, setTab] = useState<Tab>('today');

  useEffect(() => {
    if (!user) return;
    setMealsLoading(true);
    const q = query(collection(db, 'meals'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setMeals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Meal)));
      setMealsLoading(false);
    });
  }, [user]);

  const todayMeals = useMemo(() => meals.filter(m => m.date === selectedDate), [meals, selectedDate]);

  const totals: DailyTotals = useMemo(() => todayMeals.reduce(
    (acc, m) => ({ calories: acc.calories + m.calories, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  ), [todayMeals]);

  const caloriesPct = goals.calories > 0 ? Math.min(100, Math.round((totals.calories / goals.calories) * 100)) : 0;
  const historyDates = useMemo(() => {
    const s = new Set(meals.map(m => m.date));
    return Array.from(s).sort((a, b) => b.localeCompare(a)).slice(0, 30);
  }, [meals]);

  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');
  const displayDate = isToday ? 'Today' : format(parseISO(selectedDate), 'EEE, MMM d');

  function prevDay() { setSelectedDate(d => format(subDays(parseISO(d), 1), 'yyyy-MM-dd')); }
  function nextDay() {
    const next = addDays(parseISO(selectedDate), 1);
    if (next <= new Date()) setSelectedDate(format(next, 'yyyy-MM-dd'));
  }

  const TABS = [
    { id: 'today' as Tab,   label: 'Overview', icon: LayoutDashboard },
    { id: 'history' as Tab, label: 'History',  icon: CalendarDays },
    { id: 'report' as Tab,  label: 'Report',   icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-app">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* ── Hero header ── */}
        <div className="mb-8 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl text-white font-light tracking-wide">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}
                <span className="text-gradient-gold">, {user?.displayName?.split(' ')[0] || 'there'}</span>
              </h1>
              <p className="text-white/30 text-sm font-sans mt-1">Here's your nutrition snapshot</p>
            </div>

            {/* Calorie ring hero badge */}
            <div className="flex items-center gap-4 glass rounded-2xl px-5 py-3 w-fit glow-gold">
              <div className="relative w-14 h-14">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#d4a017" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${(caloriesPct / 100) * (2 * Math.PI * 22)} ${2 * Math.PI * 22}`}
                    style={{ filter: 'drop-shadow(0 0 6px rgba(212,160,23,0.6))', transition: 'stroke-dasharray 1s ease' }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-gold-400" />
                </div>
              </div>
              <div>
                <p className="text-white/35 text-xs font-sans uppercase tracking-widest">Calories</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-display text-3xl text-gold-400 font-light">{totals.calories}</span>
                  <span className="text-white/25 text-sm font-sans">/ {goals.calories}</span>
                </div>
                <p className="text-white/25 text-xs font-sans mt-0.5">{caloriesPct}% of goal</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Date navigator ── */}
        <div className="flex items-center gap-2 mb-6 opacity-0 animate-fade-up delay-100" style={{ animationFillMode: 'forwards' }}>
          <button onClick={prevDay} className="p-2.5 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all border border-white/5">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="glass rounded-2xl px-5 py-2.5 flex-1 sm:flex-none text-center sm:min-w-[160px]">
            <p className="text-white/75 text-sm font-sans font-semibold">{displayDate}</p>
          </div>
          <button onClick={nextDay} disabled={isToday}
            className="p-2.5 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all border border-white/5 disabled:opacity-20 disabled:cursor-not-allowed">
            <ChevronRight className="w-4 h-4" />
          </button>
          {!isToday && (
            <button onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
              className="text-gold-400 hover:text-gold-300 text-xs font-sans font-semibold px-3 py-2 rounded-xl hover:bg-gold-500/8 transition-all border border-gold-500/15">
              Today
            </button>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 p-1 rounded-2xl w-fit mb-6 opacity-0 animate-fade-up delay-150"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', animationFillMode: 'forwards' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-sans font-medium transition-all duration-200"
              style={{
                background: tab === id ? 'rgba(212,160,23,0.12)' : 'transparent',
                color: tab === id ? '#d4a017' : 'rgba(255,255,255,0.35)',
                border: tab === id ? '1px solid rgba(212,160,23,0.25)' : '1px solid transparent',
                boxShadow: tab === id ? '0 0 16px rgba(212,160,23,0.08)' : 'none',
              }}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW TAB ══ */}
        {tab === 'today' && (
          <div className="space-y-6">
            {/* Macro cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MacroCard label="Calories" value={totals.calories} goal={goals.calories} unit="kcal" color="gold"    icon="🔥" delay={0} />
              <MacroCard label="Protein"  value={totals.protein}  goal={goals.protein}  unit="g"    color="emerald" icon="🥩" delay={75} />
              <MacroCard label="Carbs"    value={totals.carbs}    goal={goals.carbs}    unit="g"    color="blue"    icon="🌾" delay={150} />
              <MacroCard label="Fat"      value={totals.fat}      goal={goals.fat}      unit="g"    color="orange"  icon="🥑" delay={225} />
            </div>

            <div className="grid lg:grid-cols-5 gap-5">
              {/* Left col: goals + meals */}
              <div className="lg:col-span-3 space-y-4">
                <DailyGoals onGoalsChange={setGoals} />

                {/* Meals card */}
                <div className="rounded-3xl p-5 opacity-0 animate-fade-up delay-300"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', animationFillMode: 'forwards' }}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="font-display text-2xl text-white/85 font-light">Meals</h2>
                      <p className="text-white/25 text-xs font-sans mt-0.5">
                        {todayMeals.length} {todayMeals.length === 1 ? 'entry' : 'entries'} logged
                      </p>
                    </div>
                    <button onClick={() => { setEditMeal(null); setShowAddForm(true); }} className="btn-gold flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Meal
                    </button>
                  </div>

                  {mealsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-2 border-gold-500/15 border-t-gold-500 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <MealList meals={todayMeals} onEdit={m => { setEditMeal(m); setShowAddForm(true); }} />
                  )}
                </div>
              </div>

              {/* Right col: nutrition panel */}
              <div className="lg:col-span-2 opacity-0 animate-fade-up delay-400" style={{ animationFillMode: 'forwards' }}>
                <NutritionPanel totals={totals} goals={goals} />
              </div>
            </div>
          </div>
        )}

        {/* ══ HISTORY TAB ══ */}
        {tab === 'history' && (
          <div className="space-y-3 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-white/85 font-light">History</h2>
              <span className="text-white/25 text-xs font-sans">{historyDates.length} days tracked</span>
            </div>

            {historyDates.length === 0 ? (
              <div className="rounded-3xl p-16 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <p className="font-display text-xl text-white/20 font-light">No history yet</p>
                <p className="text-white/15 text-sm font-sans mt-1">Start logging to build your history</p>
              </div>
            ) : historyDates.map((date, i) => {
              const dayMeals = meals.filter(m => m.date === date);
              const dayTotals = dayMeals.reduce((a, m) => ({ cal: a.cal + m.calories, prot: a.prot + m.protein }), { cal: 0, prot: 0 });
              const pct = Math.min(100, (dayTotals.cal / goals.calories) * 100);
              const isSelected = date === selectedDate;

              return (
                <div key={date} className="rounded-3xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 opacity-0 animate-fade-up"
                  style={{
                    background: isSelected ? 'rgba(212,160,23,0.06)' : 'rgba(255,255,255,0.025)',
                    border: isSelected ? '1px solid rgba(212,160,23,0.25)' : '1px solid rgba(255,255,255,0.05)',
                    animationDelay: `${i * 40}ms`,
                    animationFillMode: 'forwards',
                  }}
                  onClick={() => { setSelectedDate(date); setTab('today'); }}>

                  <div className="flex items-center gap-4 p-4">
                    {/* Date bubble */}
                    <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0"
                      style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.15)' }}>
                      <span className="text-gold-400 text-sm font-bold font-sans leading-none">{format(parseISO(date), 'd')}</span>
                      <span className="text-white/30 text-xs font-sans">{format(parseISO(date), 'MMM')}</span>
                    </div>

                    <div className="flex-1">
                      <p className="text-white/75 text-sm font-sans font-semibold">
                        {date === format(new Date(), 'yyyy-MM-dd') ? 'Today' : format(parseISO(date), 'EEEE')}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-gold-400 text-xs font-sans font-bold">{dayTotals.cal} kcal</span>
                        <span className="text-emerald-400 text-xs font-sans">{dayTotals.prot}g protein</span>
                        <span className="text-white/25 text-xs font-sans">{dayMeals.length} meals</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="h-full bg-gold-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, boxShadow: '0 0 6px rgba(212,160,23,0.4)' }} />
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
                  </div>

                  {dayMeals.length > 0 && (
                    <div className="px-4 pb-3 flex flex-wrap gap-1.5 border-t border-white/4 pt-3">
                      {dayMeals.slice(0, 4).map(m => (
                        <span key={m.id} className="text-xs font-sans text-white/30 bg-white/4 border border-white/5 px-2.5 py-1 rounded-xl">
                          {m.name}
                        </span>
                      ))}
                      {dayMeals.length > 4 && (
                        <span className="text-xs font-sans text-white/20 px-2 py-1">+{dayMeals.length - 4} more</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ REPORT TAB ══ */}
        {tab === 'report' && (
          <div className="max-w-xl opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-white/85 font-light">Nutrition Report</h2>
              <span className="text-white/25 text-xs font-sans">{displayDate}</span>
            </div>
            <NutritionPanel totals={totals} goals={goals} />
          </div>
        )}
      </main>

      {showAddForm && (
        <AddMealForm onClose={() => { setShowAddForm(false); setEditMeal(null); }} editMeal={editMeal} selectedDate={selectedDate} />
      )}
    </div>
  );
}
