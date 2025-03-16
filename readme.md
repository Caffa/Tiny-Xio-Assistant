# Status
If you want to resume the project, remember to have:
```bash
npm run dev
```
in the terminal.

Also look at the AI-Coding-Info folder, we are in phase 1 and right now the App cannot work as a memo app reliably

# Project Info

An app for an AI note-taking assistant.

How it works
1. Records voice input for a set duration. Save the voice memo (the speech) so user can play back.
2. Uses speech-to-text AI to transcribe the audio, exactly as it is.
3. Employs AI to refine the transcription (removing filler words, rephrasing sentences for clarity while using the same words) for better coherence and flow.
4. Summarizes the content via AI to generate a title.
5. Offers follow-up questions based on the context to help idea flow. Record subsequent notes into the same capture window.
6. Allow user to provide prompts, to convert the conversation from the transcription to twitter and substack post drafts. Uses user-provided examples to guide further content generation (e.g., for newsletters or tweets).

Do not make an authentication screen. The start screen has a big record button and a past conversation selection screen.  If the record button is clicked, you enter a new conversation, work like a voice memo app. From that point, the AI needs to record what is being said; during the entire recording period, the app functions as a voice memo tool. The speech indicator in the recording screen, should only spike up according to the volume that is detected.

After the recording is finished, that is when the app transcribes, display, enhance the transcription and replace the display. Save all three things, the voice recording, the original transcription and the enhanced transcription. This is a message.

Once within a recorded message, users should be able to listen to their original voice memo, access the raw transcription, and view the enhanced version of the transcription.

If a new recording is not being made, the user should select an existing conversation. A conversation can hold multiple recording 'messages'. When a past conversation is selected, users should be able to add to those conversations with new messages by recording within the conversation screen.

# Future Plans

Integrate with a speech-to-text API for transcription
- Use a whisper model (Whisper large-v3 [GitHub - ggerganov/whisper.cpp: Port of OpenAI's Whisper model in C/C++](https://github.com/ggerganov/whisper.cpp)) to convert the saved speech to text.  Save both the original voice recording and the original whisper transcript
- Add AI processing for enhancement and summarization & Implement follow-up question generation
- Interface with LM studio to use a local LLM model. Save and display the AI-enhanced transcript
- Allow user to provide a custom prompt for both enhanced transcription and converting the transcription to posts. Each transcription conversation window can be connected to multiple posts.

For text-to-text AI capabilities, use LM Studio
For speech-to-text transcription, use Whisper.cpp

