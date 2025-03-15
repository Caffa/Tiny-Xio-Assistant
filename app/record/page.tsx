"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { Timer } from "@/components/timer"
import { ArrowLeft, Play, Pause, Check, Sparkles } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { saveRecording } from "@/lib/storage"

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false) // Start with false instead of true
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [isPulsing, setIsPulsing] = useState(false) // Start with false instead of true
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get the conversation ID and title from the URL
  const conversationId = searchParams.get("conversation")
  const conversationTitle = searchParams.get("title") || "New Recording"
  const isNewConversation = !conversationId

  useEffect(() => {
    const requestPermissionAndStartRecording = async () => {
      try {
        console.log("Requesting microphone permission...")
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        console.log("Permission granted, starting recording...")
        setAudioStream(stream)
        setIsRecording(true)
        setIsPulsing(true)
        setPermissionError(null)

        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0) {
            console.log("Audio chunk received:", event.data.size, "bytes")
            audioChunksRef.current.push(event.data)
          }
        })

        // Make sure we get data at regular intervals
        mediaRecorder.start(1000)
        console.log("MediaRecorder started:", mediaRecorder.state)
      } catch (err: any) {
        console.error("Error accessing microphone:", err)
        setPermissionError(err.message || "Could not access your microphone. Please check permissions.")
      }
    }

    requestPermissionAndStartRecording()

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        console.log("Stopping recorder on cleanup")
        mediaRecorderRef.current.stop()
      }

      if (audioStream) {
        console.log("Stopping audio tracks")
        audioStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const handlePauseResume = () => {
    if (!mediaRecorderRef.current) return

    if (isRecording) {
      console.log("Pausing recording")
      if (mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.pause()
      }
      setIsRecording(false)
      setIsPulsing(false)
    } else {
      console.log("Resuming recording")
      if (mediaRecorderRef.current.state === "paused") {
        mediaRecorderRef.current.resume()
      }
      setIsRecording(true)
      setIsPulsing(true)
    }
  }

  const handleComplete = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      console.error("MediaRecorder is not active")
      return
    }

    console.log("Completing recording...")

    // Request data from the recorder before stopping
    mediaRecorderRef.current.requestData()

    // Define the stop event handler before stopping
    const handleStop = () => {
      console.log("Recording stopped, audio chunks:", audioChunksRef.current.length)

      if (audioChunksRef.current.length === 0) {
        console.error("No audio data collected")
        return
      }

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      console.log("Created audio blob:", audioBlob.size, "bytes")

      const audioUrl = URL.createObjectURL(audioBlob)
      console.log("Created object URL:", audioUrl)

      // Generate a unique ID for this recording
      const recordingId = `rec-${Date.now()}`
      const newConversationId = conversationId || `new-${Date.now()}`

      console.log("Saving recording:", {
        id: recordingId,
        conversationId: newConversationId,
        title: conversationTitle
      })

      // Save the recording to local storage
      saveRecording({
        id: recordingId,
        conversationId: newConversationId,
        title: conversationTitle,
        audioUrl: audioUrl,
        transcript: "Transcription will appear here",
        timestamp: new Date().toISOString(),
        audioBlob: audioBlob
      })

      // Clear media resources
      setAudioStream(null)

      // Navigate to conversation page
      const navUrl = `/conversation/${newConversationId}${conversationId ? '' : `?title=${encodeURIComponent(conversationTitle)}`}`
      console.log("Navigating to:", navUrl)
      router.push(navUrl)
    }

    // Add event listener for when recording stops
    mediaRecorderRef.current.addEventListener("stop", handleStop, { once: true })

    // Stop the recording
    mediaRecorderRef.current.stop()
    setIsRecording(false)
    console.log("MediaRecorder stopped")
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
        {permissionError && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4 text-center">
            {permissionError}
            <div className="mt-2">
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        )}
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
            disabled={!audioStream || !!permissionError}
          >
            {isRecording ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-16 w-16 rounded-full shadow-md transition-all duration-300 hover:bg-green-50"
            onClick={handleComplete}
            disabled={!audioStream || !isRecording && audioChunksRef.current.length === 0 || !!permissionError}
          >
            <Check className="h-8 w-8 text-green-600" />
          </Button>
        </div>
      </main>
    </div>
  )
}

