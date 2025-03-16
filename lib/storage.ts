// Local storage utility for voice memos
import {
  loadRecordingFile,
  saveRecordingFile,
  deleteRecordingFile,
  RECORDINGS_DIR,
  generateTimeId,
  getConversationFiles,
  clearAllRecordings
} from './utils'

export interface Recording {
  id: string
  conversationId: string
  title: string
  filePath: string // Path to the audio file
  transcript: string
  enhancedTranscript?: string
  timestamp: string
}

export interface Conversation {
  id: string
  title: string
  timestamp: string
  recordings: Recording[]
}

const STORAGE_KEY = 'voice-memo-app'
const STORAGE_VERSION = 4 // Incremented for timestamp-based ID structure

// Initialize storage with default values if empty
const initializeStorage = (): void => {
  const currentData = localStorage.getItem(STORAGE_KEY)
  if (!currentData) {
    const initialData = {
      version: STORAGE_VERSION,
      conversations: [],
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData))
    return
  }

  // Handle migration from old format
  const data = JSON.parse(currentData)
  if (!data.version || data.version < STORAGE_VERSION) {
    migrateStorage(data)
  }
}

// Migrate from old storage format to new timestamp-based format
const migrateStorage = async (oldData: any) => {
  console.log('Migrating storage to new timestamp-based format...')

  // Clear all old recordings from the file system
  await clearAllRecordings()

  // Reset conversations data to empty
  const newData = {
    version: STORAGE_VERSION,
    conversations: []
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
  console.log('Migration complete! All old recordings have been cleared.')
}

// Get all conversations
export const getConversations = (): Conversation[] => {
  initializeStorage()
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  return data.conversations || []
}

// Get a specific conversation by ID
export const getConversation = (id: string): Conversation | undefined => {
  const conversations = getConversations()
  return conversations.find(convo => convo.id === id)
}

// Create a new conversation with a timestamp-based ID
export const createConversation = (title: string): Conversation => {
  // Generate a timestamp-based ID
  const id = generateTimeId()

  const conversation: Conversation = {
    id,
    title,
    timestamp: new Date().toISOString(),
    recordings: []
  }

  saveConversation(conversation)
  return conversation
}

// Save a conversation
export const saveConversation = (conversation: Conversation): void => {
  const conversations = getConversations()
  const existingIndex = conversations.findIndex(c => c.id === conversation.id)

  if (existingIndex >= 0) {
    conversations[existingIndex] = conversation
  } else {
    conversations.push(conversation)
  }

  const data = {
    version: STORAGE_VERSION,
    conversations
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Save a recording to a conversation
export const saveRecording = async (
  recording: Omit<Recording, 'filePath' | 'id'> & { audioBlob: Blob }
): Promise<Recording> => {
  const { audioBlob, ...recordingData } = recording

  // Generate a timestamp-based ID for the recording
  const recordingId = generateTimeId()

  // Save the audio file and get the file path
  const filePath = await saveRecordingFile(
    recordingData.conversationId,
    recordingId,
    audioBlob
  )

  const conversations = getConversations()
  const conversationIndex = conversations.findIndex(c => c.id === recordingData.conversationId)

  const recordingToSave: Recording = {
    ...recordingData,
    id: recordingId,
    filePath
  }

  if (conversationIndex >= 0) {
    conversations[conversationIndex].recordings.push(recordingToSave)
  } else {
    // Create new conversation with this recording
    const newConversation: Conversation = {
      id: recordingData.conversationId,
      title: recordingData.title,
      timestamp: new Date().toISOString(),
      recordings: [recordingToSave],
    }
    conversations.push(newConversation)
  }

  const data = {
    version: STORAGE_VERSION,
    conversations
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

  return recordingToSave
}

// Delete a recording
export const deleteRecording = async (recordingId: string, conversationId: string): Promise<void> => {
  const conversations = getConversations()
  const conversationIndex = conversations.findIndex(c => c.id === conversationId)

  if (conversationIndex >= 0) {
    const recording = conversations[conversationIndex].recordings.find(r => r.id === recordingId)

    if (recording) {
      // Delete the audio file
      await deleteRecordingFile(conversationId, recordingId)
    }

    conversations[conversationIndex].recordings = conversations[conversationIndex].recordings.filter(
      r => r.id !== recordingId
    )

    // If no recordings left, delete the conversation
    if (conversations[conversationIndex].recordings.length === 0) {
      conversations.splice(conversationIndex, 1)
    }

    const data = {
      version: STORAGE_VERSION,
      conversations
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}

// Delete a conversation and all its recordings
export const deleteConversation = async (conversationId: string): Promise<void> => {
  const conversation = getConversation(conversationId)
  if (conversation) {
    // Delete all recording files
    await Promise.all(
      conversation.recordings.map(r => deleteRecordingFile(conversationId, r.id))
    )
  }

  const conversations = getConversations().filter(c => c.id !== conversationId)
  const data = {
    version: STORAGE_VERSION,
    conversations
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Cleanup old recordings that are no longer referenced
export const cleanupOldRecordings = async (): Promise<void> => {
  try {
    // Get all conversation directories
    const response = await fetch(RECORDINGS_DIR)
    if (!response.ok) return

    const dirs = await response.json()
    const conversations = getConversations()
    const validConversationIds = new Set(conversations.map(c => c.id))

    // Delete directories for conversations that no longer exist
    for (const dir of dirs) {
      if (!dir.isDirectory) continue

      const conversationId = dir.name
      if (!validConversationIds.has(conversationId)) {
        // This conversation directory no longer has metadata - delete it
        await fetch(`${RECORDINGS_DIR}/${conversationId}`, { method: 'DELETE' })
        console.log(`Deleted orphaned conversation directory: ${conversationId}`)
      } else {
        // This conversation exists, but check for orphaned files
        const validRecordingIds = new Set(
          conversations
            .find(c => c.id === conversationId)
            ?.recordings.map(r => r.id) || []
        )

        const files = await getConversationFiles(conversationId)
        for (const recordingId of files) {
          if (!validRecordingIds.has(recordingId)) {
            await deleteRecordingFile(conversationId, recordingId)
            console.log(`Deleted orphaned recording: ${recordingId} from conversation ${conversationId}`)
          }
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up recordings:', error)
  }
}

