// communication.js - Chrome extension messaging and tab communication
// This module handles communication with content scripts and tab management

/**
 * Send cursor movement message to active tab via service worker
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {boolean} isHandVisible - Whether hand is currently visible
 * @param {boolean} isFist - Whether fist gesture is active
 */
function sendCursorMovement(x, y, isHandVisible, isFist) {
  chrome.runtime.sendMessage({
    action: 'moveCursor',
    x: x,
    y: y,
    isHandVisible: isHandVisible,
    isFist: isFist
  }).catch(error => {
    console.log('Service worker communication failed:', error);
  });
}

/**
 * Send click event to active tab via service worker
 * @param {number} x - X coordinate of click
 * @param {number} y - Y coordinate of click
 */
function sendClickEvent(x, y) {
  chrome.runtime.sendMessage({
    action: 'click',
    x: x,
    y: y
  }).catch(error => {
    console.log('Service worker communication failed for click:', error);
  });
}

/**
 * Get dimensions of the active tab via service worker
 * @returns {Promise<Object>} - Promise resolving to dimensions object
 */
async function getTabDimensions() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getDimensions'
    });
    
    if (response && response.width && response.height) {
      return { width: response.width, height: response.height };
    } else {
      // Fallback to screen dimensions
      return { width: screen.width, height: screen.height };
    }
  } catch (error) {
    console.log('Service worker communication failed for dimensions');
    // Fallback to screen dimensions
    return { width: screen.width, height: screen.height };
  }
}

/**
 * Check if content script is ready in active tab via service worker
 * @returns {Promise<boolean>} - Promise resolving to readiness status
 */
async function checkContentScriptReady() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'ping'
    });
    return response && response.status === 'ready';
  } catch (error) {
    console.log('Service worker ping failed:', error);
    return false;
  }
}

/**
 * Send removal message to content script via service worker
 */
function sendCursorRemoval() {
  chrome.runtime.sendMessage({
    action: 'removeCursor'
  }).catch(error => {
    console.log('Service worker communication failed for cursor removal');
  });
}

/**
 * Log debug information about communication
 * @param {string} message - Debug message
 * @param {Object} data - Additional data to log
 */
function logCommunication(message, data = {}) {
  console.log(`[Communication] ${message}`, data);
}

// Export functions for use in other modules
window.Communication = {
  sendCursorMovement,
  sendClickEvent,
  getTabDimensions,
  checkContentScriptReady,
  sendCursorRemoval,
  logCommunication
};
