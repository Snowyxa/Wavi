# Technische Documentatie & API Referentie

*Volledige technische gids voor ontwikkelaars van de Wavi hand tracking extensie*

## 📋 Overzicht

De Hand Tracking Cursor Control Extension is een Chrome browser extensie die gebruikers in staat stelt hun cursor te besturen met handgebaren via hun webcam. Het systeem gebruikt MediaPipe Hands voor real-time hand tracking en biedt cursor beweging en klik functionaliteit.

---

## 🏗️ Architectuur

### Kern Componenten

1. **core/popup.js** - Hoofd popup controller en coördinatie
2. **core/trackingManager.js** - Hand tracking lifecycle management
3. **content.js** - Cursor visualisatie en DOM interactie
4. **popup.html** - Gebruikersinterface
5. **manifest.json** - Extensie configuratie
6. **lib/** - MediaPipe libraries en dependencies
7. **modules/** - Feature modules (camera, gestures, settings, etc.)
8. **ui/** - UI componenten (status, theme, visualization, etc.)

### Technology Stack

- **MediaPipe Hands** - Real-time hand landmark detectie
- **Chrome Extensions API** - Browser integratie
- **Canvas API** - Video processing en visualisatie
- **WebRTC** - Webcam toegang

### Modulaire Architectuur

```
Wavi/
├── core/                       # Kern controllers
│   ├── popup.js               # Main popup controller
│   └── trackingManager.js     # Hand tracking lifecycle management
├── content.js                  # Content script
├── ui/                         # UI componenten
│   ├── statusManager.js       # UI status management
│   ├── themeManager.js        # Theme switching
│   ├── settingsUI.js          # Settings panel interactions
│   └── handVisualization.js   # Hand landmarks visualization
├── modules/                    # Feature modules
│   ├── gestureDetection.js    # Vuist gebaar detectie & processing
│   ├── smoothing.js            # Cursor beweging smoothing algoritmes
│   ├── communication.js        # Chrome extensie messaging
│   ├── cameraUtils.js          # Camera setup & video stream management
│   ├── handTracking.js         # MediaPipe integratie & cursor berekeningen
│   ├── settings.js             # Configuratie opslag en beheer
│   └── localization.js         # Meertalige ondersteuning (NL/EN)
├── css/                        # Stylesheets
│   ├── styles.css             # Main styles
│   ├── theme-additions.css    # Theme-specific styles
│   ├── button-styles.css      # Button styling
│   └── content-styles.css     # Content script styles
├── lib/                        # MediaPipe libraries
└── docs/                       # Documentatie
```

### Module Loading Order

Scripts worden geladen in de volgende volgorde in `popup.html` om dependencies correct af te handelen:

1. **Configuration**: `config.js`
2. **MediaPipe Libraries**: `hands.js`, `camera_utils.js`, `drawing_utils.js`
3. **Feature Modules**: 
   - `localization.js` - Internationalization
   - `settings.js` - Configuration management
   - `smoothing.js` - Data smoothing algorithms
   - `gestureDetection.js` - Gesture recognition
   - `communication.js` - Extension messaging
   - `cameraUtils.js` - Camera management
   - `handTracking.js` - MediaPipe integration
4. **UI Modules**:
   - `statusManager.js` - Status updates
   - `themeManager.js` - Theme switching
   - `handVisualization.js` - Hand drawing
   - `settingsUI.js` - Settings panel
5. **Core Modules**:
   - `trackingManager.js` - Tracking coordination
   - `popup.js` - Main controller

### Component Dependencies

- **Core Controllers** → UI Components + Feature Modules
- **UI Components** → Feature Modules (settings, localization)
- **Feature Modules** → MediaPipe Libraries
- **All Modules** → Browser APIs (Storage, Messaging, WebRTC)

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

### 4. Scroll Functionaliteit met Peace-teken
- Peace-teken (wijs- en middelvinger gestrekt, andere vingers gebogen) detectie voor scrollen.
- Scrollen omhoog: Rechtopstaand peace-teken, hand significant omhoog gericht.
- Scrollen omlaag: Omgekeerd (ondersteboven) peace-teken, hand significant omlaag gericht.
- Continue scrollen mogelijk door het gebaar aan te houden.
- Configureerbare parameters voor gevoeligheid, detectie-drempels, en cooldowns.

### 5. Adaptief Gedrag
- Verschillende positionering strategieën voor verschillende websites
- Resolution-gebaseerde gevoeligheid scaling
- Dynamische tab dimensie detectie

### 6. Meertalige Ondersteuning
- Volledige Nederlandse en Engelse interface ondersteuning
- Real-time taalwisseling zonder herstart
- Automatische vertaling van alle UI elementen
- Opslag van taalvoorkeur in Chrome Storage

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

**scroll**
```javascript
{
  action: 'scroll',
  direction: string // 'up' or 'down'
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

#### modules/gestureDetection.js

**detectPeaceGesture(landmarks)**

```javascript
function detectPeaceGesture(landmarks: Array): Object
```
- Detecteert het peace-teken (wijs- en middelvinger gestrekt, andere vingers gesloten).
- Bepaalt de scrollrichting ('up', 'down', of null) gebaseerd op de handoriëntatie (rechtop of omgekeerd) en de verticale positie van de vingertoppen t.o.v. de pols.
- Returns: `{ detected: boolean, direction: string | null, confidence: number }`

**handlePeaceGestureStateChange(gestureResult, onScrollCallback)**

```javascript
function handlePeaceGestureStateChange(gestureResult: Object, onScrollCallback: Function): void
```
- Verwerkt de status van het peace-gebaar voor scrollen.
- Roept `onScrollCallback` aan met de scrollrichting ('up'/'down') als het gebaar stabiel gedetecteerd is.
- Beheert cooldowns voor zowel continue scroll-ticks (`minScrollInterval`) als tussen afzonderlijke scroll-sequenties (`peaceCooldown`).

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

### Peace-teken Detectie Algoritme (voor Scrollen)

**1. Vinger Status Analyse (Relatief aan Handoriëntatie)**
- Controleert of wijs- en middelvinger gestrekt zijn en de duim, ringvinger en pink gesloten/gebogen zijn.
- De definitie van "gestrekt" en "gesloten" past zich aan aan de algehele verticale oriëntatie van de hand (rechtop of omgekeerd).
  - Voorbeeld (wijsvinger gestrekt): 
    - Rechtop hand: `indexTipLandmark.y < indexMCPLandmark.y`
    - Omgekeerde hand: `indexTipLandmark.y > indexMCPLandmark.y`

**2. Scrollrichting Bepaling**
- Als een geldig peace-teken is gedetecteerd:
  - **Rechtopstaand peace-teken**: Scrollrichting is 'up' als `indexTipLandmark.y < wrist.y - scrollDirectionThreshold`.
  - **Omgekeerd peace-teken**: Scrollrichting is 'down' als `indexTipLandmark.y > wrist.y + scrollDirectionThreshold`.
- `scrollDirectionThreshold` bepaalt de minimale verticale afwijking die nodig is om een scrollrichting te activeren.

**3. Confidence Scoring en Temporele Consistentie**
- Vergelijkbaar met vuistdetectie, een `peaceScore` wordt berekend.
- `consecutivePeaceFrames` en `currentPeaceSettings.requiredPeaceFrames` zorgen voor stabiele detectie voordat scrollen wordt geactiveerd.
- `currentPeaceSettings.peaceConfidenceThreshold` is de minimale score die nodig is.

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

### Peace-teken Detectie (Scrollen)
```javascript
let currentPeaceSettings = {
  peaceGestureEnabled: true,         // Schakelt peace-gebaar voor scrollen aan/uit
  peaceConfidenceThreshold: 0.7,   // Minimale confidence score voor detectie
  requiredPeaceFrames: 3,          // Aantal opeenvolgende frames nodig
  peaceCooldown: 300,              // Cooldown (ms) tussen afzonderlijke scroll-sequenties
  scrollSensitivity: 1.0,          // Gevoeligheid van scroll-snelheid (nog niet volledig geïmplementeerd voor peace)
  minScrollInterval: 100,          // Minimale interval (ms) tussen continue scroll-ticks
  scrollDirectionThreshold: 0.05   // Drempel voor y-verschil voor up/down detectie (genormaliseerd)
};
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
1. **Uitgebreide Scroll Functionaliteit** - Horizontale scrollen, fijnmazige snelheidscontrole.
2. **Kalibratie Systeem** - Gebruiker-specifieke gevoeligheid en gebaar aanpassing.
3. **Multi-gebaar Ondersteuning** - Aanvullende hand gebaren voor andere acties (bv. tab wisselen, terug/vooruit navigeren).
4. **Verbeterde Settings UI** - Meer visuele feedback en geavanceerde opties.

### Technische Verbeteringen
1. **Machine Learning Optimalisatie** - Custom gebaar modellen
2. **Cross-browser Ondersteuning** - Firefox en Safari compatibiliteit
3. **Prestatie Verbeteringen** - WebAssembly integratie
4. **Toegankelijkheids Functies** - Voice commands integratie

---

## 📝 Conclusie

Deze hand tracking cursor control extensie demonstreert geavanceerde computer vision integratie in web browsers, en biedt een toegankelijk alternatief invoermethode, inclusief klik- en scrollfunctionaliteit. De implementatie balanceert prestatie, nauwkeurigheid, en gebruikerservaring terwijl het de complexiteit van verschillende website layouts en gebruikersomgevingen afhandelt.

---

*Laatst Bijgewerkt: 30 mei 2025*
