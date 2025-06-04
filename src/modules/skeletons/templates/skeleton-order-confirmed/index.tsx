import { SkeletonOrderConfirmedHeader } from "@lib/components"
import { SkeletonOrderInformation } from "@lib/components"
import { SkeletonOrderItems } from "@lib/components"

const SkeletonOrderConfirmed = () => {
  return (
    <div className="bg-gray-50 py-6 min-h-[calc(100vh-64px)] animate-pulse">
      <div className="content-container flex justify-center">
        <div className="max-w-4xl h-full bg-white w-full p-10">
          <SkeletonOrderConfirmedHeader />

          <SkeletonOrderItems />

          <SkeletonOrderInformation />
        </div>
      </div>
    </div>
  )
}

export default SkeletonOrderConfirmed
