import { Streams } from "@/components/streams"
import { Header } from "@/components/header"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Streams />
    </main>
  )
}

