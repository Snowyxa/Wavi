// modules/localization.js - Localization management
// This module handles internationalization for the Wavi extension

/**
 * Localization Manager
 * Handles language switching and text translations
 */
class LocalizationManager {
  constructor() {
    this.currentLanguage = 'nl'; // Default to Dutch
    this.supportedLanguages = ['nl', 'en'];
    this.translations = {
      nl: {
        // Extension info
        extensionName: 'Wavi - Handgebaar Besturing',
        extensionDescription: 'Automatisch startende handgebaar besturing met mooie moderne interface. Wijs om te bewegen, vuist om te klikken - geen knoppen vereist!',
        
        // Main UI
        gestureControl: 'Gebaar Besturing',
        initializing: 'Initialiseren...',
        startingCamera: 'Camera opstarten...',
        allProcessingLocal: 'Alle verwerking gebeurt lokaal op je apparaat',
        
        // Status messages
        ready: 'Klaar',
        detecting: 'Detecteren',
        active: 'Actief',
        connecting: 'Verbinden',
        error: 'Fout',
        cameraPermissionNeeded: 'Camera permissie vereist',
        cameraStarting: 'Camera opstarten...',
        
        // Settings panel
        settings: 'Instellingen',
        calibrationSensitivitySettings: 'Kalibratie & Gevoeligheid Instellingen',
        closeSettings: 'Instellingen Sluiten',
        
        // Appearance section
        appearance: 'Uiterlijk',
        themeMode: 'Thema Modus',
        themeModeDescription: 'Schakel tussen lichte en donkere modus',
        lightMode: 'Lichte Modus',
        darkMode: 'Donkere Modus',
        toggleTheme: 'Wissel Thema',
        
        // Language section
        language: 'Taal',
        languageSelection: 'Taal Selectie',
        languageDescription: 'Kies je voorkeurstaal voor de interface',
        dutch: 'Nederlands',
        english: 'Engels',
        
        // Hand tracking sensitivity
        handTrackingSensitivity: 'Handvolging Gevoeligheid',
        horizontalMovementSensitivity: 'Horizontale Beweging Gevoeligheid',
        horizontalSensitivityDescription: 'Controleert hoeveel de cursor horizontaal beweegt in reactie op handbeweging',
        verticalMovementSensitivity: 'Verticale Beweging Gevoeligheid',
        verticalSensitivityDescription: 'Past verticale bewegingsgevoeligheid aan relatief ten opzichte van horizontaal',
        normalSpeed: 'normale snelheid',
        current: 'Huidig',
        
        // Movement smoothing
        movementSmoothing: 'Beweging Stabilisatie',
        smoothingFactor: 'Stabilisatie Factor',
        smoothingFactorDescription: 'Hogere waarden verminderen cursor trillingen maar kunnen minder responsief aanvoelen',
        smoothingApplied: 'stabilisatie toegepast',
        movementThreshold: 'Beweging Drempel',
        movementThresholdDescription: 'Minimale handbeweging vereist om de cursor te bewegen',
        minimumMovement: 'minimale beweging',
        deadZoneRadius: 'Dode Zone Straal',
        deadZoneRadiusDescription: 'Grootte van het gebied rond de cursor waar kleine bewegingen worden genegeerd',
        deadZoneRadius2: 'dode zone straal',
        
        // Gesture detection
        gestureDetection: 'Gebaar Detectie',
        fistDetectionConfidence: 'Vuist Detectie Vertrouwen',
        fistConfidenceDescription: 'Hoe zeker het systeem moet zijn dat je een vuist maakt',
        confidenceRequired: 'vertrouwen vereist',
        requiredFistFrames: 'Vereiste Vuist Frames',
        fistFramesDescription: 'Aantal opeenvolgende frames waarin een vuist moet worden gedetecteerd',
        framesRequired: 'frames vereist',
        clickCooldown: 'Klik Afkoeling',
        clickCooldownDescription: 'Minimale tijd tussen klikken om onbedoelde dubbele klikken te voorkomen',
        cooldownPeriod: 'afkoelperiode',
        
        // Calibration
        calibration: 'Kalibratie',
        runAutoCalibration: 'Voer Auto-Kalibratie Uit',
        autoCalibrationHelp: 'Auto-kalibratie past instellingen aan op basis van je schermgrootte en typische gebruikspatronen.',
        
        // Settings actions
        resetToDefaults: 'Herstel Standaard',
        saveSettings: 'Instellingen Opslaan',
        settingsSaved: 'Instellingen opgeslagen!',
        settingsReset: 'Instellingen hersteld naar standaard!',
        calibrationComplete: 'Kalibratie voltooid!',
        
        // Usage instructions (if needed)
        pointToMove: 'Wijs om te bewegen',
        fistToClick: 'Vuist om te klikken',
        
        // Error messages
        cameraError: 'Camera fout',
        permissionDenied: 'Permissie geweigerd',
        initializationFailed: 'Initialisatie mislukt'
      },
      
      en: {
        // Extension info
        extensionName: 'Wavi - Hand Gesture Control',
        extensionDescription: 'Auto-starting hand gesture control with beautiful modern interface. Point to move, fist to click - no buttons required!',
        
        // Main UI
        gestureControl: 'Gesture Control',
        initializing: 'Initializing...',
        startingCamera: 'Starting camera...',
        allProcessingLocal: 'All processing happens locally on your device',
        
        // Status messages
        ready: 'Ready',
        detecting: 'Detecting',
        active: 'Active',
        connecting: 'Connecting',
        error: 'Error',
        cameraPermissionNeeded: 'Camera permission needed',
        cameraStarting: 'Starting camera...',
        
        // Settings panel
        settings: 'Settings',
        calibrationSensitivitySettings: 'Calibration & Sensitivity Settings',
        closeSettings: 'Close Settings',
        
        // Appearance section
        appearance: 'Appearance',
        themeMode: 'Theme Mode',
        themeModeDescription: 'Switch between light and dark mode',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',
        toggleTheme: 'Toggle Theme',
        
        // Language section
        language: 'Language',
        languageSelection: 'Language Selection',
        languageDescription: 'Choose your preferred interface language',
        dutch: 'Dutch',
        english: 'English',
        
        // Hand tracking sensitivity
        handTrackingSensitivity: 'Hand Tracking Sensitivity',
        horizontalMovementSensitivity: 'Horizontal Movement Sensitivity',
        horizontalSensitivityDescription: 'Controls how much the cursor moves horizontally in response to hand movement',
        verticalMovementSensitivity: 'Vertical Movement Sensitivity',
        verticalSensitivityDescription: 'Adjusts vertical movement sensitivity relative to horizontal',
        normalSpeed: 'normal speed',
        current: 'Current',
        
        // Movement smoothing
        movementSmoothing: 'Movement Smoothing',
        smoothingFactor: 'Smoothing Factor',
        smoothingFactorDescription: 'Higher values reduce cursor jitter but may feel less responsive',
        smoothingApplied: 'smoothing applied',
        movementThreshold: 'Movement Threshold',
        movementThresholdDescription: 'Minimum hand movement required to move the cursor',
        minimumMovement: 'minimum movement',
        deadZoneRadius: 'Dead Zone Radius',
        deadZoneRadiusDescription: 'Size of the area around the cursor where small movements are ignored',
        deadZoneRadius2: 'dead zone radius',
        
        // Gesture detection
        gestureDetection: 'Gesture Detection',
        fistDetectionConfidence: 'Fist Detection Confidence',
        fistConfidenceDescription: 'How confident the system must be that you are making a fist',
        confidenceRequired: 'confidence required',
        requiredFistFrames: 'Required Fist Frames',
        fistFramesDescription: 'Number of consecutive frames a fist must be detected',
        framesRequired: 'frames required',
        clickCooldown: 'Click Cooldown',
        clickCooldownDescription: 'Minimum time between clicks to prevent accidental double-clicks',
        cooldownPeriod: 'cooldown period',
        
        // Calibration
        calibration: 'Calibration',
        runAutoCalibration: 'Run Auto-Calibration',
        autoCalibrationHelp: 'Auto-calibration adjusts settings based on your screen size and typical usage patterns.',
        
        // Settings actions
        resetToDefaults: 'Reset to Defaults',
        saveSettings: 'Save Settings',
        settingsSaved: 'Settings saved!',
        settingsReset: 'Settings reset to defaults!',
        calibrationComplete: 'Calibration complete!',
        
        // Usage instructions (if needed)
        pointToMove: 'Point to move',
        fistToClick: 'Fist to click',
        
        // Error messages
        cameraError: 'Camera error',
        permissionDenied: 'Permission denied',
        initializationFailed: 'Initialization failed'
      }
    };
  }

  /**
   * Initialize localization system
   */
  async initialize() {
    try {
      // Load saved language preference
      const savedLanguage = await this.loadLanguagePreference();
      if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
        this.currentLanguage = savedLanguage;
      }
      
      console.log(`Localization initialized with language: ${this.currentLanguage}`);
      return true;
    } catch (error) {
      console.error('Failed to initialize localization:', error);
      return false;
    }
  }

  /**
   * Load language preference from storage
   */
  async loadLanguagePreference() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        const result = await chrome.storage.sync.get(['waviLanguage']);
        return result.waviLanguage;
      } else {
        return localStorage.getItem('waviLanguage');
      }
    } catch (error) {
      console.warn('Failed to load language preference:', error);
      return null;
    }
  }

  /**
   * Save language preference to storage
   */
  async saveLanguagePreference(language) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        await chrome.storage.sync.set({ waviLanguage: language });
      } else {
        localStorage.setItem('waviLanguage', language);
      }
      console.log(`Language preference saved: ${language}`);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }

  /**
   * Get current language
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Set current language
   */
  async setLanguage(language) {
    if (!this.supportedLanguages.includes(language)) {
      console.warn(`Unsupported language: ${language}`);
      return false;
    }
    
    this.currentLanguage = language;
    await this.saveLanguagePreference(language);
    
    // Update UI
    this.updateUI();
    
    // Dispatch language change event
    window.dispatchEvent(new CustomEvent('waviLanguageChanged', {
      detail: { language: this.currentLanguage }
    }));
    
    console.log(`Language changed to: ${language}`);
    return true;
  }

  /**
   * Get translation for a key
   */
  t(key, fallback = null) {
    const translation = this.translations[this.currentLanguage]?.[key];
    if (translation) {
      return translation;
    }
    
    // Try English as fallback
    const englishTranslation = this.translations['en']?.[key];
    if (englishTranslation) {
      return englishTranslation;
    }
    
    // Return fallback or key
    return fallback || key;
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  /**
   * Update UI with current language
   */
  updateUI() {
    // Update all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (element.tagName === 'INPUT' && element.type === 'text') {
        element.placeholder = translation;
      } else if (element.hasAttribute('title')) {
        element.title = translation;
      } else if (element.hasAttribute('aria-label')) {
        element.setAttribute('aria-label', translation);
      } else {
        element.textContent = translation;
      }
    });

    // Update specific content that might need special handling
    this.updateSpecialContent();
  }

  /**
   * Update content that needs special handling
   */
  updateSpecialContent() {
    // Update manifest.json name and description if needed (this would require reloading extension)
    // Update page title
    const titleElement = document.querySelector('title');
    if (titleElement) {
      titleElement.textContent = this.t('extensionName');
    }
    
    // Update any dynamic content
    const statusLabels = document.querySelectorAll('.status-label');
    statusLabels.forEach(label => {
      if (label.textContent.includes('Initializing')) {
        label.textContent = this.t('initializing');
      }
    });
  }

  /**
   * Get language display name
   */
  getLanguageDisplayName(languageCode) {
    const names = {
      'nl': this.t('dutch'),
      'en': this.t('english')
    };
    return names[languageCode] || languageCode;
  }
}

// Create global instance
window.LocalizationManager = LocalizationManager;
window.localizationManager = new LocalizationManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LocalizationManager;
}
