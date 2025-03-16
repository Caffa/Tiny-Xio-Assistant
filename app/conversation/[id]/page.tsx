"use client"

import { useEffect, useState } from "react"
import { VoiceMemo } from "@/components/voice-memo"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mic, ClipboardCopy, FileEdit } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { getConversation, type Conversation } from "@/lib/storage"

// Mock data for conversations
const mockConversations: Record<
  string,
  {
    title: string
    memos: Array<{
      id: string
      title: string
      transcript: string
      timestamp: string
    }>
  }
> = {
  "reader-profile": {
    title: "Reader Profile the Aspiring Content Creator",
    memos: [
      {
        id: "memo-1",
        title: "Reader Demographics",
        transcript:
          "The profile of my reader is someone who enjoys watching videos about productivity and reading books such as 'Sapiens' and 'The 4-Hour Workweek.'",
        timestamp: "2024-03-14T09:30:00Z",
      },
      {
        id: "memo-2",
        title: "Course Preferences",
        transcript:
          "They are the type of person who would sign up for Ali Abdaal's Part-Time YouTuber Academy courses.",
        timestamp: "2024-03-14T09:32:00Z",
      },
      {
        id: "memo-3",
        title: "Career Aspirations",
        transcript:
          "They are aspiring content creators with a drive to improve their lives by exploring alternative paths and trying to generate passive income. They reject the idea of a nine-to-five job.",
        timestamp: "2024-03-14T09:35:00Z",
      },
    ],
  },
  "engaging-generation": {
    title: "Engaging a New Generation: Tailoring Products",
    memos: [
      {
        id: "memo-4",
        title: "Content Fatigue",
        transcript:
          "My readers are individuals who are tired of conventional, generic productivity advice because they have already heard it before, and sometimes it simply does not work. However, people continue to recommend the same old things.",
        timestamp: "2024-03-14T10:15:00Z",
      },
      {
        id: "memo-5",
        title: "Format Preferences",
        transcript:
          "My readers prefer not to read lengthy texts. Instead, they favor emojis because they are usually young, in their twenties, and accustomed to structured writing that makes it easier for them to digest information.",
        timestamp: "2024-03-14T10:18:00Z",
      },
    ],
  },
}

export default function ConversationPage({
  params,
}: {
  params: { id: string }
}) {
  const conversationId = params.id
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversation, setConversation] = useState<Conversation | null>(null)

  // Get the title from URL params or use the ID
  const titleFromParams = searchParams.get("title")

  useEffect(() => {
    // Get conversation from storage utility
    const storedConversation = getConversation(conversationId);

    if (storedConversation) {
      setConversation(storedConversation)
    } else if (conversationId.startsWith("new-")) {
      // This is a new conversation
      const newConversation: Conversation = {
        id: conversationId,
        title: titleFromParams || "New Recording",
        timestamp: new Date().toISOString(),
        recordings: []
      }
      setConversation(newConversation)
    }
  }, [conversationId, titleFromParams])

  const handleAddToConversation = () => {
    router.push(`/record?conversation=${conversationId}&title=${encodeURIComponent(conversation?.title || "Recording")}`)
  }

  const handleCreateDraft = () => {
    router.push(`/conversation/${conversationId}/draft`)
  }

  if (!conversation) {
    return <div>Loading...</div>
  }

  // Group recordings by date
  const groupedRecordings = conversation.recordings.reduce((groups: Record<string, typeof conversation.recordings>, recording) => {
    const date = new Date(recording.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

    if (!groups[date]) {
      groups[date] = []
    }

    groups[date].push(recording)
    return groups
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between p-4 bg-white">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button
              variant="outline"
              size="icon"
              className="border-2 border-black bg-white hover:bg-gray-100"
            >
              <ArrowLeft className="h-6 w-6 text-black" />
            </Button>
          </Link>
          <h1 className="text-xl font-medium">{conversation.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="text-gray-600">
            <ClipboardCopy className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-600" onClick={handleCreateDraft}>
            <FileEdit className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="p-4 pb-24">
        {conversation.recordings.length > 0 ? (
          Object.entries(groupedRecordings).map(([date, recordings]) => (
            <div key={date} className="mb-8">
              <div className="flex justify-center mb-4">
                <span className="bg-gray-200 text-gray-600 px-4 py-1 rounded-full text-sm">{date}</span>
              </div>

              <div className="space-y-4">
                {recordings.map((recording) => (
                  <VoiceMemo
                    key={recording.id}
                    filePath={recording.filePath}
                    title={recording.title}
                    transcript={recording.transcript}
                    timestamp={recording.timestamp}
                    conversationId={conversationId}
                    memoId={recording.id}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">No recordings yet. Add your first voice memo!</div>
        )}
      </main>

      <div className="fixed bottom-4 left-4 right-4 z-30">
        <Button className="w-full gap-2" onClick={handleAddToConversation}>
          <Mic className="h-4 w-4" />
          Add to conversation
        </Button>
      </div>
    </div>
  )
}

