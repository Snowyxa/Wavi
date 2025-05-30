# Hand Tracking Cursor Control Extension - Technische Documentatie

## Overzicht

De Hand Tracking Cursor Control Extension is een Chrome browser extensie die gebruikers in staat stelt hun cursor te besturen met handgebaren via hun webcam. Het systeem gebruikt MediaPipe Hands voor real-time hand tracking en biedt cursor beweging en klik functionaliteit.

## Architectuur

### Kern Componenten

1. **popup.js** - Hoofd hand tracking logica en MediaPipe integratie
2. **content.js** - Cursor visualisatie en DOM interactie
3. **popup.html** - Gebruikersinterface
4. **manifest.json** - Extensie configuratie
5. **lib/** - MediaPipe libraries en dependencies

### Technology Stack

- **MediaPipe Hands** - Real-time hand landmark detectie
- **Chrome Extensions API** - Browser integratie
- **Canvas API** - Video processing en visualisatie
- **WebRTC** - Webcam toegang

## Belangrijke Functies

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

## Implementatie Details

### Hand Detectie en Tracking

```javascript
// MediaPipe configuration
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
```

### Coördinatensysteem

De extensie gebruikt een meerstadige coördinatentransformatie:

1. **MediaPipe Coördinaten** (0-1 genormaliseerd)
   - X: 0 (links) tot 1 (rechts)  
   - Y: 0 (boven) tot 1 (onder)

2. **Scherm Coördinaten** (pixels)
   - Getransformeerd op basis van tab dimensies
   - Site-specifieke behandeling voor complexe layouts

3. **Cursor Positionering**
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

Het systeem gebruikt een multi-criteria benadering voor vuist detectie:

1. **Vinger Status Analyse**
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

3. **Temporele Consistentie**
   ```javascript
   if (fistConfidence > fistConfidenceThreshold) {
     consecutiveFistFrames++;
   }
   const newFistState = consecutiveFistFrames >= requiredFistFrames;
   ```

## Bekende Problemen en Oplossingen

### Probleem 1: Cursor Vastzitten Bovenaan Scherm
**Probleem**: Initiële cursor positionering werd verkeerd berekend door coördinatensysteem mismatches.

**Oplossing**: 
- Fixed coördinatentransformatie in `updateCursorPosition()`
- Verwijderde dubbele viewport scaling
- Verbeterde initiële hand positie mapping

### Probleem 2: YouTube-Specifieke Positionering Problemen
**Probleem**: YouTube's complexe layout interfereert met standaard positionering logica.

**Oplossing**:
- Geïmplementeerde site-specifieke detectie
- Gebruikte viewport-relatieve positionering voor YouTube
- Verhoogde z-index voor complexe UI layers
- Aparte dimensie behandeling voor verschillende site types

### Probleem 3: Y-As Beweging Gevoeligheid
**Probleem**: Verticale cursor beweging was minder responsief dan horizontaal.

**Oplossing**:
- Toegevoegde Y-as gevoeligheid multiplier (1.2x)
- Verbeterde beweging delta berekening
- Verbeterde bounds clamping logica

## Configuratie Parameters

### Beweging Gevoeligheid
```javascript
let movementSensitivity = 2.0; // Basis gevoeligheid
let yAxisSensitivityMultiplier = 1.2; // Y-as boost
```

### Vuist Detectie
```javascript
let fistConfidenceThreshold = 0.7; // 70% confidence vereist
let requiredFistFrames = 3; // Opeenvolgende frames voor detectie
```

### Prestatie
```javascript
// Resolutie scaling voor verschillende displays
resolutionScaleFactor = Math.min(1.0, Math.max(0.5, Math.sqrt(width * height) / 1920));
```

## Browser Compatibiliteit

### Ondersteunde Browsers
- Chrome (Primair doel)
- Chromium-gebaseerde browsers

### Vereiste Permissies
- `activeTab` - Toegang tot huidige tab
- `scripting` - Inject content scripts
- Camera toegang (gebruiker permissie)

## Prestatie Overwegingen

### Optimalisatie Strategieën
1. **Single Hand Detectie** - Vermindert processing overhead
2. **Adaptieve Camera Resolutie** - Balanceert kwaliteit en prestatie
3. **Frame-gebaseerde Processing** - Soepele real-time updates
4. **Efficiënte DOM Updates** - Minimale style herberekeningen

### Resource Gebruik
- **CPU**: Gemiddeld (MediaPipe processing)
- **Memory**: Laag-gemiddeld (video buffers)
- **Network**: Geen (alleen lokale processing)

## Privacy en Beveiliging

### Data Behandeling
- **Geen Externe Communicatie**: Alle processing is lokaal
- **Geen Data Opslag**: Geen hand tracking data wordt opgeslagen
- **Camera Toegang**: Vereist voor real-time tracking
- **Tijdelijke Processing**: Video frames geprocessed en weggegooid

### Beveiligings Functies
- Content Security Policy compliance
- Sandboxed execution environment
- Permission-gebaseerde camera toegang

## Ontwikkelings Richtlijnen

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

### Beste Praktijken
1. **Error Handling**: Uitgebreide try-catch blocks
2. **Logging**: Gedetailleerde console output voor debugging
3. **Fallbacks**: Standaard waarden voor mislukte operaties
4. **Prestatie**: Efficiënte coördinaat berekeningen

## Toekomstige Verbeteringen

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

## Probleemoplossing

### Veelvoorkomende Problemen

#### Cursor Beweegt Niet
1. Controleer camera permissies
2. Verifieer MediaPipe library loading
3. Zorg voor goede lichtomstandigheden
4. Controleer console voor error berichten

#### Slechte Tracking Nauwkeurigheid
1. Verbeter lichtomstandigheden
2. Verminder achtergrond complexiteit
3. Pas camera positie aan
4. Controleer hand zichtbaarheid in frame

#### Site-Specifieke Problemen
1. Controleer of site complexe layout heeft (zoals YouTube)
2. Verifieer z-index waarden
3. Test content script injection
4. Review site-specifieke positionering logica

### Debug Informatie
De extensie biedt uitgebreide console logging:
- Hand positie coördinaten
- Cursor positie berekeningen
- Tab dimensies
- Error berichten en stack traces

## API Referentie

### Bericht Types (popup.js ↔ content.js)

#### moveCursor
```javascript
{
  action: 'moveCursor',
  x: number,        // X coördinaat
  y: number,        // Y coördinaat
  isHandVisible: boolean,
  isFist: boolean
}
```

#### click
```javascript
{
  action: 'click',
  x: number,        // Klik X coördinaat
  y: number         // Klik Y coördinaat
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

### Belangrijke Functies

#### popup.js
- `initHands()` - Initialiseer MediaPipe
- `onResults()` - Verwerk hand tracking resultaten
- `mapRange()` - Coördinatentransformatie
- `getTabDimensions()` - Krijg browser tab grootte

#### content.js
- `createCursor()` - Creëer visuele cursor element
- `updateCursorPosition()` - Update cursor positie
- `simulateClick()` - Genereer klik events
- `showClickFeedback()` - Visuele klik indicatie

## Conclusie

Deze hand tracking cursor control extensie demonstreert geavanceerde computer vision integratie in web browsers, en biedt een toegankelijk alternatief invoermethode. De implementatie balanceert prestatie, nauwkeurigheid, en gebruikerservaring terwijl het de complexiteit van verschillende website layouts en gebruikersomgevingen afhandelt.
