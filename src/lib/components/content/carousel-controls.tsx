"use client"

import { cn } from "../../utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

interface CarouselDotsProps {
  total: number
  current: number
  onDotClick: (index: number) => void
  className?: string
}

export const CarouselDots = ({ total, current, onDotClick, className }: CarouselDotsProps) => {
  return (
    <div className={cn("flex justify-center space-x-2", className)}>
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={cn(
            "w-3 h-3 rounded-full transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            index === current
              ? "bg-blue-600 scale-110"
              : "bg-gray-300 hover:bg-gray-400"
          )}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  )
}

interface CarouselArrowsProps {
  onPrevious: () => void
  onNext: () => void
  canGoPrevious: boolean
  canGoNext: boolean
  className?: string
  variant?: "default" | "floating" | "outside"
}

export const CarouselArrows = ({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  className,
  variant = "default"
}: CarouselArrowsProps) => {
  const getButtonClasses = () => {
    const baseClasses = "flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
    
    switch (variant) {
      case "floating":
        return cn(
          baseClasses,
          "absolute top-1/2 -translate-y-1/2 z-10",
          "w-10 h-10 rounded-full bg-white/90 hover:bg-white",
          "shadow-lg backdrop-blur-sm",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )
      case "outside":
        return cn(
          baseClasses,
          "w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )
      default:
        return cn(
          baseClasses,
          "w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
        )
    }
  }

  const getContainerClasses = () => {
    switch (variant) {
      case "floating":
        return "absolute inset-0 pointer-events-none"
      case "outside":
        return "flex justify-between items-center"
      default:
        return "flex justify-center space-x-4"
    }
  }

  return (
    <div className={cn(getContainerClasses(), className)}>
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className={cn(
          getButtonClasses(),
          variant === "floating" && "left-4 pointer-events-auto"
        )}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={cn(
          getButtonClasses(),
          variant === "floating" && "right-4 pointer-events-auto"
        )}
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}

interface CarouselProgressProps {
  current: number
  total: number
  className?: string
}

export const CarouselProgress = ({ current, total, className }: CarouselProgressProps) => {
  const progress = ((current + 1) / total) * 100

  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-1", className)}>
      <div
        className="bg-blue-600 h-1 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

interface UseCarouselProps {
  total: number
  autoplay?: boolean
  interval?: number
  loop?: boolean
}

export const useCarousel = ({ total, autoplay = false, interval = 5000, loop = true }: UseCarouselProps) => {
  const [current, setCurrent] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoplay)

  // Auto-advance carousel
  useEffect(() => {
    if (!isPlaying || total <= 1) return

    const timer = setInterval(() => {
      setCurrent(prev => {
        if (prev >= total - 1) {
          return loop ? 0 : prev
        }
        return prev + 1
      })
    }, interval)

    return () => clearInterval(timer)
  }, [isPlaying, total, interval, loop])

  const goToSlide = (index: number) => {
    setCurrent(Math.max(0, Math.min(index, total - 1)))
  }

  const goToPrevious = () => {
    if (current > 0) {
      setCurrent(current - 1)
    } else if (loop) {
      setCurrent(total - 1)
    }
  }

  const goToNext = () => {
    if (current < total - 1) {
      setCurrent(current + 1)
    } else if (loop) {
      setCurrent(0)
    }
  }

  const canGoPrevious = current > 0 || loop
  const canGoNext = current < total - 1 || loop

  return {
    current,
    goToSlide,
    goToPrevious,
    goToNext,
    canGoPrevious,
    canGoNext,
    isPlaying,
    setIsPlaying,
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    toggle: () => setIsPlaying(!isPlaying)
  }
} 