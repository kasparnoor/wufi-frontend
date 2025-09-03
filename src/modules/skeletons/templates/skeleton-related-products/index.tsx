import repeat from "@lib/util/repeat"
import { SkeletonProductPreview } from "@lib/components"

const SkeletonRelatedProducts = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton - Estonian Style */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/20 px-4 py-2 rounded-full border border-yellow-400/30">
          <div className="h-5 w-5 animate-pulse bg-yellow-200 rounded"></div>
          <div className="h-5 w-24 animate-pulse bg-yellow-200 rounded"></div>
        </div>
        <div className="h-8 w-64 animate-pulse bg-gray-200 rounded mx-auto mb-2"></div>
        <div className="h-4 w-96 animate-pulse bg-gray-100 rounded mx-auto"></div>
      </div>

      {/* Products Grid Skeleton - Same as Categories Page */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {repeat(8).map((index) => (
          <SkeletonProductPreview key={index} />
        ))}
      </div>
    </div>
  )
}

export default SkeletonRelatedProducts
