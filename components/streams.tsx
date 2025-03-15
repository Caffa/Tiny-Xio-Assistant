"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getConversations, Conversation } from "@/lib/storage"
import { format } from "date-fns"

export function Streams() {
  const [todayConversations, setTodayConversations] = useState<Conversation[]>([])
  const [olderConversations, setOlderConversations] = useState<Conversation[]>([])

  useEffect(() => {
    // Get conversations from local storage
    const allConversations = getConversations()

    // Sort conversations by timestamp (newest first)
    allConversations.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    // Filter conversations by date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayConvos = allConversations.filter(convo => {
      const convoDate = new Date(convo.timestamp)
      return convoDate >= today
    })

    const olderConvos = allConversations.filter(convo => {
      const convoDate = new Date(convo.timestamp)
      return convoDate < today
    })

    setTodayConversations(todayConvos)
    setOlderConversations(olderConvos)
  }, [])

  return (
    <div className="p-4">
      {todayConversations.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg text-gray-500 mb-4">Today</h2>
          {todayConversations.map((convo) => (
            <Link
              key={convo.id}
              href={`/conversation/${convo.id}?title=${encodeURIComponent(convo.title)}`}
              className="block py-4 border-b border-gray-200"
            >
              <h3 className="text-lg font-medium">{convo.title}</h3>
              <p className="text-sm text-gray-500">
                {format(new Date(convo.timestamp), 'h:mm a')} · {convo.recordings.length} recording{convo.recordings.length !== 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </section>
      )}

      {olderConversations.length > 0 && (
        <section>
          <h2 className="text-lg text-gray-500 mb-4">Earlier</h2>
          {olderConversations.map((convo) => (
            <Link
              key={convo.id}
              href={`/conversation/${convo.id}?title=${encodeURIComponent(convo.title)}`}
              className="block py-4 border-b border-gray-200"
            >
              <h3 className="text-lg font-medium">{convo.title}</h3>
              <p className="text-sm text-gray-500">
                {format(new Date(convo.timestamp), 'MMM d')} · {convo.recordings.length} recording{convo.recordings.length !== 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </section>
      )}

      {todayConversations.length === 0 && olderConversations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No recordings yet</p>
          <p className="text-sm text-gray-400">Tap the + button to start recording</p>
        </div>
      )}

      <Link href="/record">
        <Button size="icon" className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg">
          <Plus className="h-6 w-6" />
          <span className="sr-only">New recording</span>
        </Button>
      </Link>
    </div>
  )
}

