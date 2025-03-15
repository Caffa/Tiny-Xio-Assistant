"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, ClipboardCopy } from "lucide-react"
import { useRouter } from "next/navigation"

interface VoiceMemoProps {
  audioUrl: string
  title: string
  transcript: string
  timestamp: string
  conversationId: string
  memoId: string
}

export function VoiceMemo({ audioUrl, title, transcript, timestamp, conversationId, memoId }: VoiceMemoProps) {
  const router = useRouter()
  const [showCopyButton, setShowCopyButton] = useState(false)

  const handlePlayback = () => {
    // Navigate to the playback screen with the specific memo ID
    router.push(`/playback/${conversationId}?memo=${memoId}`)
  }

  return (
    <div
      className="flex gap-4 mb-6 group"
      onMouseEnter={() => setShowCopyButton(true)}
      onMouseLeave={() => setShowCopyButton(false)}
    >
      <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={handlePlayback}>
        <Play className="h-4 w-4" />
      </Button>
      <div className="flex-1 bg-white rounded-lg p-4 shadow-sm relative">
        <h3 className="font-bold mb-2">{title}</h3>
        <p className="mb-2 pr-8">{transcript}</p>

        {showCopyButton && (
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 opacity-70 hover:opacity-100">
            <ClipboardCopy className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

