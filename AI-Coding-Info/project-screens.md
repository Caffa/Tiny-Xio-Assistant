## Smart AI Note-Taking App: Screens and Panels
Here's a breakdown of the screens and panels for the smart AI note-taking app.

### 1. Start Screen

* **Layout:**
    * Top section: A large, prominent **Record Button** centered on the screen.
    * Bottom section: A scrollable list or grid displaying **Past Conversations**. Each item in the list/grid would likely show a brief summary or the title of the conversation.

* **Buttons:**
    * **Record Button:**
        * **Functionality:** When clicked, it initiates a new recording session and navigates the user to the **Recording Screen**.
        * **App Changes:** Transitions to the Recording Screen.
        * **Visual Changes:** The button might visually indicate it's being pressed (e.g., a slight animation or color change).
    * **Past Conversation Items (within the selection area):**
        * **Functionality:** When a conversation item is clicked, it opens the **Conversation Window** for that specific past conversation.
        * **App Changes:** Navigates to the Conversation Window for the selected conversation.
        * **Visual Changes:** The selected conversation item might highlight briefly upon being clicked.

### 2. Recording Screen

* **Layout:**
    * Top section: A placeholder **Title Area**.
    * Center section: A visual **Speech Indicator** that dynamically changes based on the detected audio volume.
    * Bottom section: Two primary buttons positioned horizontally.
        * Left: **Pause/Play Button** (initially showing a pause symbol).
        * Right: **Stop/Checkmark Button** (displaying a checkmark symbol).

* **Buttons:**
    * **Pause/Play Button:**
        * **Initial State (Recording):** Displays a pause symbol.
        * **Functionality (Pause):** When clicked, it pauses the recording.
        * **App Changes:** Recording is paused.
        * **Visual Changes (Pause):**
            * The screen visually grows out slightly (a subtle animation of the background expanding).
            * The pause symbol on the button changes to a play symbol.
            * A subtle blinking pulse effect in the background starts and then pauses.
        * **Functionality (Play - when paused):** When clicked (now showing a play symbol), it resumes the recording.
        * **App Changes:** Recording resumes.
        * **Visual Changes (Play):**
            * The screen shrinks back to its original size.
            * The play symbol on the button changes back to a pause symbol.
            * The subtle blinking pulse effect in the background resumes.
    * **Stop/Checkmark Button:**
        * **Functionality:** When clicked, it stops the recording.
        * **App Changes:**
            * The app initiates the speech-to-text transcription using Whisper.cpp.
            * The original voice recording and the raw transcription are saved.
            * AI processing (enhancement and summarization) is performed using LM Studio.
            * The AI-enhanced transcription is saved.
            * The user is navigated to the **Conversation Window**, with the newly recorded message displayed.
        * **Visual Changes:** The button might briefly highlight upon being clicked.

* **Title Area:**
    * **Content:** Displays a placeholder title.
        * If it's a **new conversation**, it shows some "sparkles" (e.g., an asterisk or a visual sparkle animation).
        * If the user is **adding to an existing conversation**, it displays the title of that conversation.

* **Speech Indicator:**
    * **Functionality:** Visually represents the incoming audio volume. The visual elements (e.g., bars, waves) will increase in size or intensity as the volume increases and decrease as the volume decreases.

### 3. Conversation Window

* **Layout:**
    * Top section: Likely a title bar displaying the conversation title.
    * Main content area: A vertically scrolling list of messages (transcriptions).
        * Each message is displayed in a message bubble format.
        * Each message has a **bold AI-generated short title** displayed within or above the bubble (using placeholder text initially).
        * **Time Bubbles:** Gray bubbles containing the date of the messages recorded above and below them are inserted vertically between messages to section them by date (using lorem ipsum text as placeholder date).
    * Bottom section: Contains the **Copy to Clipboard Button** and the **Write Draft Button**.

* **Buttons:**
    * **Copy to Clipboard Button:**
        * **Functionality:** When clicked, it copies the entire transcript of the current conversation (all the messages within it) to the system clipboard.
        * **App Changes:** None (a system-level action).
        * **Visual Changes:** The button might briefly highlight upon being clicked, or a small confirmation message/icon might appear briefly.
    * **Write Draft Button:**
        * **Functionality:** When clicked, it launches a small **Create Draft Panel** that slides up or appears as a bottom sheet.
        * **App Changes:** The Create Draft Panel becomes visible.
        * **Visual Changes:** The main content area of the Conversation Window might be slightly dimmed or shifted upwards to accommodate the panel.

### 4. Create Draft Panel (Bottom Panel in Conversation Window)

* **Layout:**
    * A small panel appearing at the bottom of the screen.
    * Contains two options, likely displayed as tappable buttons or sections:
        * **Substack Post**
        * **Twitter Post**
    * Each option has a **Settings Gear Icon** positioned on the right side.

* **Buttons/Options:**
    * **Substack Post Option:**
        * **Functionality:** When clicked, it directly navigates the user to the **AI Draft Window** with a draft for a Substack post generated from the current conversation.
        * **App Changes:** Transitions to the AI Draft Window.
        * **Visual Changes:** The panel might slide down or disappear.
    * **Twitter Post Option:**
        * **Functionality:** When clicked, it directly navigates the user to the **AI Draft Window** with a draft for a Twitter post generated from the current conversation.
        * **App Changes:** Transitions to the AI Draft Window.
        * **Visual Changes:** The panel might slide down or disappear.
    * **Settings Gear Icon (for Substack Post):**
        * **Functionality:** When clicked, it opens the **Prompt Edit Window** for the Substack post prompt.
        * **App Changes:** The Prompt Edit Window appears (likely as a modal or another panel).
        * **Visual Changes:** The Create Draft Panel might be slightly dimmed or shifted.
    * **Settings Gear Icon (for Twitter Post):**
        * **Functionality:** When clicked, it opens the **Prompt Edit Window** for the Twitter post prompt.
        * **App Changes:** The Prompt Edit Window appears.
        * **Visual Changes:** The Create Draft Panel might be slightly dimmed or shifted.

### 5. Playback Screen (Message Detail Screen)

* **Layout:**
    * Top section: Likely a title bar displaying the title of the current message.
    * Main content area: Displays the **enhanced transcription** of the single message that was clicked on.
    * Bottom section: Contains the following buttons:
        * Left: **Play/Pause Button** (toggles between play and pause of the voice memo).
        * Center: **Chapter List Button** (displays an icon representing a list or chapters).
        * Right: **Copy to Clipboard Button**.

* **Buttons:**
    * **Play/Pause Button:**
        * **Functionality:** When clicked, it toggles between playing and pausing the original voice memo associated with this message.
        * **App Changes:** The voice memo playback starts or stops.
        * **Visual Changes:** The icon on the button changes between a play and a pause symbol to reflect the current state.
    * **Chapter List Button:**
        * **Functionality:** When clicked, it opens the **Chapter List Panel**.
        * **App Changes:** The Chapter List Panel becomes visible (likely as a modal or a slide-in panel).
        * **Visual Changes:** The main content area might be slightly dimmed or shifted.
    * **Copy to Clipboard Button:**
        * **Functionality:** When clicked, it copies the enhanced transcription of the current message to the system clipboard.
        * **App Changes:** None (a system-level action).
        * **Visual Changes:** The button might briefly highlight upon being clicked, or a small confirmation message/icon might appear briefly.

### 6. Chapter List Panel (Opened from Playback Screen)

* **Layout:**
    * A panel that appears when the Chapter List Button is clicked in the Playback Screen.
    * Displays a vertically scrolling list of the **AI-generated short titles** of all the messages within the current conversation.

* **Functionality:**
    * When a title in the list is clicked, the panel closes, and the user is navigated back to the **Playback Screen**, now displaying the details (transcription and voice memo controls) for the message corresponding to the clicked title.
    * **App Changes:** Transitions to the Playback Screen for the selected message.
    * **Visual Changes:** The Chapter List Panel disappears.

### 7. Prompt Edit Window (Panel opened from Create Draft Panel)

* **Layout:**
    * A panel that appears when the settings gear icon is clicked in the Create Draft Panel.
    * Contains the following elements:
        * A **Text Box:** Displaying the current AI prompt used for generating the selected post type (Substack or Twitter). This text box should be editable.
        * A **Dismiss Changes Button** (likely labeled "Dismiss" or with an "X" icon).
        * An **Airplane Button** (iconically representing "send" or "go").

* **Buttons:**
    * **Dismiss Changes Button:**
        * **Functionality:** When clicked, it closes the Prompt Edit Window without saving any modifications made to the prompt in the text box.
        * **App Changes:** The Prompt Edit Window disappears.
        * **Visual Changes:** None.
    * **Airplane Button:**
        * **Functionality:** When clicked, it applies any edits made to the prompt in the text box. After applying the changes, it directly navigates the user to the **AI Draft Window** for the corresponding post type (Substack or Twitter), using the (potentially) modified prompt.
        * **App Changes:**
            * The updated prompt is saved (presumably for future use).
            * Transitions to the AI Draft Window.
        * **Visual Changes:** The Prompt Edit Window disappears.

### 8. AI Draft Window

* **Layout:**
    * Top section: Likely a title bar indicating the type of draft (e.g., "Substack Draft", "Twitter Draft").
    * Main content area: Displays the **AI-generated draft** of the post (either for Substack or Twitter) based on the content of the conversation and the prompt used (which could have been customized in the Prompt Edit Window).
    * (Note: The provided information doesn't specify buttons on this screen, so we can assume it's primarily for viewing the generated draft. Functionality for copying or further editing might be implied in a real application but isn't explicitly requested here.)

This list covers all the screens and panels mentioned in the provided information, along with their layout and the functionality of the buttons, including the resulting app and visual changes. Remember that some visual details (like specific animations or the exact appearance of elements) would be further refined during the UI/UX design process.

