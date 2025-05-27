// communication.js - Chrome extension messaging and tab communication
// This module handles communication with content scripts and tab management

/**
 * Send cursor movement message to active tab
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {boolean} isHandVisible - Whether hand is currently visible
 * @param {boolean} isFist - Whether fist gesture is active
 */
function sendCursorMovement(x, y, isHandVisible, isFist) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'moveCursor',
        x: x,
        y: y,
        isHandVisible: isHandVisible,
        isFist: isFist
      }).catch(error => {
        console.log('Content script not ready:', error);
      });
    }
  });
}

/**
 * Send click event to active tab
 * @param {number} x - X coordinate of click
 * @param {number} y - Y coordinate of click
 */
function sendClickEvent(x, y) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'click',
        x: x,
        y: y
      }).catch(error => {
        console.log('Content script not ready or communication failed:', error);
      });
    }
  });
}

/**
 * Get dimensions of the active tab
 * @returns {Promise<Object>} - Promise resolving to dimensions object
 */
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
          }        }).catch(error => {
          // Silently handle connection errors - content script may not be ready
          console.log('Content script not ready for tab dimensions');
          // Fallback to screen dimensions
          resolve({ width: screen.width, height: screen.height });
        });
      } else {
        resolve({ width: screen.width, height: screen.height });
      }
    });
  });
}

/**
 * Check if content script is ready in active tab
 * @returns {Promise<boolean>} - Promise resolving to readiness status
 */
async function checkContentScriptReady() {
  return new Promise((resolve) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'ping'
        }).then(response => {
          resolve(response && response.status === 'ready');
        }).catch(error => {
          console.log('Content script ping failed:', error);
          resolve(false);
        });
      } else {
        resolve(false);
      }
    });
  });
}

/**
 * Send removal message to content script
 */
function sendCursorRemoval() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'removeCursor'
      }).catch(error => {
        // Silently handle connection errors - content script may not be ready
        console.log('Content script not ready for cursor removal');
      });
    }
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
