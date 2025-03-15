"use client"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AudioVisualizerProps {
  audioStream: MediaStream | null
  isRecording: boolean
}

export function AudioVisualizer({ audioStream, isRecording }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(50).fill(0))
  const prevLevelsRef = useRef<number[]>(Array(50).fill(0))

  useEffect(() => {
    if (!audioStream || !canvasRef.current) return

    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const gainNode = audioContext.createGain()
    const source = audioContext.createMediaStreamSource(audioStream)

    // Lower gain to prevent maxing out
    gainNode.gain.value = 1.5

    // Increase FFT size for better frequency resolution
    analyser.fftSize = 1024

    // Slightly higher smoothing for smoother decay
    analyser.smoothingTimeConstant = 0.6

    // Connect nodes: source -> gain -> analyser
    source.connect(gainNode)
    gainNode.connect(analyser)

    const bufferLength = analyser.frequencyBinCount
    const timeData = new Float32Array(bufferLength)
    const freqData = new Uint8Array(bufferLength)

    const updateAudioLevels = () => {
      if (!isRecording) {
        animationRef.current = requestAnimationFrame(updateAudioLevels)
        return
      }

      // Get both time and frequency domain data
      analyser.getFloatTimeDomainData(timeData)
      analyser.getByteFrequencyData(freqData)

      // Calculate RMS value from time domain data
      let rms = 0
      for (let i = 0; i < timeData.length; i++) {
        rms += timeData[i] * timeData[i]
      }
      rms = Math.sqrt(rms / timeData.length)

      // Focus on vocal frequencies for the frequency analysis
      const startBin = Math.floor(bufferLength * 0.05)
      const endBin = Math.floor(bufferLength * 0.3)
      let freqSum = 0
      for (let i = startBin; i < endBin; i++) {
        freqSum += freqData[i]
      }
      const freqAvg = freqSum / (endBin - startBin) / 255 // Normalize to 0-1

      // Combine RMS and frequency data for final value
      const combinedValue = (rms * 0.7 + freqAvg * 0.3)

      // Apply non-linear scaling for better visual dynamics
      // Lower the scaling factor to prevent maxing out
      const scaledValue = Math.pow(combinedValue, 0.6) * 2.5

      // Clamp between 0 and 1
      const normalizedValue = Math.min(1, Math.max(0, scaledValue))

      // Create a bell curve distribution for the bars
      const centerIndex = Math.floor(audioLevels.length / 2)
      const newLevels = new Array(audioLevels.length).fill(0).map((_, index) => {
        // Calculate distance from center (0 to 1)
        const distanceFromCenter = Math.abs(index - centerIndex) / centerIndex
        // Create bell curve falloff
        const amplitudeFactor = Math.exp(-Math.pow(distanceFromCenter * 2, 2))

        // Get the previous value for this position for smooth decay
        const prevValue = prevLevelsRef.current[index]
        const targetValue = normalizedValue * 100 * amplitudeFactor

        // Smooth decay: if new value is lower, decay gradually
        if (targetValue < prevValue) {
          return prevValue * 0.85 // Decay factor (adjust for faster/slower decay)
        }
        return targetValue
      })

      // Update previous values reference
      prevLevelsRef.current = newLevels

      // Update state with new levels
      setAudioLevels(newLevels)

      animationRef.current = requestAnimationFrame(updateAudioLevels)
    }

    updateAudioLevels()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      gainNode.disconnect()
      source.disconnect()
      audioContext.close()
    }
  }, [audioStream, isRecording])

  return (
    <div className={cn("w-full max-w-md h-40 transition-all duration-500", !isRecording && "opacity-70")}>
      <div className="flex items-center justify-between h-full gap-1">
        {audioLevels.map((height, index) => (
          <div key={index} className="flex-1 h-full flex items-center">
            <div
              className={cn(
                "w-full rounded-sm transition-all duration-200",
                isRecording ? "bg-gray-900" : "bg-gray-200"
              )}
              style={{
                height: `${Math.max(2, height)}%`,
                transition: "height 150ms ease-out"
              }}
            />
          </div>
        ))}
      </div>
      <canvas ref={canvasRef} width={300} height={200} className="hidden" />
    </div>
  )
}

