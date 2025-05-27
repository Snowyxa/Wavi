# Development Issues Log

This document tracks all issues encountered during the development of Wavi, including both resolved and pending issues.

## Issue Tracking Format

Each issue includes:
- **Issue ID**: Unique identifier
- **Date Reported**: When the issue was first identified
- **Status**: Current state (Open, Fixed, Investigating, etc.)
- **Priority**: High, Medium, Low
- **Description**: Detailed description of the issue
- **Impact**: How it affects users
- **Resolution**: Steps taken to fix (if resolved)
- **Version**: When it was fixed (if applicable)

---

## Resolved Issues

### ISS-001: Cursor Stuck at Top of Screen
- **Date Reported**: Development Phase (Pre v1.1.1)
- **Status**: ✅ Fixed in v1.1.1
- **Priority**: High
- **Description**: Cursor would appear at the top of the screen when tracking started and wouldn't move with hand movements, particularly on YouTube and complex websites.
- **Root Cause**: Coordinate system mismatch between MediaPipe output and browser coordinates, combined with double viewport scaling.
- **Impact**: Made the extension unusable on many websites, especially YouTube.
- **Resolution**: 
  - Fixed coordinate transformation logic in `popup.js`
  - Implemented site-specific positioning for YouTube vs standard sites
  - Removed double scaling issues in coordinate mapping
  - Added proper bounds clamping in `mapRange` function
- **Version Fixed**: v1.1.1

### ISS-002: Y-Axis Movement Insensitivity
- **Date Reported**: Development Phase (Pre v1.1.1)
- **Status**: ✅ Fixed in v1.1.1
- **Priority**: Medium
- **Description**: Vertical cursor movement was less responsive than horizontal movement, making precise navigation difficult.
- **Root Cause**: Inadequate Y-axis sensitivity scaling.
- **Impact**: Reduced precision and user experience during vertical navigation.
- **Resolution**: 
  - Implemented 1.2x multiplier for Y-axis sensitivity
  - Enhanced coordinate mapping for better vertical responsiveness
- **Version Fixed**: v1.1.1

### ISS-003: YouTube Compatibility Issues
- **Date Reported**: Development Phase (Pre v1.1.1)
- **Status**: ✅ Fixed in v1.1.1
- **Priority**: High
- **Description**: Extension didn't work properly on YouTube due to complex layout and high z-index elements.
- **Root Cause**: Standard positioning logic wasn't compatible with YouTube's complex UI structure.
- **Impact**: Major website compatibility issue affecting significant user base.
- **Resolution**: 
  - Added YouTube-specific detection (`window.location.hostname.includes('youtube.com')`)
  - Implemented viewport-relative positioning for YouTube
  - Increased cursor z-index to 99999 for better visibility
- **Version Fixed**: v1.1.1

### ISS-004: Cursor Movement During Fist Gesture
- **Date Reported**: May 27, 2025
- **Status**: ✅ Fixed in v1.1.2
- **Priority**: Medium
- **Description**: When making a fist to click, the cursor continued to move, causing the hover target to change during the click gesture. This made it difficult to click on precise targets.
- **Root Cause**: Cursor tracking remained active during fist detection, and hand position shifted slightly when forming a fist. No cursor locking mechanism existed during click gestures.
- **Impact**: Affected click accuracy and user experience, especially for small UI elements.
- **Resolution**: 
  - Implemented cursor position locking during fist gesture detection (`isPositionLocked` flag)
  - Added brief cursor freeze period when click gesture is initiated
  - Improved gesture state management to separate movement and click modes
  - Added minimum lock duration (150ms) to prevent premature unlocking
  - Enhanced stabilization timeout for smooth gesture transitions
  - Locked position is used for both cursor display and click coordinate accuracy
- **Version Fixed**: v1.1.2

### ISS-005: Jittery Cursor Tracking
- **Date Reported**: Ongoing development concern
- **Status**: ✅ Fixed in v1.1.3
- **Priority**: High
- **Description**: Cursor movement exhibited jittery behavior with micro-movements and sudden position changes, particularly affecting users with motoric issues or hand tremors.
- **Root Cause**: Raw MediaPipe hand tracking data included natural hand micro-movements and sensor noise that translated to distracting cursor jitter.
- **Impact**: Significantly affected accessibility for users with motoric issues and reduced overall user experience due to unstable cursor behavior.
- **Resolution**: 
  - Implemented comprehensive multi-layer smoothing system
  - Added hand position smoothing with weighted averaging of recent positions
  - Implemented cursor position smoothing with exponential smoothing algorithm
  - Added velocity-based smoothing to prevent sudden direction changes
  - Created dead zone system (0.003 radius) to ignore micro-movements
  - Implemented stabilization frame counting for steady hand detection
  - Added configurable smoothing parameters for different user needs
  - Optimized performance with efficient position history management
- **Version Fixed**: v1.1.3

---

## Open Issues

*No open issues at this time.*

---

## Future Issues Under Investigation

### Future Considerations
- **Multi-click gestures**: Support for double-click, right-click
- **Gesture conflicts**: When multiple gestures are detected simultaneously
- **Performance on lower-end devices**: Frame rate and CPU usage optimization
- **Cross-browser compatibility**: Testing on Edge, Firefox, Safari
- **Different camera qualities**: Adaptation to various webcam specifications

---

## Development Notes

### Issue Reporting Guidelines
When reporting new issues:
1. **Reproduce consistently** - Ensure the issue can be replicated
2. **Document steps** - Provide clear reproduction steps
3. **Environment details** - Browser version, OS, camera type
4. **Impact assessment** - How it affects user experience
5. **Screenshots/videos** - Visual evidence when applicable

### Priority Levels
- **High**: Breaks core functionality, affects many users
- **Medium**: Impacts user experience but workarounds exist
- **Low**: Minor inconvenience or edge case

### Development Workflow
1. **Issue Identification** → Add to this log
2. **Investigation** → Root cause analysis
3. **Planning** → Add to version roadmap
4. **Implementation** → Code changes
5. **Testing** → Verify fix works
6. **Documentation** → Update relevant docs
7. **Release** → Include in version notes

---

*Last Updated: May 27, 2025*
