import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function Streams() {
  const conversations = {
    today: [
      { id: "financial-anxiety", title: "Navigating Financial Anxiety and Subscription Dilemmas" },
      { id: "voice-pal-app", title: "Designing the Voice Pal App: Features and Functionality" },
    ],
    yesterday: [
      { id: "guppies", title: "A Day of Bonding Over Guppies" },
      { id: "reader-profile", title: "Reader Profile the Aspiring Content Creator Audience" },
      { id: "engaging-generation", title: "Engaging a New Generation: Tailoring Products" },
    ],
  }

  return (
    <div className="p-4">
      <section className="mb-6">
        <h2 className="text-lg text-gray-500 mb-4">Today</h2>
        {conversations.today.map((convo) => (
          <Link
            key={convo.id}
            href={`/conversation/${convo.id}?title=${encodeURIComponent(convo.title)}`}
            className="block py-4 border-b border-gray-200"
          >
            <h3 className="text-lg font-medium">{convo.title}</h3>
          </Link>
        ))}
      </section>

      <section>
        <h2 className="text-lg text-gray-500 mb-4">Yesterday</h2>
        {conversations.yesterday.map((convo) => (
          <Link
            key={convo.id}
            href={`/conversation/${convo.id}?title=${encodeURIComponent(convo.title)}`}
            className="block py-4 border-b border-gray-200"
          >
            <h3 className="text-lg font-medium">{convo.title}</h3>
          </Link>
        ))}
      </section>

      <Link href="/record">
        <Button size="icon" className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg">
          <Plus className="h-6 w-6" />
          <span className="sr-only">New recording</span>
        </Button>
      </Link>
    </div>
  )
}

