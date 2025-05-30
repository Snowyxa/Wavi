// popup.js - Main hand tracking extension popup
// Auto-starting version with modern UI

// DOM elements
let video;
let canvas;
let ctx;

// Tracking state
let lastClickPosition = null;
let currentStream = null;
let currentCamera = null;
let isTrackingStarted = false;

// Settings state
let settingsPanel = null;
let settingsOverlay = null;

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
  initializePopup();
  await initializeSettings();
  
  // Initialize theme
  initializeTheme();
  
  // Auto-start tracking after initialization
  setTimeout(() => {
    if (!isTrackingStarted) {
      startTracking();
    }
  }, 1000);
});

// Handle window resize to maintain canvas dimensions
window.addEventListener('resize', function() {
  if (canvas) {
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
      const containerWidth = videoContainer.offsetWidth;
      const containerHeight = videoContainer.offsetHeight;
      
      canvas.width = containerWidth;
      canvas.height = containerHeight;
      
      console.log(`Canvas resized on window resize: ${containerWidth}x${containerHeight}`);
    }
  }
});

/**
 * Wait for required modules to load
 */
async function waitForModules() {
  const maxAttempts = 50;
  const delay = 100;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (window.Settings && 
        window.HandTracking && 
        window.GestureDetection && 
        window.Smoothing) {
      console.log('All modules loaded successfully');
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  console.warn('Some modules may not be loaded yet');
  return false;
}

/**
 * Initialize the popup interface
 */
function initializePopup() {
  // Get DOM elements
  video = document.getElementById('video');
  canvas = document.getElementById('output');
  ctx = canvas.getContext('2d');
  
  // Set canvas dimensions to match container for ultra-wide layout
  const videoContainer = document.querySelector('.video-container');
  if (videoContainer && canvas) {
    // Force canvas to match container size
    const containerWidth = videoContainer.offsetWidth;
    const containerHeight = videoContainer.offsetHeight;
    
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    console.log(`Canvas dimensions set: ${containerWidth}x${containerHeight}`);
  }
  
  // Configure video element
  if (video) {
    window.CameraUtils.configureVideoElement(video);
  }
  
  // Initialize MediaPipe Hands (async)
  initializeHandTracking();
  
  console.log('Popup initialized - Auto-starting tracking...');
}

/**
 * Initialize hand tracking asynchronously
 */
async function initializeHandTracking() {
  try {
    // Check if MediaPipe functions are available
    console.log('Checking MediaPipe availability:');
    console.log('- typeof Hands:', typeof Hands);
    console.log('- typeof Camera:', typeof Camera);
    console.log('- typeof drawConnectors:', typeof drawConnectors);
    console.log('- typeof drawLandmarks:', typeof drawLandmarks);
    console.log('- typeof HAND_CONNECTIONS:', typeof HAND_CONNECTIONS);
    console.log('- MediaPipeBasePath:', window.MediaPipeBasePath);
    
    // Check if essential MediaPipe components are loaded
    if (typeof Hands === 'undefined') {
      throw new Error('MediaPipe Hands library not loaded. Check that lib/hands.js is accessible.');
    }
    
    if (typeof Camera === 'undefined') {
      throw new Error('MediaPipe Camera utility not loaded. Check that lib/camera_utils.js is accessible.');
    }
    
    const handsInstance = await window.HandTracking.initializeMediaPipeHands();
    if (!handsInstance) {
      console.error('Failed to initialize MediaPipe Hands');
      updateUI('error', 'Failed to initialize hand tracking');
      return;
    }
    console.log('MediaPipe Hands initialized successfully');
  } catch (error) {
    console.error('Error initializing hand tracking:', error);
    updateUI('error', `Initialization failed: ${error.message}`);
  }
}

/**
 * Start hand tracking automatically
 */
async function startTracking() {
  if (isTrackingStarted) return;
  
  try {
    updateUI('starting');
    
    // Ensure MediaPipe is initialized
    if (!window.HandTracking.isCurrentlyTracking && typeof Hands === 'undefined') {
      console.log('Reinitializing MediaPipe Hands...');
      await initializeHandTracking();
    }
    
    // Check camera permission
    const hasPermission = await window.CameraUtils.checkCameraPermission();
    if (!hasPermission) {
      throw new Error('Camera permission required');
    }
    
    // Get tab dimensions
    const dimensions = await window.Communication.getTabDimensions();
    window.HandTracking.updateTabDimensions(dimensions);
      // Initialize video stream
    currentStream = await window.CameraUtils.initializeVideoStream(video);
    
    // Ensure canvas dimensions match container after video loads
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer && canvas) {
      const containerWidth = videoContainer.offsetWidth;
      const containerHeight = videoContainer.offsetHeight;
      
      canvas.width = containerWidth;
      canvas.height = containerHeight;
      
      console.log(`Canvas resized for tracking: ${containerWidth}x${containerHeight}`);
    }
    
    // Start hand tracking
    currentCamera = window.HandTracking.startHandTracking(video, canvas, onResults);
    
    isTrackingStarted = true;
    updateUI('tracking');
    console.log('Hand tracking started successfully');
    
  } catch (error) {
    console.error('Failed to start tracking:', error);
    const userMessage = window.CameraUtils.handleVideoError(error);
    updateUI('error', userMessage);
  }
}

/**
 * Stop hand tracking
 */
/**
 * Stop hand tracking
 */
function stopTracking() {
  try {
    // Stop hand tracking
    window.HandTracking.stopHandTracking();
    
    // Stop video stream
    if (currentStream) {
      window.CameraUtils.stopVideoStream(currentStream);
      currentStream = null;
    }
    
    // Clear canvas
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Remove cursor from content script
    window.Communication.sendCursorRemoval();
    
    // Reset state
    window.HandTracking.resetTrackingState();
    lastClickPosition = null;
    currentCamera = null;
    isTrackingStarted = false;
    
    updateUI('stopped');
    console.log('Hand tracking stopped');
    
  } catch (error) {
    console.error('Error stopping tracking:', error);
    updateUI('error', 'Failed to stop tracking');
  }
}

/**
 * Process MediaPipe hand tracking results
 * @param {Object} results - MediaPipe results object
 */
function onResults(results) {
  // Clear canvas
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
  
  const handDetected = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;
  
  // Handle hand detection state changes
  if (handDetected !== window.HandTracking.isHandCurrentlyVisible()) {
    window.HandTracking.setHandVisibility(handDetected);
    
    if (!handDetected) {
      // Reset gesture state when hand is lost
      window.HandTracking.resetTrackingState();
    }
  }
  
  if (handDetected) {
    // Process each detected hand
    for (const landmarks of results.multiHandLandmarks) {      // Draw hand landmarks and connections
      if (typeof drawConnectors === 'function' && typeof HAND_CONNECTIONS !== 'undefined') {
        drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 2
        });
      } else {
        console.warn('drawConnectors or HAND_CONNECTIONS not available - drawing basic connections');
        drawBasicHandConnections(ctx, landmarks);
      }
      
      if (typeof drawLandmarks === 'function') {
        drawLandmarks(ctx, landmarks, {
          color: '#FF0000',
          lineWidth: 1
        });
      } else {
        console.warn('drawLandmarks not available - drawing basic landmarks');
        drawBasicHandLandmarks(ctx, landmarks);
      }
      
      // Calculate cursor position
      const cursorPosition = window.HandTracking.calculateCursorPosition(landmarks);
      
      if (cursorPosition) {
        // Check for gesture detection
        const gestureDetected = window.GestureDetection.processFistDetection(landmarks);
        
        // Handle gesture state changes
        window.GestureDetection.handleGestureStateChange(
          gestureDetected,
          cursorPosition,
          handleClickEvent
        );
        
        // Send cursor movement (only if position is not locked)
        if (!window.GestureDetection.isPositionCurrentlyLocked()) {
          window.Communication.sendCursorMovement(
            cursorPosition.x,
            cursorPosition.y,
            true,
            gestureDetected
          );
        } else {
          // Send locked position
          const lockedPos = window.GestureDetection.getLockedPosition();
          if (lockedPos) {
            window.Communication.sendCursorMovement(
              lockedPos.x,
              lockedPos.y,
              true,
              gestureDetected
            );
          }
        }
      }
    }
  }
  
  ctx.restore();
}

/**
 * Handle click events from gesture detection
 * @param {number} x - Click X coordinate
 * @param {number} y - Click Y coordinate
 */
function handleClickEvent(x, y) {
  // Store click position
  lastClickPosition = { x, y };
  
  // Send click event to content script
  window.Communication.sendClickEvent(x, y);
  
  console.log(`Click event: x=${x}, y=${y}`);
}

/**
 * Update UI based on tracking state
 * @param {string} state - Current state ('starting', 'tracking', 'stopped', 'error')
 * @param {string} message - Optional message for error state
 */
/**
 * Update UI based on tracking state
 * @param {string} state - Current state ('starting', 'tracking', 'stopped', 'error')
 * @param {string} message - Optional message for error state
 */
function updateUI(state, message = '') {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const cameraStatus = document.getElementById('cameraStatus');
  const cameraOverlay = cameraStatus ? cameraStatus.parentElement : null;
  const statusPill = document.querySelector('.status-pill');
  const statusLabel = document.querySelector('.status-label');
  
  switch (state) {
    case 'starting':
      // Header status
      if (statusDot) {
        statusDot.className = 'status-dot connecting';
      }
      if (statusText) {
        statusText.textContent = 'Starting...';
      }
      
      // Camera overlay
      if (cameraOverlay) {
        cameraOverlay.classList.remove('hidden');
      }
      if (cameraStatus) {
        cameraStatus.innerHTML = '<div class="loading-spinner"></div><span>Starting camera...</span>';
      }
      
      // Footer status pill
      if (statusPill) {
        statusPill.className = 'status-pill';
      }
      if (statusLabel) {
        statusLabel.textContent = 'Initializing';
      }
      break;
      
    case 'tracking':
      // Header status
      if (statusDot) {
        statusDot.className = 'status-dot active';
      }
      if (statusText) {
        statusText.textContent = 'Active';
      }
      
      // Camera overlay
      if (cameraOverlay) {
        cameraOverlay.classList.add('hidden');
      }
      
      // Footer status pill
      if (statusPill) {
        statusPill.className = 'status-pill active';
      }
      if (statusLabel) {
        statusLabel.textContent = 'Tracking Active';
      }
      break;
      
    case 'stopped':
      // Header status
      if (statusDot) {
        statusDot.className = 'status-dot';
      }
      if (statusText) {
        statusText.textContent = 'Stopped';
      }
      
      // Camera overlay
      if (cameraOverlay) {
        cameraOverlay.classList.remove('hidden');
      }
      if (cameraStatus) {
        cameraStatus.innerHTML = '<span>Tracking stopped</span>';
      }
      
      // Footer status pill
      if (statusPill) {
        statusPill.className = 'status-pill';
      }
      if (statusLabel) {
        statusLabel.textContent = 'Tracking Stopped';
      }
      break;
      
    case 'error':
      // Header status
      if (statusDot) {
        statusDot.className = 'status-dot error';
      }
      if (statusText) {
        statusText.textContent = 'Error';
      }
      
      // Camera overlay
      if (cameraOverlay) {
        cameraOverlay.classList.remove('hidden');
      }
      if (cameraStatus) {
        cameraStatus.innerHTML = `<span>${message || 'Error occurred'}</span>`;
      }
      
      // Footer status pill
      if (statusPill) {
        statusPill.className = 'status-pill error';
      }
      if (statusLabel) {
        statusLabel.textContent = 'Error';
      }
      break;
  }
}

// Handle popup unload
window.addEventListener('beforeunload', function() {
  if (isTrackingStarted || window.HandTracking.isCurrentlyTracking()) {
    stopTracking();
  }
});

/**
 * Fallback function to draw basic hand connections when MediaPipe drawing utils aren't available
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} landmarks - Hand landmarks
 */
function drawBasicHandConnections(ctx, landmarks) {
  if (!landmarks || landmarks.length < 21) return;
  
  // Basic hand connections (simplified version of HAND_CONNECTIONS)
  const connections = [
    [0,1],[1,2],[2,3],[3,4],     // Thumb
    [0,5],[5,6],[6,7],[7,8],     // Index finger
    [5,9],[9,10],[10,11],[11,12], // Middle finger
    [9,13],[13,14],[14,15],[15,16], // Ring finger
    [13,17],[0,17],[17,18],[18,19],[19,20] // Pinky and palm
  ];
  
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 2;
  
  connections.forEach(([startIdx, endIdx]) => {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];
    
    if (start && end) {
      ctx.beginPath();
      ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
      ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
      ctx.stroke();
    }
  });
}

/**
 * Fallback function to draw basic hand landmarks when MediaPipe drawing utils aren't available
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} landmarks - Hand landmarks
 */
function drawBasicHandLandmarks(ctx, landmarks) {
  if (!landmarks || landmarks.length < 21) return;
  
  ctx.fillStyle = '#FF0000';
  
  landmarks.forEach((landmark, index) => {
    if (landmark) {
      const x = landmark.x * canvas.width;
      const y = landmark.y * canvas.height;
      
      ctx.beginPath();
      ctx.arc(x, y, index === 8 ? 4 : 2, 0, 2 * Math.PI); // Larger dot for index finger tip
      ctx.fill();
    }
  });
}

/**
 * Initialize settings panel and event handlers
 */
async function initializeSettings() {
  // Wait for modules to load
  await waitForModules();
  
  // Get DOM elements
  settingsPanel = document.getElementById('settingsPanel');
  settingsOverlay = document.getElementById('settingsOverlay');
  
  const settingsBtn = document.getElementById('settingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const resetSettingsBtn = document.getElementById('resetSettingsBtn');
  const autoCalibrateBtn = document.getElementById('autoCalibrateBtn');
  const themeToggle = document.getElementById('themeToggle');
  
  if (!settingsPanel || !settingsOverlay) {
    console.error('Settings UI elements not found');
    return;
  }
  
  // Event listeners
  settingsBtn?.addEventListener('click', openSettings);
  closeSettingsBtn?.addEventListener('click', closeSettings);
  
  // Close settings when clicking overlay (but not the panel itself)
  settingsOverlay?.addEventListener('click', (event) => {
    if (event.target === settingsOverlay) {
      closeSettings();
    }
  });
  
  saveSettingsBtn?.addEventListener('click', saveSettings);
  resetSettingsBtn?.addEventListener('click', resetSettings);
  autoCalibrateBtn?.addEventListener('click', runAutoCalibration);
  
  // Theme toggle
  themeToggle?.addEventListener('click', toggleTheme);
  
  // Preset buttons
  const presetButtons = document.querySelectorAll('.preset-card');
  presetButtons.forEach(button => {
    button.addEventListener('click', handlePresetSelection);
    button.addEventListener('keydown', handlePresetKeydown);
  });
  
  // Slider inputs
  const sliders = document.querySelectorAll('.slider');
  sliders.forEach(slider => {
    slider.addEventListener('input', handleSliderChange);
    slider.addEventListener('change', updateSliderValue);
  });
  
  // Checkbox inputs
  const checkboxes = document.querySelectorAll('.checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', handleCheckboxChange);
  });
  
  // Load current settings
  loadSettings();
  
  // Keyboard navigation for settings panel
  settingsPanel.addEventListener('keydown', handleSettingsKeydown);
  
  console.log('Settings panel initialized');
}

/**
 * Load current settings and populate UI
 */
async function loadSettings() {
  try {
    if (typeof window.Settings === 'undefined') {
      console.error('Settings module not loaded');
      return;
    }
    
    const settings = await window.Settings.getSettings();
    populateSettingsUI(settings);
    
  } catch (error) {
    console.error('Error loading settings:', error);
    showCalibrationStatus('Error loading settings', 'error');
  }
}

/**
 * Populate settings UI with current values
 */
function populateSettingsUI(settings) {
  // Hand tracking sensitivity
  updateSliderUI('xSensitivity', settings.movementSensitivity, 'x');
  updateSliderUI('ySensitivity', settings.yAxisSensitivityMultiplier, 'x');
  
  // Movement smoothing
  updateSliderUI('smoothingFactor', settings.smoothingFactor, '%', 100);
  updateSliderUI('movementThreshold', settings.movementThreshold, 'px', 1000);
  updateSliderUI('deadZoneRadius', settings.deadZoneRadius, 'px', 1000);
  
  // Gesture detection
  updateSliderUI('fistConfidence', settings.fistConfidenceThreshold, '%', 100);
  updateSliderUI('fistFrames', settings.requiredFistFrames, '');
  updateSliderUI('fistCooldown', settings.fistCooldown, 'ms');
  
  // Accessibility options
  updateCheckboxUI('audioFeedback', settings.enableAudioFeedback);
  updateCheckboxUI('highContrast', settings.highContrast);
  updateCheckboxUI('reducedMotion', settings.reducedMotion);
  
  // Apply accessibility settings
  applyAccessibilitySettings({
    audioFeedback: settings.enableAudioFeedback,
    highContrast: settings.highContrast,
    reducedMotion: settings.reducedMotion
  });
  // Theme - Don't override if user just toggled it
  const savedTheme = settings.theme || 'auto';
  let effectiveTheme;
  
  if (savedTheme === 'auto') {
    // Use system preference for auto theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    effectiveTheme = prefersDark ? 'dark' : 'light';
  } else {
    effectiveTheme = savedTheme;
  }
  
  // Only apply theme if it's different from current state to avoid overriding user toggles
  const isCurrentlyDark = document.body.classList.contains('dark-theme');
  const shouldBeDark = effectiveTheme === 'dark';
  
  if (isCurrentlyDark !== shouldBeDark) {
    if (effectiveTheme === 'dark') {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
  }
  
  // Update theme toggle UI
  const lightIcon = document.getElementById('lightIcon');
  const darkIcon = document.getElementById('darkIcon');
  const themeLabel = document.getElementById('themeLabel');
  
  if (lightIcon && darkIcon && themeLabel) {
    if (effectiveTheme === 'dark') {
      lightIcon.style.display = 'none';
      darkIcon.style.display = 'inline';
      themeLabel.textContent = 'Dark Mode';
    } else {
      lightIcon.style.display = 'inline';
      darkIcon.style.display = 'none';
      themeLabel.textContent = 'Light Mode';
    }
  }
}

/**
 * Update slider UI element
 */
function updateSliderUI(sliderId, value, unit, multiplier = 1) {
  const slider = document.getElementById(sliderId);
  const valueSpan = document.getElementById(sliderId + 'Value');
  const descSpan = document.getElementById(sliderId.replace(/([A-Z])/g, '$1').toLowerCase() + 'Desc');
  
  if (slider) {
    slider.value = value;
    if (valueSpan) {
      const displayValue = Math.round(value * multiplier);
      valueSpan.textContent = displayValue + unit;
    }
    if (descSpan) {
      const displayValue = Math.round(value * multiplier);
      descSpan.textContent = `Current: ${displayValue}${unit} ${unit === '%' ? 'smoothing applied' : unit === 'ms' ? 'cooldown period' : unit === 'px' ? (sliderId.includes('threshold') ? 'minimum movement' : sliderId.includes('dead') ? 'dead zone radius' : '') : sliderId.includes('x') || sliderId.includes('y') ? 'normal speed' : ''}`;
    }
    
    // Update aria-valuetext
    const displayValue = Math.round(value * multiplier);
    slider.setAttribute('aria-valuetext', `${displayValue}${unit} ${unit === 'x' ? 'normal speed' : unit === '%' ? 'smoothing' : unit === 'px' ? 'pixels' : unit === 'ms' ? 'milliseconds' : unit === '' ? (sliderId.includes('frames') ? 'frames required' : '') : ''}`);
  }
}

/**
 * Update checkbox UI element
 */
function updateCheckboxUI(checkboxId, checked) {
  const checkbox = document.getElementById(checkboxId);
  if (checkbox) {
    checkbox.checked = checked;
  }
}

/**
 * Open settings panel
 */
function openSettings() {
  settingsPanel.classList.add('active');
  settingsOverlay.classList.add('active');
  settingsPanel.setAttribute('aria-hidden', 'false');
  settingsOverlay.setAttribute('aria-hidden', 'false');
  
  // Focus the close button for keyboard navigation
  const closeBtn = document.getElementById('closeSettingsBtn');
  if (closeBtn) {
    closeBtn.focus();
  }
  
  // Trap focus within settings panel
  document.addEventListener('keydown', trapFocus);
}

/**
 * Close settings panel
 */
function closeSettings() {
  settingsPanel.classList.remove('active');
  settingsOverlay.classList.remove('active');
  settingsPanel.setAttribute('aria-hidden', 'true');
  settingsOverlay.setAttribute('aria-hidden', 'true');
  
  // Return focus to settings button
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.focus();
  }
  
  // Remove focus trap
  document.removeEventListener('keydown', trapFocus);
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
  const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  console.log(`Toggling theme from ${currentTheme} to ${newTheme}`);
  console.log('Body classes before:', document.body.className);
  
  // Update body class with explicit class management
  if (newTheme === 'dark') {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  }
  
  console.log('Body classes after:', document.body.className);
  
  // Force a repaint to ensure styles are applied
  document.body.offsetHeight;
  
  // Update theme toggle UI
  const lightIcon = document.getElementById('lightIcon');
  const darkIcon = document.getElementById('darkIcon');
  const themeLabel = document.getElementById('themeLabel');
  
  if (lightIcon && darkIcon && themeLabel) {
    if (newTheme === 'dark') {
      lightIcon.style.display = 'none';
      darkIcon.style.display = 'inline';
      themeLabel.textContent = 'Dark Mode';
    } else {
      lightIcon.style.display = 'inline';
      darkIcon.style.display = 'none';
      themeLabel.textContent = 'Light Mode';
    }
    console.log(`UI updated for ${newTheme} theme`);
  } else {
    console.warn('Theme toggle UI elements not found');
  }
  
  // Save theme preference
  localStorage.setItem('waviTheme', newTheme);
  
  // Update settings if available - don't call saveSettings directly
  try {
    if (window.Settings && typeof window.Settings.updateSettings === 'function') {
      // Only update the theme setting, don't trigger a full settings application
      const themeUpdate = { theme: newTheme };
      window.Settings.updateSettings(themeUpdate);
      console.log('Theme updated to:', newTheme);
    }
  } catch (error) {
    console.error('Error saving theme preference:', error);
  }
}

/**
 * Initialize theme based on saved preference
 */
function initializeTheme() {
  try {
    const savedTheme = localStorage.getItem('waviTheme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Determine the effective theme
    let currentTheme;
    if (savedTheme && savedTheme !== 'auto') {
      currentTheme = savedTheme;
    } else {
      // Use system preference for 'auto' or when no preference is saved
      currentTheme = prefersDark ? 'dark' : 'light';
    }
    
    // Apply theme with explicit class management
    if (currentTheme === 'dark') {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
    
    // Update theme toggle UI elements
    const lightIcon = document.getElementById('lightIcon');
    const darkIcon = document.getElementById('darkIcon');
    const themeLabel = document.getElementById('themeLabel');
    
    if (lightIcon && darkIcon && themeLabel) {
      if (currentTheme === 'dark') {
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'inline';
        themeLabel.textContent = 'Dark Mode';
      } else {
        lightIcon.style.display = 'inline';
        darkIcon.style.display = 'none';
        themeLabel.textContent = 'Light Mode';
      }
    }
    
    console.log('Theme initialized:', currentTheme, '(saved theme was:', savedTheme, ')');
    console.log('Body classes:', document.body.className);
  } catch (error) {
    console.error('Error initializing theme:', error);
  }
}

/**
 * Handle preset selection
 */
async function handlePresetSelection(event) {
  const presetName = event.currentTarget.dataset.preset;
  if (!presetName) return;
  
  try {
    // Update radio group selection
    const presetButtons = document.querySelectorAll('.preset-card');
    presetButtons.forEach(button => {
      button.setAttribute('aria-checked', 'false');
      button.setAttribute('tabindex', '-1');
    });
      event.currentTarget.setAttribute('aria-checked', 'true');
    event.currentTarget.setAttribute('tabindex', '0');
      // Apply preset settings
    if (typeof window.Settings?.applyPreset === 'function') {
      await window.Settings.applyPreset(presetName);
      const newSettings = await window.Settings.getSettings();
      populateSettingsUI(newSettings);
      
      // Apply settings to modules
      await applySettingsToModules(newSettings);
      
      showCalibrationStatus(`Applied ${presetName} preset`, 'success');
    }
    
  } catch (error) {
    console.error('Error applying preset:', error);
    showCalibrationStatus('Error applying preset', 'error');
  }
}

/**
 * Handle preset keyboard navigation
 */
function handlePresetKeydown(event) {
  const presetButtons = Array.from(document.querySelectorAll('.preset-card'));
  const currentIndex = presetButtons.indexOf(event.currentTarget);
  
  let newIndex = currentIndex;
  
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      newIndex = (currentIndex + 1) % presetButtons.length;
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      newIndex = (currentIndex - 1 + presetButtons.length) % presetButtons.length;
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      handlePresetSelection(event);
      return;
    default:
      return;
  }
  
  event.preventDefault();
  
  // Update focus and tabindex
  presetButtons.forEach(button => button.setAttribute('tabindex', '-1'));
  presetButtons[newIndex].setAttribute('tabindex', '0');
  presetButtons[newIndex].focus();
}

/**
 * Handle slider value changes
 */
function handleSliderChange(event) {
  updateSliderValue(event);
  
  // Update settings via Settings module
  const sliderId = event.target.id;
  const value = parseFloat(event.target.value);
  
  updateSettingsValue(sliderId, value);
}

/**
 * Update slider display value
 */
function updateSliderValue(event) {
  const slider = event.target;
  const sliderId = slider.id;
  const value = parseFloat(slider.value);
  const valueSpan = document.getElementById(sliderId + 'Value');
  
  if (valueSpan) {
    let displayValue, unit;
    
    switch (sliderId) {
      case 'xSensitivity':
      case 'ySensitivity':
        displayValue = value.toFixed(1);
        unit = 'x';
        break;
      case 'smoothingFactor':
      case 'fistConfidence':
        displayValue = Math.round(value * 100);
        unit = '%';
        break;
      case 'movementThreshold':
      case 'deadZoneRadius':
        displayValue = Math.round(value * 1000);
        unit = 'px';
        break;
      case 'fistFrames':
        displayValue = Math.round(value);
        unit = '';
        break;
      case 'fistCooldown':
        displayValue = Math.round(value);
        unit = 'ms';
        break;
      default:
        displayValue = value.toFixed(2);
        unit = '';
    }
    
    valueSpan.textContent = displayValue + unit;
    
    // Update aria-valuetext
    slider.setAttribute('aria-valuetext', `${displayValue}${unit}`);
  }
}

/**
 * Update settings value from slider input
 */
async function updateSettingsValue(sliderId, value) {
  try {
    const updateObject = {};
    
    switch (sliderId) {
      case 'xSensitivity':
        updateObject.movementSensitivity = value;
        break;
      case 'ySensitivity':
        updateObject.yAxisSensitivityMultiplier = value;
        break;
      case 'smoothingFactor':
        updateObject.smoothingFactor = value;
        break;
      case 'movementThreshold':
        updateObject.movementThreshold = value;
        break;
      case 'deadZoneRadius':
        updateObject.deadZoneRadius = value;
        break;
      case 'fistConfidence':
        updateObject.fistConfidenceThreshold = value;
        break;
      case 'fistFrames':
        updateObject.requiredFistFrames = Math.round(value);
        break;
      case 'fistCooldown':
        updateObject.fistCooldown = Math.round(value);
        break;
    }
    
    if (Object.keys(updateObject).length > 0) {
      await window.Settings.updateSettings(updateObject);
    }
  } catch (error) {
    console.error('Error updating settings value:', error);
  }
}

/**
 * Handle checkbox changes
 */
async function handleCheckboxChange(event) {
  const checkboxId = event.target.id;
  const checked = event.target.checked;
  
  try {
    const updateObject = {};
    
    switch (checkboxId) {
      case 'audioFeedback':
        updateObject.enableAudioFeedback = checked;
        break;
      case 'highContrast':
        updateObject.highContrast = checked;
        applyHighContrast(checked);
        break;
      case 'reducedMotion':
        updateObject.reducedMotion = checked;
        applyReducedMotion(checked);
        break;
    }
    
    if (Object.keys(updateObject).length > 0) {
      await window.Settings.updateSettings(updateObject);
    }
  } catch (error) {
    console.error('Error updating checkbox setting:', error);
  }
}

/**
 * Apply accessibility settings
 */
function applyAccessibilitySettings(accessibility) {
  applyHighContrast(accessibility.highContrast);
  applyReducedMotion(accessibility.reducedMotion);
}

/**
 * Apply high contrast mode
 */
function applyHighContrast(enabled) {
  if (enabled) {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }
}

/**
 * Apply reduced motion preference
 */
function applyReducedMotion(enabled) {
  if (enabled) {
    document.body.classList.add('reduced-motion');
  } else {
    document.body.classList.remove('reduced-motion');
  }
}

/**
 * Save current settings
 */
async function saveSettings() {
  try {
    if (typeof window.Settings?.saveSettings === 'function') {
      await window.Settings.saveSettings();
      const settings = await window.Settings.getSettings();
      await applySettingsToModules(settings);
      showCalibrationStatus('Settings saved successfully', 'success');
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    showCalibrationStatus('Error saving settings', 'error');
  }
}

/**
 * Reset settings to defaults
 */
async function resetSettings() {
  try {
    if (typeof window.Settings?.resetSettings === 'function') {
      await window.Settings.resetSettings();
      const settings = await window.Settings.getSettings();
      populateSettingsUI(settings);
      await applySettingsToModules(settings);
      
      // Reset preset selection
      const presetButtons = document.querySelectorAll('.preset-card');
      presetButtons.forEach(button => {
        button.setAttribute('aria-checked', 'false');
        button.setAttribute('tabindex', '-1');
      });
      presetButtons[0]?.setAttribute('tabindex', '0');
      
      showCalibrationStatus('Settings reset to defaults', 'success');
    }
  } catch (error) {
    console.error('Error resetting settings:', error);
    showCalibrationStatus('Error resetting settings', 'error');
  }
}

/**
 * Run auto-calibration
 */
async function runAutoCalibration() {
  try {
    const button = document.getElementById('autoCalibrateBtn');
    if (button) {
      button.disabled = true;
      button.textContent = 'Calibrating...';
    }
      showCalibrationStatus('Running auto-calibration...', 'info');
    
    if (typeof window.Settings?.startAutoCalibration === 'function') {
      await window.Settings.startAutoCalibration();
      const calibratedSettings = await window.Settings.getSettings();
      populateSettingsUI(calibratedSettings);
      await applySettingsToModules(calibratedSettings);
      
      showCalibrationStatus('Auto-calibration completed successfully', 'success');
    }
    
  } catch (error) {
    console.error('Error during auto-calibration:', error);
    showCalibrationStatus('Auto-calibration failed', 'error');
  } finally {
    const button = document.getElementById('autoCalibrateBtn');
    if (button) {
      button.disabled = false;
      button.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path><path d="M9 12l2 2 4-4"></path></svg>Run Auto-Calibration';
    }
  }
}

/**
 * Apply settings to all modules
 */
async function applySettingsToModules(settings) {
  try {
    // If no settings provided, get them from the Settings module
    if (!settings && window.Settings?.getSettings) {
      settings = await window.Settings.getSettings();
    }
    
    // Safety check - if still no settings, use defaults
    if (!settings) {
      console.warn('No settings available, using defaults');
      return;
    }
    
    // Apply to smoothing module
    if (typeof window.Smoothing?.updateSettings === 'function') {
      window.Smoothing.updateSettings({
        smoothingFactor: settings.smoothingFactor,
        movementThreshold: settings.movementThreshold,
        deadZoneRadius: settings.deadZoneRadius,
        enabled: true
      });
    }
    
    // Apply to gesture detection module
    if (typeof window.GestureDetection?.updateGestureSettings === 'function') {
      window.GestureDetection.updateGestureSettings({
        fistConfidenceThreshold: settings.fistConfidenceThreshold,
        requiredFistFrames: settings.requiredFistFrames,
        fistCooldown: settings.fistCooldown,
        minimumLockDuration: settings.minimumLockDuration || 150
      });
    }
    
    // Apply to hand tracking module
    if (typeof window.HandTracking?.updateSensitivitySettings === 'function') {
      window.HandTracking.updateSensitivitySettings({
        movementSensitivity: settings.movementSensitivity,
        yAxisSensitivityMultiplier: settings.yAxisSensitivityMultiplier
      });
    }
    
    console.log('Settings applied to all modules');
    
  } catch (error) {
    console.error('Error applying settings to modules:', error);
  }
}

/**
 * Show calibration status message
 */
function showCalibrationStatus(message, type = 'info') {
  const statusElement = document.getElementById('calibrationStatus');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = `calibration-status ${type}`;
    
    // Clear status after 3 seconds for success/info messages
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        statusElement.textContent = '';
        statusElement.className = 'calibration-status';
      }, 3000);
    }
  }
}

/**
 * Handle settings panel keyboard navigation
 */
function handleSettingsKeydown(event) {
  if (event.key === 'Escape') {
    closeSettings();
  }
}

/**
 * Trap focus within settings panel
 */
function trapFocus(event) {
  if (event.key !== 'Tab') return;
  
  const focusableElements = settingsPanel.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      lastElement.focus();
      event.preventDefault();
    }
  } else {
    if (document.activeElement === lastElement) {
      firstElement.focus();
      event.preventDefault();
    }
  }
}

// Log initialization
console.log('Wavi Extension v2.0.0 - Auto-starting hand tracking popup loaded');
