# Wavi Project Structure

## Overview
The Wavi hand tracking extension has been reorganized into a modular architecture for better maintainability, debugging, and code organization.

## Directory Structure

```
Wavi/
├── config.js                 # Configuration settings
├── content.js                # Content script for web page injection
├── manifest.json             # Extension manifest
├── popup.html                # Main popup interface
├── service-worker.js          # Background service worker
├── README.md                  # Project documentation
│
├── css/                       # Stylesheets (organized)
│   ├── styles.css            # Main styles
│   ├── theme-additions.css   # Theme-specific styles
│   ├── button-styles.css     # Button styling
│   └── content-styles.css    # Content script styles
│
├── core/                      # Core functionality modules
│   ├── popup.js              # Main popup controller (simplified)
│   └── trackingManager.js    # Hand tracking lifecycle management
│
├── ui/                        # User interface modules
│   ├── themeManager.js       # Theme switching and initialization
│   ├── statusManager.js      # UI status updates and state management
│   ├── settingsUI.js         # Settings panel interactions
│   └── handVisualization.js  # Hand landmarks and drawing utilities
│
├── modules/                   # Feature modules
│   ├── cameraUtils.js        # Camera management utilities
│   ├── communication.js      # Extension messaging
│   ├── gestureDetection.js   # Gesture recognition logic
│   ├── handTracking.js       # MediaPipe integration
│   ├── settings.js           # Settings management
│   └── smoothing.js          # Data smoothing algorithms
│
├── lib/                       # External libraries
│   ├── hands.js              # MediaPipe Hands
│   ├── camera_utils.js       # MediaPipe camera utilities
│   ├── drawing_utils.js      # MediaPipe drawing utilities
│   └── [binary files]        # MediaPipe model files
│
├── icons/                     # Extension icons
│   └── WaviExtensionLogo.png
│
└── docs/                      # Documentation
    ├── ARCHITECTUUR-DIAGRAM.md
    ├── ISSUES-EN-OPLOSSINGEN.md
    ├── requirements.md
    ├── TECHNISCHE-DOCUMENTATIE.md
    ├── version-roadmap.md
    └── PROJECT-STRUCTURE.md (this file)
```

## Module Architecture

### Core Modules (`core/`)
- **popup.js**: Main popup controller that coordinates all components
- **trackingManager.js**: Manages hand tracking lifecycle and MediaPipe integration

### UI Modules (`ui/`)
- **themeManager.js**: Handles light/dark theme switching
- **statusManager.js**: Manages UI status updates and state display
- **settingsUI.js**: Controls settings panel interactions and UI
- **handVisualization.js**: Handles hand landmark drawing and visualization

### Feature Modules (`modules/`)
- **handTracking.js**: MediaPipe Hands integration and processing
- **gestureDetection.js**: Gesture recognition and classification
- **cameraUtils.js**: Camera management and utilities
- **communication.js**: Extension messaging between components
- **settings.js**: Settings persistence and management
- **smoothing.js**: Data smoothing for stable tracking

## Loading Order

The scripts are loaded in the following order in `popup.html`:

1. **Configuration**: `config.js`
2. **MediaPipe Libraries**: `hands.js`, `camera_utils.js`, `drawing_utils.js`
3. **Feature Modules**: `settings.js`, `smoothing.js`, etc.
4. **UI Modules**: `statusManager.js`, `themeManager.js`, etc.
5. **Core Modules**: `trackingManager.js`
6. **Main Controller**: `core/popup.js`

## Benefits of Modular Architecture

1. **Separation of Concerns**: Each module has a specific responsibility
2. **Easier Debugging**: Issues can be isolated to specific modules
3. **Better Maintainability**: Code is organized and easier to understand
4. **Reusability**: Modules can be reused across different parts of the extension
5. **Testing**: Individual modules can be tested independently
6. **Code Organization**: Related functionality is grouped together

## Class-Based Design

All modules use a class-based architecture with:
- Clear constructor initialization
- Public methods for external interaction
- Private methods for internal logic
- Global export pattern for cross-module communication

## Migration Notes

The original large `popup.js` file (~1284 lines) has been split into focused modules:
- Theme functionality → `ui/themeManager.js`
- Status management → `ui/statusManager.js`
- Settings UI → `ui/settingsUI.js`
- Hand visualization → `ui/handVisualization.js`
- Core tracking → `core/trackingManager.js`
- Main coordination → `core/popup.js`

The old `theme.js` file was removed as its functionality is now included in `ui/themeManager.js`.
