# Hand Tracking Cursor Control Chrome Extension

A Chrome extension that allows you to control your cursor using hand gestures through your webcam.

## Features

- Real-time hand tracking using MediaPipe
- Visual cursor overlay that follows your index finger
- Simple start/stop controls
- Works on any webpage

## Project Structure

```
├── manifest.json      # Extension configuration
├── popup.html        # Extension popup UI
├── popup.js          # Hand tracking logic
├── content.js        # Cursor overlay implementation
├── styles.css        # UI styling
└── lib/             # MediaPipe libraries
    ├── hands_solution_packed_assets_loader.js
    ├── hands_solution_simd_wasm_bin.js
    ├── hands.js
    ├── camera_utils.js
    └── drawing_utils.js
```

## Setup Instructions

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select this project directory
5. The extension icon should appear in your Chrome toolbar

## Usage

1. Click the extension icon to open the popup
2. Click "Start Tracking" to begin hand tracking
3. Position your hand in front of the camera
4. Move your index finger to control the cursor
5. Click "Stop Tracking" when done

## Requirements

- Chrome browser
- Webcam
- MediaPipe libraries (included in the `lib` directory)

## Notes

- The extension requires camera permissions
- Works best in well-lit environments
- Keep your hand within the camera frame for best results

## Privacy

This extension:
- Only processes video locally in your browser
- Does not send any data to external servers
- Requires camera access for hand tracking functionality

## License

MIT License 