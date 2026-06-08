import { useMemo } from 'react';
import { DailyTotals, DailyGoals, NutritionScore } from '../types';

interface Props { totals: DailyTotals; goals: DailyGoals; }

function computeScores(totals: DailyTotals, goals: DailyGoals): NutritionScore {
  const calPct  = goals.calories > 0 ? totals.calories / goals.calories : 0;
  const protPct = goals.protein  > 0 ? totals.protein  / goals.protein  : 0;
  const carbPct = goals.carbs    > 0 ? totals.carbs    / goals.carbs    : 0;
  const fatPct  = goals.fat      > 0 ? totals.fat      / goals.fat      : 0;

  const proteinScore     = Math.round(protPct >= 0.9 && protPct <= 1.1 ? 95 : protPct >= 0.75 ? 80 : protPct >= 0.5 ? 60 : protPct * 80);
  const metabolicScore   = Math.round(calPct  >= 0.85 && calPct  <= 1.05 ? 92 : calPct >= 0.7 && calPct <= 1.2 ? 75 : calPct < 0.5 ? 45 : 60);
  const totalMacroG      = totals.protein + totals.carbs + totals.fat;
  const fatRatio         = totalMacroG > 0 ? totals.fat / totalMacroG : 0;
  const bcScore          = Math.round(proteinScore * 0.6 + (fatPct > 0.5 && fatPct < 1.1 ? 90 : 60) * 0.4);
  const foodQuality      = Math.round(fatRatio < 0.25 ? 88 : fatRatio < 0.35 ? 78 : fatRatio < 0.45 ? 65 : 50);
  const overall          = Math.round((proteinScore + metabolicScore + bcScore + foodQuality) / 4);

  const recommendations: string[] = [];
  if (protPct < 0.7)   recommendations.push('Boost protein — aim for lean meats, eggs, or legumes at your next meal.');
  if (calPct  < 0.7)   recommendations.push("You're under your calorie goal — make sure you're fuelling your activity.");
  if (calPct  > 1.2)   recommendations.push('Slightly over calories today — go lighter tomorrow to rebalance.');
  if (carbPct > 1.3)   recommendations.push('High carbs — swap refined grains for oats, sweet potato, or quinoa.');
  if (fatRatio > 0.4)  recommendations.push('Fat ratio is high — balance with lean protein and fibrous veggies.');
  if (!recommendations.length) recommendations.push('Perfect balance today — your macros are exactly on target. Keep it up!');
  if (protPct >= 0.9 && protPct <= 1.1) recommendations.push('Protein is spot on — great for muscle recovery and satiety.');

  return { overall, protein: proteinScore, metabolic: metabolicScore, bodyComposition: bcScore, foodQuality, recommendations };
}

interface ScoreGaugeProps { value: number; label: string; emoji: string; color: string; glow: string; delay: number; }

function ScoreGauge({ value, label, emoji, color, glow, delay }: ScoreGaugeProps) {
  const r = 26; const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const grade = value >= 90 ? 'S' : value >= 80 ? 'A' : value >= 70 ? 'B' : value >= 60 ? 'C' : 'D';

  return (
    <div
      className="flex flex-col items-center gap-3 opacity-0 animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="relative w-[72px] h-[72px]">
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full animate-pulse-ring"
          style={{ boxShadow: `0 0 16px ${glow}`, opacity: 0.4 }}
        />
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
          <circle
            cx="36" cy="36" r={r} fill="none"
            stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ filter: `drop-shadow(0 0 5px ${color}99)`, transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-black font-sans" style={{ color }}>{grade}</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-base mb-0.5">{emoji}</div>
        <div className="text-white/50 text-xs font-sans leading-tight text-center">{label}</div>
        <div className="text-xs font-bold mt-0.5" style={{ color }}>{value}</div>
      </div>
    </div>
  );
}

export default function NutritionPanel({ totals, goals }: Props) {
  const scores = useMemo(() => computeScores(totals, goals), [totals, goals]);

  const overallColor = scores.overall >= 80 ? '#34d399' : scores.overall >= 60 ? '#d4a017' : '#f87171';
  const overallLabel = scores.overall >= 90 ? 'Elite' : scores.overall >= 80 ? 'Excellent' : scores.overall >= 70 ? 'Great' : scores.overall >= 55 ? 'Fair' : 'Needs Work';

  const totalMacroG = totals.protein + totals.carbs + totals.fat;
  const mb = totalMacroG > 0 ? {
    protein: Math.round((totals.protein / totalMacroG) * 100),
    carbs:   Math.round((totals.carbs   / totalMacroG) * 100),
    fat:     Math.round((totals.fat     / totalMacroG) * 100),
  } : { protein: 0, carbs: 0, fat: 0 };

  const remaining = goals.calories - totals.calories;

  // Big master ring
  const bigR = 54; const bigCirc = 2 * Math.PI * bigR;
  const bigDash = (Math.min(100, scores.overall) / 100) * bigCirc;

  return (
    <div className="glass rounded-3xl overflow-hidden">
      {/* Hero section */}
      <div className="relative p-6 pb-4" style={{ background: 'radial-gradient(ellipse at top, rgba(212,160,23,0.08) 0%, transparent 70%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,160,23,0.4), transparent)' }} />

        <p className="text-white/35 text-xs font-semibold uppercase tracking-[0.15em] mb-4">Daily Report</p>

        <div className="flex items-center gap-6">
          {/* Master score ring */}
          <div className="relative shrink-0">
            <svg width="140" height="140" className="-rotate-90" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r={bigR} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
              <circle cx="70" cy="70" r={bigR} fill="none"
                stroke={overallColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${bigDash} ${bigCirc}`}
                style={{
                  filter: `drop-shadow(0 0 10px ${overallColor}80)`,
                  transition: 'stroke-dasharray 1.5s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-5xl font-light" style={{ color: overallColor }}>{scores.overall}</span>
              <span className="text-xs font-bold uppercase tracking-widest mt-0.5" style={{ color: overallColor }}>{overallLabel}</span>
            </div>
          </div>

          {/* Stats column */}
          <div className="flex-1 space-y-3">
            {[
              { label: 'Consumed', val: totals.calories, unit: 'kcal', color: '#d4a017' },
              { label: 'Remaining', val: remaining, unit: 'kcal', color: remaining >= 0 ? '#34d399' : '#f87171' },
              { label: 'Protein', val: totals.protein, unit: 'g', color: '#34d399' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-white/35 text-xs font-sans">{item.label}</span>
                <span className="font-display text-lg font-light" style={{ color: item.color }}>
                  {item.val}<span className="text-xs text-white/30 ml-0.5">{item.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-5">
        {/* Macro bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="label-xs">Macro Split</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            <div className="bg-emerald-400 transition-all duration-700 rounded-l-full" style={{ width: `${mb.protein}%` }} />
            <div className="bg-gold-400 transition-all duration-700" style={{ width: `${mb.carbs}%` }} />
            <div className="bg-orange-400 transition-all duration-700 rounded-r-full" style={{ width: `${mb.fat}%` }} />
          </div>
          <div className="flex gap-4 mt-2.5">
            {[
              { l: 'Protein', p: mb.protein, g: totals.protein, c: 'bg-emerald-400', t: 'text-emerald-400' },
              { l: 'Carbs',   p: mb.carbs,   g: totals.carbs,   c: 'bg-gold-400',    t: 'text-gold-400' },
              { l: 'Fat',     p: mb.fat,     g: totals.fat,     c: 'bg-orange-400',  t: 'text-orange-400' },
            ].map(item => (
              <div key={item.l} className="flex items-center gap-1.5 flex-1">
                <div className={`w-2 h-2 rounded-full ${item.c} shrink-0`} />
                <div>
                  <div className={`text-xs font-bold ${item.t}`}>{item.g}g</div>
                  <div className="text-white/25 text-xs">{item.l} {item.p}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Score gauges */}
        <div>
          <span className="label-xs">Score Breakdown</span>
          <div className="grid grid-cols-4 gap-2 mt-3">
            <ScoreGauge value={scores.protein}         label="Protein"   emoji="🥩" color="#34d399" glow="rgba(52,211,153,0.4)"  delay={0} />
            <ScoreGauge value={scores.metabolic}       label="Metabolic" emoji="⚡" color="#d4a017" glow="rgba(212,160,23,0.4)" delay={100} />
            <ScoreGauge value={scores.bodyComposition} label="Body Comp" emoji="💪" color="#60a5fa" glow="rgba(96,165,250,0.4)"  delay={200} />
            <ScoreGauge value={scores.foodQuality}     label="Quality"   emoji="🌿" color="#c084fc" glow="rgba(192,132,252,0.4)" delay={300} />
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <span className="label-xs">Insights</span>
          <div className="space-y-2 mt-2">
            {scores.recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-2xl bg-white/3 border border-white/5">
                <span className="text-base shrink-0">
                  {i === 0 ? '🎯' : i === 1 ? '💡' : '✨'}
                </span>
                <p className="text-white/55 text-xs font-sans leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
