# 👋 Wavi - Automatisch Startende Handgebaar Besturing

**Zwaai traditionele muisbesturing vaarwel!** Wavi is een Chrome-extensie die je webcam omzet in een krachtige gebaar-controller, waarmee je websites kunt navigeren met eenvoudige handbewegingen. Nu met **instant automatische start** - geen knoppen nodig!

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Chrome Extension](https://img.shields.io/badge/chrome-extension-green.svg)
![Auto Start](https://img.shields.io/badge/auto--start-enabled-brightgreen.svg)
![Privacy First](https://img.shields.io/badge/privacy-first-orange.svg)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)

</div>

## ✨ Functies

### 🚀 **Instant Automatische Start**
- **Nul-Klik Activatie** - Tracking start automatisch wanneer je de extensie opent
- **Geen Knop Vereist** - Open gewoon de popup en begin met gebaren maken
- **Directe Feedback** - Moderne UI met real-time status indicatoren

### 🎯 **Intuïtieve Besturing**
- **Wijsvinger Tracking** - Beweeg je wijsvinger om de cursor te besturen
- **Vuist Gebaren** - Maak een vuist om ergens op de pagina te klikken
- **Real-time Reactie** - Ultra-lage latentie tracking voor soepele interactie

### 🎨 **Mooie Moderne Interface**
- **Gradient Ontwerp** - Strak, modern UI met vloeiende animaties
- **Status Indicatoren** - Visuele feedback met kleurgecodeerde status stippen
- **Dark Mode Ondersteuning** - Past automatisch aan je systeemthema aan
- **Responsieve Layout** - Werkt perfect op alle schermformaten

### 🌐 **Universele Compatibiliteit**
- **Werkt Overal** - Compatible met alle websites inclusief YouTube, sociale media en complexe web apps
- **Adaptieve Positionering** - Past automatisch aan verschillende site layouts en UI structuren aan
- **Hoge Z-Index** - Cursor altijd zichtbaar, zelfs op complexe interfaces

### 🔒 **Privacy-Gericht**
- **100% Lokale Verwerking** - Alle hand tracking gebeurt in je browser
- **Geen Data Overdracht** - Nul data verzonden naar externe servers
- **Camera Controle** - Volledige controle over wanneer je camera actief is
- **Veilig per Ontwerp** - Geen tracking, geen analytics, geen data verzameling

### ⚡ **Prestatie Geoptimaliseerd**
- **MediaPipe Integratie** - Maakt gebruik van Google's geavanceerde hand tracking technologie
- **Adaptieve Gevoeligheid** - Past automatisch aan je schermresolutie aan
- **Geavanceerde Smoothing** - Multi-layer smoothing systeem vermindert trillingen voor verbeterde toegankelijkheid
- **Dead Zone Technologie** - Negeert micro-bewegingen voor stabiele cursor positionering

## 🚀 Snelle Start

### Installatie
1. **Download & Installeer**
   ```bash
   git clone https://github.com/your-username/wavi-extension.git
   cd wavi-extension
   ```

2. **Laden in Chrome**
   - Open Chrome → Navigeer naar `chrome://extensions/`
   - Schakel **"Ontwikkelaarsmodus"** in (toggle rechtsboven)
   - Klik **"Uitgepakte extensie laden"** → Selecteer de projectmap
   - 🎉 Wavi icoon verschijnt in je werkbalk!

### Eerste Gebruik
1. **🎬 Instant Start** - Klik op het Wavi extensie icoon en tracking start automatisch!
2. **📹 Camera Toegang Verlenen** - Sta camera permissies toe wanneer gevraagd (eenmalig)
3. **✋ Positioneer Je Hand** - Houd je hand duidelijk zichtbaar voor de camera
4. **👆 Wijs & Navigeer** - Beweeg je wijsvinger om de cursor direct te besturen
5. **✊ Maak een Vuist** - Sluit je hand om ergens op de pagina te klikken
6. **🎯 Geniet van Naadloze Besturing** - Geen knoppen om in te drukken, geen setup vereist!

## 🎮 Hoe Te Gebruiken

### Kern Gebaren
| Gebaar | Actie | Visuele Feedback |
|---------|--------|----------------|
| **👆 Wijzen** | Cursor bewegen | Groene circulaire cursor volgt je vinger |
| **✊ Vuist** | Klik actie | Rode cursor wanneer vuist wordt gedetecteerd |
| **🖐️ Open Hand** | Inactieve staat | Normale cursor, geen actie |

### Aan De Slag
1. **Open Extensie** - Klik op het Wavi icoon in je Chrome werkbalk
2. **Auto-Start Magie** - Tracking begint automatisch (geen knoppen nodig!)
3. **Verlenen Permissies** - Sta camera toegang toe wanneer gevraagd
4. **Begin Met Gebaren** - Wijs met je wijsvinger om de cursor te bewegen
5. **Klik Met Vuist** - Maak een vuist gebaar om te klikken

### Pro Tips
- **Verlichting**: Werkt het best in goed verlichte omgevingen
- **Afstand**: Houd hand 30-60 cm van camera voor optimale tracking
- **Stabiliteit**: Kleine, doelbewuste bewegingen werken beter dan grote gebaren
- **Camera Positie**: Zorg dat je hand duidelijk zichtbaar is in de camera view
- **Prestaties**: Sluit andere camera-gebruikende apps voor beste prestaties

## 📁 Project Structuur

```
wavi-extension/
├── 📄 manifest.json           # Extensie configuratie & permissies
├── 🎨 popup.html             # Moderne auto-start interface
├── 🧠 popup.js               # Auto-startende hand tracking engine
├── 🎯 content.js             # Cursor overlay & klik afhandeling
├── 💄 styles.css             # Mooie moderne UI met animaties
├── ⚙️ config.js              # Configuratie instellingen
├── 🔧 service-worker.js      # Achtergrond service worker
├── 📚 docs/                  # Uitgebreide documentatie
│   ├── API-REFERENCE.md      # Technische API documentatie
│   ├── DOCUMENTATION.md      # Volledige implementatie gids
│   ├── TROUBLESHOOTING.md    # Veelvoorkomende problemen & oplossingen
│   ├── requirements.md       # Systeemvereisten
│   └── version-roadmap.md    # Ontwikkelings roadmap
├── 🎨 icons/                 # Extensie iconen
│   └── icon.svg
├── 📦 lib/                   # MediaPipe bibliotheken
│   ├── hands_solution_packed_assets_loader.js
│   ├── hands_solution_simd_wasm_bin.js
│   ├── hands.js
│   ├── camera_utils.js
│   └── drawing_utils.js
└── 🔧 modules/               # Modulaire componenten
    ├── cameraUtils.js
    ├── communication.js
    ├── gestureDetection.js
    ├── handTracking.js
    └── smoothing.js
```

## 📖 Documentatie

| Document | Beschrijving |
|----------|-------------|
| 📘 **[Technische Documentatie](./docs/DOCUMENTATION.md)** | Volledige implementatie gids & architectuur |
| 🔧 **[API Referentie](./docs/API-REFERENCE.md)** | Functie definities & code voorbeelden |
| 🆘 **[Probleemoplossing Gids](./docs/TROUBLESHOOTING.md)** | Veelvoorkomende problemen & oplossingen |
| 📋 **[Vereisten](./docs/requirements.md)** | Systeemvereisten & compatibiliteit |
| 🗺️ **[Roadmap](./docs/version-roadmap.md)** | Toekomstige functies & ontwikkelings tijdlijn |

## 🎯 Huidige Status: v2.0.0

### 🆕 Nieuw in v2.0.0
- ✅ **Auto-Start Technologie** - Tracking begint instant wanneer popup opent
- ✅ **Moderne UI Herontwerp** - Mooie gradient interface met status indicatoren
- ✅ **Nul-Knop Ervaring** - Geen start/stop knoppen meer nodig
- ✅ **Verbeterde Visuele Feedback** - Kleurgecodeerde status stippen en vloeiende animaties
- ✅ **Dark Mode Ondersteuning** - Past automatisch aan systeemvoorkeuren aan
- ✅ **Verbeterde Toegankelijkheid** - Beter contrast en visuele indicatoren

### ✅ Kern Functies
- ✅ **Real-time Hand Tracking** - MediaPipe-aangedreven gebaar herkenning
- ✅ **Cursor Beweging** - Vloeiende, responsieve vinger tracking
- ✅ **Klik Functionaliteit** - Betrouwbare vuist-gebaseerde klikken
- ✅ **Site Compatibiliteit** - Geoptimaliseerd voor YouTube & complexe layouts
- ✅ **Visuele Feedback** - Duidelijke cursor states en klik bevestiging
- ✅ **Privacy Bescherming** - 100% lokale verwerking

### 🔧 Technische Verbeteringen
- **Verbeterde Prestaties** - Geoptimaliseerde initialisatie en resource management
- **Betere Error Handling** - Verbeterde camera permissie en error states
- **Vloeiendere Animaties** - Hardware-versnelde CSS transities
- **Responsief Ontwerp** - Mobiel en desktop geoptimaliseerde layouts

## 🔧 Systeemvereisten

- **Browser**: Chrome 88+ (Chromium-gebaseerde browsers)
- **Camera**: Elke standaard webcam (ingebouwd of extern)
- **Verlichting**: Adequate omgevingsverlichting voor hand detectie
- **Prestaties**: Moderne CPU voor real-time verwerking

## 🛡️ Privacy & Beveiliging

Wavi is ontworpen met **privacy-first principes**:

- 🔒 **Alleen Lokale Verwerking** - Hand tracking gebeurt volledig in je browser
- 🚫 **Nul Data Verzameling** - Geen persoonlijke data, afbeeldingen, of gebaren worden opgeslagen
- 📹 **Camera Controle** - Jij bepaalt wanneer de camera actief is
- 🌐 **Geen Netwerk Verzoeken** - Extensie werkt volledig offline
- 🔐 **Standaard Permissies** - Vraagt alleen noodzakelijke camera toegang

## 🤝 Bijdragen

We verwelkomen bijdragen! Bekijk onze bijdrage richtlijnen en voel je vrij om:

- 🐛 **Bugs Rapporteren** - Help ons verbeteren door problemen te melden
- 💡 **Functies Voorstellen** - Deel ideeën voor nieuwe gebaren of functionaliteit
- 🔧 **PRs Indienen** - Draag code verbeteringen of nieuwe functies bij
- 📖 **Docs Verbeteren** - Help om onze documentatie nog beter te maken

## 📄 Licentie

Dit project is gelicenseerd onder de MIT Licentie - zie het [LICENSE](LICENSE) bestand voor details.

## 🙏 Dankbetuigingen

- **Google MediaPipe** - Voor de ongelooflijke hand tracking technologie
- **Chrome Extensions API** - Voor het leveren van het platform
- **Open Source Community** - Voor inspiratie en continue verbetering

---

<div align="center">

**Gemaakt met ❤️ voor een toegankelijker web**

[Documentatie](./docs/DOCUMENTATION.md) • [API Referentie](./docs/API-REFERENCE.md) • [Probleemoplossing](./docs/TROUBLESHOOTING.md)

</div>

## Licentie

MIT Licentie