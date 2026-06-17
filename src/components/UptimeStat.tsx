export default function UptimeStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-2 rounded-md bg-slate-50/50">
      <span className="text-[9px] font-bold uppercase text-muted-foreground mb-1">
        {label}
      </span>
      <span className={`text-sm font-bold ${color}`}>{value}%</span>
    </div>
  );
}
