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

  // Create a persistent array of random frequency band assignments for bars
  const freqBandAssignmentsRef = useRef<number[]>(() => {
    return Array(50).fill(0).map(() => {
      // Randomly assign each bar to focus on different frequency ranges
      // 0: default (full range), 1: low, 2: mid, 3: high
      const weights = [0.7, 0.1, 0.1, 0.1] // 70% default, 10% each special range
      const rand = Math.random()
      if (rand < weights[0]) return 0
      if (rand < weights[0] + weights[1]) return 1
      if (rand < weights[0] + weights[1] + weights[2]) return 2
      return 3
    })
  })

  useEffect(() => {
    if (!audioStream || !canvasRef.current) return

    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const gainNode = audioContext.createGain()
    const source = audioContext.createMediaStreamSource(audioStream)

    // Lower gain to prevent maxing out
    gainNode.gain.value = 1.5

    // Increase FFT size for better frequency resolution
    analyser.fftSize = 2048 // Increased for better frequency resolution

    // Slightly higher smoothing for smoother decay
    analyser.smoothingTimeConstant = 0.6

    // Connect nodes: source -> gain -> analyser
    source.connect(gainNode)
    gainNode.connect(analyser)

    const bufferLength = analyser.frequencyBinCount
    const timeData = new Float32Array(bufferLength)
    const freqData = new Uint8Array(bufferLength)

    const getFrequencyRangeValue = (start: number, end: number): number => {
      let sum = 0
      const length = end - start
      for (let i = start; i < end; i++) {
        sum += freqData[i]
      }
      return sum / length / 255 // Normalize to 0-1
    }

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

      // Get different frequency range values
      const lowFreq = getFrequencyRangeValue(0, Math.floor(bufferLength * 0.1))    // 0-200Hz
      const midFreq = getFrequencyRangeValue(Math.floor(bufferLength * 0.1), Math.floor(bufferLength * 0.3))  // 200-800Hz
      const highFreq = getFrequencyRangeValue(Math.floor(bufferLength * 0.3), Math.floor(bufferLength * 0.5)) // 800-2000Hz

      // Combine RMS and frequency data for final value
      // Apply non-linear scaling for better visual dynamics
      const baseValue = Math.pow(rms * 0.7, 0.6) * 2.5

      // Create a bell curve distribution for the bars
      const centerIndex = Math.floor(audioLevels.length / 2)
      const newLevels = new Array(audioLevels.length).fill(0).map((_, index) => {
        // Calculate distance from center (0 to 1)
        const distanceFromCenter = Math.abs(index - centerIndex) / centerIndex
        // Create bell curve falloff
        const amplitudeFactor = Math.exp(-Math.pow(distanceFromCenter * 2, 2))

        // Get frequency band assignment for this bar
        const freqBand = freqBandAssignmentsRef.current[index]

        // Calculate base target value
        let targetValue = baseValue

        // Modify target value based on frequency band assignment
        switch (freqBand) {
          case 1: // Low frequency focused
            targetValue = targetValue * 0.7 + lowFreq * 0.8
            break
          case 2: // Mid frequency focused
            targetValue = targetValue * 0.7 + midFreq * 0.8
            break
          case 3: // High frequency focused
            targetValue = targetValue * 0.7 + highFreq * 0.8
            break
          default: // Default behavior (full range)
            // Keep original target value
            break
        }

        // Clamp between 0 and 1
        targetValue = Math.min(1, Math.max(0, targetValue))

        // Apply bell curve distribution
        targetValue = targetValue * 100 * amplitudeFactor

        // Get the previous value for this position for smooth decay
        const prevValue = prevLevelsRef.current[index]

        // Smooth decay: if new value is lower, decay gradually
        if (targetValue < prevValue) {
          return prevValue * 0.85 // Decay factor
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
                isRecording ?
                  // Different colors for different frequency bands
                  freqBandAssignmentsRef.current[index] === 1 ? "bg-gray-800" :
                  freqBandAssignmentsRef.current[index] === 2 ? "bg-gray-700" :
                  freqBandAssignmentsRef.current[index] === 3 ? "bg-gray-600" :
                  "bg-gray-900"
                : "bg-gray-200"
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

