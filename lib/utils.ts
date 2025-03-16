import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { cleanupOldRecordings } from "./storage"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// File system utilities for recordings
export const RECORDINGS_DIR = 'data/recordings'
const ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/mpeg']
const MAX_FILE_AGE_DAYS = 30

// Ensure a directory exists
export const ensureDir = async (dirPath: string): Promise<void> => {
  try {
    await fetch(`${dirPath}/.exists`, { method: 'HEAD' })
  } catch {
    console.log(`Creating directory: ${dirPath}`)
    await fetch(dirPath, { method: 'PUT' })
  }
}

// Ensure the main recordings directory exists
export const ensureRecordingsDir = async (): Promise<void> => {
  await ensureDir(RECORDINGS_DIR)
}

// Ensure a conversation directory exists
export const ensureConversationDir = async (conversationId: string): Promise<string> => {
  const conversationDir = `${RECORDINGS_DIR}/${conversationId}`
  await ensureDir(conversationDir)
  return conversationDir
}

export const validateAudioFile = (blob: Blob): boolean => {
  return ALLOWED_AUDIO_TYPES.includes(blob.type)
}

// Generate a timestamp-based ID with dashes separating each part
export const generateTimeId = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0')

  return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}-${milliseconds}`
}

// Save a recording file to a conversation folder
export const saveRecordingFile = async (
  conversationId: string,
  recordingId: string,
  audioBlob: Blob
): Promise<string> => {
  if (!validateAudioFile(audioBlob)) {
    throw new Error('Invalid audio format. Only MP3 files are supported.')
  }

  try {
    // Make sure the recordings directory exists first
    await ensureRecordingsDir()

    // Then ensure the conversation directory
    const conversationDir = await ensureConversationDir(conversationId)
    const filePath = `${conversationDir}/${recordingId}.mp3`

    console.log(`Saving recording to: ${filePath} (blob size: ${audioBlob.size} bytes)`)

    const response = await fetch(filePath, {
      method: 'PUT',
      body: audioBlob,
      headers: {
        'Content-Type': 'audio/mp3'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to save file: ${response.status} ${response.statusText}`)
    }

    console.log(`Successfully saved recording to: ${filePath}`)
    return filePath
  } catch (error) {
    console.error('Error saving recording:', error)
    throw new Error(`Failed to save recording file: ${error.message}`)
  }
}

// Load a recording file from a conversation folder
export const loadRecordingFile = async (
  conversationId: string,
  recordingId: string
): Promise<Blob | null> => {
  try {
    const filePath = `${RECORDINGS_DIR}/${conversationId}/${recordingId}.mp3`
    console.log(`Attempting to load recording from: ${filePath}`)

    const response = await fetch(filePath)

    if (!response.ok) {
      console.error('Recording file not found:', filePath)
      return null
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !ALLOWED_AUDIO_TYPES.includes(contentType)) {
      console.error('Invalid file format:', contentType)
      return null
    }

    const blob = await response.blob()
    if (!validateAudioFile(blob)) {
      console.error('Invalid audio file format')
      return null
    }

    console.log(`Successfully loaded recording from: ${filePath}, blob size: ${blob.size} bytes`)
    return blob
  } catch (error) {
    console.error('Error loading recording:', error)
    return null
  }
}

// Delete a recording file
export const deleteRecordingFile = async (
  conversationId: string,
  recordingId: string
): Promise<boolean> => {
  try {
    const filePath = `${RECORDINGS_DIR}/${conversationId}/${recordingId}.mp3`
    await fetch(filePath, { method: 'DELETE' })
    return true
  } catch (error) {
    console.error('Error deleting recording:', error)
    return false
  }
}

// Get all files in a conversation directory
export const getConversationFiles = async (conversationId: string): Promise<string[]> => {
  try {
    const dirPath = `${RECORDINGS_DIR}/${conversationId}`
    const response = await fetch(dirPath)

    if (!response.ok) return []

    const files = await response.json()
    return files
      .filter((file: any) => file.name.endsWith('.mp3'))
      .map((file: any) => file.name.replace('.mp3', ''))
  } catch (error) {
    console.error(`Error getting files for conversation ${conversationId}:`, error)
    return []
  }
}

// Delete all recordings
export const clearAllRecordings = async (): Promise<boolean> => {
  try {
    // Get all conversation directories
    const response = await fetch(RECORDINGS_DIR)
    if (!response.ok) return false

    const directories = await response.json()

    // Delete each conversation directory
    for (const dir of directories) {
      if (!dir.isDirectory) continue

      const conversationId = dir.name
      const conversationPath = `${RECORDINGS_DIR}/${conversationId}`

      await fetch(conversationPath, { method: 'DELETE' })
      console.log(`Deleted conversation directory: ${conversationId}`)
    }

    return true
  } catch (error) {
    console.error('Error clearing recordings:', error)
    return false
  }
}

// Cleanup function for old recordings
export const cleanupUnusedRecordingFiles = async () => {
  try {
    // Get all conversation directories
    const response = await fetch(RECORDINGS_DIR)
    if (!response.ok) return

    const directories = await response.json()
    const now = Date.now()

    for (const dir of directories) {
      if (!dir.isDirectory) continue

      const conversationId = dir.name
      const conversationPath = `${RECORDINGS_DIR}/${conversationId}`

      // Check if the directory is too old
      const dirStats = await fetch(conversationPath, { method: 'HEAD' })
      if (!dirStats.ok) continue

      const lastModified = new Date(dirStats.headers.get('last-modified') || '').getTime()
      const ageInDays = (now - lastModified) / (1000 * 60 * 60 * 24)

      if (ageInDays > MAX_FILE_AGE_DAYS) {
        // Delete entire conversation directory if it's too old
        await fetch(conversationPath, { method: 'DELETE' })
        console.log(`Deleted old conversation directory: ${conversationId}`)
      }
    }
  } catch (error) {
    console.error('Error cleaning up recordings:', error)
  }
}

