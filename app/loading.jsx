export default function LoadingKustom() {
  return (
    <div className="py-10 animate-pulse">
      {/* Skeleton Hero */}
      <div className="max-w-2xl">
        <div className="h-10 w-3/4 rounded-xl bg-garis/60"></div>
        <div className="mt-3 h-5 w-1/2 rounded-lg bg-garis/50"></div>
        <div className="mt-4 h-4 w-1/3 rounded-lg bg-garis/40"></div>
      </div>

      {/* Skeleton Filter & Search */}
      <div className="mt-12 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-10 w-full sm:w-56 rounded-lg bg-garis/50"></div>
          <div className="h-9 w-36 rounded-lg bg-garis/40"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-16 rounded-full bg-garis/60"></div>
          <div className="h-8 w-20 rounded-full bg-garis/40"></div>
          <div className="h-8 w-24 rounded-full bg-garis/40"></div>
        </div>
      </div>

      {/* Skeleton Grid Kartu Produk */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-garis bg-permukaan p-3"
          >
            <div className="aspect-square w-full rounded-xl bg-garis/60"></div>
            <div className="mt-3 h-3 w-1/3 rounded bg-garis/40"></div>
            <div className="mt-2 h-5 w-3/4 rounded bg-garis/60"></div>
            <div className="mt-3 h-6 w-1/2 rounded-md bg-garis/50"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
