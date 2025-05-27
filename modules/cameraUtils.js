// cameraUtils.js - Camera setup and video stream management
// This module handles camera initialization and video stream processing

/**
 * Set up camera with optimal settings
 * @returns {Promise<Object>} - Promise resolving to camera constraints
 */
async function setupCameraConstraints() {
  let constraints = {
    width: 640,
    height: 480
  };
  
  try {
    // Try to get display information for adaptive resolution
    const displayWidth = screen.width;
    const displayHeight = screen.height;
    
    // Adaptive camera resolution based on display size
    if (displayWidth >= 1920 && displayHeight >= 1080) {
      // High resolution displays
      constraints = {
        width: Math.min(1280, displayWidth),
        height: Math.min(720, displayHeight)
      };
    } else if (displayWidth >= 1366 && displayHeight >= 768) {
      // Medium resolution displays
      constraints = {
        width: Math.min(960, displayWidth),
        height: Math.min(540, displayHeight)
      };
    } else {
      // Lower resolution displays
      constraints = {
        width: Math.min(720, displayWidth),
        height: Math.min(1280, displayHeight)
      };
    }
    
    console.log(`Using adaptive camera resolution: ${constraints.width}x${constraints.height}`);
    console.log(`Display resolution: ${displayWidth}x${displayHeight}`);
  } catch (error) {
    console.error('Error determining camera capabilities:', error);
  }
  
  return constraints;
}

/**
 * Initialize video stream with camera
 * @param {HTMLVideoElement} videoElement - Video element to attach stream
 * @returns {Promise<MediaStream>} - Promise resolving to media stream
 */
async function initializeVideoStream(videoElement) {
  try {
    const constraints = await setupCameraConstraints();
    
    const stream = await navigator.mediaDevices.getUserMedia({
      video: constraints,
      audio: false
    });
    
    videoElement.srcObject = stream;
    
    return new Promise((resolve, reject) => {
      videoElement.onloadedmetadata = () => {
        console.log(`Video stream initialized: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
        resolve(stream);
      };
      
      videoElement.onerror = (error) => {
        reject(new Error(`Video element error: ${error.message}`));
      };
      
      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('Video stream initialization timeout'));
      }, 10000);
    });
  } catch (error) {
    console.error('Error accessing camera:', error);
    throw new Error(`Camera access failed: ${error.message}`);
  }
}

/**
 * Stop video stream and release camera
 * @param {MediaStream} stream - Media stream to stop
 */
function stopVideoStream(stream) {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
      console.log('Camera track stopped');
    });
  }
}

/**
 * Check camera permissions
 * @returns {Promise<boolean>} - Promise resolving to permission status
 */
async function checkCameraPermission() {
  try {
    const result = await navigator.permissions.query({ name: 'camera' });
    return result.state === 'granted';
  } catch (error) {
    console.warn('Permission API not supported, checking via getUserMedia');
    
    // Fallback: try to access camera briefly
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
        audio: false
      });
      stopVideoStream(stream);
      return true;
    } catch (e) {
      return false;
    }
  }
}

/**
 * Get available camera devices
 * @returns {Promise<Array>} - Promise resolving to array of camera devices
 */
async function getAvailableCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  } catch (error) {
    console.error('Error enumerating devices:', error);
    return [];
  }
}

/**
 * Set up video element for hand tracking
 * @param {HTMLVideoElement} videoElement - Video element to configure
 */
function configureVideoElement(videoElement) {
  videoElement.style.transform = 'scaleX(-1)'; // Mirror the video
  videoElement.autoplay = true;
  videoElement.muted = true;
  videoElement.playsInline = true;
  
  // Set video attributes for better performance
  videoElement.setAttribute('webkit-playsinline', 'true');
  videoElement.setAttribute('playsinline', 'true');
}

/**
 * Handle video stream errors
 * @param {Error} error - Error object
 * @returns {string} - User-friendly error message
 */
function handleVideoError(error) {
  let userMessage = 'Camera access failed';
  
  if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
    userMessage = 'Camera permission denied. Please allow camera access and try again.';
  } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
    userMessage = 'No camera found. Please connect a camera and try again.';
  } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
    userMessage = 'Camera is already in use by another application.';
  } else if (error.name === 'OverconstrainedError') {
    userMessage = 'Camera does not support the required settings.';
  } else if (error.name === 'NotSupportedError') {
    userMessage = 'Camera access is not supported in this browser.';
  } else if (error.name === 'AbortError') {
    userMessage = 'Camera access was interrupted.';
  }
  
  console.error('Video error details:', error);
  return userMessage;
}

// Export functions for use in other modules
window.CameraUtils = {
  setupCameraConstraints,
  initializeVideoStream,
  stopVideoStream,
  checkCameraPermission,
  getAvailableCameras,
  configureVideoElement,
  handleVideoError
};
