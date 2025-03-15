"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Settings, Send, Twitter, FileText, Newspaper } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const draftOptions = [
  {
    id: "twitter",
    icon: Twitter,
    title: "Twitter Thread",
    description: "Convert into an engaging thread",
    prompt:
      "Transform this conversation into a compelling Twitter thread that maintains the key insights while adapting to Twitter's format.",
  },
  {
    id: "substack",
    icon: FileText,
    title: "Substack Post",
    description: "Create a structured blog post",
    prompt:
      "Convert this conversation into a well-structured blog post with clear sections, maintaining the personal tone while adding professional polish.",
  },
  {
    id: "article",
    icon: Newspaper,
    title: "Article Draft",
    description: "Generate a formal article",
    prompt: "Transform this conversation into a formal article with proper citations and academic tone.",
  },
]

export default function CreateDraftPage({
  params,
}: {
  params: { id: string }
}) {
  // Unwrap params Promise
  const unwrappedParams = React.use(params);
  const conversationId = unwrappedParams.id;

  const router = useRouter()
  const [showPromptEdit, setShowPromptEdit] = useState(false)
  const [selectedOption, setSelectedOption] = useState<(typeof draftOptions)[0] | null>(null)
  const [customPrompt, setCustomPrompt] = useState("")

  const handleOptionClick = (option: (typeof draftOptions)[0]) => {
    // Direct navigation to AI draft generation
    router.push(`/conversation/${conversationId}/draft/generate?type=${option.id}`)
  }

  const handleSettingsClick = (e: React.MouseEvent, option: (typeof draftOptions)[0]) => {
    e.stopPropagation()
    setSelectedOption(option)
    setCustomPrompt(option.prompt)
    setShowPromptEdit(true)
  }

  const handleGenerateDraft = () => {
    if (selectedOption) {
      router.push(
        `/conversation/${conversationId}/draft/generate?type=${selectedOption.id}&prompt=${encodeURIComponent(customPrompt)}`,
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between p-4 bg-white border-b">
        <Link href={`/conversation/${conversationId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-xl font-medium">Create Draft</h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </header>

      <main className="container mx-auto p-4 max-w-2xl">
        <div className="space-y-4">
          {draftOptions.map((option) => (
            <Card
              key={option.id}
              className="p-4 cursor-pointer hover:shadow-md transition-all"
              onClick={() => handleOptionClick(option)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <option.icon className="h-5 w-5 text-gray-600" />
                  <div>
                    <h3 className="font-medium">{option.title}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleSettingsClick(e, option)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Prompt edit sheet */}
      <Sheet open={showPromptEdit} onOpenChange={setShowPromptEdit}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Customize AI Prompt</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <p className="text-sm text-gray-600">
              Customize how the AI should transform your conversation into the selected format.
            </p>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[200px]"
              placeholder="Enter custom prompt..."
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPromptEdit(false)}>
                Dismiss Changes
              </Button>
              <Button onClick={handleGenerateDraft}>
                <Send className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

