interface MacroCardProps {
  label: string;
  value: number;
  goal: number;
  unit: string;
  color: 'gold' | 'emerald' | 'blue' | 'orange';
  icon: string;
  delay?: number;
}

const COLORS = {
  gold:    { stroke: '#d4a017', glow: 'rgba(212,160,23,0.35)', text: '#e4b84a', bg: 'rgba(212,160,23,0.06)', border: 'rgba(212,160,23,0.15)' },
  emerald: { stroke: '#34d399', glow: 'rgba(52,211,153,0.35)',  text: '#34d399', bg: 'rgba(52,211,153,0.06)',  border: 'rgba(52,211,153,0.15)' },
  blue:    { stroke: '#60a5fa', glow: 'rgba(96,165,250,0.35)',  text: '#60a5fa', bg: 'rgba(96,165,250,0.06)',  border: 'rgba(96,165,250,0.15)' },
  orange:  { stroke: '#fb923c', glow: 'rgba(251,146,60,0.35)',  text: '#fb923c', bg: 'rgba(251,146,60,0.06)',  border: 'rgba(251,146,60,0.15)' },
};

export default function MacroCard({ label, value, goal, unit, color, icon, delay = 0 }: MacroCardProps) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  const over = goal > 0 && value > goal;
  const c = COLORS[color];

  // SVG ring
  const size = 80;
  const r = 32;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  const displayPct = Math.round(pct);

  return (
    <div
      className="stat-card opacity-0 animate-fade-up"
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards',
        background: c.bg,
        border: `1px solid ${c.border}`,
        boxShadow: `0 0 40px ${c.glow}20`,
      }}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div
          className="absolute top-0 left-0 w-full h-px opacity-60"
          style={{ background: `linear-gradient(90deg, transparent, ${c.stroke}60, transparent)` }}
        />
      </div>

      <div className="flex items-center justify-between">
        {/* Left: label + value */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{icon}</span>
            <span className="text-white/40 text-xs font-semibold uppercase tracking-[0.12em]">{label}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-4xl font-light" style={{ color: c.text }}>{value}</span>
            <span className="text-white/30 text-sm font-sans">{unit}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-white/20 text-xs">of {goal}{unit}</span>
            {over && (
              <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                +{value - goal}
              </span>
            )}
          </div>
        </div>

        {/* Right: ring gauge */}
        <div className="relative shrink-0">
          <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size/2} cy={size/2} r={r}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="6"
            />
            {pct > 0 && (
              <circle
                cx={size/2} cy={size/2} r={r}
                fill="none"
                stroke={over ? '#f87171' : c.stroke}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circ}`}
                style={{
                  filter: `drop-shadow(0 0 6px ${over ? '#f8717180' : c.glow})`,
                  transition: 'stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-sm font-bold font-sans"
              style={{ color: over ? '#f87171' : c.text }}
            >
              {displayPct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
