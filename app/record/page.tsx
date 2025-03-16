"use client"

import React, { useEffect, useRef, useState } from "react"
import { ChevronLeft, Pause, Play, Check } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { Button } from "@/components/ui/button"
import { createConversation, saveRecording } from "@/lib/storage"
import { cn } from "@/lib/utils"

// Get supported audio MIME type
const getSupportedMimeType = () => {
  const types = ['audio/mp3', 'audio/mpeg', 'audio/webm;codecs=opus', 'audio/ogg;codecs=opus']
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }
  return 'audio/webm' // Fallback
}

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [isPulsing, setIsPulsing] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const searchParams = useSearchParams()
  const router = useRouter()
  const mimeType = useRef(getSupportedMimeType())

  // Get the conversation ID and title from the URL
  const conversationId = searchParams.get("conversation")
  const conversationTitle = searchParams.get("title") || "New Recording"
  const isNewConversation = !conversationId

  useEffect(() => {
    const requestPermissionAndStartRecording = async () => {
      try {
        console.log("Requesting microphone permission...")
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1, // Mono audio for voice
            noiseSuppression: true, // Reduce background noise
            echoCancellation: true, // Reduce echo
            autoGainControl: true, // Auto adjust volume
          },
        })
        setAudioStream(stream)
        console.log("Microphone access granted")

        // Create new MediaRecorder with the stream
        const recorder = new MediaRecorder(stream, { mimeType: mimeType.current })
        mediaRecorderRef.current = recorder
        audioChunksRef.current = []

        // Handle data coming from the recorder
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
            console.log("Audio chunk received:", event.data.size, "bytes")
          }
        }

        // Start recording automatically
        recorder.start(500) // Collect data every 500ms
        console.log("Recording started")
        setIsRecording(true)
        setIsPulsing(true)
      } catch (err) {
        console.error("Error getting microphone permission:", err)
        setPermissionError("Please allow microphone access to record")
      }
    }

    requestPermissionAndStartRecording()

    // Cleanup function
    return () => {
      if (audioStream) {
        console.log("Stopping all audio tracks")
        audioStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const handlePauseResumeRecording = () => {
    if (!mediaRecorderRef.current) {
      console.error("MediaRecorder not initialized")
      return
    }

    if (isRecording) {
      // Pause recording
      if (mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.pause()
        console.log("Recording paused")
        setIsRecording(false)
        setIsPulsing(false)
      }
    } else {
      // Resume recording
      if (mediaRecorderRef.current.state === "paused") {
        mediaRecorderRef.current.resume()
        console.log("Recording resumed")
        setIsRecording(true)
        setIsPulsing(true)
      }
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
    const handleStop = async () => {
      console.log("Recording stopped, audio chunks:", audioChunksRef.current.length)

      if (audioChunksRef.current.length === 0) {
        console.error("No audio data collected")
        return
      }

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' })
      console.log("Created audio blob:", audioBlob.size, "bytes")

      try {
        // Process conversation ID
        let targetConversationId = conversationId

        // If it's a new conversation, create it with a timestamp-based ID
        if (isNewConversation) {
          const newConversation = createConversation(conversationTitle)
          targetConversationId = newConversation.id
          console.log("Created new conversation:", targetConversationId)
        }

        console.log("Saving recording to conversation:", targetConversationId)

        // Save recording with the blob
        const savedRecording = await saveRecording({
          conversationId: targetConversationId!,
          title: conversationTitle,
          transcript: "Transcription will appear here",
          timestamp: new Date().toISOString(),
          audioBlob: audioBlob
        })

        console.log("Recording saved successfully:", savedRecording)

        // Clear media resources
        setAudioStream(null)

        // Navigate to conversation page
        const navUrl = `/conversation/${targetConversationId}`
        console.log("Navigating to:", navUrl)
        router.push(navUrl)
      } catch (error) {
        console.error("Error saving recording:", error)
      }
    }

    // Add stop event listener
    mediaRecorderRef.current.addEventListener('stop', handleStop, { once: true })

    // Stop the recording
    mediaRecorderRef.current.stop()
    console.log("Recording stopping...")

    // Stop all tracks from the stream
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop())
    }
  }

  // Show error if microphone permission is denied
  if (permissionError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Microphone Access Required</h1>
        <p className="mb-6 text-gray-600">{permissionError}</p>
        <Button asChild variant="outline">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-between min-h-screen p-4 transition-all duration-300",
      !isRecording && "bg-gray-50"
    )}>
      <div className="w-full flex justify-start">
        <Button
          variant="outline"
          asChild
          className="p-2 border-2 border-black bg-white hover:bg-gray-100"
        >
          <Link href="/">
            <ChevronLeft className="h-6 w-6 text-black" />
          </Link>
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
        <div className="text-xl font-medium mb-8">
          {isNewConversation ? `${conversationTitle} ✨` : conversationTitle}
        </div>

        <div className="mb-16 w-full">
          <AudioVisualizer
            audioStream={audioStream}
            isRecording={isPulsing}
          />
        </div>

        <div className="flex justify-center gap-12 w-full mt-8">
          <Button
            onClick={handlePauseResumeRecording}
            className="rounded-full h-16 w-16 flex items-center justify-center"
          >
            {isRecording ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </Button>

          <Button
            onClick={handleComplete}
            variant="secondary"
            className="rounded-full h-16 w-16 flex items-center justify-center"
          >
            <Check className="h-8 w-8" />
          </Button>
        </div>
      </div>

      <div className="h-16"></div>
    </div>
  )
}

