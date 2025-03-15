"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DraftCustomizationProps {
  isOpen: boolean
  onClose: () => void
  prompt: string
  onPromptChange: (prompt: string) => void
}

export function DraftCustomization({ isOpen, onClose, prompt, onPromptChange }: DraftCustomizationProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/50 z-50 transition-opacity",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-white rounded-t-xl p-6 transition-transform duration-300",
          isOpen ? "translate-y-0" : "translate-y-full",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Customize AI Prompt</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Customize how the AI should transform your conversation into the selected format. Be specific about tone,
            style, and any particular elements you want to maintain.
          </p>

          <Textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Enter your custom prompt..."
            className="min-h-[200px]"
          />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

