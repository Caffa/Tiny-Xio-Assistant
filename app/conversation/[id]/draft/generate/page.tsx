"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function GenerateDraftPage({
  params,
}: {
  params: { id: string }
}) {
  const searchParams = useSearchParams()
  const draftType = searchParams.get("type") || "twitter"
  const customPrompt = searchParams.get("prompt")

  const [isGenerating, setIsGenerating] = useState(true)
  const [generatedContent, setGeneratedContent] = useState("")

  // Simulate AI generation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsGenerating(false)

      // Mock generated content based on draft type
      if (draftType === "twitter") {
        setGeneratedContent(
          "1/ The profile of my ideal reader: someone who enjoys productivity videos and books like 'Sapiens' and '4-Hour Workweek'.\n\n" +
            "2/ They're the type to join Ali Abdaal's Part-Time YouTuber Academy, aspiring content creators looking for alternative paths.\n\n" +
            "3/ They're seeking passive income opportunities and reject the conventional 9-to-5 lifestyle.",
        )
      } else if (draftType === "substack") {
        setGeneratedContent(
          "# Understanding My Reader Profile\n\n" +
            "My ideal reader is someone fascinated by productivity and personal development. They consume content like 'Sapiens' and 'The 4-Hour Workweek' regularly, and are drawn to educational programs like Ali Abdaal's Part-Time YouTuber Academy.\n\n" +
            "## Content Creation Aspirations\n\n" +
            "These individuals are aspiring content creators with a strong drive to improve their circumstances. They're actively exploring alternative career paths and methods to generate passive income, fundamentally rejecting the traditional nine-to-five employment model.",
        )
      } else {
        setGeneratedContent(
          "# The Modern Content Creator: A Demographic Analysis\n\n" +
            "This article examines the profile of contemporary content creators, their consumption habits, and career aspirations.\n\n" +
            "## Introduction\n\n" +
            "The modern content creator represents a distinct demographic with specific media consumption patterns and professional goals. This analysis explores their characteristics and motivations.\n\n" +
            "## Consumption Patterns\n\n" +
            "Research indicates these individuals regularly engage with productivity-focused content, including literature such as 'Sapiens' (Harari, 2015) and 'The 4-Hour Workweek' (Ferriss, 2009). Additionally, they demonstrate interest in educational programs specifically targeting content creation skills, exemplified by enrollment in courses such as Ali Abdaal's Part-Time YouTuber Academy.",
        )
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [draftType, customPrompt])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between p-4 bg-white border-b">
        <Link href={`/conversation/${params.id}/draft`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-xl font-medium">
          {draftType === "twitter" ? "Twitter Thread" : draftType === "substack" ? "Substack Post" : "Article Draft"}
        </h1>
        <Button variant="ghost" size="icon">
          <Copy className="h-5 w-5" />
        </Button>
      </header>

      <main className="container mx-auto p-4 max-w-2xl">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="h-8 w-8 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <p className="text-gray-600">Generating your draft...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 shadow-sm whitespace-pre-wrap">{generatedContent}</div>
        )}
      </main>
    </div>
  )
}

