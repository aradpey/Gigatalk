# GigaTalk

A local voice-to-text assistant built with Electron and OpenAI Whisper. GigaTalk runs as a system tray application and allows you to quickly transcribe speech to text using a global hotkey.

## Features

- 🎙️ **Voice Recording**: Record audio with a global hotkey (`Cmd+Shift+Space`)
- 🤖 **AI Transcription**: Uses OpenAI Whisper for accurate speech-to-text conversion
- 📋 **Auto-Paste**: Automatically pastes transcribed text into the active application
- 🖥️ **Tray-Only Interface**: Runs in the system tray with no visible window
- 🔄 **Dynamic Icons**: Visual feedback showing recording/processing states
- 🧹 **Auto-Cleanup**: Automatically deletes temporary audio files
- 📝 **Comprehensive Logging**: Detailed logs for debugging and monitoring

## Requirements

- **macOS** (tested on macOS 15.3.1)
- **Python 3.9+** with Whisper installed
- **SoX** (for audio recording)
- **Microphone permissions**

## Installation

### Prerequisites

1. **Install SoX** (for audio recording):

   ```bash
   brew install sox
   ```

2. **Install Python dependencies**:
   ```bash
   pip3 install openai-whisper torch ffmpeg-python
   ```

### Building from Source

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/gigatalk.git
   cd gigatalk
   ```

2. **Install Node.js dependencies**:

   ```bash
   npm install
   ```

3. **Build the application**:

   ```bash
   npm run dist
   ```

4. **Install the DMG**:
   - Open `dist/GigaTalk-1.0.0-arm64.dmg`
   - Drag GigaTalk to Applications folder

## Usage

1. **Launch GigaTalk** from Applications
2. **Grant microphone permissions** when prompted
3. **Use the global hotkey** `Cmd+Shift+Space` to:
   - **Press and hold**: Start recording
   - **Release**: Stop recording and transcribe
4. **Transcribed text** will be automatically pasted into the active application

### Tray Menu

Right-click the GigaTalk tray icon to access:

- **View Logs**: Open the log file for debugging
- **Copy Log Path**: Copy log file path to clipboard
- **Quit**: Exit the application

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Distribution

```bash
npm run dist
```

### Project Structure

```
gigatalk/
├── backend/           # Core application logic
│   ├── main.js       # Main Electron process
│   ├── recorder.js   # Audio recording functionality
│   ├── insertText.js # Text insertion via clipboard
│   └── whisper_handler.py # Python Whisper script
├── frontend/         # UI components (tray-only)
├── package.json      # Node.js dependencies and build config
└── requirements.txt  # Python dependencies
```

## Troubleshooting

### Common Issues

1. **"Python not found" error**:

   - Ensure Python 3.9+ is installed
   - Install Whisper: `pip3 install openai-whisper`

2. **"No module named 'whisper'" error**:

   - Install Whisper on the correct Python version
   - Check which Python the app is using in the logs

3. **Audio recording issues**:

   - Install SoX: `brew install sox`
   - Grant microphone permissions in System Preferences

4. **Slow transcription**:
   - First run downloads the Whisper model (~140MB)
   - Subsequent runs should be fast

### Logs

GigaTalk creates detailed logs at:

```
~/Library/Logs/GigaTalk/gigatalk.log
```

Access logs via the tray menu or check the file directly.

## Technical Details

### Architecture

- **Electron**: Cross-platform desktop app framework
- **Whisper**: OpenAI's speech recognition model
- **SoX**: Audio recording and processing
- **PyTorch**: Machine learning backend for Whisper

### Performance

- **Fast Transcription**: Uses system Python with pre-installed dependencies
- **Efficient Recording**: SoX for high-quality audio capture
- **Memory Optimized**: Automatic cleanup of temporary files

## License

ISC License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review the logs
3. Open an issue on GitHub
