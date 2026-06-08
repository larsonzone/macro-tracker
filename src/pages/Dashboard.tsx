import { useState, useEffect, useMemo } from 'react';
import {
  collection, query, where, onSnapshot, orderBy,
} from 'firebase/firestore';
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
import { Plus, ChevronLeft, ChevronRight, Activity, CalendarDays, BarChart3 } from 'lucide-react';

const DEFAULT_GOALS: DailyGoalsType = { calories: 2000, protein: 150, carbs: 200, fat: 65 };

type Tab = 'today' | 'history' | 'report';

export default function Dashboard() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealsLoading, setMealsLoading] = useState(true);
  const [goals, setGoals] = useState<DailyGoalsType>(DEFAULT_GOALS);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMeal, setEditMeal] = useState<Meal | null>(null);
  const [tab, setTab] = useState<Tab>('today');

  // Real-time meals listener
  useEffect(() => {
    if (!user) return;
    setMealsLoading(true);
    const q = query(
      collection(db, 'meals'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Meal));
      setMeals(data);
      setMealsLoading(false);
    });
    return unsub;
  }, [user]);

  const todayMeals = useMemo(() => meals.filter(m => m.date === selectedDate), [meals, selectedDate]);

  const totals: DailyTotals = useMemo(() => todayMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  ), [todayMeals]);

  // Wellness score: simple composite
  const wellnessScore = useMemo(() => {
    if (goals.calories === 0) return 0;
    const calScore = Math.min(100, Math.round((totals.calories / goals.calories) * 90));
    const protScore = goals.protein > 0 ? Math.min(100, Math.round((totals.protein / goals.protein) * 100)) : 0;
    return Math.round((calScore + protScore) / 2);
  }, [totals, goals]);

  // History: unique dates with meals, last 14 days
  const historyDates = useMemo(() => {
    const dateSet = new Set(meals.map(m => m.date));
    return Array.from(dateSet).sort((a, b) => b.localeCompare(a)).slice(0, 30);
  }, [meals]);

  function prevDay() {
    setSelectedDate(d => format(subDays(parseISO(d), 1), 'yyyy-MM-dd'));
  }
  function nextDay() {
    const next = addDays(parseISO(selectedDate), 1);
    if (next <= new Date()) setSelectedDate(format(next, 'yyyy-MM-dd'));
  }

  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');
  const displayDate = isToday ? 'Today' : format(parseISO(selectedDate), 'EEEE, MMMM d');

  function openEdit(meal: Meal) {
    setEditMeal(meal);
    setShowAddForm(true);
  }

  function closeForm() {
    setShowAddForm(false);
    setEditMeal(null);
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl text-white font-light">Dashboard</h1>
            <p className="text-white/35 text-sm font-sans mt-1">Track your nutrition, hit your goals</p>
          </div>

          {/* Wellness score badge */}
          <div className="flex items-center gap-3 glass-card px-4 py-3 w-fit">
            <Activity className="w-4 h-4 text-gold-400" />
            <div>
              <p className="text-white/35 text-xs font-sans">Wellness Score</p>
              <p className="font-display text-xl text-gold-400 font-light leading-none mt-0.5">{wellnessScore}</p>
            </div>
            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden ml-2">
              <div
                className="h-full rounded-full bg-gold-500 transition-all duration-700"
                style={{ width: `${wellnessScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Date navigator */}
        <div className="flex items-center gap-3 mb-6 animate-fade-in animate-delay-100">
          <button onClick={prevDay} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="glass-card px-5 py-2.5 flex-1 sm:flex-none text-center min-w-[180px]">
            <p className="text-white/80 text-sm font-sans font-medium">{displayDate}</p>
            {!isToday && (
              <p className="text-white/30 text-xs font-sans">{format(parseISO(selectedDate), 'yyyy-MM-dd')}</p>
            )}
          </div>
          <button
            onClick={nextDay}
            disabled={isToday}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
              className="text-gold-400 hover:text-gold-300 text-xs font-sans px-3 py-1.5 rounded-lg hover:bg-gold-500/10 transition-all"
            >
              Back to Today
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-white/6 w-fit mb-6 animate-fade-in animate-delay-200">
          {([
            { id: 'today', label: 'Overview', icon: BarChart3 },
            { id: 'history', label: 'History', icon: CalendarDays },
            { id: 'report', label: 'Report', icon: Activity },
          ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans transition-all ${
                tab === id
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/25'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* === OVERVIEW TAB === */}
        {tab === 'today' && (
          <div className="space-y-6">
            {/* Macro cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MacroCard label="Calories" value={totals.calories} goal={goals.calories} unit="kcal" color="gold" icon="🔥" delay={0} />
              <MacroCard label="Protein" value={totals.protein} goal={goals.protein} unit="g" color="emerald" icon="🥩" delay={100} />
              <MacroCard label="Carbs" value={totals.carbs} goal={goals.carbs} unit="g" color="blue" icon="🌾" delay={200} />
              <MacroCard label="Fat" value={totals.fat} goal={goals.fat} unit="g" color="orange" icon="🥑" delay={300} />
            </div>

            {/* Goals + Meals */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left: goals + meal list */}
              <div className="lg:col-span-2 space-y-4">
                <DailyGoals onGoalsChange={setGoals} />

                {/* Meals section */}
                <div className="glass-card p-5 animate-slide-up animate-delay-300">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="section-title">Meals</h2>
                      <p className="text-white/30 text-xs font-sans mt-0.5">
                        {todayMeals.length} {todayMeals.length === 1 ? 'entry' : 'entries'} · {totals.calories} kcal
                      </p>
                    </div>
                    <button
                      onClick={() => { setEditMeal(null); setShowAddForm(true); }}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Meal
                    </button>
                  </div>

                  {mealsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-6 h-6 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <MealList meals={todayMeals} onEdit={openEdit} />
                  )}
                </div>
              </div>

              {/* Right: mini report */}
              <div className="animate-slide-up animate-delay-400">
                <NutritionPanel totals={totals} goals={goals} />
              </div>
            </div>
          </div>
        )}

        {/* === HISTORY TAB === */}
        {tab === 'history' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Meal History</h2>
              <p className="text-white/30 text-xs font-sans">{historyDates.length} days logged</p>
            </div>

            {historyDates.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-white/30 font-display text-lg font-light">No history yet</p>
                <p className="text-white/20 text-sm font-sans mt-1">Start logging meals to see your history</p>
              </div>
            ) : (
              historyDates.map(date => {
                const dayMeals = meals.filter(m => m.date === date);
                const dayTotals = dayMeals.reduce(
                  (acc, m) => ({ ...acc, calories: acc.calories + m.calories, protein: acc.protein + m.protein }),
                  { calories: 0, protein: 0 }
                );
                const isSelected = date === selectedDate;

                return (
                  <div
                    key={date}
                    className={`glass-card overflow-hidden transition-all duration-200 cursor-pointer ${isSelected ? 'gold-border' : 'hover:border-white/10'}`}
                    style={{ border: isSelected ? undefined : '1px solid rgba(255,255,255,0.05)' }}
                  >
                    {/* Date header */}
                    <div
                      className="flex items-center justify-between p-4 hover:bg-white/2"
                      onClick={() => { setSelectedDate(date); setTab('today'); }}
                    >
                      <div>
                        <p className="text-white/80 text-sm font-sans font-medium">
                          {date === format(new Date(), 'yyyy-MM-dd') ? 'Today' : format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-white/30 text-xs font-sans mt-0.5">
                          {dayMeals.length} meals · {dayTotals.calories} kcal · {dayTotals.protein}g protein
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gold-500 rounded-full"
                            style={{ width: `${Math.min(100, (dayTotals.calories / goals.calories) * 100)}%` }}
                          />
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20" />
                      </div>
                    </div>

                    {/* Meal chips */}
                    <div className="px-4 pb-4 flex flex-wrap gap-2">
                      {dayMeals.map(m => (
                        <span
                          key={m.id}
                          className="text-xs font-sans text-white/40 bg-white/4 border border-white/6 px-2.5 py-1 rounded-lg"
                        >
                          {m.name} · {m.calories} kcal
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* === REPORT TAB === */}
        {tab === 'report' && (
          <div className="max-w-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Nutrition Report</h2>
              <p className="text-white/30 text-xs font-sans">{displayDate}</p>
            </div>
            <NutritionPanel totals={totals} goals={goals} />
          </div>
        )}
      </main>

      {/* Add/Edit meal modal */}
      {showAddForm && (
        <AddMealForm
          onClose={closeForm}
          editMeal={editMeal}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}
