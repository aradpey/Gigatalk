/**
 * backend/insertText.js
 * Compatible with clipboardy v5.0.0 (ESM-only)
 * Dynamically imports clipboardy for CommonJS.
 */

const os = require("os");
const { keyboard, Key } = require("@nut-tree-fork/nut-js");

// Optional: make typing faster
keyboard.config.autoDelayMs = 0;

async function insertText(text) {
  try {
    // Dynamically import clipboardy v5 (ESM)
    const clipboard = await import("clipboardy");

    // ✅ Copy text to clipboard
    await clipboard.default.write(text);

    // ✅ Simulate paste command depending on OS
    if (os.platform() === "darwin") {
      await keyboard.pressKey(Key.LeftSuper);
      await keyboard.type(Key.V);
      await keyboard.releaseKey(Key.LeftSuper);
      console.log("✅ Pasted transcribed text via Command+V");
    } else if (os.platform() === "win32" || os.platform() === "linux") {
      await keyboard.pressKey(Key.LeftControl);
      await keyboard.type(Key.V);
      await keyboard.releaseKey(Key.LeftControl);
      console.log("✅ Pasted transcribed text via Ctrl+V");
    } else {
      console.warn(
        "⚠️ Unsupported platform for auto-paste — text copied to clipboard only."
      );
    }
  } catch (err) {
    console.error("❌ Error inserting text:", err);
  }
}

module.exports = { insertText };
