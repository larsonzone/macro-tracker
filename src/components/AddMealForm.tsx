import { useState } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { MealType, Meal, MealFormData } from '../types';
import { format } from 'date-fns';
import { X, Plus, Save } from 'lucide-react';

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const defaultForm: MealFormData = {
  name: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  mealType: 'Breakfast',
  notes: '',
};

interface Props {
  onClose: () => void;
  editMeal?: Meal | null;
  selectedDate: string;
}

export default function AddMealForm({ onClose, editMeal, selectedDate }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState<MealFormData>(
    editMeal
      ? {
          name: editMeal.name,
          calories: editMeal.calories,
          protein: editMeal.protein,
          carbs: editMeal.carbs,
          fat: editMeal.fat,
          mealType: editMeal.mealType,
          notes: editMeal.notes ?? '',
        }
      : defaultForm
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: ['calories', 'protein', 'carbs', 'fat'].includes(name) ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim()) { setError('Please enter a food name.'); return; }
    if (form.calories < 0 || form.protein < 0 || form.carbs < 0 || form.fat < 0) {
      setError('Values cannot be negative.'); return;
    }

    setLoading(true);
    setError('');

    try {
      if (editMeal) {
        const ref = doc(db, 'meals', editMeal.id);
        await updateDoc(ref, { ...form });
      } else {
        await addDoc(collection(db, 'meals'), {
          ...form,
          userId: user.uid,
          date: selectedDate,
          createdAt: Date.now(),
        });
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save meal.');
    } finally {
      setLoading(false);
    }
  }

  const displayDate = format(new Date(selectedDate + 'T12:00:00'), 'MMMM d, yyyy');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(1,24,18,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-card gold-border w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="font-display text-xl text-white font-light">
              {editMeal ? 'Edit Meal' : 'Log a Meal'}
            </h2>
            <p className="text-white/30 text-xs font-sans mt-0.5">{displayDate}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Food name */}
          <div>
            <label className="label">Food Name</label>
            <input
              className="input-field"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Grilled Chicken Salad"
              autoFocus
            />
          </div>

          {/* Meal type */}
          <div>
            <label className="label">Meal Type</label>
            <select
              className="input-field"
              name="mealType"
              value={form.mealType}
              onChange={handleChange}
            >
              {MEAL_TYPES.map(t => (
                <option key={t} value={t} style={{ background: '#022c22' }}>{t}</option>
              ))}
            </select>
          </div>

          {/* Macros grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Calories</label>
              <input className="input-field" name="calories" type="number" min={0} value={form.calories || ''} onChange={handleChange} placeholder="0" />
            </div>
            <div>
              <label className="label">Protein (g)</label>
              <input className="input-field" name="protein" type="number" min={0} value={form.protein || ''} onChange={handleChange} placeholder="0" />
            </div>
            <div>
              <label className="label">Carbs (g)</label>
              <input className="input-field" name="carbs" type="number" min={0} value={form.carbs || ''} onChange={handleChange} placeholder="0" />
            </div>
            <div>
              <label className="label">Fat (g)</label>
              <input className="input-field" name="fat" type="number" min={0} value={form.fat || ''} onChange={handleChange} placeholder="0" />
            </div>
          </div>

          {/* Macro hint */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-white/3 border border-white/5">
            {[
              { label: 'Protein cal', val: form.protein * 4 },
              { label: 'Carb cal', val: form.carbs * 4 },
              { label: 'Fat cal', val: form.fat * 9 },
            ].map(item => (
              <div key={item.label} className="text-center">
                <p className="text-white/30 text-xs font-sans">{item.label}</p>
                <p className="text-gold-400 text-sm font-sans font-medium">{item.val}</p>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes <span className="text-white/20">(optional)</span></label>
            <textarea
              className="input-field resize-none"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any details about this meal..."
              rows={2}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 font-sans">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? (
                <div className="w-4 h-4 border-2 border-emerald-900/40 border-t-emerald-900 rounded-full animate-spin" />
              ) : editMeal ? (
                <><Save className="w-4 h-4" /> Save Changes</>
              ) : (
                <><Plus className="w-4 h-4" /> Add Meal</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
