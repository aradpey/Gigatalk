import sys
import whisper
import warnings

warnings.filterwarnings("ignore")


def main():
    if len(sys.argv) < 2:
        print("No file provided")
        return

    audio_file = sys.argv[1]

    # Use a small model for speed; "base" or "tiny"
    model = whisper.load_model("base")

    # Just print the actual transcription (no metadata or debug output)
    result = model.transcribe(audio_file)
    print(result["text"])


if __name__ == "__main__":
    main()
