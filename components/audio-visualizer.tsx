"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface AudioVisualizerProps {
  audioStream: MediaStream | null
  isRecording: boolean
}

export function AudioVisualizer({ audioStream, isRecording }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    if (!audioStream || !canvasRef.current) return

    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(audioStream)

    analyser.fftSize = 256
    source.connect(analyser)

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")!

    const draw = () => {
      if (!isRecording) {
        // If paused, just keep the last frame
        animationRef.current = requestAnimationFrame(draw)
        return
      }

      const width = canvas.width
      const height = canvas.height

      analyser.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, width, height)

      const barWidth = width / bufferLength

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height

        ctx.fillStyle = isRecording ? "black" : "#666"
        ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight)
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      source.disconnect()
      audioContext.close()
    }
  }, [audioStream, isRecording])

  return (
    <div className={cn("w-full max-w-md transition-all duration-500", !isRecording && "opacity-70")}>
      <canvas ref={canvasRef} width={300} height={200} className="w-full" />
    </div>
  )
}

