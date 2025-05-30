# Wavi Browserextensie Architectuur

Dit document bevat een gedetailleerde architectuurdiagram van de Wavi hand gesture control browserextensie.

## Architectuur Overzicht

Het volgende Mermaid-diagram toont de complete architectuur van de Wavi browserextensie, inclusief alle componenten, modules, communicatieflows en data stromen:

```mermaid
graph TB
    %% Browser Extension Components
    subgraph "Browser Extension (Manifest V3)"
        subgraph "Popup Interface"
            PH[popup.html]
            CSS_STYLES[css/styles.css]
            CSS_THEME[css/theme-additions.css]
            CSS_BUTTON[css/button-styles.css]
            PH --> CSS_STYLES
            PH --> CSS_THEME
            PH --> CSS_BUTTON
        end
        
        subgraph "Background Process"
            SW[service-worker.js]
        end
        
        subgraph "Content Scripts"
            CS[content.js]
            CSS_CONTENT[css/content-styles.css]
            CS --> CSS_CONTENT
        end
        
        subgraph "Configuration"
            CF[config.js]
            MF[manifest.json]
        end
    end
    
    %% Core Architecture
    subgraph "Core System"
        POPUP_CTRL[core/popup.js]
        TRACKING_MGR[core/trackingManager.js]
        POPUP_CTRL --> TRACKING_MGR
    end
    
    %% UI Components
    subgraph "UI Components"
        STATUS_MGR[ui/statusManager.js]
        THEME_MGR[ui/themeManager.js]
        SETTINGS_UI[ui/settingsUI.js]
        HAND_VIS[ui/handVisualization.js]
    end
      %% Core Modules
    subgraph "Core Modules"
        HT[modules/handTracking.js]
        GD[modules/gestureDetection.js]
        SM[modules/smoothing.js]
        CM[modules/communication.js]
        CU[modules/cameraUtils.js]
        SETTINGS[modules/settings.js]
        LOC[modules/localization.js]
    end
    
    %% MediaPipe Libraries
    subgraph "MediaPipe Libraries"
        MPH[lib/hands.js]
        MPCU[lib/camera_utils.js]
        MPDU[lib/drawing_utils.js]
        MPWASM[lib/hands_solution_simd_wasm_bin.js]
        MPAL[lib/hands_solution_packed_assets_loader.js]
        MPDATA[lib/hands_solution_packed_assets.data]
        MPBIN[lib/hands.binarypb]
        MPTFLITE[lib/hand_landmark_full.tflite]
    end
            
    %% External APIs and Hardware
    subgraph "Browser APIs & Hardware"
        WRTC[WebRTC Camera API]
        CV[Canvas API]
        DOM[DOM API]
        TABS[Chrome Tabs API]
        MSG[Chrome Runtime Messaging]
        STORAGE[Chrome Storage API]
    end
    
    %% Web Pages
    subgraph "Target Web Pages"
        WP1[Any Website]
        WP2[YouTube]
        WP3[Other Sites]
        CURSOR[Virtual Cursor]
    end
      %% Connection Flow - Initialization (Updated 2025)
    CF --> POPUP_CTRL
    MF --> SW
    MF --> CS
    
    %% Core System Dependencies
    POPUP_CTRL --> STATUS_MGR
    POPUP_CTRL --> THEME_MGR
    POPUP_CTRL --> SETTINGS_UI
    POPUP_CTRL --> LOC
    TRACKING_MGR --> HAND_VIS
    TRACKING_MGR --> STATUS_MGR
    
    %% Module Dependencies
    POPUP_CTRL --> HT
    POPUP_CTRL --> GD
    POPUP_CTRL --> SM
    POPUP_CTRL --> CM    POPUP_CTRL --> CU
    POPUP_CTRL --> SETTINGS
    POPUP_CTRL --> LOC
    
    TRACKING_MGR --> HT
    TRACKING_MGR --> GD
    TRACKING_MGR --> SM
    TRACKING_MGR --> CM
    
    %% UI Component Dependencies
    SETTINGS_UI --> SETTINGS
    SETTINGS_UI --> THEME_MGR
    SETTINGS_UI --> LOC
    STATUS_MGR --> LOC
    HAND_VIS --> MPDU
    
    %% MediaPipe Integration
    HT --> MPH
    CU --> MPCU
    MPH --> MPWASM
    MPH --> MPAL
    MPH --> MPDATA
    MPH --> MPBIN
    MPH --> MPTFLITE
    
    %% Browser API Usage
    CU --> WRTC
    HAND_VIS --> CV
    CS --> DOM
    SW --> TABS
    CM --> MSG    SW --> MSG
    SETTINGS --> STORAGE
    THEME_MGR --> STORAGE
    LOC --> STORAGE
    
    %% Communication Flow
    POPUP_CTRL -.->|Messages| SW
    SW -.->|Forward Messages| CS
    CS -.->|Response| SW
    SW -.->|Response| POPUP_CTRL
    
    %% Data Flow
    WRTC -->|Video Stream| TRACKING_MGR
    TRACKING_MGR -->|Video Frames| HT
    HT -->|Hand Landmarks| GD
    GD -->|Gesture Data (Fist, Peace)| SM
    SM -->|Smoothed Position, Scroll Commands| CM
    CM -->|Cursor Commands, Scroll Commands| SW
    SW -->|Cursor Commands, Scroll Commands| CS
    CS -->|DOM Manipulation, Scroll Actions| CURSOR
    CS -->|Scroll Actions| WP1
    CS -->|Scroll Actions| WP2
    CS -->|Scroll Actions| WP3
    
    %% Settings Flow
    SETTINGS_UI -->|Configuration| SETTINGS
    SETTINGS -->|Settings Data| HT
    SETTINGS -->|Settings Data| GD
    SETTINGS -->|Settings Data| SM
    
    %% Target Page Integration
    CS --> WP1
    CS --> WP2
    CS --> WP3
    CURSOR --> WP1
    CURSOR --> WP2
    CURSOR --> WP3
    
    %% Styling
    classDef core fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    classDef ui fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef module fill:#fff3e0,stroke:#f57800,stroke-width:2px
    classDef mediapipe fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    classDef browser fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef webpage fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef config fill:#f1f8e9,stroke:#689f38,stroke-width:2px
    classDef css fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    
    class POPUP_CTRL,TRACKING_MGR core
    class STATUS_MGR,THEME_MGR,SETTINGS_UI,HAND_VIS ui
    class HT,GD,SM,CM,CU,SETTINGS module
    class MPH,MPCU,MPDU,MPWASM,MPAL,MPDATA,MPBIN,MPTFLITE mediapipe
    class WRTC,CV,DOM,TABS,MSG,STORAGE browser
    class WP1,WP2,WP3,CURSOR webpage
    class CF,MF config
    class CSS_STYLES,CSS_THEME,CSS_BUTTON,CSS_CONTENT css
    class PH,SW,CS core
```

## Component Beschrijvingen

### Browser Extension Core
- **manifest.json**: Extensie configuratie en permissies
- **service-worker.js**: Background script voor communicatie tussen componenten
- **popup.html**: Hoofdinterface voor camera en hand tracking
- **content.js**: Script dat in webpagina's wordt geïnjecteerd voor cursor control
- **config.js**: Centrale configuratie instellingen

### Core System
- **core/popup.js**: Hoofdcontroller die alle componenten coördineert
- **core/trackingManager.js**: Beheert de complete hand tracking lifecycle en coördinatie

### UI Components
- **ui/statusManager.js**: Beheert UI status updates en state management
- **ui/themeManager.js**: Handelt light/dark theme switching af
- **ui/settingsUI.js**: Beheert settings panel interacties en UI updates
- **ui/handVisualization.js**: Visualiseert hand landmarks en feedback op canvas

### Core Modules
- **modules/handTracking.js**: MediaPipe integratie en hand landmark detectie
- **modules/gestureDetection.js**: Vuist gesture herkenning voor klikken en Peace-teken herkenning voor scrollen
- **modules/smoothing.js**: Cursor beweging smoothing en stabilisatie, verwerkt scroll commando's
- **modules/communication.js**: Chrome extension messaging tussen componenten
- **modules/cameraUtils.js**: Camera initialisatie en stream management
- **modules/settings.js**: Configuratie opslag en beheer met Chrome Storage API
- **modules/localization.js**: Meertalige ondersteuning met Dutch/English talen

### CSS Styling
- **css/styles.css**: Hoofdstijlen voor popup interface
- **css/theme-additions.css**: Dark/light theme specifieke stijlen
- **css/button-styles.css**: Button styling en animaties
- **css/content-styles.css**: Stijlen voor de cursor overlay in webpagina's

### MediaPipe Libraries
- **lib/hands.js**: Hoofd MediaPipe Hands API
- **lib/camera_utils.js**: MediaPipe camera utilities
- **lib/drawing_utils.js**: MediaPipe tekenfuncties voor hand visualisatie
- **lib/hands_solution_simd_wasm_bin.js**: WASM binaries voor hand detection
- **lib/hands_solution_packed_assets_loader.js**: Asset loader voor MediaPipe modellen
- **lib/hands_solution_packed_assets.data**: Gecompileerde model data
- **lib/hands.binarypb**: Protocol buffer model definitie
- **lib/hand_landmark_full.tflite**: TensorFlow Lite model voor hand landmarks

### Data Flow
1. **Camera Input**: WebRTC API levert video stream aan tracking manager
2. **Hand Detection**: MediaPipe analyseert video frames voor hand landmarks
3. **Gesture Recognition**: Vuist detectie voor klik events; Peace-teken detectie voor scroll events (up/down)
4. **Position Smoothing & Scroll Command Generation**: Cursor bewegingen worden gestabiliseerd; scroll commando's worden gegenereerd op basis van peace-gebaar
5. **Settings Integration**: Configuratie wordt toegepast op alle modules, inclusief gesture detectie parameters
6. **Communication**: Klik- en scroll-commando's worden via service worker naar content script gestuurd
7. **DOM Manipulation & Scrolling**: Content script creëert en beweegt virtuele cursor, en voert scroll acties uit op webpagina's

### Communication Architecture
- **Popup Controller ↔ Service Worker**: Runtime messaging voor klik- en scroll-commando's
- **Service Worker ↔ Content Script**: Tab messaging voor cursor control en scroll acties
- **Content Script ↔ DOM**: Directe DOM manipulatie voor cursor weergave en het uitvoeren van scroll events
- **Settings Module ↔ Chrome Storage**: Persistente configuratie opslag
- **UI Components ↔ Core Modules**: Interne module communicatie

### Security Model
- **Manifest V3**: Moderne security met service workers
- **Content Security Policy**: Beperkte script execution
- **Local Processing**: Alle hand tracking gebeurt lokaal (privacy)
- **Minimal Permissions**: Alleen activeTab, scripting en storage permissions
- **Isolated Components**: Modulaire architectuur voorkomt cross-contamination

### Modern Architecture Benefits
- **Separation of Concerns**: Duidelijke scheiding tussen UI, core logic en modules
- **Maintainability**: Modulaire structuur maakt onderhoud en updates eenvoudiger
- **Testability**: Geïsoleerde componenten zijn beter testbaar
- **Scalability**: Nieuwe functies kunnen worden toegevoegd zonder bestaande code te verstoren
- **Performance**: Optimale resource loading en management

## Technische Stack
- **Framework**: Chrome Extension Manifest V3
- **Machine Learning**: MediaPipe Hands (Google) met TensorFlow Lite
- **Video Processing**: WebRTC Camera API
- **Rendering**: HTML5 Canvas API met hardware acceleratie
- **Styling**: CSS3 met moderne UI patterns en theme support
- **Communication**: Chrome Extension APIs (Runtime, Tabs, Storage)
- **Architecture**: Modular component-based design
- **Performance**: Optimized WASM binaries en lokale ML processing

---

## Architectuur Status (Laatste Update: 30 Mei 2025)

### ✅ Huidige Implementatie Status
- **Modulaire Structuur**: Volledig geïmplementeerd met core/, ui/, modules/, css/ folders
- **Script Loading**: Geoptimaliseerde dependency order in popup.html
- **File Organization**: Alle componenten correct georganiseerd volgens architectuur
- **Documentation**: Architectuur en project structure documentatie up-to-date

### 🔧 Recente Wijzigingen
- Tracking-worker.js reference verwijderd uit manifest.json (niet geïmplementeerd)
- Icon reference gecorrigeerd naar WaviExtensionLogo.png
- Technische documentatie geüpdatet voor modulaire architectuur
- Module loading order gedocumenteerd
- Peace-teken scroll functionaliteit toegevoegd en gedocumenteerd in architectuur.

### 📋 Architectuur Compliance
- **98%** - Architectuur documentatie accuraat met werkelijke implementatie, inclusief peace-scroll.
- **Alle modules** bestaan en functioneren volgens specificatie
- **Dependencies** correct gedefinieerd en geladen
- **No breaking changes** - backwards compatible updates
