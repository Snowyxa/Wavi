# Technische Documentatie & API Referentie

*Volledige technische gids voor ontwikkelaars van de Wavi hand tracking extensie*

## 📋 Overzicht

De Hand Tracking Cursor Control Extension is een Chrome browser extensie die gebruikers in staat stelt hun cursor te besturen met handgebaren via hun webcam. Het systeem gebruikt MediaPipe Hands voor real-time hand tracking en biedt cursor beweging en klik functionaliteit.

---

## 🏗️ Architectuur

### Kern Componenten

1. **popup.js** - Hoofd hand tracking logica en MediaPipe integratie
2. **content.js** - Cursor visualisatie en DOM interactie
3. **popup.html** - Gebruikersinterface
4. **manifest.json** - Extensie configuratie
5. **lib/** - MediaPipe libraries en dependencies
6. **modules/** - Modulaire componenten (nieuwe architectuur)

### Technology Stack

- **MediaPipe Hands** - Real-time hand landmark detectie
- **Chrome Extensions API** - Browser integratie
- **Canvas API** - Video processing en visualisatie
- **WebRTC** - Webcam toegang

### Modulaire Architectuur

```
Wavi/
├── popup.js                    # Main popup controller
├── content.js                  # Content script
├── modules/                    # Modulaire componenten
│   ├── gestureDetection.js    # Vuist gebaar detectie & processing
│   ├── smoothing.js            # Cursor beweging smoothing algoritmes
│   ├── communication.js        # Chrome extensie messaging
│   ├── cameraUtils.js          # Camera setup & video stream management
│   └── handTracking.js         # MediaPipe integratie & cursor berekeningen
├── lib/                        # MediaPipe libraries
└── docs/                       # Documentatie
```

---

## ⚡ Belangrijke Functies

### 1. Real-time Hand Tracking
- Gebruikt MediaPipe Hands met geoptimaliseerde instellingen voor prestatie
- Volgt wijsvinger tip (landmark 8) voor cursor positionering
- Ondersteunt single hand detectie met confidence drempels

### 2. Cursor Beweging
- Visuele cursor overlay die handbewegingen volgt
- Site-specifieke positionering logica (YouTube vs. standaard sites)
- Soepele beweging met configureerbare gevoeligheid
- Viewport-relatieve positionering voor complexe layouts

### 3. Klik Functionaliteit
- Vuist gebaar detectie voor klikken
- Multi-finger analyse voor verbeterde nauwkeurigheid
- Klik cooldown om accidentele multiple clicks te voorkomen
- Visuele feedback tijdens klik events

### 4. Adaptief Gedrag
- Verschillende positionering strategieën voor verschillende websites
- Resolution-gebaseerde gevoeligheid scaling
- Dynamische tab dimensie detectie

---

## 🔧 API Referentie

### Bericht Types

#### popup.js → content.js

**moveCursor**
```javascript
{
  action: 'moveCursor',
  x: number,           // X coördinaat in pixels
  y: number,           // Y coördinaat in pixels  
  isHandVisible: boolean,  // Of hand momenteel gedetecteerd wordt
  isFist: boolean      // Of vuist gebaar gedetecteerd wordt
}
```

**click**
```javascript
{
  action: 'click',
  x: number,           // Klik X coördinaat in pixels
  y: number            // Klik Y coördinaat in pixels
}
```

**removeCursor**
```javascript
{
  action: 'removeCursor'
}
```

#### content.js → popup.js

**getDimensions**
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

### Kern Functies

#### popup.js

**initHands()**
```javascript
async function initHands(): Promise<boolean>
```
- Initialiseert MediaPipe Hands met geoptimaliseerde instellingen
- Returns: `true` als succesvol, `false` als mislukt

**onResults(results)**
```javascript
async function onResults(results: HandResults): Promise<void>
```
- Verwerkt hand tracking resultaten van MediaPipe
- Gebruikt landmarks[8] voor cursor control en landmarks[4,2,5,9,13,17] voor vuist detectie

#### content.js

**createCursor()**
```javascript
function createCursor(): void
```
- Creëert visuele cursor element op pagina
- Eigenschappen: fixed positioning, 20px cirkel, z-index 99999

**updateCursorPosition(x, y)**
```javascript
function updateCursorPosition(x: number, y: number): void
```
- Update cursor positie met site-specifieke logica
- YouTube: viewport-relatieve positionering
- Andere sites: document-relatieve met scroll offset

**simulateClick(x, y)**
```javascript
function simulateClick(x: number, y: number): void
```
- Genereert mouse events (mousedown, mouseup, click)
- Gebruikt `document.elementFromPoint(x, y)` voor target detectie

---

## 📐 Implementatie Details

### Hand Detectie en Tracking

```javascript
// MediaPipe configuratie
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
```

### Coördinatensysteem

**1. MediaPipe Coördinaten** (0-1 genormaliseerd)
- X: 0 (links) tot 1 (rechts)  
- Y: 0 (boven) tot 1 (onder)

**2. Scherm Coördinaten** (pixels)
- Getransformeerd op basis van tab dimensies
- Site-specifieke behandeling voor complexe layouts

**3. Cursor Positionering**
- Fixed positioning voor YouTube en vergelijkbare sites
- Absolute positioning met scroll offset voor standaard sites

### Site-Specifieke Behandeling

#### YouTube en Complexe Sites
```javascript
if (isYouTube) {
  // Gebruik viewport-relatieve positionering
  const finalX = Math.max(0, Math.min(x, viewportWidth - 20));
  const finalY = Math.max(0, Math.min(y, viewportHeight - 20));
  cursor.style.left = `${finalX}px`;
  cursor.style.top = `${finalY}px`;
}
```

#### Standaard Sites
```javascript
else {
  // Gebruik document-relatieve positionering met scroll
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  let finalX = x + scrollX;
  let finalY = y + scrollY;
  // Pas bounds clamping toe...
}
```

### Beweging Berekening

```javascript
// Bereken beweging delta
const deltaX = -1 * (currentHandPosition.x - lastHandPosition.x) * movementSensitivity;
const deltaY = (currentHandPosition.y - lastHandPosition.y) * movementSensitivity * yAxisSensitivityMultiplier;

// Update cursor positie
centerPosition.x += deltaX * tabDimensions.width;
centerPosition.y += deltaY * tabDimensions.height;
```

### Vuist Detectie Algoritme

**1. Vinger Status Analyse**
```javascript
const isThumbClosed = thumbTip.y > thumbMCP.y;
const isIndexClosed = indexTip.y > indexMCP.y;
const isMiddleClosed = middleTip.y > middleMCP.y;
const isRingClosed = ringTip.y > ringMCP.y;
const isPinkyClosed = pinkyTip.y > pinkyMCP.y;
```

**2. Confidence Scoring**
```javascript
const closedCount = closedFingers.filter(finger => finger).length;
const currentFistConfidence = closedCount / 5;
fistConfidence = (fistConfidence * 0.7) + (currentFistConfidence * 0.3);
```

**3. Temporele Consistentie**
```javascript
if (fistConfidence > fistConfidenceThreshold) {
  consecutiveFistFrames++;
}
const newFistState = consecutiveFistFrames >= requiredFistFrames;
```

---

## ⚙️ Configuratie Parameters

### Beweging Gevoeligheid
```javascript
let movementSensitivity = 2.0; // Basis gevoeligheid
let yAxisSensitivityMultiplier = 1.2; // Y-as boost
```

### Vuist Detectie
```javascript
let fistConfidenceThreshold = 0.7; // 70% confidence vereist
let requiredFistFrames = 3; // Opeenvolgende frames voor detectie
let fistCooldown = 500; // 500ms tussen clicks
```

### Prestatie
```javascript
// Auto-scaling gebaseerd op scherm resolutie
resolutionScaleFactor = Math.min(1.0, 
  Math.max(0.5, Math.sqrt(width * height) / 1920)
);
```

---

## 🔒 Browser Compatibiliteit & Beveiliging

### Ondersteunde Browsers
- Chrome (Primair doel)
- Chromium-gebaseerde browsers

### Vereiste Permissies
- `activeTab` - Toegang tot huidige tab
- `scripting` - Inject content scripts
- Camera toegang (gebruiker permissie)

### Beveiliging
- **Geen Externe Communicatie**: Alle processing is lokaal
- **Geen Data Opslag**: Geen hand tracking data wordt opgeslagen
- **Camera Toegang**: Vereist voor real-time tracking
- **Tijdelijke Processing**: Video frames geprocessed en weggegooid

---

## 🚀 Prestatie Overwegingen

### Optimalisatie Strategieën
1. **Single Hand Detectie** - Vermindert processing overhead
2. **Adaptieve Camera Resolutie** - Balanceert kwaliteit en prestatie
3. **Frame-gebaseerde Processing** - Soepele real-time updates
4. **Efficiënte DOM Updates** - Minimale style herberekeningen

### Resource Gebruik
- **CPU**: Gemiddeld (MediaPipe processing)
- **Memory**: Laag-gemiddeld (video buffers)
- **Network**: Geen (alleen lokale processing)

---

## 🛠️ Ontwikkelings Richtlijnen

### Code Structuur
```
popup.js
├── Hand tracking initialisatie
├── MediaPipe integratie
├── Coördinatentransformatie
├── Gebaar detectie
└── Communicatie met content script

content.js
├── Cursor visualisatie
├── DOM interactie
├── Site-specifieke positionering
└── Event handling
```

### Best Practices
1. **Error Handling**: Uitgebreide try-catch blocks
2. **Logging**: Gedetailleerde console output voor debugging
3. **Fallbacks**: Default waarden voor mislukte operaties
4. **Prestatie**: Efficiënte coördinaat berekeningen

---

## 🔮 Toekomstige Verbeteringen

### Geplande Functies
1. **Scroll Functionaliteit** - Horizontale hand beweging voor scrollen
2. **Kalibratie Systeem** - Gebruiker-specifieke gevoeligheid aanpassing
3. **Multi-gebaar Ondersteuning** - Aanvullende hand gebaren
4. **Settings UI** - Configureerbare parameters

### Technische Verbeteringen
1. **Machine Learning Optimalisatie** - Custom gebaar modellen
2. **Cross-browser Ondersteuning** - Firefox en Safari compatibiliteit
3. **Prestatie Verbeteringen** - WebAssembly integratie
4. **Toegankelijkheids Functies** - Voice commands integratie

---

## 📝 Conclusie

Deze hand tracking cursor control extensie demonstreert geavanceerde computer vision integratie in web browsers, en biedt een toegankelijk alternatief invoermethode. De implementatie balanceert prestatie, nauwkeurigheid, en gebruikerservaring terwijl het de complexiteit van verschillende website layouts en gebruikersomgevingen afhandelt.

---

*Laatst Bijgewerkt: 30 mei 2025*
