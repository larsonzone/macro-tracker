interface MacroCardProps {
  label: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
  icon: string;
  delay?: number;
}

export default function MacroCard({ label, value, goal, unit, color, icon, delay = 0 }: MacroCardProps) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  const over = goal > 0 && value > goal;

  const colorMap: Record<string, { bar: string; text: string; glow: string; bg: string }> = {
    gold: {
      bar: 'bg-gold-500',
      text: 'text-gold-400',
      glow: 'rgba(212,160,23,0.3)',
      bg: 'bg-gold-500/10',
    },
    emerald: {
      bar: 'bg-emerald-400',
      text: 'text-emerald-400',
      glow: 'rgba(52,211,153,0.3)',
      bg: 'bg-emerald-400/10',
    },
    blue: {
      bar: 'bg-blue-400',
      text: 'text-blue-400',
      glow: 'rgba(96,165,250,0.3)',
      bg: 'bg-blue-400/10',
    },
    orange: {
      bar: 'bg-orange-400',
      text: 'text-orange-400',
      glow: 'rgba(251,146,60,0.3)',
      bg: 'bg-orange-400/10',
    },
  };

  const c = colorMap[color] ?? colorMap.gold;

  return (
    <div
      className="glass-card p-5 animate-slide-up opacity-0"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest font-sans mb-1">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className={`font-display text-3xl font-light ${c.text}`}>{value}</span>
            <span className="text-white/30 text-sm font-sans">{unit}</span>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center text-xl`}>
          {icon}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-white/25 text-xs font-sans">Goal: {goal}{unit}</span>
          <span className={`text-xs font-sans font-medium ${over ? 'text-red-400' : c.text}`}>
            {over ? `+${value - goal}${unit}` : `${pct}%`}
          </span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${over ? 'bg-red-400' : c.bar}`}
            style={{
              width: `${pct}%`,
              boxShadow: `0 0 8px ${over ? 'rgba(248,113,113,0.5)' : c.glow}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
