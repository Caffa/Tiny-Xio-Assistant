import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-white">
      <h1 className="text-2xl font-bold">Streams</h1>
      <Avatar>
        <AvatarImage src="/placeholder.svg" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </header>
  )
}

