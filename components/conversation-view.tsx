interface Message {
  id: string
  title: string
  content: string
  timestamp: string
}

interface MessageGroup {
  date: string
  messages: Message[]
}

export function ConversationView({ messages }: { messages: Message[] }) {
  // Group messages by date
  const groupedMessages = messages.reduce((groups: MessageGroup[], message) => {
    const date = new Date(message.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

    const existingGroup = groups.find((g) => g.date === date)
    if (existingGroup) {
      existingGroup.messages.push(message)
    } else {
      groups.push({ date, messages: [message] })
    }

    return groups
  }, [])

  return (
    <div className="space-y-8">
      {groupedMessages.map((group) => (
        <div key={group.date} className="space-y-4">
          <div className="flex justify-center">
            <span className="bg-gray-200 text-gray-600 px-4 py-1 rounded-full text-sm">{group.date}</span>
          </div>

          {group.messages.map((message) => (
            <div key={message.id} className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold mb-2">{message.title}</h3>
              <p className="text-gray-800">{message.content}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

