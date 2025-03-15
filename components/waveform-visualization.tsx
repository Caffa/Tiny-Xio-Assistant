import { cn } from "@/lib/utils"
interface WaveformVisualizationProps {
  progress: number
}

export function WaveformVisualization({ progress }: WaveformVisualizationProps) {
  // Generate random heights for the waveform bars
  const bars = Array.from({ length: 50 }, () => Math.random() * 100)
  const progressIndex = Math.floor((progress / 100) * bars.length)

  return (
    <div className="flex items-center justify-between h-full gap-1">
      {bars.map((height, index) => (
        <div key={index} className="flex-1 h-full flex items-center">
          <div
            className={cn(
              "w-full rounded-sm transition-all duration-200",
              index <= progressIndex ? "bg-gray-900" : "bg-gray-200",
            )}
            style={{
              height: `${height}%`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

