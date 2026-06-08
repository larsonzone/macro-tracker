import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { DailyGoals as DailyGoalsType } from '../types';
import { Target, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

const DEFAULTS: DailyGoalsType = { calories: 2000, protein: 150, carbs: 200, fat: 65 };

interface Props { onGoalsChange: (goals: DailyGoalsType) => void; }

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
        const d = snap.data() as DailyGoalsType;
        setGoals(d); setForm(d); onGoalsChange(d);
      } else { onGoalsChange(DEFAULTS); }
      setLoading(false);
    });
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'goals', user.uid), form);
      setGoals(form); onGoalsChange(form);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
      setOpen(false);
    } finally { setSaving(false); }
  }

  if (loading) return null;

  const FIELDS = [
    { key: 'calories', label: 'Calories', unit: 'kcal', emoji: '🔥', color: '#d4a017' },
    { key: 'protein',  label: 'Protein',  unit: 'g',    emoji: '🥩', color: '#34d399' },
    { key: 'carbs',    label: 'Carbs',    unit: 'g',    emoji: '🌾', color: '#60a5fa' },
    { key: 'fat',      label: 'Fat',      unit: 'g',    emoji: '🥑', color: '#fb923c' },
  ];

  return (
    <div className="rounded-3xl overflow-hidden transition-all duration-300"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Header toggle */}
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/2 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.2)' }}>
            <Target className="w-4 h-4 text-gold-400" />
          </div>
          <div>
            <p className="text-white/70 text-sm font-sans font-semibold">Daily Goals</p>
            <p className="text-white/25 text-xs font-sans mt-0.5">
              {goals.calories} kcal · {goals.protein}g P · {goals.carbs}g C · {goals.fat}g F
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {open ? <ChevronUp className="w-4 h-4 text-white/25" /> : <ChevronDown className="w-4 h-4 text-white/25" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-white/4">
          <div className="grid grid-cols-2 gap-3 mt-4">
            {FIELDS.map(f => (
              <div key={f.key}>
                <label className="label-xs">{f.emoji} {f.label}</label>
                <div className="relative">
                  <input className="input-dark pr-14"
                    name={f.key} type="number" min={0}
                    value={(form as unknown as Record<string, number>)[f.key] || ''}
                    onChange={e => setForm(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                    placeholder="0" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-sans font-semibold"
                    style={{ color: f.color }}>{f.unit}</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving}
            className="btn-gold mt-4 w-full flex items-center justify-center gap-2 disabled:opacity-50">
            {saving
              ? <div className="w-4 h-4 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />
              : saved ? <><CheckCircle2 className="w-4 h-4" />Saved!</>
              : 'Save Goals'
            }
          </button>
        </div>
      )}
    </div>
  );
}
