# Troubleshooting Guide

## Common Issues and Solutions

### 1. Cursor Stuck at Top of Screen

**Symptoms:**
- Cursor appears at top of screen when tracking starts
- Cursor doesn't move with hand movements
- Issue occurs specifically on YouTube or complex websites

**Causes:**
- Coordinate system mismatch between MediaPipe and browser
- Double viewport scaling
- Site-specific layout interference

**Solutions:**
✅ **Fixed in v1.1.1** - Updated coordinate transformation logic

**If issue persists:**
1. Refresh the webpage
2. Restart tracking (Stop → Start)
3. Check browser console for error messages

### 2. Poor Hand Tracking Accuracy

**Symptoms:**
- Hand not detected consistently
- Cursor jumps or moves erratically
- Tracking stops unexpectedly

**Causes:**
- Poor lighting conditions
- Complex background
- Hand partially out of frame
- Camera quality issues

**Solutions:**
1. **Improve Lighting**
   - Face a light source (window/lamp)
   - Avoid backlighting
   - Use consistent, bright lighting

2. **Optimize Background**
   - Use plain background when possible
   - Minimize movement behind hand
   - Avoid busy patterns

3. **Hand Positioning**
   - Keep entire hand visible in camera
   - Maintain 1-3 feet distance from camera
   - Use clear, deliberate movements

### 3. YouTube-Specific Issues

**Symptoms:**
- Tracking works on other sites but not YouTube
- Cursor positioning is off on YouTube
- Can't click YouTube elements

**Causes:**
- YouTube's complex layout and high z-index elements
- Different viewport handling
- Dynamic content loading

**Solutions:**
✅ **Fixed in v1.1.1** - Added YouTube-specific positioning logic

**Additional tips:**
1. Make sure YouTube page is fully loaded
2. Try refreshing the page after starting tracking
3. Ensure extension has permissions for the site

### 4. Click Detection Problems

**Symptoms:**
- Fist gesture not triggering clicks
- Multiple clicks when making one gesture
- Click happening in wrong location

**Causes:**
- Fist detection sensitivity
- Hand positioning
- Timing issues

**Solutions:**
1. **Improve Fist Gesture**
   - Make a clear, tight fist
   - Hold fist for brief moment
   - Ensure all fingers are closed

2. **Adjust Timing**
   - Wait for cooldown between clicks (500ms)
   - Make deliberate, distinct gestures
   - Avoid rapid hand movements during click

3. **Check Hand Position**
   - Keep hand steady when clicking
   - Position cursor before making fist
   - Ensure good hand visibility

### 5. Extension Not Loading

**Symptoms:**
- Extension doesn't appear in toolbar
- "Start Tracking" button doesn't work
- Error messages in popup

**Causes:**
- Missing MediaPipe libraries
- Permission issues
- Chrome extension loading problems

**Solutions:**
1. **Check Extension Loading**
   ```
   Chrome → Extensions → Developer mode → Check for errors
   ```

2. **Verify Files**
   - Ensure all files in `lib/` folder are present
   - Check manifest.json is valid
   - Reload extension

3. **Clear Cache**
   - Disable and re-enable extension
   - Restart Chrome browser
   - Clear extension cache

### 6. Camera Access Issues

**Symptoms:**
- "Camera access denied" error
- Black video feed
- No camera permissions prompt

**Causes:**
- Camera permissions not granted
- Camera in use by other application
- Hardware/driver issues

**Solutions:**
1. **Grant Permissions**
   - Chrome → Settings → Privacy → Camera
   - Allow camera access for the website
   - Reload page after granting permissions

2. **Check Camera Usage**
   - Close other applications using camera
   - Restart browser
   - Check camera in other applications

3. **Hardware Check**
   - Verify camera is connected and working
   - Update camera drivers
   - Try different camera if available

### 7. Performance Issues

**Symptoms:**
- Laggy cursor movement
- Browser becomes slow
- High CPU usage

**Causes:**
- High camera resolution
- Multiple browser tabs
- System resource constraints

**Solutions:**
1. **Optimize Performance**
   - Close unnecessary browser tabs
   - Lower camera resolution in code if needed
   - Close other resource-intensive applications

2. **Check System Resources**
   - Monitor CPU and memory usage
   - Ensure adequate system resources
   - Consider reducing movement sensitivity

### 8. Console Error Messages

Common error patterns and solutions:

#### "Content script not ready"
- **Cause:** Content script failed to load
- **Solution:** Refresh page, check extension permissions

#### "MediaPipe failed to initialize"
- **Cause:** Missing or corrupt MediaPipe libraries
- **Solution:** Re-download extension, check lib/ folder

#### "Failed to get tab dimensions"
- **Cause:** Communication error between popup and content script
- **Solution:** Refresh page, restart tracking

#### "Camera access denied"
- **Cause:** Permission not granted or camera unavailable
- **Solution:** Grant camera permissions, check camera availability

### 9. Site Compatibility

**Supported Sites:**
- ✅ Most standard websites
- ✅ YouTube (with special handling)
- ✅ GitHub, documentation sites
- ✅ E-commerce platforms

**May Have Issues:**
- ⚠️ Sites with complex iframes
- ⚠️ Sites with custom cursor implementations
- ⚠️ Sites with aggressive CSP policies

**Not Supported:**
- ❌ Browser internal pages (chrome://)
- ❌ Extension store pages
- ❌ Some restricted corporate sites

## Debug Information

### Enabling Debug Mode

1. Open browser console (F12)
2. Look for hand tracking log messages
3. Check for error messages or warnings

### Key Log Messages

```javascript
// Good tracking
"First hand detection: x=0.5234, y=0.4123"
"Hand position: current(0.5245, 0.4156), last(0.5234, 0.4123)"
"Cursor position updated: x=960, y=540"

// Issues
"Content script not ready"
"Failed to initialize MediaPipe Hands"
"Camera access denied"
```

### Reporting Issues

When reporting problems, please include:
1. Browser version and OS
2. Console error messages
3. Steps to reproduce
4. Which websites show the issue
5. Camera and lighting conditions

## Recovery Steps

If everything stops working:

1. **Complete Reset**
   - Stop tracking
   - Close extension popup
   - Refresh webpage
   - Restart tracking

2. **Extension Reload**
   - Go to chrome://extensions/
   - Find the extension
   - Click reload button
   - Try again

3. **Browser Restart**
   - Close all Chrome windows
   - Restart browser
   - Load extension and try again

## Performance Tips

1. **Optimal Conditions**
   - Good lighting (facing light source)
   - Plain background
   - Stable camera position
   - 1-3 feet from camera

2. **System Optimization**
   - Close unnecessary applications
   - Use recent Chrome version
   - Ensure adequate system memory
   - Consider camera resolution vs. performance

3. **Usage Best Practices**
   - Start tracking before navigating to target site
   - Use deliberate, clear hand movements
   - Wait between gestures
   - Keep hand visible in camera frame
