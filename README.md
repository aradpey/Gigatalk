# GigaTalk

A voice-to-text application that runs in your system tray. Press a hotkey to record audio, and it automatically transcribes your speech and pastes the text into whatever application you're using.

## What it does

- Records audio when you press Cmd+Shift+Space
- Converts speech to text using AI
- Automatically pastes the transcribed text into your current application
- Runs quietly in the background with no visible window

## Technologies

- Electron (desktop app framework)
- OpenAI Whisper (speech recognition)
- Python (for AI processing)
- SoX (audio recording)

## Installation

### Step 1: Install prerequisites

Open Terminal and run these commands one by one:

```bash
# Install Homebrew (package manager)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install SoX (for audio recording)
brew install sox

# Install Python dependencies
pip3 install openai-whisper torch ffmpeg-python
```

### Step 2: Download and build the app

```bash
# Download the code
git clone https://github.com/yourusername/gigatalk.git
cd gigatalk

# Install Node.js dependencies
npm install

# Build the app
npm run dist
```

### Step 3: Install the app

1. Open the `dist` folder
2. Double-click `GigaTalk-1.0.0-arm64.dmg`
3. Drag GigaTalk to your Applications folder
4. Open GigaTalk from Applications
5. Grant microphone permissions when asked

### Step 4: Use the app

Press `Cmd+Shift+Space` to start recording. Release the keys to stop recording and get your transcribed text.

## Troubleshooting

If you get a "Python not found" error, make sure you have Python 3.9 or later installed:

```bash
python3 --version
```

If you get a "No module named 'whisper'" error, reinstall the Python dependencies:

```bash
pip3 install openai-whisper torch ffmpeg-python
```

If audio recording doesn't work, make sure SoX is installed:

```bash
brew install sox
```
