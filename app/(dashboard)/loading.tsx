export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F0F4F8] p-6">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 mb-6 flex items-center gap-3">
        <div className="w-0.5 h-6 bg-gray-200" />
        <div>
          <div className="skeleton h-2.5 w-40 mb-1.5 rounded" />
          <div className="skeleton h-4 w-56 rounded" />
        </div>
      </div>

      {/* Pills skeleton */}
      <div className="flex items-center gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-9 w-28 rounded" />
        ))}
      </div>

      {/* Chart cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-6">
          <div className="skeleton h-3 w-32 mb-4 rounded" />
          <div className="skeleton h-48 w-full rounded" />
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <div className="skeleton h-3 w-32 mb-4 rounded" />
          <div className="skeleton h-48 w-full rounded" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white border border-gray-200">
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="skeleton h-3 w-48 rounded" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-5 py-3 border-b border-gray-50 flex items-center gap-4">
            <div className="skeleton h-3 w-32 rounded" />
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-3 w-12 rounded" />
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
