# Release Notes - v1.2.0
**Release Date**: May 27, 2025  
**Status**: Development Version

## 🎯 Major Features

### Alternative Click Gestures (Accessibility Focus)
- **👌 Pinch Gesture**: Touch thumb tip to index finger tip for clicking
- **✌️ Peace Sign**: Extend index and middle fingers while keeping others closed
- **👍 Thumbs Up**: Extend thumb upward while keeping other fingers closed
- **🖐️ Palm Open/Close**: Transition from open palm to closed fist
- **👊 Fist (Legacy)**: Traditional fist gesture maintained for compatibility

### Scroll Functionality
- **Hand Movement Scrolling**: Move hand to scroll through pages
- **Configurable Sensitivity**: Adjustable scroll speed (1.0x to 10.0x)
- **Dead Zone Protection**: Prevents accidental scrolling from small movements
- **Smooth Scrolling**: Uses browser's smooth scroll behavior

### Enhanced User Interface
- **Gesture Selection**: Dropdown menu to choose preferred click gesture
- **Real-time Feedback**: Current gesture mode displayed in status
- **Scroll Controls**: Toggle scroll mode and adjust sensitivity
- **Visual Indicators**: Cursor changes color based on mode (green=normal, blue=scroll, red=gesture)

## 🚀 Technical Improvements

### Gesture Detection System
- **Multi-gesture Support**: Process multiple gesture types simultaneously
- **Confidence Scoring**: Improved reliability with gesture confidence thresholds
- **Reduced Latency**: Lowered required gesture frames from 3 to 2
- **MediaPipe Integration**: Leverages hand landmarks for precise detection

### Performance Optimizations
- **Efficient Processing**: Parallel gesture detection without performance impact
- **Smart Cooldowns**: Prevents gesture spam while maintaining responsiveness
- **Memory Management**: Proper cleanup of gesture states and timers

### Accessibility Enhancements
- **Motor Difficulty Support**: Pinch gesture requires minimal hand movement
- **Customizable Sensitivity**: Adjustable thresholds for different user needs
- **Multiple Options**: Various gesture types accommodate different abilities
- **Visual Feedback**: Clear indication of active modes and gestures

## 🐛 Issues Resolved

### ISS-005: Fist Gesture Accessibility Issues
- **Problem**: Fist gesture too difficult for users with motor difficulties
- **Solution**: Added alternative gestures requiring less precision
- **Impact**: Significantly improved accessibility for users with limited hand mobility

### ISS-006: Missing Scroll Functionality  
- **Problem**: No way to scroll pages without traditional mouse
- **Solution**: Implemented hand movement-based scrolling
- **Impact**: Complete hands-free web navigation now possible

## 📋 Implementation Details

### New Configuration Options
```javascript
let gestureMode = 'pinch'; // 'pinch', 'peace', 'thumbsup', 'palm', 'fist'
let scrollMode = false;    // Enable/disable scroll functionality
let scrollSensitivity = 3.0; // Scroll speed multiplier
let pinchThreshold = 0.05;   // Distance threshold for pinch detection
```

### Message Protocol Extensions
```javascript
// New scroll message
{
  action: 'scroll',
  deltaX: number,
  deltaY: number
}

// Enhanced cursor message
{
  action: 'moveCursor',
  x: number,
  y: number,
  isHandVisible: boolean,
  isFist: boolean,
  gestureMode: string,
  scrollMode: boolean
}
```

## 🔄 Breaking Changes
- None - Fully backward compatible with v1.1.x

## 🧪 Testing Recommendations

### Gesture Testing
1. Test each gesture mode for reliability
2. Verify gesture switching works correctly
3. Check gesture confidence thresholds
4. Test with different hand positions

### Scroll Testing
1. Verify scroll sensitivity settings
2. Test scroll dead zone functionality
3. Check scroll cooldown prevents spam
4. Test on different website layouts

### Integration Testing
1. Verify compatibility with existing sites
2. Test cursor locking during gestures
3. Check visual feedback changes
4. Test settings persistence

## 🎯 Known Limitations

### Current Constraints
- Single hand tracking only
- Requires well-lit environment
- Camera permission required
- Chrome/Chromium browsers only

### Future Improvements
- Gesture customization settings
- Gesture sensitivity per-user calibration
- Multi-hand gesture support
- Cross-browser compatibility

## 📚 Documentation Updates
- Updated README.md with new gesture instructions
- Added gesture mode examples
- Enhanced troubleshooting guide
- Updated API reference with new messages

## 🔜 Next Version Preview
v1.2.1 will focus on:
- Gesture sensitivity calibration
- Custom gesture training
- Performance optimizations
- User preference persistence

---

**Note**: This version represents a major accessibility improvement, addressing critical usability issues identified in user feedback while maintaining full backward compatibility.
