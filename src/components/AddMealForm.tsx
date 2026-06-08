import { useState } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { MealType, Meal, MealFormData } from '../types';
import { format } from 'date-fns';
import { X, Plus, Save, Flame } from 'lucide-react';

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const TYPE_ICON: Record<string, string> = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🍎' };

const defaultForm: MealFormData = { name: '', calories: 0, protein: 0, carbs: 0, fat: 0, mealType: 'Breakfast', notes: '' };

interface Props { onClose: () => void; editMeal?: Meal | null; selectedDate: string; }

export default function AddMealForm({ onClose, editMeal, selectedDate }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState<MealFormData>(
    editMeal ? { name: editMeal.name, calories: editMeal.calories, protein: editMeal.protein, carbs: editMeal.carbs, fat: editMeal.fat, mealType: editMeal.mealType, notes: editMeal.notes ?? '' }
    : defaultForm
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: ['calories','protein','carbs','fat'].includes(name) ? Number(value) : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !form.name.trim()) { setError('Please enter a food name.'); return; }
    setLoading(true); setError('');
    try {
      if (editMeal) { await updateDoc(doc(db, 'meals', editMeal.id), { ...form }); }
      else { await addDoc(collection(db, 'meals'), { ...form, userId: user.uid, date: selectedDate, createdAt: Date.now() }); }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally { setLoading(false); }
  }

  const calCheck = form.protein * 4 + form.carbs * 4 + form.fat * 9;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(2,6,4,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl animate-scale-in"
        style={{ background: '#0a1510', border: '1px solid rgba(212,160,23,0.2)', boxShadow: '0 -20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(212,160,23,0.08)' }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="font-display text-2xl text-white font-light">{editMeal ? 'Edit Meal' : 'Log a Meal'}</h2>
            <p className="text-white/25 text-xs font-sans mt-0.5">{format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d')}</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/25 hover:text-white/60 transition-colors rounded-xl hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Food name */}
          <div>
            <label className="label-xs">Food Name</label>
            <input className="input-dark" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Grilled Chicken & Rice" autoFocus />
          </div>

          {/* Meal type pills */}
          <div>
            <label className="label-xs">Meal Type</label>
            <div className="grid grid-cols-4 gap-2">
              {MEAL_TYPES.map(t => (
                <button key={t} type="button" onClick={() => setForm(p => ({ ...p, mealType: t }))}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-200 border"
                  style={{
                    background: form.mealType === t ? 'rgba(212,160,23,0.12)' : 'rgba(255,255,255,0.03)',
                    borderColor: form.mealType === t ? 'rgba(212,160,23,0.35)' : 'rgba(255,255,255,0.06)',
                    boxShadow: form.mealType === t ? '0 0 16px rgba(212,160,23,0.1)' : 'none',
                  }}>
                  <span className="text-lg">{TYPE_ICON[t]}</span>
                  <span className="text-xs font-sans font-medium" style={{ color: form.mealType === t ? '#d4a017' : 'rgba(255,255,255,0.4)' }}>{t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'calories', label: '🔥 Calories', unit: 'kcal', color: '#d4a017' },
              { name: 'protein',  label: '🥩 Protein',  unit: 'g',    color: '#34d399' },
              { name: 'carbs',    label: '🌾 Carbs',    unit: 'g',    color: '#60a5fa' },
              { name: 'fat',      label: '🥑 Fat',      unit: 'g',    color: '#fb923c' },
            ].map(f => (
              <div key={f.name}>
                <label className="label-xs">{f.label}</label>
                <div className="relative">
                  <input className="input-dark pr-12"
                    name={f.name} type="number" min={0}
                    value={(form as unknown as Record<string, number>)[f.name] || ''}
                    onChange={handleChange} placeholder="0" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-sans font-medium"
                    style={{ color: f.color }}>{f.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Calorie check */}
          {calCheck > 0 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(212,160,23,0.05)', border: '1px solid rgba(212,160,23,0.1)' }}>
              <span className="text-white/40 text-xs font-sans">Macro-derived calories</span>
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-gold-400" />
                <span className="text-gold-400 text-sm font-bold font-sans">{calCheck} kcal</span>
                {Math.abs(calCheck - form.calories) > 20 && form.calories > 0 && (
                  <span className="text-orange-400 text-xs ml-1">(diff: {Math.abs(calCheck - form.calories)})</span>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="label-xs">Notes <span className="text-white/20 normal-case tracking-normal">optional</span></label>
            <textarea className="input-dark resize-none" name="notes" value={form.notes} onChange={handleChange}
              placeholder="Any details..." rows={2} />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/8 border border-red-500/15 rounded-2xl px-4 py-3 font-sans">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading
                ? <div className="w-4 h-4 border-2 border-emerald-900/30 border-t-emerald-950 rounded-full animate-spin" />
                : editMeal
                  ? <><Save className="w-4 h-4" />Save Changes</>
                  : <><Plus className="w-4 h-4" />Add Meal</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
