# Modular Architecture Guide

## Overview
The Hand Tracking Extension has been restructured into a modular architecture for better maintainability, debugging, and future extensibility. This document explains the new structure and how to work with it.

## Folder Structure

```
Cursor-POC/
├── popup.js                    # Main popup controller (simplified)
├── popup.html                  # UI with module imports
├── content.js                  # Content script (simplified)
├── manifest.json               # Extension manifest
├── styles.css                  # UI styles
├── popup-old.js               # Backup of previous monolithic version
│
├── modules/                    # New modular components
│   ├── gestureDetection.js    # Fist gesture detection & processing
│   ├── smoothing.js            # Cursor movement smoothing algorithms
│   ├── communication.js        # Chrome extension messaging
│   ├── cameraUtils.js          # Camera setup & video stream management
│   └── handTracking.js         # MediaPipe integration & cursor calculations
│
├── lib/                        # MediaPipe libraries (unchanged)
├── docs/                       # Documentation
└── icons/                      # Extension icons
```

## Module Descriptions

### 1. gestureDetection.js
**Purpose**: Handles fist gesture detection and click events
**Key Functions**:
- `processFistDetection(landmarks)` - Detects fist gestures from hand landmarks
- `handleGestureStateChange()` - Manages click events and position locking
- `resetGestureState()` - Clears gesture detection state
- `isPositionCurrentlyLocked()` - Checks if cursor is locked during gesture

**Usage**:
```javascript
const gestureDetected = window.GestureDetection.processFistDetection(landmarks);
window.GestureDetection.handleGestureStateChange(gestureDetected, cursorPosition, clickCallback);
```

### 2. smoothing.js
**Purpose**: Provides advanced smoothing algorithms for cursor movement
**Key Functions**:
- `calculateSmoothedPosition(position)` - Applies weighted average smoothing
- `applySmoothingToMovement()` - Reduces jitter in hand movement
- `resetSmoothingState()` - Clears smoothing history
- `updateSmoothingSettings()` - Configures smoothing parameters

**Usage**:
```javascript
const smoothedPosition = window.Smoothing.calculateSmoothedPosition(rawPosition);
const smoothedMovement = window.Smoothing.applySmoothingToMovement(current, last);
```

### 3. communication.js
**Purpose**: Manages communication between popup and content scripts
**Key Functions**:
- `sendCursorMovement(x, y, visible, gesture)` - Sends cursor updates
- `sendClickEvent(x, y)` - Triggers click events
- `getTabDimensions()` - Retrieves active tab size
- `checkContentScriptReady()` - Verifies content script status

**Usage**:
```javascript
window.Communication.sendCursorMovement(x, y, true, false);
const dimensions = await window.Communication.getTabDimensions();
```

### 4. cameraUtils.js
**Purpose**: Handles camera initialization and video stream management
**Key Functions**:
- `initializeVideoStream(videoElement)` - Sets up camera stream
- `setupCameraConstraints()` - Configures optimal camera settings
- `stopVideoStream(stream)` - Properly releases camera resources
- `checkCameraPermission()` - Verifies camera access

**Usage**:
```javascript
const stream = await window.CameraUtils.initializeVideoStream(videoElement);
const hasPermission = await window.CameraUtils.checkCameraPermission();
```

### 5. handTracking.js
**Purpose**: Core MediaPipe integration and cursor position calculations
**Key Functions**:
- `initializeMediaPipeHands()` - Sets up MediaPipe Hands
- `startHandTracking()` - Begins tracking with callbacks
- `calculateCursorPosition(landmarks)` - Converts hand position to cursor coordinates
- `updateTabDimensions()` - Adjusts for different screen sizes

**Usage**:
```javascript
window.HandTracking.initializeMediaPipeHands();
const camera = window.HandTracking.startHandTracking(video, canvas, onResults);
const cursorPos = window.HandTracking.calculateCursorPosition(landmarks);
```

## Integration Pattern

### popup.js Structure
```javascript
// 1. Initialize modules on DOM load
document.addEventListener('DOMContentLoaded', function() {
  initializePopup();
  setupEventListeners();
});

// 2. Use modules in main functions
async function startTracking() {
  // Camera setup
  const stream = await window.CameraUtils.initializeVideoStream(video);
  
  // Hand tracking
  const camera = window.HandTracking.startHandTracking(video, canvas, onResults);
  
  // Communication
  const dimensions = await window.Communication.getTabDimensions();
}

// 3. Process results with modules
function onResults(results) {
  // Hand tracking
  const cursorPosition = window.HandTracking.calculateCursorPosition(landmarks);
  
  // Gesture detection
  const gestureDetected = window.GestureDetection.processFistDetection(landmarks);
  
  // Communication
  window.Communication.sendCursorMovement(x, y, visible, gesture);
}
```

### HTML Script Loading Order
```html
<!-- MediaPipe libraries first -->
<script src="lib/hands_solution_packed_assets_loader.js"></script>
<script src="lib/hands.js"></script>

<!-- Modules second (order matters for dependencies) -->
<script src="modules/smoothing.js"></script>
<script src="modules/gestureDetection.js"></script>
<script src="modules/communication.js"></script>
<script src="modules/cameraUtils.js"></script>
<script src="modules/handTracking.js"></script>

<!-- Main script last -->
<script src="popup.js"></script>
```

## Development Guidelines

### Adding New Modules
1. **Create module file** in `/modules/` directory
2. **Export functions** using `window.ModuleName = { ... }` pattern
3. **Add script tag** to `popup.html` in correct order
4. **Document functions** with JSDoc comments
5. **Include reset function** for state cleanup

### Module Template
```javascript
// moduleName.js - Brief description
// This module handles [specific functionality]

// Private variables
let moduleState = {};

/**
 * Main function description
 * @param {type} param - Parameter description
 * @returns {type} - Return value description
 */
function mainFunction(param) {
  // Implementation
}

/**
 * Reset module state
 */
function resetModuleState() {
  moduleState = {};
}

// Export functions
window.ModuleName = {
  mainFunction,
  resetModuleState
};
```

### Debugging Tips
1. **Module isolation** - Test individual modules separately
2. **Console logging** - Each module has its own logging namespace
3. **State inspection** - Use reset functions to clear state between tests
4. **Dependency checking** - Verify module loading order in browser console

### Error Handling
- Each module should handle its own errors gracefully
- Use try/catch blocks around module function calls
- Provide meaningful error messages with module context
- Reset module state on errors to prevent cascading failures

## Migration from Old Version

### What Changed
- **popup.js reduced** from 970 lines to ~200 lines
- **Functionality split** across 5 specialized modules
- **Alternative gestures removed** (pinch, peace, thumbs up)
- **Scroll functionality removed** for simplicity
- **State management improved** with modular resets

### What Stayed the Same
- **Core fist gesture** clicking behavior unchanged
- **Cursor movement** smoothing and sensitivity preserved
- **Extension API** and user interface remain the same
- **MediaPipe integration** continues to work identically

### Updating Existing Code
If you have customizations to the old popup.js:

1. **Identify the module** where your code belongs
2. **Move functions** to appropriate module files
3. **Update function calls** to use `window.ModuleName.function()` syntax
4. **Add module exports** for any new functions
5. **Test integration** with the main popup controller

## Performance Considerations

### Benefits
- **Reduced memory usage** with eliminated unused gesture code
- **Faster initialization** with focused module loading
- **Better error isolation** preventing system-wide failures
- **Improved garbage collection** with modular state management

### Best Practices
- **Minimize cross-module calls** to reduce overhead
- **Use module reset functions** to prevent memory leaks
- **Cache module references** if calling frequently
- **Profile individual modules** to identify bottlenecks

## Testing Strategy

### Unit Testing
- Test each module independently with mock inputs
- Verify module exports and function signatures
- Check error handling and edge cases
- Validate state reset functionality

### Integration Testing
- Test module interactions and data flow
- Verify proper loading order and dependencies
- Check cross-module communication
- Validate complete user workflows

### Browser Testing
- Test extension loading with all modules
- Verify content script communication
- Check camera and MediaPipe integration
- Test across different websites and environments

---

This modular architecture provides a solid foundation for future development while maintaining the core functionality that users expect. The simplified structure makes it easier to understand, debug, and extend the hand tracking system.
