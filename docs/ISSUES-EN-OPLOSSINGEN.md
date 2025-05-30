# Problemen en Oplossingen

*Geconsolideerde gids voor alle bekende problemen, fixes en troubleshooting*

## 📋 Overzicht

Dit document combineert alle informatie over problemen, oplossingen en troubleshooting voor de Wavi hand tracking extensie. Het is onderverdeeld in drie secties:
1. **Opgeloste Ontwikkeling Problemen** - Technische issues tijdens ontwikkeling
2. **Gebruiker Troubleshooting** - Praktische oplossingen voor eindgebruikers  
3. **Huidige en Toekomstige Problemen** - Wat nog onderzocht wordt

---

## 🔧 Opgeloste Ontwikkeling Problemen

### ISS-001: Cursor Vastzittend Bovenaan Scherm ✅
- **Datum Gerapporteerd**: Ontwikkeling Fase (Pre v1.1.1)
- **Status**: Opgelost in v1.1.1
- **Prioriteit**: Hoog
- **Beschrijving**: Cursor verscheen bovenaan scherm bij tracking start en bewoog niet mee met hand bewegingen, vooral op YouTube en complexe websites.
- **Hoofdoorzaak**: Coördinatensysteem mismatch tussen MediaPipe output en browser coördinaten, gecombineerd met dubbele viewport scaling.
- **Impact**: Maakte extensie onbruikbaar op veel websites, vooral YouTube.
- **Oplossing**: 
  - Fixed coördinatentransformatie logica in `popup.js`
  - Geïmplementeerde site-specifieke positionering voor YouTube vs standaard sites
  - Verwijderde dubbele scaling problemen in coördinaat mapping
  - Toegevoegde juiste bounds clamping in `mapRange` functie
- **Versie Gefixt**: v1.1.1

### ISS-002: Y-As Beweging Ongevoeligheid ✅
- **Datum Gerapporteerd**: Ontwikkeling Fase (Pre v1.1.1)
- **Status**: Opgelost in v1.1.1
- **Prioriteit**: Gemiddeld
- **Beschrijving**: Verticale cursor beweging was minder responsief dan horizontale beweging, waardoor precieze navigatie moeilijk werd.
- **Hoofdoorzaak**: Inadequate Y-as gevoeligheid scaling.
- **Impact**: Verminderde precisie en gebruikerservaring tijdens verticale navigatie.
- **Oplossing**: 
  - Geïmplementeerde 1.2x multiplier voor Y-as gevoeligheid
  - Verbeterde coördinaat mapping voor betere verticale responsiviteit
- **Versie Gefixt**: v1.1.1

### ISS-003: YouTube Compatibiliteit Problemen ✅
- **Datum Gerapporteerd**: Ontwikkeling Fase (Pre v1.1.1)
- **Status**: Opgelost in v1.1.1
- **Prioriteit**: Hoog
- **Beschrijving**: Extensie werkte niet goed op YouTube door complexe layout en hoge z-index elementen.
- **Hoofdoorzaak**: Standaard positionering logica was niet compatibel met YouTube's complexe UI structuur.
- **Impact**: Grote website compatibiliteit probleem dat significante gebruikersbasis beïnvloedde.
- **Oplossing**: 
  - Toegevoegde YouTube-specifieke detectie (`window.location.hostname.includes('youtube.com')`)
  - Geïmplementeerde viewport-relatieve positionering voor YouTube
  - Verhoogde cursor z-index naar 99999 voor betere zichtbaarheid
- **Versie Gefixt**: v1.1.1

### ISS-004: Cursor Beweging Tijdens Vuist Gebaar ✅
- **Datum Gerapporteerd**: 27 mei 2025
- **Status**: Opgelost in v1.1.2
- **Prioriteit**: Gemiddeld
- **Beschrijving**: Bij maken van vuist om te klikken bleef cursor bewegen, waardoor hover target veranderde tijdens klik gebaar. Dit maakte het moeilijk om op precieze targets te klikken.
- **Hoofdoorzaak**: Cursor tracking bleef actief tijdens vuist detectie, en hand positie verschoof licht bij vormen van vuist. Geen cursor vergrendeling mechanisme bestond tijdens klik gebaren.
- **Impact**: Beïnvloedde klik nauwkeurigheid en gebruikerservaring, vooral voor kleine UI elementen.
- **Oplossing**: 
  - Geïmplementeerde cursor positie vergrendeling tijdens vuist gebaar detectie (`isPositionLocked` flag)
  - Toegevoegde korte cursor freeze periode wanneer klik gebaar geïnitieerd wordt
  - Verbeterde gebaar state management om beweging en klik modes te scheiden
  - Toegevoegde minimum lock duur (150ms) om vroegtijdige ontgrendeling te voorkomen
  - Verbeterde stabilisatie timeout voor soepele gebaar overgangen
  - Vergrendelde positie wordt gebruikt voor zowel cursor display als klik coördinaat nauwkeurigheid
- **Versie Gefixt**: v1.1.2

### ISS-005: Jittery Cursor Tracking ✅
- **Datum Gerapporteerd**: Doorlopende ontwikkeling zorg
- **Status**: Opgelost in v1.1.3
- **Prioriteit**: Hoog
- **Beschrijving**: Cursor beweging vertoonde jittery gedrag met micro-bewegingen en plotselinge positie veranderingen, vooral beïnvloedend voor gebruikers met motorische problemen of hand tremors.
- **Hoofdoorzaak**: Ruwe MediaPipe hand tracking data bevatte natuurlijke hand micro-bewegingen en sensor ruis die vertaalde naar afleidende cursor jitter.
- **Impact**: Beïnvloedde significaant toegankelijkheid voor gebruikers met motorische problemen en verminderde algehele gebruikerservaring door onstabiel cursor gedrag.
- **Oplossing**: 
  - Geïmplementeerde uitgebreide multi-layer smoothing systeem
  - Toegevoegde hand positie smoothing met gewogen gemiddelde van recente posities
  - Geïmplementeerde cursor positie smoothing met exponential smoothing algoritme
  - Toegevoegde velocity-gebaseerde smoothing om plotselinge richting veranderingen te voorkomen
  - Gecreëerde dead zone systeem (0.003 radius) om micro-bewegingen te negeren
  - Geïmplementeerde stabilisatie frame counting voor stabiele hand detectie
  - Toegevoegde configureerbare smoothing parameters voor verschillende gebruiker behoeften
  - Geoptimaliseerde prestatie met efficiënte positie geschiedenis management
- **Versie Gefixt**: v1.1.3

### ISS-006: UI Fixes en Verbeteringen ✅
- **Datum Gerapporteerd**: Ontwikkeling Fase
- **Status**: Opgelost in verschillende versies
- **Prioriteit**: Gemiddeld
- **Beschrijving**: Verschillende UI problemen en verbetering verzoeken.
- **Opgeloste Problemen**:
  1. **UI Breedte Verdubbeling**: 1440px → 2880px (2x zoals gevraagd)
  2. **"How to Use" Sectie Verwijderd**: Volledige removal van instructie panelen
  3. **Camera UI Shrinking Issue Gefixt**: MediaPipe Camera hardcoded dimensies opgelost
  4. **Enhanced Video Container**: Hoogte verhoogd van 400px → 600px
- **Bestanden Gewijzigd**: `styles.css`, `popup.html`, `popup.js`, diverse modules
- **Impact**: Verbeterde gebruikersinterface en stabiliteit

---

## 🛠️ Gebruiker Troubleshooting

### Veelvoorkomende Problemen en Directe Oplossingen

#### 1. Cursor Beweegt Niet
**Symptomen:**
- Extensie opent maar cursor verschijnt niet
- Camera werkt maar geen hand tracking
- Console fouten zichtbaar

**Directe Oplossingen:**
1. **Controleer Camera Permissies**
   - Klik op camera icoon in adresbalk
   - Zorg dat camera toegang toegestaan is
   - Herlaad pagina na permissie wijziging

2. **Verifieer MediaPipe Library Loading**
   - Open browser console (F12)
   - Zoek naar MediaPipe gerelateerde fouten
   - Herstart browser als libraries niet laden

3. **Zorg voor Goede Lichtomstandigheden**
   - Ga voor een lichtbron staan (raam/lamp)
   - Vermijd tegenlicht
   - Gebruik consistente, heldere verlichting

#### 2. Slechte Tracking Nauwkeurigheid
**Symptomen:**
- Hand wordt niet consistent gedetecteerd
- Cursor springt of beweegt onregelmatig
- Tracking stopt onverwacht

**Directe Oplossingen:**
1. **Optimaliseer Achtergrond**
   - Gebruik effen achtergrond wanneer mogelijk
   - Minimaliseer beweging achter hand
   - Vermijd drukke patronen

2. **Hand Positionering**
   - Houd volledige hand zichtbaar in camera
   - Behoud 1-3 voet afstand van camera
   - Zorg dat vingers goed zichtbaar zijn

3. **Camera Kwaliteit**
   - Gebruik hogere resolutie camera indien beschikbaar
   - Reinig camera lens
   - Zorg voor stabiele camera positie

#### 3. Site-Specifieke Problemen
**Symptomen:**
- Werkt op sommige sites maar niet op andere
- Cursor positionering verkeerd op complexe sites
- Z-index problemen met website UI

**Directe Oplossingen:**
1. **YouTube en Complexe Sites**
   - Extensie gebruikt speciale logica voor YouTube
   - Bij problemen: ververs pagina
   - Controleer of site complex layout heeft

2. **Z-Index Problemen**
   - Cursor zou bovenop meeste UI moeten verschijnen
   - Bij onzichtbaarheid: rapporteer specifieke site
   - Test op andere websites om probleem te isoleren

#### 4. Klik Functionaliteit Problemen
**Symptomen:**
- Vuist gebaar gedetecteerd maar geen klik
- Kliks op verkeerde plek
- Multiple clicks per gebaar

**Directe Oplossingen:**
1. **Vuist Gebaar Technique**
   - Maak duidelijke vuist met alle vingers gesloten
   - Houd vuist 0.5 seconden vast
   - Laat langzaam los na klik

2. **Klik Nauwkeurigheid**
   - Positioneer hand stabiel voor klik
   - Vermijd beweging tijdens vuist maken
   - Wacht op visuele feedback

#### 5. Prestatie Problemen
**Symptomen:**
- Langzame tracking response
- Browser wordt traag
- Hoge CPU gebruik

**Directe Oplossingen:**
1. **Browser Optimalisatie**
   - Sluit andere zware tabs
   - Herstart browser periodiek
   - Update Chrome naar nieuwste versie

2. **Systeemprestatie**
   - Sluit onnodige programma's
   - Zorg voor voldoende RAM beschikbaar
   - Check camera drivers up-to-date

---

## 🔍 Debug Informatie

### Console Logging
De extensie biedt uitgebreide console logging voor debugging:
- Hand positie coördinaten
- Cursor positie berekeningen  
- Tab dimensies
- Error berichten en stack traces

### Browser Compatibiliteit
- **Ondersteund**: Chrome, Edge (Chromium-gebaseerd)
- **Niet Ondersteund**: Firefox, Safari (WebAssembly/MediaPipe beperking)
- **Vereiste Permissies**: Camera toegang, activeTab, scripting

---

## 🔮 Huidige en Toekomstige Problemen

### Open Issues
*Geen open issues op dit moment.*

### Toekomstige Overwegingen
- **Multi-click gebaren**: Ondersteuning voor double-click, right-click
- **Gebaar conflicten**: Wanneer meerdere gebaren tegelijk gedetecteerd worden
- **Prestatie op lagere-end apparaten**: Frame rate en CPU gebruik optimalisatie
- **Cross-browser compatibiliteit**: Testen op Edge, Firefox, Safari
- **Verschillende camera kwaliteiten**: Aanpassing aan verschillende webcam specificaties

### Issue Rapportage Richtlijnen
Bij rapporteren van nieuwe issues:
1. **Reproduceer consistent** - Zorg dat issue gerepliceerd kan worden
2. **Documenteer stappen** - Verstrek duidelijke reproductie stappen
3. **Omgeving details** - Browser versie, OS, camera type
4. **Impact assessment** - Hoe het gebruikerservaring beïnvloedt
5. **Screenshots/videos** - Visueel bewijs wanneer toepasbaar

### Prioriteit Levels
- **Hoog**: Breekt kern functionaliteit, beïnvloedt veel gebruikers
- **Gemiddeld**: Beïnvloedt gebruikerservaring maar workarounds bestaan
- **Laag**: Kleine ongemak of edge case

---

*Laatst Bijgewerkt: 30 mei 2025*
