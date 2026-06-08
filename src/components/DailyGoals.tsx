import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { DailyGoals as DailyGoalsType } from '../types';
import { Target, Save, ChevronDown, ChevronUp } from 'lucide-react';

const DEFAULTS: DailyGoalsType = { calories: 2000, protein: 150, carbs: 200, fat: 65 };

interface Props {
  onGoalsChange: (goals: DailyGoalsType) => void;
}

export default function DailyGoals({ onGoalsChange }: Props) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<DailyGoalsType>(DEFAULTS);
  const [form, setForm] = useState<DailyGoalsType>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'goals', user.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data() as DailyGoalsType;
        setGoals(data);
        setForm(data);
        onGoalsChange(data);
      } else {
        onGoalsChange(DEFAULTS);
      }
      setLoading(false);
    });
  }, [user]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: Number(value) }));
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'goals', user.uid), form);
      setGoals(form);
      onGoalsChange(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  return (
    <div className="glass-card gold-border overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold-500/15 border border-gold-500/25 flex items-center justify-center">
            <Target className="w-4 h-4 text-gold-400" />
          </div>
          <div>
            <p className="text-white/80 text-sm font-sans font-medium">Daily Goals</p>
            <p className="text-white/30 text-xs font-sans mt-0.5">
              {goals.calories} kcal · {goals.protein}g P · {goals.carbs}g C · {goals.fat}g F
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-white/5">
          <div className="grid grid-cols-2 gap-4 mt-4">
            {[
              { key: 'calories', label: 'Calories', unit: 'kcal', icon: '🔥' },
              { key: 'protein', label: 'Protein', unit: 'g', icon: '🥩' },
              { key: 'carbs', label: 'Carbs', unit: 'g', icon: '🌾' },
              { key: 'fat', label: 'Fat', unit: 'g', icon: '🥑' },
            ].map(({ key, label, unit, icon }) => (
              <div key={key}>
                <label className="label">{icon} {label} ({unit})</label>
                <input
                  className="input-field"
                  name={key}
                  type="number"
                  min={0}
                  value={(form as unknown as Record<string, number>)[key] || ''}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary mt-4 w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-emerald-900/30 border-t-emerald-900 rounded-full animate-spin" />
            ) : saved ? (
              <><span>✓</span> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save Goals</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
