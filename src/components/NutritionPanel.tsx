import { useMemo } from 'react';
import { DailyTotals, DailyGoals, NutritionScore } from '../types';
import { Award, TrendingUp, Zap, Heart } from 'lucide-react';

interface Props {
  totals: DailyTotals;
  goals: DailyGoals;
}

function computeScores(totals: DailyTotals, goals: DailyGoals): NutritionScore {
  const calPct = goals.calories > 0 ? totals.calories / goals.calories : 0;
  const protPct = goals.protein > 0 ? totals.protein / goals.protein : 0;
  const carbPct = goals.carbs > 0 ? totals.carbs / goals.carbs : 0;
  const fatPct = goals.fat > 0 ? totals.fat / goals.fat : 0;

  // Protein score: ideal 90-110%
  const proteinScore = Math.round(
    protPct >= 0.9 && protPct <= 1.1 ? 95
    : protPct >= 0.75 ? 80
    : protPct >= 0.5 ? 60
    : protPct * 80
  );

  // Metabolic score: based on overall calorie balance
  const metabolicScore = Math.round(
    calPct >= 0.85 && calPct <= 1.05 ? 92
    : calPct >= 0.7 && calPct <= 1.2 ? 75
    : calPct < 0.5 ? 45
    : 60
  );

  // Body composition: protein + fat balance
  const bcScore = Math.round(
    (proteinScore * 0.6 + (fatPct > 0.5 && fatPct < 1.1 ? 90 : 60) * 0.4)
  );

  // Food quality: penalise very high fat relative to carbs/protein
  const totalMacroG = totals.protein + totals.carbs + totals.fat;
  const fatRatio = totalMacroG > 0 ? totals.fat / totalMacroG : 0;
  const foodQuality = Math.round(
    fatRatio < 0.25 ? 88 : fatRatio < 0.35 ? 78 : fatRatio < 0.45 ? 65 : 50
  );

  const overall = Math.round((proteinScore + metabolicScore + bcScore + foodQuality) / 4);

  const recommendations: string[] = [];
  if (protPct < 0.7) recommendations.push('Increase protein intake to support muscle recovery and satiety.');
  if (calPct < 0.7) recommendations.push('You\'re under your calorie goal — ensure adequate fueling for your activity level.');
  if (calPct > 1.2) recommendations.push('Caloric intake is above goal today — consider lighter options tomorrow.');
  if (carbPct > 1.3) recommendations.push('Carbohydrate intake is elevated — favour complex sources like oats, sweet potato, and legumes.');
  if (fatRatio > 0.4) recommendations.push('High fat ratio detected — balance with lean proteins and fibrous vegetables.');
  if (recommendations.length === 0) recommendations.push('Excellent balance today — your macros are well-aligned with your goals.');
  if (protPct >= 0.9 && protPct <= 1.1) recommendations.push('Protein target is on track — great for body composition support.');

  return { overall, protein: proteinScore, metabolic: metabolicScore, bodyComposition: bcScore, foodQuality, recommendations };
}

function ScoreRing({ value, label, icon: Icon, color }: { value: number; label: string; icon: React.ElementType; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;

  const colorMap: Record<string, { stroke: string; text: string; bg: string }> = {
    gold: { stroke: '#d4a017', text: 'text-gold-400', bg: 'text-gold-500/20' },
    emerald: { stroke: '#34d399', text: 'text-emerald-400', bg: 'text-emerald-400/20' },
    blue: { stroke: '#60a5fa', text: 'text-blue-400', bg: 'text-blue-400/20' },
    purple: { stroke: '#a78bfa', text: 'text-purple-400', bg: 'text-purple-400/20' },
  };
  const c = colorMap[color] ?? colorMap.gold;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
          <circle cx="35" cy="35" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <circle
            cx="35" cy="35" r={r}
            fill="none"
            stroke={c.stroke}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ filter: `drop-shadow(0 0 4px ${c.stroke}55)`, transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className={`w-3 h-3 ${c.text} mb-0.5`} />
          <span className={`text-xs font-sans font-semibold ${c.text}`}>{value}</span>
        </div>
      </div>
      <span className="text-white/40 text-xs font-sans text-center leading-tight">{label}</span>
    </div>
  );
}

export default function NutritionPanel({ totals, goals }: Props) {
  const scores = useMemo(() => computeScores(totals, goals), [totals, goals]);

  const overallColor = scores.overall >= 80 ? 'text-emerald-400' : scores.overall >= 60 ? 'text-gold-400' : 'text-red-400';
  const overallBg = scores.overall >= 80 ? 'from-emerald-500/10 to-transparent' : scores.overall >= 60 ? 'from-gold-500/10 to-transparent' : 'from-red-500/10 to-transparent';
  const overallLabel = scores.overall >= 85 ? 'Excellent' : scores.overall >= 70 ? 'Good' : scores.overall >= 55 ? 'Fair' : 'Needs Work';

  const totalMacroG = totals.protein + totals.carbs + totals.fat;
  const macroBreakdown = totalMacroG > 0 ? {
    protein: Math.round((totals.protein / totalMacroG) * 100),
    carbs: Math.round((totals.carbs / totalMacroG) * 100),
    fat: Math.round((totals.fat / totalMacroG) * 100),
  } : { protein: 0, carbs: 0, fat: 0 };

  return (
    <div className="glass-card gold-border overflow-hidden animate-fade-in">
      {/* Header band */}
      <div className={`bg-gradient-to-r ${overallBg} border-b border-white/5 px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest font-sans">Nutrition Report</p>
            <h3 className="font-display text-xl text-white font-light mt-0.5">Daily Summary</h3>
          </div>
          <div className="text-right">
            <div className={`font-display text-5xl font-light ${overallColor}`}>{scores.overall}</div>
            <div className={`text-xs font-sans font-medium ${overallColor} mt-0.5`}>{overallLabel}</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Macro breakdown bar */}
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest font-sans mb-3">Macro Distribution</p>
          <div className="flex rounded-full overflow-hidden h-2 gap-0.5">
            <div className="bg-emerald-400 transition-all duration-700" style={{ width: `${macroBreakdown.protein}%` }} title={`Protein ${macroBreakdown.protein}%`} />
            <div className="bg-gold-400 transition-all duration-700" style={{ width: `${macroBreakdown.carbs}%` }} title={`Carbs ${macroBreakdown.carbs}%`} />
            <div className="bg-orange-400 transition-all duration-700" style={{ width: `${macroBreakdown.fat}%` }} title={`Fat ${macroBreakdown.fat}%`} />
          </div>
          <div className="flex gap-4 mt-2">
            {[
              { label: 'Protein', pct: macroBreakdown.protein, color: 'bg-emerald-400', g: totals.protein },
              { label: 'Carbs', pct: macroBreakdown.carbs, color: 'bg-gold-400', g: totals.carbs },
              { label: 'Fat', pct: macroBreakdown.fat, color: 'bg-orange-400', g: totals.fat },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-white/40 text-xs font-sans">{item.label} {item.pct}% · {item.g}g</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calorie summary */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/5">
          <div className="flex-1">
            <p className="text-white/30 text-xs font-sans">Total Calories</p>
            <p className="font-display text-2xl text-gold-400 font-light">{totals.calories}</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="flex-1">
            <p className="text-white/30 text-xs font-sans">Calorie Goal</p>
            <p className="font-display text-2xl text-white/60 font-light">{goals.calories}</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="flex-1">
            <p className="text-white/30 text-xs font-sans">Remaining</p>
            <p className={`font-display text-2xl font-light ${goals.calories - totals.calories >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {goals.calories - totals.calories}
            </p>
          </div>
        </div>

        {/* Score rings */}
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest font-sans mb-4">Score Breakdown</p>
          <div className="grid grid-cols-4 gap-4">
            <ScoreRing value={scores.protein} label="Protein Score" icon={TrendingUp} color="emerald" />
            <ScoreRing value={scores.metabolic} label="Metabolic Score" icon={Zap} color="gold" />
            <ScoreRing value={scores.bodyComposition} label="Body Comp." icon={Heart} color="blue" />
            <ScoreRing value={scores.foodQuality} label="Food Quality" icon={Award} color="purple" />
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest font-sans mb-3">Recommendations</p>
          <div className="space-y-2">
            {scores.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-1.5 shrink-0" />
                <p className="text-white/60 text-sm font-sans leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
