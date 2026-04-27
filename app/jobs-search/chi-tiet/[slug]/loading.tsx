export default function Loading() {
  return (
    <main id="main-content" className="detail pt-[116px] pb-8 lg:pb-0">
      <div className="container mx-auto px-6 lg:px-0 relative min-h-screen">
        <div className="lg:max-w-6xl mx-auto lg:py-16 py-5 relative">
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 mt-5 lg:mt-16">
            <div className="col-span-1">
              <div className="animate-pulse rounded-3xl border border-gray-200 p-6 h-48" />
            </div>
            <div className="col-span-2 flex flex-col gap-8">
              <div className="animate-pulse h-10 bg-gray-200 rounded-xl w-3/4" />
              <div className="flex gap-3">
                <div className="animate-pulse h-7 bg-gray-200 rounded-3xl w-24" />
                <div className="animate-pulse h-7 bg-gray-200 rounded-3xl w-20" />
                <div className="animate-pulse h-7 bg-gray-200 rounded-3xl w-28" />
              </div>
              <div className="flex flex-col gap-3">
                <div className="animate-pulse h-4 bg-gray-200 rounded w-full" />
                <div className="animate-pulse h-4 bg-gray-200 rounded w-full" />
                <div className="animate-pulse h-4 bg-gray-200 rounded w-5/6" />
                <div className="animate-pulse h-4 bg-gray-200 rounded w-full" />
                <div className="animate-pulse h-4 bg-gray-200 rounded w-4/6" />
              </div>
              <div className="flex flex-col gap-3 mt-4">
                <div className="animate-pulse h-4 bg-gray-200 rounded w-full" />
                <div className="animate-pulse h-4 bg-gray-200 rounded w-full" />
                <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
