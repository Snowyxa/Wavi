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

// Log initialization
console.log('Hand Tracking Extension v1.1.4 - Modular popup loaded');
