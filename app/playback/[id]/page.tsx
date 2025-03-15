"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { X, Play, Pause, List, ClipboardCopy } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import React from "react"

// Mock data structure for conversations
const mockConversations: Record<
  string,
  {
    title: string
    transcript: string
    chapters: Array<{
      id: string
      title: string
      content: string
      startTime: number
    }>
  }
> = {
  "memo-1": {
    title: "Reader Profile the Aspiring Content Creator",
    transcript:
      "The profile of my reader is someone who enjoys watching videos about productivity and reading books such as 'Sapiens' and 'The 4-Hour Workweek.' They are the type of person who would sign up for Ali Abdaal's Part-Time YouTuber Academy courses. They are aspiring content creators with a drive to improve their lives by exploring alternative paths and trying to generate passive income. They reject the idea of a nine-to-five job.",
    chapters: [
      {
        id: "ch1",
        title: "Reader Demographics",
        content:
          "The profile of my reader is someone who enjoys watching videos about productivity and reading books such as 'Sapiens' and 'The 4-Hour Workweek.'",
        startTime: 0,
      },
      {
        id: "ch2",
        title: "Content Preferences",
        content: "They are the type of person who would sign up for Ali Abdaal's Part-Time YouTuber Academy courses.",
        startTime: 15,
      },
      {
        id: "ch3",
        title: "Aspirations and Values",
        content:
          "They are aspiring content creators with a drive to improve their lives by exploring alternative paths and trying to generate passive income. They reject the idea of a nine-to-five job.",
        startTime: 30,
      },
    ],
  },
}

export default function PlaybackPage({
  params,
}: {
  params: { id: string }
}) {
  // Unwrap params Promise
  const unwrappedParams = React.use(params);
  const conversationId = unwrappedParams.id;

  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showChapters, setShowChapters] = useState(false)
  const [currentChapter, setCurrentChapter] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const audioRef = useRef<HTMLAudioElement>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)

  const memoId = searchParams.get("memo") || ""
  const conversation = mockConversations[memoId]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      const currentProgress = (audio.currentTime / audio.duration) * 100
      setProgress(currentProgress)

      // Auto-scroll the transcript
      if (transcriptRef.current) {
        const scrollHeight = transcriptRef.current.scrollHeight - transcriptRef.current.clientHeight
        transcriptRef.current.scrollTop = scrollHeight * (currentProgress / 100)
      }

      // Update current chapter based on time
      if (conversation) {
        const currentTime = audio.currentTime
        const newChapterIndex = conversation.chapters.findIndex((chapter, index) => {
          const nextChapter = conversation.chapters[index + 1]
          return currentTime >= chapter.startTime && (!nextChapter || currentTime < nextChapter.startTime)
        })

        if (newChapterIndex !== -1 && newChapterIndex !== currentChapter) {
          setCurrentChapter(newChapterIndex)
        }
      }
    }

    audio.addEventListener("timeupdate", updateProgress)
    audio.addEventListener("ended", () => setIsPlaying(false))

    return () => {
      audio.removeEventListener("timeupdate", updateProgress)
      audio.removeEventListener("ended", () => setIsPlaying(false))
    }
  }, [conversation, currentChapter])

  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleChapterSelect = (index: number) => {
    if (audioRef.current && conversation) {
      audioRef.current.currentTime = conversation.chapters[index].startTime
      setCurrentChapter(index)
      setShowChapters(false)
      if (!isPlaying) {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleClose = () => {
    router.push(`/conversation/${conversationId}`)
  }

  if (!conversation) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-medium tracking-wide uppercase">NOW PLAYING</h1>
        <Button variant="ghost" size="icon" onClick={() => setShowChapters(true)}>
          <List className="h-6 w-6" />
        </Button>
      </header>

      <main className="p-4 flex flex-col items-center">
        {/* Waveform visualization */}
        <div className="w-full max-w-md h-24 mb-8">
          <div className="flex items-center justify-between h-full gap-1">
            {Array.from({ length: 50 }, () => Math.random() * 100).map((height, index) => (
              <div key={index} className="flex-1 h-full flex items-center">
                <div
                  className={cn(
                    "w-full rounded-sm transition-all duration-200",
                    index <= Math.floor((progress / 100) * 50) ? "bg-gray-900" : "bg-gray-200",
                  )}
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Transcript with fade effect */}
        <div className="relative w-full max-w-md mb-8">
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent z-10" />
          <div ref={transcriptRef} className="h-[calc(100vh-400px)] overflow-y-auto px-4">
            <p className="text-lg leading-relaxed">{conversation.transcript}</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent z-10" />
        </div>

        {/* Audio element (hidden) */}
        <audio ref={audioRef} src="/demo.mp3" />

        {/* Playback controls */}
        <div className="fixed bottom-16 left-0 right-0 flex flex-col items-center gap-6 p-4 bg-gradient-to-t from-white to-transparent pt-16">
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              className="h-14 w-14 rounded-full bg-gray-900 text-white hover:bg-gray-800"
              onClick={togglePlayback}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </Button>
          </div>

          {/* Bottom navigation */}
          <div className="flex justify-center gap-12 w-full">
            <Button variant="ghost" size="icon" className="text-gray-600" onClick={() => setShowChapters(true)}>
              <List className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-600">
              <ClipboardCopy className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </main>

      {/* Chapter list sheet */}
      <Sheet open={showChapters} onOpenChange={setShowChapters}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Chapters</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-2">
            {conversation.chapters.map((chapter, index) => (
              <Button
                key={chapter.id}
                variant="ghost"
                className={cn("w-full justify-start p-4 h-auto", currentChapter === index && "bg-gray-100")}
                onClick={() => handleChapterSelect(index)}
              >
                <div className="text-left">
                  <div className="font-medium">{chapter.title}</div>
                  <div className="text-sm text-gray-500 truncate">{chapter.content.substring(0, 60)}...</div>
                </div>
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

