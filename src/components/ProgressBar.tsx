interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  colorClass?: string;
  showValue?: boolean;
}

export default function ProgressBar({ label, value, max, colorClass = 'bg-gold-500', showValue = true }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const over = value > max;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-white/50 text-xs font-sans">{label}</span>
        {showValue && (
          <span className={`text-xs font-sans font-medium ${over ? 'text-red-400' : 'text-white/60'}`}>
            {value} / {max}
          </span>
        )}
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-red-400' : colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
