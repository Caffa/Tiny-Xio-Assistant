// Local storage utility for voice memos

export interface Recording {
  id: string
  conversationId: string
  title: string
  audioUrl: string
  transcript: string
  enhancedTranscript?: string
  timestamp: string
  audioBlob?: Blob
}

export interface Conversation {
  id: string
  title: string
  timestamp: string
  recordings: Recording[]
}

const STORAGE_KEY = 'voice-memo-app';

// Initialize storage with default values if empty
const initializeStorage = (): void => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    const initialData = {
      conversations: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  }
};

// Get all conversations
export const getConversations = (): Conversation[] => {
  initializeStorage();
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  return data.conversations || [];
};

// Get a specific conversation by ID
export const getConversation = (id: string): Conversation | undefined => {
  const conversations = getConversations();
  return conversations.find(convo => convo.id === id);
};

// Save a new conversation
export const saveConversation = (conversation: Conversation): void => {
  const conversations = getConversations();
  const existingIndex = conversations.findIndex(c => c.id === conversation.id);

  if (existingIndex >= 0) {
    // Update existing conversation
    conversations[existingIndex] = conversation;
  } else {
    // Add new conversation
    conversations.push(conversation);
  }

  const data = { conversations };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Save a recording to a conversation
export const saveRecording = (recording: Recording): void => {
  const conversations = getConversations();
  const conversationIndex = conversations.findIndex(c => c.id === recording.conversationId);

  if (conversationIndex >= 0) {
    // Add to existing conversation
    const existingRecordingIndex = conversations[conversationIndex].recordings.findIndex(
      r => r.id === recording.id
    );

    if (existingRecordingIndex >= 0) {
      // Update existing recording
      conversations[conversationIndex].recordings[existingRecordingIndex] = recording;
    } else {
      // Add new recording
      conversations[conversationIndex].recordings.push(recording);
    }
  } else {
    // Create new conversation with this recording
    const newConversation: Conversation = {
      id: recording.conversationId,
      title: 'New Recording',
      timestamp: new Date().toISOString(),
      recordings: [recording],
    };
    conversations.push(newConversation);
  }

  const data = { conversations };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Delete a recording
export const deleteRecording = (recordingId: string, conversationId: string): void => {
  const conversations = getConversations();
  const conversationIndex = conversations.findIndex(c => c.id === conversationId);

  if (conversationIndex >= 0) {
    conversations[conversationIndex].recordings = conversations[conversationIndex].recordings.filter(
      r => r.id !== recordingId
    );

    // If no recordings left, delete the conversation
    if (conversations[conversationIndex].recordings.length === 0) {
      conversations.splice(conversationIndex, 1);
    }

    const data = { conversations };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

// Delete a conversation and all its recordings
export const deleteConversation = (conversationId: string): void => {
  const conversations = getConversations().filter(c => c.id !== conversationId);
  const data = { conversations };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

