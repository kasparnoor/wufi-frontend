"use client"

import { Shield, Truck, RotateCcw, Heart, Award, Info } from "lucide-react"
import { useState } from "react"

const TrustBadges = () => {
  const [hoveredBadge, setHoveredBadge] = useState<number | null>(null)

  const badges = [
    {
      icon: Shield,
      text: "Turvaline makse",
      subtext: "SSL krüpteeritud",
      tooltip: "Kõik maksed on kaitstud turvaliselt SSL krüpteerimisega ja töödeldakse turvaliste makseprotsessorite kaudu.",
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-200"
    },
    {
      icon: Truck,
      text: "Tasuta tarne",
      subtext: "üle 50€",
      tooltip: "Tellimused üle 50€ kohalesaamise väärtuses kvalifitseeruvad tasuta kohaletoimetamiseks kogu Eestis.",
      color: "text-blue-700",
      bg: "bg-blue-50", 
      border: "border-blue-200"
    },
    {
      icon: RotateCcw,
      text: "Maitsegarantii",
      subtext: "80% täis pakist",
      tooltip: "Kui lemmikule ei maitse ja pakk on veel 80% täis, võtame tagasi 14 päeva jooksul - isegi kui pakk on avatud!",
      color: "text-purple-700",
      bg: "bg-purple-50",
      border: "border-purple-200"
    },
    {
      icon: Heart,
      text: "Loomade heaolu",
      subtext: "eetiliselt toodetud",
      tooltip: "Kõik meie tooted on valitud loomade heaolu ja eetiliste tootmisstandardite silmas pidades.",
      color: "text-pink-700",
      bg: "bg-pink-50",
      border: "border-pink-200"
    }
  ]

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Award className="h-4 w-4 text-yellow-600" />
        Miks meid usaldada?
      </h3>
      
      {/* Desktop: Single column, Mobile: 2x2 grid */}
      <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 lg:gap-1.5">
        {badges.map((badge, index) => {
          const IconComponent = badge.icon
          const isHovered = hoveredBadge === index
          
          return (
            <div
              key={index}
              className={`relative flex items-center gap-2 p-2 lg:p-2 rounded-lg border transition-colors duration-200 ${badge.bg} ${badge.border} hover:shadow-sm`}
              onMouseEnter={() => setHoveredBadge(index)}
              onMouseLeave={() => setHoveredBadge(null)}
            >
              <div className={`p-1.5 rounded-full bg-white shadow-sm flex-shrink-0`}>
                <IconComponent className={`h-3 w-3 lg:h-3.5 lg:w-3.5 ${badge.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium ${badge.color} leading-tight`}>
                  {badge.text}
                </div>
                <div className="text-xs text-gray-500 leading-tight">
                  {badge.subtext}
                </div>
              </div>
              
              {/* Info icon for tooltip */}
              <div className="flex-shrink-0">
                <Info className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
              </div>
              
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50 max-w-64 text-center">
                  {badge.tooltip}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      
    </div>
  )
}

export default TrustBadges 