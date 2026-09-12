import { Skeleton } from "@/components/ui/skeleton";

export default function AdminStatsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-7 w-40" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
          <Skeleton key={index} className="h-20 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
