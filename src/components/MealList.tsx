import { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Meal } from '../types';
import { Pencil, Trash2, ChevronDown, ChevronUp, UtensilsCrossed } from 'lucide-react';

interface Props { meals: Meal[]; onEdit: (meal: Meal) => void; }

const ORDER = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const BADGE: Record<string, string> = {
  Breakfast: 'badge badge-breakfast',
  Lunch: 'badge badge-lunch',
  Dinner: 'badge badge-dinner',
  Snack: 'badge badge-snack',
};
const MEAL_ICON: Record<string, string> = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🍎' };
const MEAL_COLOR: Record<string, string> = {
  Breakfast: 'rgba(245,158,11,0.1)',
  Lunch: 'rgba(52,211,153,0.1)',
  Dinner: 'rgba(99,102,241,0.1)',
  Snack: 'rgba(244,63,94,0.1)',
};

export default function MealList({ meals, onEdit }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Remove this meal?')) return;
    setDeletingId(id);
    try { await deleteDoc(doc(db, 'meals', id)); }
    finally { setDeletingId(null); }
  }

  if (meals.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <UtensilsCrossed className="w-7 h-7 text-white/15" />
        </div>
        <p className="font-display text-xl text-white/25 font-light">No meals logged</p>
        <p className="text-white/15 text-sm font-sans mt-1">Tap "Add Meal" to start tracking</p>
      </div>
    );
  }

  const grouped = ORDER.reduce<Record<string, Meal[]>>((acc, type) => {
    const g = meals.filter(m => m.mealType === type);
    if (g.length) acc[type] = g;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([type, typeMeals]) => {
        const typeTotal = typeMeals.reduce((s, m) => s + m.calories, 0);
        return (
          <div key={type}>
            {/* Section header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm"
                style={{ background: MEAL_COLOR[type] }}>
                {MEAL_ICON[type]}
              </div>
              <span className="text-white/50 text-xs font-semibold uppercase tracking-[0.12em]">{type}</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
              <span className="text-white/25 text-xs font-sans font-medium">{typeTotal} kcal</span>
            </div>

            <div className="space-y-2">
              {typeMeals.map((meal, i) => (
                <div
                  key={meal.id}
                  className="rounded-2xl overflow-hidden transition-all duration-200 opacity-0 animate-fade-up"
                  style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    animationDelay: `${i * 50}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <div className="flex items-center gap-3 p-3.5">
                    {/* Calorie bubble */}
                    <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0"
                      style={{ background: MEAL_COLOR[type], border: `1px solid ${MEAL_COLOR[type]}` }}>
                      <span className="text-gold-400 text-sm font-bold font-sans leading-none">{meal.calories}</span>
                      <span className="text-white/30 text-xs font-sans">kcal</span>
                    </div>

                    {/* Name + macros */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white/85 text-sm font-sans font-semibold truncate">{meal.name}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {[
                          { l: 'P', v: meal.protein, c: 'text-emerald-400' },
                          { l: 'C', v: meal.carbs,   c: 'text-gold-400' },
                          { l: 'F', v: meal.fat,     c: 'text-orange-400' },
                        ].map(m => (
                          <span key={m.l} className="text-xs font-sans">
                            <span className={`font-bold ${m.c}`}>{m.v}g</span>
                            <span className="text-white/25 ml-0.5">{m.l}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {meal.notes && (
                        <button onClick={() => setExpandedId(expandedId === meal.id ? null : meal.id)}
                          className="p-2 text-white/20 hover:text-white/50 transition-colors rounded-xl hover:bg-white/5">
                          {expandedId === meal.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <button onClick={() => onEdit(meal)}
                        className="p-2 text-white/20 hover:text-gold-400 transition-colors rounded-xl hover:bg-white/5">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(meal.id)} disabled={deletingId === meal.id}
                        className="p-2 text-white/20 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/5 disabled:opacity-30">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {expandedId === meal.id && meal.notes && (
                    <div className="px-4 pb-3 pt-0 border-t border-white/4">
                      <p className="text-white/35 text-xs font-sans leading-relaxed mt-2">{meal.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
