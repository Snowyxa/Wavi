// core/trackingManager.js - Core tracking management

/**
 * Tracking Manager Module
 * Handles the core hand tracking lifecycle and coordination
 */
class TrackingManager {
  constructor(video, canvas) {
    this.video = video;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Tracking state
    this.lastClickPosition = null;
    this.currentStream = null;
    this.currentCamera = null;
    this.isTrackingStarted = false;
    
    // Initialize components
    this.handVisualization = new window.HandVisualization(canvas, this.ctx);
    this.statusManager = new window.StatusManager();
  }

  /**
   * Initialize hand tracking asynchronously
   */
  async initializeHandTracking() {
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
        this.statusManager.updateUI('error', 'Failed to initialize hand tracking');
        return;
      }
      console.log('MediaPipe Hands initialized successfully');
    } catch (error) {
      console.error('Error initializing hand tracking:', error);
      this.statusManager.updateUI('error', `Initialization failed: ${error.message}`);
    }
  }

  /**
   * Start hand tracking automatically
   */
  async startTracking() {
    if (this.isTrackingStarted) return;
    
    try {
      this.statusManager.updateUI('starting');
      
      // Ensure MediaPipe is initialized
      if (!window.HandTracking.isCurrentlyTracking && typeof Hands === 'undefined') {
        console.log('Reinitializing MediaPipe Hands...');
        await this.initializeHandTracking();
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
      this.currentStream = await window.CameraUtils.initializeVideoStream(this.video);
      
      // Ensure canvas dimensions match container after video loads
      this.resizeCanvas();
      
      // Start hand tracking
      this.currentCamera = window.HandTracking.startHandTracking(
        this.video, 
        this.canvas, 
        (results) => this.onResults(results)
      );
      
      this.isTrackingStarted = true;
      this.statusManager.updateUI('tracking');
      console.log('Hand tracking started successfully');
      
    } catch (error) {
      console.error('Failed to start tracking:', error);
      const userMessage = window.CameraUtils.handleVideoError(error);
      this.statusManager.updateUI('error', userMessage);
    }
  }

  /**
   * Stop hand tracking
   */
  stopTracking() {
    try {
      // Stop hand tracking
      window.HandTracking.stopHandTracking();
      
      // Stop video stream
      if (this.currentStream) {
        window.CameraUtils.stopVideoStream(this.currentStream);
        this.currentStream = null;
      }
      
      // Clear canvas
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      
      // Remove cursor from content script
      window.Communication.sendCursorRemoval();
      
      // Reset state
      window.HandTracking.resetTrackingState();
      this.lastClickPosition = null;
      this.currentCamera = null;
      this.isTrackingStarted = false;
      
      this.statusManager.updateUI('stopped');
      console.log('Hand tracking stopped');
      
    } catch (error) {
      console.error('Error stopping tracking:', error);
      this.statusManager.updateUI('error', 'Failed to stop tracking');
    }
  }

  /**
   * Process MediaPipe hand tracking results
   * @param {Object} results - MediaPipe results object
   */
  onResults(results) {
    // Use hand visualization to process and draw results
    this.handVisualization.processResults(results, (landmarks) => {
      this.processHandLandmarks(landmarks);
    });
  }

  /**
   * Process individual hand landmarks for gesture detection and cursor movement
   * @param {Array} landmarks - Hand landmarks
   */
  processHandLandmarks(landmarks) {
    // Calculate cursor position
    const cursorPosition = window.HandTracking.calculateCursorPosition(landmarks);
    
    if (cursorPosition) {
      // Check for gesture detection
      const gestureDetected = window.GestureDetection.processFistDetection(landmarks);
      
      // Handle gesture state changes
      window.GestureDetection.handleGestureStateChange(
        gestureDetected,
        cursorPosition,
        (x, y) => this.handleClickEvent(x, y)
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

  /**
   * Handle click events from gesture detection
   * @param {number} x - Click X coordinate
   * @param {number} y - Click Y coordinate
   */
  handleClickEvent(x, y) {
    // Store click position
    this.lastClickPosition = { x, y };
    
    // Send click event to content script
    window.Communication.sendClickEvent(x, y);
    
    console.log(`Click event: x=${x}, y=${y}`);
  }

  /**
   * Resize canvas to match container
   */
  resizeCanvas() {
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer && this.canvas) {
      const containerWidth = videoContainer.offsetWidth;
      const containerHeight = videoContainer.offsetHeight;
      
      this.canvas.width = containerWidth;
      this.canvas.height = containerHeight;
      
      console.log(`Canvas resized for tracking: ${containerWidth}x${containerHeight}`);
    }
  }

  /**
   * Get current tracking state
   */
  isTracking() {
    return this.isTrackingStarted;
  }

  /**
   * Get last click position
   */
  getLastClickPosition() {
    return this.lastClickPosition;
  }
}

// Export for global access
window.TrackingManager = TrackingManager;
