export default function SurveyFormLoading() {
  return (
    <div className="bg-[#F0F4F8] min-h-screen">
      {/* Progress bar skeleton */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-3">
          <div className="skeleton h-1.5 w-full rounded" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Header skeleton */}
        <div className="bg-[#132B4F] p-8">
          <div className="skeleton h-3 w-32 mb-4 rounded opacity-20" />
          <div className="skeleton h-6 w-64 mb-2 rounded opacity-20" />
          <div className="skeleton h-2 w-48 rounded opacity-20" />
        </div>

        {/* Section skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="skeleton w-8 h-8 rounded" />
              <div>
                <div className="skeleton h-2 w-16 mb-1 rounded" />
                <div className="skeleton h-3.5 w-40 rounded" />
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2].map((j) => (
                <div key={j}>
                  <div className="skeleton h-2 w-24 mb-2 rounded" />
                  <div className="skeleton h-10 w-full rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
