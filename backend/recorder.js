/**
 * backend/recorder.js
 * Records microphone audio to a .wav file.
 */

const { record } = require("node-record-lpcm16"); // <-- note the destructuring
const fs = require("fs");
const os = require("os");

function recordAudio(outputPath) {
  const file = fs.createWriteStream(outputPath, { encoding: "binary" });

  // Pick correct backend program depending on platform
  const recordProgram = os.platform() === "darwin" ? "rec" : "arecord";

  // Start recording
  const recording = record({
    sampleRateHertz: 16000,
    threshold: 0,
    verbose: true,
    recordProgram,
    silence: "1.0",
  });

  recording.stream().pipe(file);

  // Return stop function for main.js
  return () => recording.stop();
}

module.exports = { recordAudio };
