## Phased Implementation Plan:

**Phase 1: Core Voice Memo Functionality**

* **Screens:** Start Screen (with only the Record Button), Recording Screen (basic recording controls).
* **Functionality:**
    * Record voice input for a set duration.
    * Save the voice memo (audio file).
    * Basic playback of saved voice memos within the Recording Screen (replace stop button with play after recording).
    * A simple list of past recordings on the Start Screen (without conversation grouping).

**Phase 2: Basic Transcription & Playback Screen**

* **Screens:** Introduce the Playback Screen (initially just showing the raw transcription and a basic play button).
* **Functionality:**
    * Integrate Whisper.cpp for speech-to-text transcription after recording.
    * Save the raw transcription.
    * Upon stopping recording, navigate to the Playback Screen displaying the raw transcript and a play button to listen to the original recording.

**Phase 3: Conversation Management**

* **Screens:** Update the Start Screen to allow selection of "past conversations". Introduce the basic structure for the Conversation Window.
* **Functionality:**
    * Implement the concept of "conversations" as containers for multiple recordings/messages.
    * Allow users to start a new conversation (from the Record Button).
    * Allow users to add new recordings to existing conversations (from the Conversation Window).
    * Basic display of messages within the Conversation Window (just the raw transcript for now).

**Phase 4: AI Enhancement & Summarization**

* **Functionality:**
    * Integrate LM Studio for AI-powered transcription enhancement.
    * Save the enhanced transcription.
    * Display the enhanced transcription in the Conversation Window and Playback Screen.
    * Implement AI title generation for each message (displayed in the Conversation Window).

**Phase 5: UI/UX Refinements & Recording Screen Polish**

* **Screens:** Implement all the specific UI/UX details for the Recording Screen (speech indicator, pause/play button visual changes, stop to checkmark, title placeholder).
* **Functionality:**
    * Implement the speech indicator.
    * Implement the pause/play button behavior and visual changes (screen growth, blinking pulse).
    * Change the stop button to a checkmark.
    * Implement the placeholder title logic.

**Phase 6: Conversation Window & Playback Screen Enhancements**

* **Screens:** Fully implement the Conversation Window (message bubbles, time bubbles, copy button, write draft button) and the Playback Screen (updated layout, chapter list button, copy button).
* **Functionality:**
    * Display messages in bubbles with bold titles in the Conversation Window.
    * Add time bubbles for date separation.
    * Implement the "Copy to Clipboard" button in both screens.
    * Implement the basic "Write Draft" button (which will lead to the next phase).
    * Implement the Playback Screen with the updated button layout.
    * Implement the basic functionality of the Chapter List Button (opens a list of message titles - navigation will come later).

**Phase 7: Draft Generation & Prompt Editing**

* **Screens:** Implement the Create Draft Panel, AI Draft Window, and Prompt Edit Window.
* **Functionality:**
    * Implement the Create Draft Panel with Twitter and Substack options and settings gears.
    * Implement the AI Draft Window to display placeholder generated drafts.
    * Implement the Prompt Edit Window with the text box, dismiss, and airplane buttons.
    * Connect the "Write Draft" button to open the Create Draft Panel.
    * Clicking on a draft option in the Create Draft Panel should navigate to the AI Draft Window.
    * Clicking the settings gear should open the Prompt Edit Window for the respective draft type.
    * Implement basic saving and loading of custom prompts.

**Phase 8: Follow-up Questions & Final Polish**

* **Functionality:**
    * Implement AI-powered follow-up question generation based on the conversation context (display in the Conversation Window).
    * Implement navigation from the Chapter List Panel to specific messages in the Playback Screen.
    * Thorough testing and bug fixing.
    * UI/UX refinements and performance optimizations.

## Final Feature List:

* **Voice Recording:** Capture voice input with adjustable duration.
* **Voice Memo Playback:** Listen to saved audio recordings.
* **Conversation Management:** Organize recordings into independent or ongoing conversations.
* **Speech-to-Text Transcription (Raw):** Convert voice memos to text using Whisper.cpp.
* **AI-Enhanced Transcription:** Refine raw transcriptions for clarity and flow using LM Studio.
* **AI Title Generation:** Automatically summarize content into a concise title.
* **Follow-up Question Generation:** Receive AI-driven prompts to continue idea flow.
* **Draft Generation (Twitter & Substack):** Convert conversation transcripts into social media and newsletter drafts.
* **Customizable Prompts:** Tailor AI draft generation using user-provided examples and editable prompts.
* **Past Conversation Selection:** Easily access and add to existing conversations.
* **Conversation View:** Display messages within a conversation with date-based separation and individual message titles.
* **Message Playback View:** Focus on a single message with voice memo controls and transcription display.
* **Chapter List:** Navigate between messages within a conversation during playback.
* **Copy to Clipboard:** Quickly copy transcriptions (single message or entire conversation).
* **Prompt Editing:** Customize AI prompts for enhanced transcription and draft generation.

