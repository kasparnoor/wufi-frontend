import { VideoData } from "../../../../types/content-page"
import { cn } from "../../../../lib/utils"
import { VideoPlayer } from "../../../../lib/components/content"

interface VideoSectionProps {
  data: VideoData
}

const VideoSection = ({ data }: VideoSectionProps) => {
  return (
    <section 
      className="py-16 px-4"
      style={{ backgroundColor: data.background_color || undefined }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {data.title}
            </h2>
          </div>
        )}

        {/* Video Player */}
        <div className="relative">
          <VideoPlayer
            videoUrl={data.video_url}
            videoType={data.video_type}
            thumbnail={data.thumbnail}
            title={data.title}
            autoplay={data.autoplay}
            controls={data.controls}
            className="w-full shadow-lg"
            aspectRatio="video"
          />
        </div>
      </div>
    </section>
  )
}

export default VideoSection 