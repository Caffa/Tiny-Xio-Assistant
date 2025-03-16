"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, ClipboardCopy, Square } from "lucide-react"
import { useRouter } from "next/navigation"
import { loadRecordingFile } from "@/lib/utils"

interface VoiceMemoProps {
  filePath: string
  title: string
  transcript: string
  timestamp: string
  conversationId: string
  memoId: string
}

export function VoiceMemo({ filePath, title, transcript, timestamp, conversationId, memoId }: VoiceMemoProps) {
  const router = useRouter()
  const [showCopyButton, setShowCopyButton] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string>()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Load audio file when component mounts
  useEffect(() => {
    const loadAudio = async () => {
      try {
        setIsLoading(true)
        console.log(`Loading audio file for memo: ${memoId} in conversation: ${conversationId}`)

        // Get clean IDs (remove any prefix if present)
        const cleanConversationId = conversationId.replace(/^(conv-|rec-)/, '')
        const cleanMemoId = memoId.replace(/^(conv-|rec-)/, '')

        console.log(`Using clean IDs - conversation: ${cleanConversationId}, memo: ${cleanMemoId}`)

        // Try to load using the cleaned IDs
        let blob = await loadRecordingFile(cleanConversationId, cleanMemoId)

        // If that fails, try with original IDs
        if (!blob) {
          console.log(`Failed with clean IDs, trying original IDs`)
          blob = await loadRecordingFile(conversationId, memoId)
        }

        // If both ID attempts fail and we have a filePath, try using that path directly
        if (!blob && filePath) {
          console.log(`Trying to load directly from path: ${filePath}`)
          try {
            const response = await fetch(filePath)
            if (response.ok) {
              blob = await response.blob()
            } else {
              console.error(`Failed to fetch from filePath: ${filePath}, status: ${response.status}`)
            }
          } catch (pathError) {
            console.error('Error loading from direct path:', pathError)
          }
        }

        if (blob) {
          const url = URL.createObjectURL(blob)
          setAudioUrl(url)
          setError(null)
        } else {
          setError('Could not load audio file')
          console.error('Failed to load audio file for:', { conversationId, memoId, filePath })
        }
      } catch (error) {
        console.error('Error loading audio:', error)
        setError('Error loading audio')
      } finally {
        setIsLoading(false)
      }
    }

    loadAudio()

    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [conversationId, memoId, filePath])

  const handlePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err)
          setError('Error playing audio')
        })
        setIsPlaying(true)
      }
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => setIsPlaying(false)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const handleCopyTranscript = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript)
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex gap-4 mb-6">
        <div className="h-10 w-10 shrink-0 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="flex-1 bg-white rounded-lg p-4 shadow-sm">
          <div className="h-5 w-1/3 bg-gray-200 rounded mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-100 rounded mb-2 animate-pulse"></div>
          <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  // Render error state
  if (error && !audioUrl) {
    return (
      <div className="flex gap-4 mb-6">
        <div className="h-10 w-10 shrink-0 bg-red-100 rounded-md flex items-center justify-center">
          <span className="text-red-500 text-lg">!</span>
        </div>
        <div className="flex-1 bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-bold mb-2">{title}</h3>
          <p className="mb-2 pr-8">{transcript}</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex gap-4 mb-6 group"
      onMouseEnter={() => setShowCopyButton(true)}
      onMouseLeave={() => setShowCopyButton(false)}
    >
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0"
        onClick={handlePlayback}
        disabled={!audioUrl}
      >
        {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <div className="flex-1 bg-white rounded-lg p-4 shadow-sm relative">
        <h3 className="font-bold mb-2">{title}</h3>
        <p className="mb-2 pr-8">{transcript}</p>

        {showCopyButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 opacity-70 hover:opacity-100"
            onClick={handleCopyTranscript}
          >
            <ClipboardCopy className="h-4 w-4" />
          </Button>
        )}

        {error && audioUrl && (
          <p className="text-amber-500 text-xs mt-2">{error}</p>
        )}
      </div>
    </div>
  )
}

