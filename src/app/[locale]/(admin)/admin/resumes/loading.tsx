import { Skeleton } from "@/components/ui/skeleton";

export default function AdminResumesLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-44" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
