import type { Metadata } from 'next'
import { ThemeProvider } from "@/components/theme-provider"
import { cleanupOldRecordings } from "@/lib/storage"
import { cleanupUnusedRecordingFiles } from "@/lib/utils"
import './globals.css'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Run cleanup on app initialization
  if (typeof window !== 'undefined') {
    // Run cleanup asynchronously
    Promise.all([
      cleanupOldRecordings(),
      cleanupUnusedRecordingFiles()
    ]).catch(error => {
      console.error('Error during storage cleanup:', error)
    })
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

