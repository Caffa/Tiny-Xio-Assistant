"use client"

import { useEffect, useState } from "react"

interface TimerProps {
  isRunning: boolean
}

export function Timer({ isRunning }: TimerProps) {
  const [time, setTime] = useState(0)

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (isRunning) {
      intervalId = setInterval(() => {
        setTime((t) => t + 1)
      }, 1000)
    } else {
      // Reset timer when recording stops
      setTime(0)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isRunning])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="text-center flex flex-col items-center gap-1">
      <div className="text-4xl font-mono tracking-wider font-bold text-primary">
        {formatTime(time)}
      </div>
      <div className="text-sm text-gray-500">Record duration</div>
    </div>
  )
}

