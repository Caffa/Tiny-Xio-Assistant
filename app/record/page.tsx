"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { Timer } from "@/components/timer"
import { ArrowLeft, Play, Pause, Check, Sparkles } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(true)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [isPulsing, setIsPulsing] = useState(true)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get the conversation ID and title from the URL
  const conversationId = searchParams.get("conversation")
  const conversationTitle = searchParams.get("title") || "New Recording"
  const isNewConversation = !conversationId

  useEffect(() => {
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        setAudioStream(stream)
        setIsRecording(true)

        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        mediaRecorder.start()

        const audioChunks: Blob[] = []
        mediaRecorder.addEventListener("dataavailable", (event) => {
          audioChunks.push(event.data)
        })

        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks)
          const audioUrl = URL.createObjectURL(audioBlob)
          // Handle the recorded audio
          console.log("Recording finished:", audioUrl)
        })
      } catch (err) {
        console.error("Error accessing microphone:", err)
      }
    }

    startRecording()

    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const handlePauseResume = () => {
    if (isRecording) {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.pause()
      }
      setIsRecording(false)
      setIsPulsing(false)
    } else {
      if (mediaRecorderRef.current?.state === "paused") {
        mediaRecorderRef.current.resume()
      }
      setIsRecording(true)
      setIsPulsing(true)
    }
  }

  const handleComplete = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Navigate back to the conversation page after stopping
      if (conversationId) {
        router.push(`/conversation/${conversationId}`)
      } else {
        // Create a new conversation with a timestamp ID
        const newId = `new-${Date.now()}`
        router.push(`/conversation/${newId}?title=${encodeURIComponent("New Recording")}`)
      }
    }
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-white transition-all duration-500 relative overflow-hidden",
        !isRecording && "scale-[0.98] bg-gray-50",
      )}
    >
      {/* Pulsing background effect */}
      <div
        className={cn(
          "absolute inset-0 bg-blue-100/20 rounded-full scale-0 opacity-0 transition-all duration-2000 ease-in-out",
          isPulsing && "animate-pulse-slow",
        )}
      />

      <header className="flex items-center justify-between p-4 border-b relative z-10">
        <div className="flex items-center gap-4">
          <Link href={conversationId ? `/conversation/${conversationId}` : "/"}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-lg font-medium flex items-center gap-2">
            {isNewConversation && <Sparkles className="h-4 w-4 text-yellow-500" />}
            {conversationTitle}
          </h1>
        </div>
      </header>

      <main className="flex flex-col items-center justify-between h-[calc(100vh-64px)] p-4 relative z-10">
        <div
          className={cn(
            "w-full flex-1 flex flex-col items-center justify-center gap-8 transition-all duration-500",
            !isRecording && "scale-105",
          )}
        >
          <AudioVisualizer audioStream={audioStream} isRecording={isRecording} />
          <Timer isRunning={isRecording} />
        </div>

        <div className="w-full flex justify-center gap-8 py-8">
          <Button
            variant="outline"
            size="icon"
            className="h-16 w-16 rounded-full shadow-md transition-all duration-300 hover:bg-primary/10"
            onClick={handlePauseResume}
          >
            {isRecording ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-16 w-16 rounded-full shadow-md transition-all duration-300 hover:bg-green-50"
            onClick={handleComplete}
          >
            <Check className="h-8 w-8 text-green-600" />
          </Button>
        </div>
      </main>
    </div>
  )
}

