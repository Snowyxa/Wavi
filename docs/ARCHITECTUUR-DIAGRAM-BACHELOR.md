# Wavi Browser Extension – Key Architecture Diagrams

Below are the most relevant diagrams for your bachelor paper. You can copy the Mermaid code blocks directly into your thesis or use them as a basis for graphical tools.

---

## 1. Component Diagram

```mermaid
graph TD
    subgraph Browser_Extension
        PH[popup.html]
        SW[service-worker.js]
        CS[content.js]
        MF[manifest.json]
        CF[config.js]
    end
    subgraph Core_System
        POPUP_CTRL[core/popup.js]
        TRACKING_MGR[core/trackingManager.js]
    end
    subgraph UI_Components
        STATUS_MGR[ui/statusManager.js]
        THEME_MGR[ui/themeManager.js]
        SETTINGS_UI[ui/settingsUI.js]
        HAND_VIS[ui/handVisualization.js]
    end
    subgraph Modules
        HT[modules/handTracking.js]
        GD[modules/gestureDetection.js]
        SM[modules/smoothing.js]
        CM[modules/communication.js]
        CU[modules/cameraUtils.js]
        SETTINGS[modules/settings.js]
        LOC[modules/localization.js]
    end
    subgraph MediaPipe_Libraries
        MPH[lib/hands.js]
        MPCU[lib/camera_utils.js]
        MPDU[lib/drawing_utils.js]
    end
    PH --> POPUP_CTRL
    POPUP_CTRL --> TRACKING_MGR
    POPUP_CTRL --> STATUS_MGR
    POPUP_CTRL --> THEME_MGR
    POPUP_CTRL --> SETTINGS_UI
    POPUP_CTRL --> HT
    POPUP_CTRL --> GD
    POPUP_CTRL --> SM
    POPUP_CTRL --> CM
    POPUP_CTRL --> CU
    POPUP_CTRL --> SETTINGS
    POPUP_CTRL --> LOC
    TRACKING_MGR --> HAND_VIS
    TRACKING_MGR --> STATUS_MGR
    HT --> MPH
    CU --> MPCU
    HAND_VIS --> MPDU
    SETTINGS_UI --> SETTINGS
    SETTINGS_UI --> THEME_MGR
    SETTINGS_UI --> LOC
    STATUS_MGR --> LOC
    THEME_MGR --> SETTINGS
    CM --> SW
    SW --> CS
    CS --> PH
```

---

## 2. Data Flow Diagram

```mermaid
graph TD
    Camera[WebRTC Camera API]
    Camera -->|Video Stream| TrackingManager[core/trackingManager.js]
    TrackingManager -->|Frames| HandTracking[modules/handTracking.js]
    HandTracking -->|Landmarks| GestureDetection[modules/gestureDetection.js]
    GestureDetection -->|Gesture| Smoothing[modules/smoothing.js]
    Smoothing -->|Commands| Communication[modules/communication.js]
    Communication -->|Messages| ServiceWorker[service-worker.js]
    ServiceWorker -->|Commands| ContentScript[content.js]
    ContentScript -->|DOM Manipulation| VirtualCursor[Virtual Cursor]
    ContentScript -->|Scroll| WebPage[Any Web Page]
    VirtualCursor --> WebPage
```

---

## 3. Sequence Diagram: Hand Gesture to Cursor Move

```mermaid
sequenceDiagram
    participant User
    participant Camera
    participant TrackingManager
    participant HandTracking
    participant GestureDetection
    participant Smoothing
    participant Communication
    participant ServiceWorker
    participant ContentScript
    participant WebPage
    User->>Camera: Show hand gesture
    Camera->>TrackingManager: Video stream
    TrackingManager->>HandTracking: Video frames
    HandTracking->>GestureDetection: Hand landmarks
    GestureDetection->>Smoothing: Gesture data
    Smoothing->>Communication: Smoothed commands
    Communication->>ServiceWorker: Send command
    ServiceWorker->>ContentScript: Forward command
    ContentScript->>WebPage: Move cursor / scroll
```

---

## 4. State Diagram: Extension Operation

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Tracking: Camera enabled
    Tracking --> GestureDetected: Hand gesture recognized
    GestureDetected --> ActionSent: Command generated
    ActionSent --> Tracking: Await next gesture
    Tracking --> Idle: Camera disabled
```

---

These diagrams are suitable for academic papers and clearly show the architecture, data flow, dynamic behavior, and states of your browser extension.
