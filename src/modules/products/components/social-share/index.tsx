"use client"

import { Share2, Copy, CheckCircle, Share as ShareIcon, Facebook, Twitter, Linkedin, Mail, Send } from "lucide-react"
import { useState, useEffect } from "react"

type Product = {
  title: string
  handle: string
  thumbnail?: string | null
}

type SocialShareProps = {
  product: Product
}

const SocialShare = ({ product }: SocialShareProps) => {
  const [copied, setCopied] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("")
  const [canShareNatively, setCanShareNatively] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  
  useEffect(() => {
    // Set URL on client side to avoid hydration issues
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href)
      setCanShareNatively(!!navigator.share)
      const ua = window.navigator.userAgent
      setIsIOS(/iPhone|iPad|iPod/i.test(ua))
    }
  }, [])
  
  const shareTitle = `Wufi.ee: ${product.title}`
  const shareDescription = `Avasta ${product.title} Wufi.ee-s! Ideaalne sinu lemmikule, saadaval ka mugava püsitellimusena. Säästa aega ja raha! Vaata lähemalt:`
  
  const shareLinks = [
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareDescription)}`,
      color: "bg-blue-600 hover:bg-blue-700",
      icon: Facebook
    },
    {
      name: "X",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareDescription)}&url=${encodeURIComponent(currentUrl)}`,
      color: "bg-gray-900 hover:bg-black",
      icon: Twitter
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      color: "bg-sky-700 hover:bg-sky-800",
      icon: Linkedin
    },
    {
      name: "WhatsApp", 
      url: `https://wa.me/?text=${encodeURIComponent(`${shareDescription} ${currentUrl}`)}`,
      color: "bg-green-600 hover:bg-green-700",
      icon: Send
    },
    {
      name: "Email",
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareDescription}\n\n${currentUrl}`)}`,
      color: "bg-gray-600 hover:bg-gray-700", 
      icon: Mail
    }
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = currentUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = (url: string) => {
    // Open in popup for social media and email
    window.open(url, '_blank', 'width=600,height=400,toolbar=no,menubar=no,scrollbars=yes')
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: currentUrl,
        });
        console.log('Content shared successfully');
      } catch (error) {
        console.error('Error sharing', error);
      }
    }
  };

  // Don't render until we have the URL to avoid hydration mismatch
  if (!currentUrl) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-800">Jaga sõpradega</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Share2 className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-800">Jaga sõpradega</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {isIOS && canShareNatively && (
          <button
            onClick={handleNativeShare}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-white text-xs font-medium transition-all duration-300 hover:scale-105 hover:shadow-md bg-black focus-ring`}
            title="Jaga seadme kaudu"
            aria-label="Jaga seadme kaudu"
          >
            <ShareIcon className="h-3.5 w-3.5" />
            <span>Jaga</span>
          </button>
        )}

        {shareLinks.map((link, idx) => {
          const IconComp = link.icon
          return (
            <button
              key={link.name}
              onClick={() => handleShare(link.url)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-white text-xs font-medium transition-all duration-300 hover:scale-105 hover:shadow-md ${link.color} focus-ring`}
              title={`Jaga ${link.name} kaudu`}
              aria-label={`Jaga ${link.name} kaudu`}
            >
              <IconComp className="h-3.5 w-3.5" />
              <span>{link.name}</span>
            </button>
          )
        })}

        {canShareNatively && !isIOS && (
          <button
            onClick={handleNativeShare}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 text-xs font-medium border border-gray-300 bg-white transition-all duration-300 hover:scale-105 hover:shadow-md focus-ring hover:bg-gray-50`}
            title="Jaga seadme kaudu"
            aria-label="Jaga seadme kaudu"
          >
            <ShareIcon className="h-3.5 w-3.5" />
            <span>Jaga</span>
          </button>
        )}
        
        <button
          onClick={copyToClipboard}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 text-xs font-medium border border-gray-300 bg-white transition-all duration-300 hover:scale-105 hover:shadow-md focus-ring ${
            copied ? 'bg-green-50 border-green-300 text-green-700' : 'hover:bg-gray-50'
          }`}
          title="Kopeeri link"
        >
          {copied ? (
            <CheckCircle className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          <span>{copied ? 'Kopeeritud!' : 'Kopeeri'}</span>
        </button>
      </div>
    </div>
  )
}

export default SocialShare 