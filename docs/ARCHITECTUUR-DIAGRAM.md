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
            PJ[popup.js]
            PS[styles.css]
            PH --> PJ
            PH --> PS
        end
        
        subgraph "Background Process"
            SW[service-worker.js]
        end
        
        subgraph "Content Scripts"
            CS[content.js]
            CSS[content-styles.css]
            CS --> CSS
        end
        
        subgraph "Configuration"
            CF[config.js]
            MF[manifest.json]
        end
    end
    
    %% Core Modules
    subgraph "Core Modules"
        HT[handTracking.js]
        GD[gestureDetection.js]
        SM[smoothing.js]
        CM[communication.js]
        CU[cameraUtils.js]
    end
    
    %% MediaPipe Libraries
    subgraph "MediaPipe Libraries"
        MPH[hands.js]
        MPCU[camera_utils.js]
        MPDU[drawing_utils.js]
        MPWASM[hands_solution_simd_wasm_bin.js]
        MPAL[hands_solution_packed_assets_loader.js]
    end
    
    %% External APIs and Hardware
    subgraph "Browser APIs & Hardware"
        WRTC[WebRTC Camera API]
        CV[Canvas API]
        DOM[DOM API]
        TABS[Chrome Tabs API]
        MSG[Chrome Runtime Messaging]
    end
    
    %% Web Pages
    subgraph "Target Web Pages"
        WP1[Any Website]
        WP2[YouTube]
        WP3[Other Sites]
        CURSOR[Virtual Cursor]
    end
    
    %% Connection Flow - Initialization
    CF --> PJ
    MF --> SW
    MF --> CS
    
    %% Module Dependencies
    PJ --> HT
    PJ --> GD
    PJ --> SM
    PJ --> CM
    PJ --> CU
    
    %% MediaPipe Integration
    HT --> MPH
    CU --> MPCU
    PJ --> MPDU
    MPH --> MPWASM
    MPH --> MPAL
    
    %% Browser API Usage
    CU --> WRTC
    PJ --> CV
    CS --> DOM
    SW --> TABS
    CM --> MSG
    SW --> MSG
    
    %% Communication Flow
    PJ -.->|Messages| SW
    SW -.->|Forward Messages| CS
    CS -.->|Response| SW
    SW -.->|Response| PJ
    
    %% Data Flow
    WRTC -->|Video Stream| PJ
    PJ -->|Video Frames| HT
    HT -->|Hand Landmarks| GD
    GD -->|Gesture Data| SM
    SM -->|Smoothed Position| CM
    CM -->|Cursor Commands| SW
    SW -->|Cursor Commands| CS
    CS -->|DOM Manipulation| CURSOR
    
    %% Target Page Integration
    CS --> WP1
    CS --> WP2
    CS --> WP3
    CURSOR --> WP1
    CURSOR --> WP2
    CURSOR --> WP3
    
    %% Styling
    classDef popup fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    classDef module fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef mediapipe fill:#fff3e0,stroke:#f57800,stroke-width:2px
    classDef browser fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef webpage fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef config fill:#f1f8e9,stroke:#689f38,stroke-width:2px
    
    class PH,PJ,PS,SW,CS,CSS popup
    class HT,GD,SM,CM,CU module
    class MPH,MPCU,MPDU,MPWASM,MPAL mediapipe
    class WRTC,CV,DOM,TABS,MSG browser
    class WP1,WP2,WP3,CURSOR webpage
    class CF,MF config
```

## Component Beschrijvingen

### Browser Extension Core
- **manifest.json**: Extensie configuratie en permissies
- **service-worker.js**: Background script voor communicatie tussen componenten
- **popup.html/js**: Hoofdinterface voor camera en hand tracking
- **content.js**: Script dat in webpagina's wordt geïnjecteerd voor cursor control

### Core Modules
- **handTracking.js**: MediaPipe integratie en hand landmark detectie
- **gestureDetection.js**: Vuist gesture herkenning voor klikken
- **smoothing.js**: Cursor beweging smoothing en stabilisatie
- **communication.js**: Chrome extension messaging tussen componenten
- **cameraUtils.js**: Camera initialisatie en stream management

### MediaPipe Libraries
- **hands.js**: Hoofd MediaPipe Hands API
- **camera_utils.js**: MediaPipe camera utilities
- **drawing_utils.js**: MediaPipe tekenfuncties
- **WASM binaries**: Gecompileerde machine learning modellen

### Data Flow
1. **Camera Input**: WebRTC API levert video stream aan popup
2. **Hand Detection**: MediaPipe analyseert video frames voor hand landmarks
3. **Gesture Recognition**: Vuist detectie voor klik events
4. **Position Smoothing**: Cursor bewegingen worden gestabiliseerd
5. **Communication**: Commands worden via service worker naar content script gestuurd
6. **DOM Manipulation**: Content script creëert en beweegt virtuele cursor op webpagina's

### Communication Architecture
- **Popup ↔ Service Worker**: Runtime messaging voor commands
- **Service Worker ↔ Content Script**: Tab messaging voor cursor control
- **Content Script ↔ DOM**: Directe DOM manipulatie voor cursor weergave

### Security Model
- **Manifest V3**: Moderne security met service workers
- **Content Security Policy**: Beperkte script execution
- **Local Processing**: Alle hand tracking gebeurt lokaal (privacy)
- **Minimal Permissions**: Alleen activeTab en scripting permissions

## Technische Stack
- **Framework**: Chrome Extension Manifest V3
- **Machine Learning**: MediaPipe Hands (Google)
- **Video Processing**: WebRTC Camera API
- **Rendering**: HTML5 Canvas API
- **Styling**: CSS3 met moderne UI patterns
- **Communication**: Chrome Extension APIs
