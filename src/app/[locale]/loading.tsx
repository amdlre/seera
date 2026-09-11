export default function LocaleLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div
        role="status"
        aria-label="Loading"
        className="border-border border-t-primary h-8 w-8 animate-spin rounded-full border-2"
      />
    </div>
  );
}
