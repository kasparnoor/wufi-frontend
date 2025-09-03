"use client"

import { useState, useEffect } from "react"
import { CountdownTimerData } from "../../../../types/content-page"
import { cn } from "../../../../lib/utils"

interface CountdownTimerSectionProps {
  data: CountdownTimerData
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const CountdownTimerSection = ({ data }: CountdownTimerSectionProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(data.target_date) - +new Date()
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        }
      } else {
        setIsExpired(true)
        return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [data.target_date])

  const formatNumber = (num: number) => num.toString().padStart(2, '0')

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Section Title */}
        {data.title && (
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            {data.title}
          </h2>
        )}

        {/* Description */}
        {data.description && (
          <p className="text-lg text-gray-600 mb-12">
            {data.description}
          </p>
        )}

        {/* Countdown Display */}
        {!isExpired ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {formatNumber(timeLeft.days)}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">
                Days
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {formatNumber(timeLeft.hours)}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">
                Hours
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {formatNumber(timeLeft.minutes)}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">
                Minutes
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {formatNumber(timeLeft.seconds)}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">
                Seconds
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-red-800 mb-2">
              Time&apos;s Up!
            </h3>
            <p className="text-red-600">
              The countdown has expired.
            </p>
          </div>
        )}

        {/* Call to Action */}
        {data.cta_text && data.cta_url && (
          <div>
            <a
              href={data.cta_url}
              className={cn(
                "inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm",
                "text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                "transition-colors duration-200"
              )}
            >
              {data.cta_text}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

export default CountdownTimerSection 