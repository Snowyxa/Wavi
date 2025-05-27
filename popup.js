// popup.js - Main hand tracking extension popup
// Simplified and modular version using organized components

// DOM elements
let video;
let canvas;
let ctx;

// Tracking state
let lastClickPosition = null;
let currentStream = null;
let currentCamera = null;

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializePopup();
  setupEventListeners();
});

/**
 * Initialize the popup interface
 */
function initializePopup() {
  // Get DOM elements
  video = document.getElementById('video');
  canvas = document.getElementById('output');
  ctx = canvas.getContext('2d');
    // Configure video element
  if (video) {
    window.CameraUtils.configureVideoElement(video);
  }
  
  // Initialize MediaPipe Hands (async)
  initializeHandTracking();
  
  console.log('Popup initialized');
}

/**
 * Set up event listeners for UI controls
 */
function setupEventListeners() {
  const startButton = document.getElementById('startTracking');
  const stopButton = document.getElementById('stopTracking');
  
  if (startButton) {
    startButton.addEventListener('click', startTracking);
  }
  
  if (stopButton) {
    stopButton.addEventListener('click', stopTracking);
  }
}

/**
 * Initialize hand tracking asynchronously
 */
async function initializeHandTracking() {
  try {
    const handsInstance = await window.HandTracking.initializeMediaPipeHands();
    if (!handsInstance) {
      console.error('Failed to initialize MediaPipe Hands');
      updateUI('error');
      return;
    }
    console.log('MediaPipe Hands initialized successfully');
  } catch (error) {
    console.error('Error initializing hand tracking:', error);
    updateUI('error');
  }
}

/**
 * Start hand tracking
 */
async function startTracking() {
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
    
    // Start hand tracking
    currentCamera = window.HandTracking.startHandTracking(video, canvas, onResults);
    
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
    for (const landmarks of results.multiHandLandmarks) {
      // Draw hand landmarks
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 2
      });
      drawLandmarks(ctx, landmarks, {
        color: '#FF0000',
        lineWidth: 1
      });
      
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
function updateUI(state, message = '') {
  const startButton = document.getElementById('startTracking');
  const stopButton = document.getElementById('stopTracking');
  const statusElement = document.getElementById('status');
  
  if (!startButton || !stopButton) return;
  
  switch (state) {
    case 'starting':
      startButton.disabled = true;
      stopButton.disabled = true;
      startButton.textContent = 'Starting...';
      if (statusElement) statusElement.textContent = 'Initializing camera...';
      break;
      
    case 'tracking':
      startButton.disabled = true;
      stopButton.disabled = false;
      startButton.textContent = 'Start Tracking';
      stopButton.textContent = 'Stop Tracking';
      if (statusElement) statusElement.textContent = 'Tracking active - Move your hand to control cursor';
      break;
      
    case 'stopped':
      startButton.disabled = false;
      stopButton.disabled = true;
      startButton.textContent = 'Start Tracking';
      stopButton.textContent = 'Stop Tracking';
      if (statusElement) statusElement.textContent = 'Tracking stopped';
      break;
      
    case 'error':
      startButton.disabled = false;
      stopButton.disabled = true;
      startButton.textContent = 'Start Tracking';
      stopButton.textContent = 'Stop Tracking';
      if (statusElement) statusElement.textContent = message || 'Error occurred';
      break;
  }
}

// Handle popup unload
window.addEventListener('beforeunload', function() {
  if (window.HandTracking.isCurrentlyTracking()) {
    stopTracking();
  }
});

// Log initialization
console.log('Hand Tracking Extension v1.1.4 - Modular popup loaded');
