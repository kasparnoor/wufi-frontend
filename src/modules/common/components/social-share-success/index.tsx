"use client"

import { motion } from "framer-motion"
import { Sparkles, Facebook, Twitter, Mail } from "lucide-react"
import { useEffect, useState } from "react"

interface SocialShareSuccessProps {
  orderId: string
}

const SocialShareSuccess: React.FC<SocialShareSuccessProps> = ({ orderId }) => {
  const [currentUrl, setCurrentUrl] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href)
    }
  }, [])

  const shareMessage = `Leia mis sinu lemmikule sobib.`

  const krapsUrl = "https://kraps.ee"

  const socialShareLinks = [
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(krapsUrl)}&quote=${encodeURIComponent(shareMessage)}`,
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      name: "Twitter",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(krapsUrl)}`,
      icon: Twitter,
      color: "bg-blue-400 hover:bg-blue-500"
    },
    {
      name: "Email",
      url: `mailto:?subject=${encodeURIComponent("Kraps.ee - Leia mis sinu lemmikule sobib!")}&body=${encodeURIComponent(`${shareMessage}\n\n${krapsUrl}`)}`,
      icon: Mail,
      color: "bg-gray-600 hover:bg-gray-700"
    },
  ]

  return (
    <div className="text-center space-y-6">
      <h3 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
        <Sparkles className="h-6 w-6 text-yellow-500" />
        Jaga oma rõõmu!
      </h3>
      <p className="text-base text-gray-700 max-w-xl mx-auto">
        Aita meil levitada sõna! Jaga oma uut tellimust sotsiaalmeedias ja kasuta hashtag'i #krapstoob.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        {socialShareLinks.map((link, index) => {
          const IconComponent = link.icon
          return (
            <motion.a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 * index + 0.5 }}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${link.color}`}
            >
              <IconComponent className="h-5 w-5" />
              <span>{link.name}</span>
            </motion.a>
          )
        })}
      </div>
    </div>
  )
}

export default SocialShareSuccess
