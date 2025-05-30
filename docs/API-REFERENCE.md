# API Referentie

## Overzicht

De Hand Tracking Cursor Control Extension gebruikt een bericht-doorgeef systeem tussen de popup (hand tracking) en content script (cursor control). Dit document beschrijft de API voor communicatie tussen componenten.

## Bericht Types

### popup.js → content.js

#### moveCursor
Update de cursor positie op de webpagina.

```javascript
{
  action: 'moveCursor',
  x: number,           // X coördinaat in pixels
  y: number,           // Y coördinaat in pixels  
  isHandVisible: boolean,  // Of hand momenteel gedetecteerd wordt
  isFist: boolean      // Of vuist gebaar gedetecteerd wordt
}
```

**Voorbeeld:**
```javascript
chrome.tabs.sendMessage(tabId, {
  action: 'moveCursor',
  x: 960,
  y: 540,
  isHandVisible: true,
  isFist: false
});
```

#### click
Triggert een klik event op de gespecificeerde coördinaten.

```javascript
{
  action: 'click',
  x: number,           // Klik X coördinaat in pixels
  y: number            // Klik Y coördinaat in pixels
}
```

**Voorbeeld:**
```javascript
chrome.tabs.sendMessage(tabId, {
  action: 'click',
  x: 960,
  y: 540
});
```

#### removeCursor
Verwijdert het cursor element van de pagina.

```javascript
{
  action: 'removeCursor'
}
```

### content.js → popup.js

#### ping
Health check om te verifiëren dat content script klaar is.

```javascript
// Request
{
  action: 'ping'
}

// Response
{
  status: 'ready'
}
```

#### getDimensions
Krijgt de dimensies van de huidige browser tab/viewport.

```javascript
// Request
{
  action: 'getDimensions'
}

// Response
{
  width: number,       // Tab breedte in pixels
  height: number       // Tab hoogte in pixels
}
```

**Site-specifiek gedrag:**
- **YouTube**: Returnt `window.innerWidth/innerHeight`
- **Andere sites**: Returnt groter van viewport of document dimensies

## Kern Functies

### popup.js

#### initHands()
Initialiseert MediaPipe Hands met geoptimaliseerde instellingen.

```javascript
async function initHands(): Promise<boolean>
```

**Returnt:** `true` als succesvol, `false` als mislukt

**Configuratie:**
- `maxNumHands: 1` - Single hand detectie
- `modelComplexity: 1` - Gebalanceerde nauwkeurigheid/prestatie
- `minDetectionConfidence: 0.5` - 50% confidence drempel
- `minTrackingConfidence: 0.5` - 50% tracking drempel

#### onResults(results)
Verwerkt hand tracking resultaten van MediaPipe.

```javascript
async function onResults(results: HandResults): Promise<void>
```

**Parameters:**
- `results.multiHandLandmarks` - Array van hand landmark coördinaten
- `results.image` - Camera frame image

**Belangrijke landmarks gebruikt:**
- `landmarks[8]` - Wijsvinger tip (cursor control)
- `landmarks[4]` - Duim tip (vuist detectie)
- `landmarks[2,5,9,13,17]` - MCP gewrichten (vuist detectie)

#### mapRange(value, inMin, inMax, outMin, outMax)
Maps a value from one range to another with clamping.

```javascript
function mapRange(
  value: number,     // Input value
  inMin: number,     // Input range minimum
  inMax: number,     // Input range maximum  
  outMin: number,    // Output range minimum
  outMax: number     // Output range maximum
): number
```

**Example:**
```javascript
// Map hand position (0-1) to screen coordinates
const screenX = mapRange(handX, 0.2, 0.8, width * 0.2, width * 0.8);
```

#### getTabDimensions()
Gets the dimensions of the active browser tab.

```javascript
async function getTabDimensions(): Promise<{width: number, height: number}>
```

**Returns:** Object with width and height properties

### content.js

#### createCursor()
Creates the visual cursor element on the page.

```javascript
function createCursor(): void
```

**Cursor properties:**
- `position: fixed` - Stays in viewport
- `width/height: 20px` - Circular cursor
- `zIndex: 99999` - Above most UI elements
- `pointerEvents: none` - Doesn't interfere with page

#### updateCursorPosition(x, y)
Updates the cursor position with site-specific logic.

```javascript
function updateCursorPosition(x: number, y: number): void
```

**Behavior:**
- **YouTube**: Viewport-relative positioning
- **Other sites**: Document-relative with scroll offset
- **Bounds clamping**: Keeps cursor within visible area

#### simulateClick(x, y)
Generates mouse events to simulate a click.

```javascript
function simulateClick(x: number, y: number): void
```

**Events generated:**
1. `mousedown` - Press
2. `mouseup` - Release  
3. `click` - Click event

**Target detection:**
- Uses `document.elementFromPoint(x, y)` to find element
- Dispatches events to the target element

#### showClickFeedback()
Provides visual feedback during click events.

```javascript
function showClickFeedback(): void
```

**Behavior:**
- Changes cursor color to red for 200ms
- Returns to green after feedback period

## Coordinate Systems

### MediaPipe Coordinates
```javascript
// Normalized coordinates (0-1)
{
  x: 0.5,  // Center horizontally
  y: 0.3   // Upper third vertically
}
```

### Screen Coordinates  
```javascript
// Pixel coordinates
{
  x: 960,  // Pixels from left edge
  y: 324   // Pixels from top edge
}
```

### Transformation Process

1. **MediaPipe → Relative Movement**
   ```javascript
   const deltaX = -1 * (current.x - last.x) * sensitivity;
   const deltaY = (current.y - last.y) * sensitivity;
   ```

2. **Relative → Screen Coordinates**
   ```javascript
   centerPosition.x += deltaX * tabDimensions.width;
   centerPosition.y += deltaY * tabDimensions.height;
   ```

3. **Screen → Final Position**
   ```javascript
   // YouTube: Direct positioning
   cursor.style.left = `${x}px`;
   
   // Other sites: Add scroll offset
   cursor.style.left = `${x + scrollX}px`;
   ```

## Configuration Constants

### Movement Sensitivity
```javascript
let movementSensitivity = 2.0;           // Base sensitivity
let yAxisSensitivityMultiplier = 1.2;    // Y-axis boost
```

### Fist Detection
```javascript
let fistConfidenceThreshold = 0.7;       // 70% confidence required
let requiredFistFrames = 3;              // Consecutive frames needed
let fistCooldown = 500;                  // 500ms between clicks
```

### Performance
```javascript
// Auto-scaling based on screen resolution
resolutionScaleFactor = Math.min(1.0, 
  Math.max(0.5, Math.sqrt(width * height) / 1920)
);
```

## Error Handling

### Common Error Responses
```javascript
// Success
{ status: 'success' }

// Error
{ 
  status: 'error', 
  message: 'Specific error description' 
}
```

### Error Types
- `'Content script not ready'` - Script injection failed
- `'Failed to initialize MediaPipe Hands'` - Library loading error
- `'Camera access denied'` - Permission issue
- `'Failed to get tab dimensions'` - Communication error

## Performance Considerations

### Optimization Strategies
1. **Single Hand Detection** - Reduces processing load
2. **Adaptive Resolution** - Balances quality and performance
3. **Efficient Updates** - Minimal DOM manipulation
4. **Smart Clamping** - Prevents excessive calculations

### Frame Rate Management
```javascript
// MediaPipe processes frames as available
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({image: video});
  }
});
```

### Memory Management
- Video frames are processed and discarded
- No persistent storage of tracking data
- Automatic cleanup on extension disable

## Browser Compatibility

### Chrome Extension APIs Used
- `chrome.tabs.query()` - Get active tab
- `chrome.tabs.sendMessage()` - Inter-script communication
- `chrome.scripting.executeScript()` - Inject content script
- `chrome.runtime.getURL()` - Access extension resources

### WebAPI Dependencies
- **getUserMedia()** - Camera access
- **Canvas API** - Video processing
- **DOM Events** - Click simulation
- **CSS Positioning** - Cursor display

## Security Considerations

### Content Security Policy
The extension respects site CSP policies:
```json
"content_security_policy": {
  "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
}
```

### Permissions
- `activeTab` - Access current page only
- `scripting` - Inject cursor control
- Camera access - User granted, not stored

### Data Privacy
- No external network requests
- Local processing only
- Temporary video frame processing
- No persistent data storage
