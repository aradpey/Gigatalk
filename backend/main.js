/**
 * backend/main.js
 * Tray-only app with dynamic icons for recording/processing states.
 */

const { app, globalShortcut, Tray, Menu, nativeImage } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");
const { recordAudio } = require("./recorder");
const { insertText } = require("./insertText");

// Set up logging to file for packaged app debugging
const logDir = path.join(os.homedir(), "Library", "Logs", "GigaTalk");
const logFile = path.join(logDir, "gigatalk.log");

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Override console.log to also write to file
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

function logToFile(level, ...args) {
  const timestamp = new Date().toISOString();
  const message = args
    .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
    .join(" ");
  const logEntry = `[${timestamp}] [${level}] ${message}\n`;

  try {
    fs.appendFileSync(logFile, logEntry);
  } catch (err) {
    // Fallback to original console if file writing fails
    originalError("Failed to write to log file:", err.message);
  }
}

console.log = function (...args) {
  originalLog(...args);
  logToFile("INFO", ...args);
};

console.error = function (...args) {
  originalError(...args);
  logToFile("ERROR", ...args);
};

console.warn = function (...args) {
  originalWarn(...args);
  logToFile("WARN", ...args);
};

console.log("🚀 GigaTalk starting up...");
console.log("📝 Log file location:", logFile);

let tray = null;
let recording = false;
let stopFn = null;

/* ✅ Ensure macOS packaged app can find SoX when launched from Finder */
if (process.platform === "darwin") {
  process.env.PATH = [
    process.env.PATH,
    "/opt/homebrew/bin", // where Homebrew installs SoX (Apple Silicon)
    "/usr/local/bin", // fallback for Intel Macs
  ].join(":");
  console.log("🔧 Updated PATH for macOS:", process.env.PATH);
}

// ✅ Hide Dock icon completely (macOS only)
app.dock?.hide();

app.whenReady().then(() => {
  createTray();
  registerHotkey();
});

function loadIcon(name) {
  const iconPath = path.join(__dirname, `../${name}`);
  return fs.existsSync(iconPath)
    ? nativeImage.createFromPath(iconPath)
    : nativeImage.createEmpty();
}

function createTray() {
  tray = new Tray(loadIcon("icon.png"));
  tray.setToolTip("GigaTalk");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "View Logs",
      click: () => {
        const { shell } = require("electron");
        shell.openPath(logFile);
      },
    },
    {
      label: "Copy Log Path",
      click: () => {
        const { clipboard } = require("electron");
        clipboard.writeText(logFile);
        console.log("📋 Log path copied to clipboard:", logFile);
      },
    },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);
  tray.setContextMenu(contextMenu);
}

function setTrayState(state) {
  switch (state) {
    case "recording":
      tray.setImage(loadIcon("icon_recording.png"));
      tray.setToolTip("🎙️ Recording...");
      break;
    case "processing":
      tray.setImage(loadIcon("icon_processing.png"));
      tray.setToolTip("Transcribing...");
      break;
    default:
      tray.setImage(loadIcon("icon.png"));
      tray.setToolTip("GigaTalk");
      break;
  }
}

function registerHotkey() {
  const hotkey = "CommandOrControl+Shift+Space";
  globalShortcut.register(hotkey, toggleRecording);
  console.log(`✅ Hotkey registered: ${hotkey}`);
}

async function toggleRecording() {
  if (!recording) {
    const tempDir = path.join(os.tmpdir(), "gigatalk");
    fs.mkdirSync(tempDir, { recursive: true });

    const outFile = path.join(tempDir, `recording-${Date.now()}.wav`);
    stopFn = recordAudio(outFile);

    recording = true;
    setTrayState("recording");
    console.log("🎙️ Recording started:", outFile);
  } else {
    stopFn?.();
    recording = false;
    setTrayState("processing");
    console.log("🛑 Recording stopped. Transcribing...");

    const lastFile = getLastRecording();
    if (lastFile) await transcribeAudio(lastFile);

    setTrayState("idle");
  }
}

function getLastRecording() {
  const tempDir = path.join(os.tmpdir(), "gigatalk");
  if (!fs.existsSync(tempDir)) return null;
  const files = fs.readdirSync(tempDir).filter((f) => f.endsWith(".wav"));
  if (!files.length) return null;
  files.sort();
  return path.join(tempDir, files[files.length - 1]);
}

async function transcribeAudio(audioPath) {
  return new Promise((resolve) => {
    console.log("🎧 Transcribing file:", audioPath);
    console.log("🔍 Audio file exists:", fs.existsSync(audioPath));
    console.log(
      "🔍 Audio file size:",
      fs.existsSync(audioPath) ? fs.statSync(audioPath).size + " bytes" : "N/A"
    );

    // Determine Python executable and script path based on environment
    const isPackaged = app.isPackaged;
    const pythonExec = isPackaged
      ? "/Applications/Xcode.app/Contents/Developer/usr/bin/python3"
      : "python3";
    const scriptPath = isPackaged
      ? path.join(
          process.resourcesPath,
          "app.asar.unpacked",
          "backend",
          "whisper_handler.py"
        )
      : path.join(__dirname, "whisper_handler.py");

    console.log("🔍 Is packaged app:", isPackaged);
    console.log("🔍 Python executable:", pythonExec);
    console.log("🔍 Script path:", scriptPath);
    console.log("🔍 Script exists:", fs.existsSync(scriptPath));
    console.log("🔍 __dirname:", __dirname);
    console.log("🔍 process.resourcesPath:", process.resourcesPath);

    // Check if we can find Python
    const { exec } = require("child_process");
    exec(`${pythonExec} --version`, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ Python not found:", error.message);
        console.error("❌ Tried command:", `${pythonExec} --version`);
        setTrayState("idle");
        resolve("");
        return;
      }
      console.log("✅ Python found:", stdout.trim());
    });

    const py = spawn(pythonExec, [scriptPath, audioPath]);
    let text = "";
    let errorOutput = "";

    py.stdout.on("data", (data) => {
      const output = data.toString();
      text += output;
      console.log("📝 Python stdout:", output.trim());
    });

    py.stderr.on("data", (err) => {
      const error = err.toString();
      errorOutput += error;
      console.error("❌ Python stderr:", error.trim());
    });

    py.on("error", (error) => {
      console.error("❌ Failed to start Python process:", error.message);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error signal:", error.signal);
      setTrayState("idle");
      resolve("");
    });

    py.on("close", async (code) => {
      console.log("🔍 Python process exited with code:", code);
      console.log("🔍 Final stdout:", text);
      console.log("🔍 Final stderr:", errorOutput);

      const cleaned = text.trim();

      if (cleaned) {
        console.log(
          "✅ Transcription successful:",
          cleaned.slice(0, 60) + "..."
        );
        await insertText(cleaned);
        console.log("✅ Transcription inserted into active application");
      } else {
        console.error("❌ No transcription result - empty output");
        if (errorOutput) {
          console.error("❌ Error details:", errorOutput);
        }
      }

      // ✅ Delete temporary audio file
      try {
        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath);
          console.log("🗑️ Deleted temp audio file:", audioPath);
        }

        const dir = path.dirname(audioPath);
        if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
          fs.rmdirSync(dir);
          console.log("🧹 Cleaned up empty temp directory:", dir);
        }
      } catch (err) {
        console.warn("⚠️ Could not delete temp audio:", err.message);
      }

      resolve(cleaned);
    });
  });
}

app.on("will-quit", () => globalShortcut.unregisterAll());
