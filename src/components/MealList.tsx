import { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Meal } from '../types';
import { Pencil, Trash2, ChevronDown, ChevronUp, Utensils } from 'lucide-react';

interface Props {
  meals: Meal[];
  onEdit: (meal: Meal) => void;
}

const mealTypeOrder = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const badgeClass: Record<string, string> = {
  Breakfast: 'meal-badge-breakfast',
  Lunch: 'meal-badge-lunch',
  Dinner: 'meal-badge-dinner',
  Snack: 'meal-badge-snack',
};

const mealTypeIcon: Record<string, string> = {
  Breakfast: '🌅',
  Lunch: '☀️',
  Dinner: '🌙',
  Snack: '🍎',
};

export default function MealList({ meals, onEdit }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Remove this meal from your log?')) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'meals', id));
    } finally {
      setDeletingId(null);
    }
  }

  if (meals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mx-auto mb-4">
          <Utensils className="w-7 h-7 text-white/20" />
        </div>
        <p className="text-white/30 font-display text-lg font-light">No meals logged yet</p>
        <p className="text-white/20 text-sm font-sans mt-1">Tap "Add Meal" to start tracking</p>
      </div>
    );
  }

  // Group by meal type in order
  const grouped = mealTypeOrder.reduce<Record<string, Meal[]>>((acc, type) => {
    const group = meals.filter(m => m.mealType === type);
    if (group.length > 0) acc[type] = group;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([type, typeMeals]) => (
        <div key={type}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{mealTypeIcon[type]}</span>
            <span className="text-white/40 text-xs uppercase tracking-widest font-sans">{type}</span>
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-white/25 text-xs font-sans">
              {typeMeals.reduce((s, m) => s + m.calories, 0)} kcal
            </span>
          </div>

          <div className="space-y-2">
            {typeMeals.map((meal) => (
              <div
                key={meal.id}
                className="glass-card overflow-hidden transition-all duration-200 hover:border-white/12"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-3 p-4">
                  {/* Name & badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white/90 text-sm font-sans font-medium truncate">{meal.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-sans ${badgeClass[meal.mealType]}`}>
                        {meal.mealType}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-gold-400 text-sm font-sans font-semibold">{meal.calories} kcal</span>
                      <span className="text-white/25 text-xs font-sans">P: {meal.protein}g</span>
                      <span className="text-white/25 text-xs font-sans">C: {meal.carbs}g</span>
                      <span className="text-white/25 text-xs font-sans">F: {meal.fat}g</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {meal.notes && (
                      <button
                        onClick={() => setExpandedId(expandedId === meal.id ? null : meal.id)}
                        className="p-1.5 text-white/25 hover:text-white/60 transition-colors rounded-lg hover:bg-white/5"
                      >
                        {expandedId === meal.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(meal)}
                      className="p-1.5 text-white/25 hover:text-gold-400 transition-colors rounded-lg hover:bg-white/5"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(meal.id)}
                      disabled={deletingId === meal.id}
                      className="p-1.5 text-white/25 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/5 disabled:opacity-40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notes expansion */}
                {expandedId === meal.id && meal.notes && (
                  <div className="px-4 pb-4 border-t border-white/5 pt-3">
                    <p className="text-white/40 text-xs font-sans leading-relaxed">{meal.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
