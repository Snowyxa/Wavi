# Hand Tracking Cursor Control Extension - Technical Documentation

## Overview

The Hand Tracking Cursor Control Extension is a Chrome browser extension that enables users to control their cursor using hand gestures through their webcam. The system uses MediaPipe Hands for real-time hand tracking and provides cursor movement and click functionality.

## Architecture

### Core Components

1. **popup.js** - Main hand tracking logic and MediaPipe integration
2. **content.js** - Cursor visualization and DOM interaction
3. **popup.html** - User interface
4. **manifest.json** - Extension configuration
5. **lib/** - MediaPipe libraries and dependencies

### Technology Stack

- **MediaPipe Hands** - Real-time hand landmark detection
- **Chrome Extensions API** - Browser integration
- **Canvas API** - Video processing and visualization
- **WebRTC** - Webcam access

## Key Features

### 1. Real-time Hand Tracking
- Uses MediaPipe Hands with optimized settings for performance
- Tracks index finger tip (landmark 8) for cursor positioning
- Supports single hand detection with confidence thresholds

### 2. Cursor Movement
- Visual cursor overlay that follows hand movements
- Site-specific positioning logic (YouTube vs. standard sites)
- Smooth movement with configurable sensitivity
- Viewport-relative positioning for complex layouts

### 3. Click Functionality
- Fist gesture detection for clicking
- Multi-finger analysis for improved accuracy
- Click cooldown to prevent accidental multiple clicks
- Visual feedback during click events

### 4. Adaptive Behavior
- Different positioning strategies for different websites
- Resolution-based sensitivity scaling
- Dynamic tab dimension detection

## Implementation Details

### Hand Detection and Tracking

```javascript
// MediaPipe configuration
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
```

### Coordinate System

The extension uses a multi-stage coordinate transformation:

1. **MediaPipe Coordinates** (0-1 normalized)
   - X: 0 (left) to 1 (right)
   - Y: 0 (top) to 1 (bottom)

2. **Screen Coordinates** (pixels)
   - Transformed based on tab dimensions
   - Site-specific handling for complex layouts

3. **Cursor Positioning**
   - Fixed positioning for YouTube and similar sites
   - Absolute positioning with scroll offset for standard sites

### Site-Specific Handling

#### YouTube and Complex Sites
```javascript
if (isYouTube) {
  // Use viewport-relative positioning
  const finalX = Math.max(0, Math.min(x, viewportWidth - 20));
  const finalY = Math.max(0, Math.min(y, viewportHeight - 20));
  cursor.style.left = `${finalX}px`;
  cursor.style.top = `${finalY}px`;
}
```

#### Standard Sites
```javascript
else {
  // Use document-relative positioning with scroll
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  let finalX = x + scrollX;
  let finalY = y + scrollY;
  // Apply bounds clamping...
}
```

### Movement Calculation

```javascript
// Calculate movement delta
const deltaX = -1 * (currentHandPosition.x - lastHandPosition.x) * movementSensitivity;
const deltaY = (currentHandPosition.y - lastHandPosition.y) * movementSensitivity * yAxisSensitivityMultiplier;

// Update cursor position
centerPosition.x += deltaX * tabDimensions.width;
centerPosition.y += deltaY * tabDimensions.height;
```

### Fist Detection Algorithm

The system uses a multi-criteria approach for fist detection:

1. **Finger State Analysis**
   ```javascript
   const isThumbClosed = thumbTip.y > thumbMCP.y;
   const isIndexClosed = indexTip.y > indexMCP.y;
   const isMiddleClosed = middleTip.y > middleMCP.y;
   const isRingClosed = ringTip.y > ringMCP.y;
   const isPinkyClosed = pinkyTip.y > pinkyMCP.y;
   ```

2. **Confidence Scoring**
   ```javascript
   const closedCount = closedFingers.filter(finger => finger).length;
   const currentFistConfidence = closedCount / 5;
   fistConfidence = (fistConfidence * 0.7) + (currentFistConfidence * 0.3);
   ```

3. **Temporal Consistency**
   ```javascript
   if (fistConfidence > fistConfidenceThreshold) {
     consecutiveFistFrames++;
   }
   const newFistState = consecutiveFistFrames >= requiredFistFrames;
   ```

## Known Issues and Solutions

### Issue 1: Cursor Stuck at Top of Screen
**Problem**: Initial cursor positioning was incorrectly calculated due to coordinate system mismatches.

**Solution**: 
- Fixed coordinate transformation in `updateCursorPosition()`
- Removed double viewport scaling
- Improved initial hand position mapping

### Issue 2: YouTube-Specific Positioning Problems
**Problem**: YouTube's complex layout interfered with standard positioning logic.

**Solution**:
- Implemented site-specific detection
- Used viewport-relative positioning for YouTube
- Increased z-index for complex UI layers
- Separate dimension handling for different site types

### Issue 3: Y-Axis Movement Sensitivity
**Problem**: Vertical cursor movement was less responsive than horizontal.

**Solution**:
- Added Y-axis sensitivity multiplier (1.2x)
- Improved movement delta calculation
- Enhanced bounds clamping logic

## Configuration Parameters

### Movement Sensitivity
```javascript
let movementSensitivity = 2.0; // Base sensitivity
let yAxisSensitivityMultiplier = 1.2; // Y-axis boost
```

### Fist Detection
```javascript
let fistConfidenceThreshold = 0.7; // 70% confidence required
let requiredFistFrames = 3; // Consecutive frames for detection
```

### Performance
```javascript
// Resolution scaling for different displays
resolutionScaleFactor = Math.min(1.0, Math.max(0.5, Math.sqrt(width * height) / 1920));
```

## Browser Compatibility

### Supported Browsers
- Chrome (Primary target)
- Chromium-based browsers

### Required Permissions
- `activeTab` - Access to current tab
- `scripting` - Inject content scripts
- Camera access (user permission)

## Performance Considerations

### Optimization Strategies
1. **Single Hand Detection** - Reduces processing overhead
2. **Adaptive Camera Resolution** - Balances quality and performance
3. **Frame-based Processing** - Smooth real-time updates
4. **Efficient DOM Updates** - Minimal style recalculations

### Resource Usage
- **CPU**: Moderate (MediaPipe processing)
- **Memory**: Low-moderate (video buffers)
- **Network**: None (local processing only)

## Privacy and Security

### Data Handling
- **No External Communication**: All processing is local
- **No Data Storage**: No hand tracking data is saved
- **Camera Access**: Required for real-time tracking
- **Temporary Processing**: Video frames processed and discarded

### Security Features
- Content Security Policy compliance
- Sandboxed execution environment
- Permission-based camera access

## Development Guidelines

### Code Structure
```
popup.js
├── Hand tracking initialization
├── MediaPipe integration
├── Coordinate transformation
├── Gesture detection
└── Communication with content script

content.js
├── Cursor visualization
├── DOM interaction
├── Site-specific positioning
└── Event handling
```

### Best Practices
1. **Error Handling**: Comprehensive try-catch blocks
2. **Logging**: Detailed console output for debugging
3. **Fallbacks**: Default values for failed operations
4. **Performance**: Efficient coordinate calculations

## Future Enhancements

### Planned Features
1. **Scroll Functionality** - Horizontal hand movement for scrolling
2. **Calibration System** - User-specific sensitivity adjustment
3. **Multi-gesture Support** - Additional hand gestures
4. **Settings UI** - Configurable parameters

### Technical Improvements
1. **Machine Learning Optimization** - Custom gesture models
2. **Cross-browser Support** - Firefox and Safari compatibility
3. **Performance Enhancements** - WebAssembly integration
4. **Accessibility Features** - Voice commands integration

## Troubleshooting

### Common Issues

#### Cursor Not Moving
1. Check camera permissions
2. Verify MediaPipe library loading
3. Ensure proper lighting conditions
4. Check console for error messages

#### Poor Tracking Accuracy
1. Improve lighting conditions
2. Reduce background complexity
3. Adjust camera position
4. Check hand visibility in frame

#### Site-Specific Problems
1. Check if site has complex layout (like YouTube)
2. Verify z-index values
3. Test content script injection
4. Review site-specific positioning logic

### Debug Information
The extension provides extensive console logging:
- Hand position coordinates
- Cursor position calculations
- Tab dimensions
- Error messages and stack traces

## API Reference

### Message Types (popup.js ↔ content.js)

#### moveCursor
```javascript
{
  action: 'moveCursor',
  x: number,        // X coordinate
  y: number,        // Y coordinate
  isHandVisible: boolean,
  isFist: boolean
}
```

#### click
```javascript
{
  action: 'click',
  x: number,        // Click X coordinate
  y: number         // Click Y coordinate
}
```

#### getDimensions
```javascript
{
  action: 'getDimensions'
}
// Response: { width: number, height: number }
```

#### removeCursor
```javascript
{
  action: 'removeCursor'
}
```

### Key Functions

#### popup.js
- `initHands()` - Initialize MediaPipe
- `onResults()` - Process hand tracking results
- `mapRange()` - Coordinate transformation
- `getTabDimensions()` - Get browser tab size

#### content.js
- `createCursor()` - Create visual cursor element
- `updateCursorPosition()` - Update cursor position
- `simulateClick()` - Generate click events
- `showClickFeedback()` - Visual click indication

## Conclusion

This hand tracking cursor control extension demonstrates advanced computer vision integration in web browsers, providing an accessible alternative input method. The implementation balances performance, accuracy, and user experience while handling the complexity of different website layouts and user environments.
