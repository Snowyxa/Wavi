let video;
let canvas;
let ctx;
let isTracking = false;
let hands;
let lastValidPosition = null;
let isHandVisible = false;
let isFist = false;
let lastFistState = false;
let fistCooldown = false;
let fistCooldownTimeout = null;
let lastClickPosition = null;
let fistConfidence = 0;
let fistConfidenceThreshold = 0.7;
let consecutiveFistFrames = 0;
let requiredFistFrames = 3;
let centerPosition = null;
let lastHandPosition = null;
let movementSensitivity = 2.0; // Adjust this value to control cursor movement speed
let isFirstHandDetection = true; // Add flag for first hand detection
let resolutionScaleFactor = 1.0; // Scaling factor for movement sensitivity based on resolution
let tabDimensions = { width: 1920, height: 1080 }; // Store actual tab dimensions

// Initialize MediaPipe Hands
async function initHands() {
  try {
    hands = new Hands({
      locateFile: (file) => {
        if (file === 'hand_landmark_lite.tflite') {
          return chrome.runtime.getURL('lib/hand_landmark_full.tflite');
        }
        return chrome.runtime.getURL(`lib/${file}`);
      }
    });

    await hands.initialize();
    
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    hands.onResults(onResults);
    return true;
  } catch (error) {
    console.error('Failed to initialize MediaPipe Hands:', error);
    return false;
  }
}

// Initialize camera and canvas
async function initCamera() {
  try {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');    // Get optimal video constraints based on display resolution
    const videoConstraints = await getBestVideoConstraints();
    
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: videoConstraints.width },
        height: { ideal: videoConstraints.height },
        facingMode: 'user'
      }
    });
    video.srcObject = stream;
    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        resolve(video);
      };
    });
  } catch (error) {
    console.error('Failed to initialize camera:', error);
    return null;
  }
}

// Process hand tracking results
async function onResults(results) {
  if (!isTracking) return;

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
  const handDetected = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;  if (handDetected && !isHandVisible) {
    isHandVisible = true;    // Initialize hand position tracking when hand is first detected
    if (isFirstHandDetection) {
      try {
        // Get actual tab dimensions instead of popup dimensions
        tabDimensions = await getTabDimensions();
        
        // Get the first detected hand position from landmarks
        const firstLandmark = results.multiHandLandmarks[0][8]; // Index finger tip
        
        // Set lastHandPosition to the first detection
        lastHandPosition = {
          x: firstLandmark.x,
          y: firstLandmark.y
        };
        
        // Instead of resetting cursor to center, map the initial hand position 
        // to the current cursor position to prevent jumps
        centerPosition = {
          x: mapRange(firstLandmark.x, 0.2, 0.8, tabDimensions.width * 0.2, tabDimensions.width * 0.8),
          y: mapRange(firstLandmark.y, 0.2, 0.8, tabDimensions.height * 0.2, tabDimensions.height * 0.8)
        };
        
        console.log(`First hand detection: x=${firstLandmark.x.toFixed(4)}, y=${firstLandmark.y.toFixed(4)}`);
        console.log(`Center position set to: x=${centerPosition.x}, y=${centerPosition.y}`);
        console.log(`Tab dimensions: ${tabDimensions.width}x${tabDimensions.height}`);
        console.log(`Popup dimensions: ${window.innerWidth}x${window.innerHeight}`);
        
        // Send initial cursor position to content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'moveCursor',
              x: centerPosition.x,
              y: centerPosition.y,
              isHandVisible: true,
              isFist: false
            }).catch(error => {
              console.log('Content script not ready:', error);
            });
          }
        });
        
        isFirstHandDetection = false;
      } catch (error) {
        console.error('Error during first hand detection:', error);
      }
    }
  } else if (!handDetected && isHandVisible) {
    isHandVisible = false;
    isFist = false;
    lastFistState = false;
    fistConfidence = 0;
    consecutiveFistFrames = 0;
  }

  if (handDetected) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 2
      });
      drawLandmarks(ctx, landmarks, {
        color: '#FF0000',
        lineWidth: 1
      });

      const indexFinger = landmarks[8];

      if (indexFinger) {
        // Check for fist gesture with improved detection
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        
        const thumbMCP = landmarks[2];
        const indexMCP = landmarks[5];
        const middleMCP = landmarks[9];
        const ringMCP = landmarks[13];
        const pinkyMCP = landmarks[17];

        // Calculate distances between finger tips and their MCP joints
        const isThumbClosed = thumbTip.y > thumbMCP.y;
        const isIndexClosed = indexTip.y > indexMCP.y;
        const isMiddleClosed = middleTip.y > middleMCP.y;
        const isRingClosed = ringTip.y > ringMCP.y;
        const isPinkyClosed = pinkyTip.y > pinkyMCP.y;

        // Calculate confidence score for fist detection
        const closedFingers = [isThumbClosed, isIndexClosed, isMiddleClosed, isRingClosed, isPinkyClosed];
        const closedCount = closedFingers.filter(finger => finger).length;
        const currentFistConfidence = closedCount / 5;

        // Smooth the confidence score
        fistConfidence = (fistConfidence * 0.7) + (currentFistConfidence * 0.3);

        // Update consecutive frames counter
        if (fistConfidence > fistConfidenceThreshold) {
          consecutiveFistFrames++;
        } else {
          consecutiveFistFrames = Math.max(0, consecutiveFistFrames - 1);
        }

        // Determine if it's a fist based on confidence and consecutive frames
        const newFistState = consecutiveFistFrames >= requiredFistFrames;

        // Handle fist state change
        if (newFistState !== lastFistState && !fistCooldown) {
          lastFistState = newFistState;
          if (newFistState) {
            // Store click position
            lastClickPosition = {
              x: centerPosition.x,
              y: centerPosition.y
            };
            
            // Send click event
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                  action: 'click',
                  x: lastClickPosition.x,
                  y: lastClickPosition.y
                }).catch(error => {
                  console.log('Content script not ready or communication failed:', error);
                });
              }
            });

            // Set cooldown to prevent multiple clicks
            fistCooldown = true;
            if (fistCooldownTimeout) {
              clearTimeout(fistCooldownTimeout);
            }
            fistCooldownTimeout = setTimeout(() => {
              fistCooldown = false;
            }, 500); // 500ms cooldown between clicks
          }
        }        // Calculate relative movement
        if (!newFistState) {
          const currentHandPosition = {
            x: indexFinger.x,
            y: indexFinger.y
          };
            if (lastHandPosition) {
            // Calculate movement delta with flipped X axis
            const deltaX = -1 * (currentHandPosition.x - lastHandPosition.x) * movementSensitivity;
            
            // For Y axis: MediaPipe coordinates are 0 (top) to 1 (bottom)
            // We want natural movement: hand moves down -> cursor moves down
            // Add a slight scaling factor for Y-axis to improve responsiveness
            const yAxisSensitivityMultiplier = 1.2; // Make vertical movement slightly more responsive
            const deltaY = (currentHandPosition.y - lastHandPosition.y) * movementSensitivity * yAxisSensitivityMultiplier;
            
            // Update center position with movement delta
            centerPosition.x += deltaX * tabDimensions.width;
            centerPosition.y += deltaY * tabDimensions.height;
            
            // Debug cursor position
            console.log(`Hand position: current(${currentHandPosition.x.toFixed(4)}, ${currentHandPosition.y.toFixed(4)}), last(${lastHandPosition.x.toFixed(4)}, ${lastHandPosition.y.toFixed(4)})`);
            console.log(`Delta: x=${deltaX.toFixed(4)}, y=${deltaY.toFixed(4)}`);
            console.log(`Cursor position updated: x=${centerPosition.x.toFixed(0)}, y=${centerPosition.y.toFixed(0)}`);

            // Clamp cursor position to screen bounds
            centerPosition.x = Math.max(0, Math.min(centerPosition.x, tabDimensions.width));
            centerPosition.y = Math.max(0, Math.min(centerPosition.y, tabDimensions.height));

            // Send updated cursor position
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                  action: 'moveCursor',
                  x: centerPosition.x,
                  y: centerPosition.y,
                  isHandVisible: true,
                  isFist: newFistState
                }).catch(error => {
                  console.log('Content script not ready or communication failed:', error);
                  document.getElementById('statusText').textContent = 'Cursor control not available on this page';
                });
              }
            });
          }

          lastHandPosition = currentHandPosition;
        }
      }
    }
  }
  ctx.restore();
}

// Helper function for mapping range with clamping
function mapRange(value, inMin, inMax, outMin, outMax) {
  // Clamp input value to the input range
  const clampedValue = Math.max(inMin, Math.min(inMax, value));
  // Map the clamped value to the output range
  return (clampedValue - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

// Function to start calibration
function startCalibration() {
  isCalibrating = true;
  calibrationStep = 0;
  calibrationData = {};
  document.getElementById('statusText').textContent = calibrationInstructions[calibrationStep];
  document.getElementById('calibrateButton').disabled = true;
  document.getElementById('startTracking').disabled = true;
}

// Function to stop calibration
function stopCalibration(message) {
  isCalibrating = false;
  calibrationStep = 0;
  document.getElementById('statusText').textContent = message;
  document.getElementById('calibrateButton').disabled = false;
  document.getElementById('startTracking').disabled = false;
}

// Initialize content script
async function initializeContentScript() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      throw new Error('No active tab found');
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    await new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tab.id, { action: 'ping' })
        .then(response => {
          if (response && response.status === 'ready') {
            resolve();
          } else {
            reject(new Error('Content script not ready'));
          }
        })
        .catch(reject);
    });

    return true;
  } catch (error) {
    console.error('Failed to initialize content script:', error);
    document.getElementById('statusText').textContent = 'Failed to initialize cursor control';
    return false;
  }
}

// Start hand tracking
async function startTracking() {
  if (!isTracking) {
    try {
      const contentScriptReady = await initializeContentScript();
      if (!contentScriptReady) {
        throw new Error('Failed to initialize content script');
      }

      const handsInitialized = await initHands();
      if (!handsInitialized) {
        throw new Error('Failed to initialize MediaPipe Hands');
      }

      const video = await initCamera();
      if (!video) {
        throw new Error('Failed to initialize camera');
      }      // Get actual tab dimensions and initialize center position
      tabDimensions = await getTabDimensions();
      centerPosition = {
        x: tabDimensions.width / 2,
        y: tabDimensions.height / 2
      };
      lastHandPosition = null;
      isFirstHandDetection = true;
        // Calculate resolution scaling factor for movement sensitivity
      resolutionScaleFactor = Math.min(
        1.0,
        Math.max(0.5, Math.sqrt(window.screen.width * window.screen.height) / 1920)
      );
      movementSensitivity = 2.0 * resolutionScaleFactor;
      
      console.log(`Resolution scaling factor: ${resolutionScaleFactor}`);
      console.log(`Movement sensitivity: ${movementSensitivity}`);
      console.log(`Screen resolution: ${window.screen.width}x${window.screen.height}`);
      console.log(`Window inner size: ${window.innerWidth}x${window.innerHeight}`);

      isTracking = true;
      document.getElementById('statusText').textContent = 'Active';
      document.getElementById('startTracking').disabled = true;
      document.getElementById('stopTracking').disabled = false;      // Get the best camera resolution
      const videoConstraints = await getBestVideoConstraints();
      
      const camera = new Camera(video, {
        onFrame: async () => {
          await hands.send({image: video});
        },
        width: videoConstraints.width,
        height: videoConstraints.height
      });
      camera.start();
    } catch (error) {
      console.error('Failed to start tracking:', error);
      document.getElementById('statusText').textContent = 'Error: ' + error.message;
      isTracking = false;
      document.getElementById('startTracking').disabled = false;
      document.getElementById('stopTracking').disabled = true;
    }
  }
}

// Stop hand tracking
function stopTracking() {
  isTracking = false;
  isHandVisible = false;
  isFist = false;
  lastFistState = false;
  lastValidPosition = null;
  if (fistCooldownTimeout) {
    clearTimeout(fistCooldownTimeout);
  }
  fistCooldown = false;
  
  document.getElementById('statusText').textContent = 'Inactive';
  document.getElementById('startTracking').disabled = false;
  document.getElementById('stopTracking').disabled = true;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const stream = video.srcObject;
  const tracks = stream.getTracks();
  tracks.forEach(track => track.stop());
  video.srcObject = null;

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'removeCursor' })
        .catch(error => console.log('Error removing cursor:', error));
    }
  });
}

// Add this new function to detect optimal camera settings
async function getBestVideoConstraints() {
  // Default fallback values
  let constraints = {
    width: 640,
    height: 480
  };
  
  try {
    // Get the display resolution
    const displayWidth = window.screen.width;
    const displayHeight = window.screen.height;
    
    // Use reasonable resolution based on display size
    // (Too high resolution can cause performance issues)
    if (displayWidth > displayHeight) {
      // Landscape orientation
      constraints = {
        width: Math.min(1280, displayWidth),
        height: Math.min(720, displayHeight)
      };
    } else {
      // Portrait orientation  
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

// Get actual browser tab dimensions from content script
async function getTabDimensions() {
  return new Promise((resolve) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'getDimensions'
        }).then(response => {
          if (response && response.width && response.height) {
            resolve({ width: response.width, height: response.height });
          } else {
            // Fallback to screen dimensions
            resolve({ width: screen.width, height: screen.height });
          }
        }).catch(error => {
          console.log('Failed to get tab dimensions:', error);
          // Fallback to screen dimensions
          resolve({ width: screen.width, height: screen.height });
        });
      } else {
        resolve({ width: screen.width, height: screen.height });
      }
    });
  });
}

// Event listeners
document.getElementById('startTracking').addEventListener('click', startTracking);
document.getElementById('stopTracking').addEventListener('click', stopTracking);
document.getElementById('calibrateButton').addEventListener('click', startCalibration);