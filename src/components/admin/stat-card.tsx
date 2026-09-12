export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-border bg-card flex flex-col gap-1 rounded-lg border p-4">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-foreground text-2xl font-bold">{value}</span>
    </div>
  );
}
