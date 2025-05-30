// Create cursor element
let cursor = null;

function createCursor() {
  // First check if cursor already exists in the page
  const existingCursor = document.getElementById('handtracking-cursor');
  if (existingCursor) {
    // If it exists but not in our reference, update our reference
    if (cursor !== existingCursor) {
      cursor = existingCursor;
      console.log('Using existing cursor element');
      return;
    }
  }
  
  // Remove any existing cursors first to prevent duplicates
  const oldCursors = document.querySelectorAll('#handtracking-cursor');
  if (oldCursors.length > 0) {
    console.log(`Found ${oldCursors.length} existing cursors, removing them`);
    oldCursors.forEach(oldCursor => {
      if (oldCursor && oldCursor.parentNode) {
        oldCursor.style.display = 'none';
        oldCursor.parentNode.removeChild(oldCursor);
      }
    });
  }
  
  // Create new cursor
  if (!cursor || !document.body.contains(cursor)) {
    cursor = document.createElement('div');
    cursor.id = 'handtracking-cursor';
    // All styles now come from content-styles.css
    document.body.appendChild(cursor);
    initializeCursor();
    console.log('Hand tracking cursor created and added to page');
  }
}

// Initialize cursor position to center of viewport
function initializeCursor() {
  if (!cursor) return;
  const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
  const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  cursor.style.left = `${viewportWidth / 2}px`;
  cursor.style.top = `${viewportHeight / 2}px`;
  cursor.style.opacity = '0.8';
  cursor.style.display = 'block'; // Ensure cursor is visible
  console.log(`Cursor initialized at center: ${viewportWidth / 2}px, ${viewportHeight / 2}px`);
}

// Call initialization
createCursor();

// Also create cursor when page is fully loaded (backup)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createCursor);
} else {
  createCursor();
}

// Update cursor position relative to viewport and scroll
function updateCursorPosition(x, y) {
  if (!cursor) {
    console.warn('Cursor element not found, creating new one');
    createCursor();
    return;
  }
  
  // For YouTube and similar sites, use viewport-relative positioning
  // since they have complex layouts that can interfere with absolute positioning
  const isYouTube = window.location.hostname.includes('youtube.com');
  
  if (isYouTube) {
    // Use fixed positioning relative to viewport for YouTube
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Clamp to viewport bounds
    const finalX = Math.max(0, Math.min(x, viewportWidth - 20));
    const finalY = Math.max(0, Math.min(y, viewportHeight - 20));

    cursor.style.left = `${finalX}px`;
    cursor.style.top = `${finalY}px`;
    cursor.style.opacity = '0.8';
    cursor.style.display = 'block';
    
    console.log(`YouTube cursor position: x=${x}, y=${y}, finalX=${finalX}, finalY=${finalY}, viewport=${viewportWidth}x${viewportHeight}`);
  } else {
    // Standard positioning for other sites
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    let finalX = x + scrollX;
    let finalY = y + scrollY;

    // Clamp cursor position to document bounds
    const maxWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
    const maxHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    
    finalX = Math.max(0, Math.min(finalX, maxWidth - 20));
    finalY = Math.max(0, Math.min(finalY, maxHeight - 20));

    cursor.style.left = `${finalX}px`;
    cursor.style.top = `${finalY}px`;
    cursor.style.opacity = '0.8';
    cursor.style.display = 'block';
    
    console.log(`Standard cursor position: x=${x}, y=${y}, finalX=${finalX}, finalY=${finalY}`);
  }
}

// Function to simulate click at position
function simulateClick(x, y) {
  // Create and dispatch mouse events
  const events = [
    new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: x,
      clientY: y
    }),
    new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: x,
      clientY: y
    }),
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: x,
      clientY: y
    })
  ];

  // Find element at position
  const element = document.elementFromPoint(x, y);
  if (element) {
    events.forEach(event => element.dispatchEvent(event));
  }
}

// Function to show click feedback
function showClickFeedback() {
  if (!cursor) return;
  cursor.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
  setTimeout(() => {
    if (cursor) cursor.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
  }, 200);
}

// Listen for messages from the service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message.action, message);
  
  if (message.action === 'ping') {
    sendResponse({ status: 'ready' });
    return true;
  }if (message.action === 'getDimensions') {
    const isYouTube = window.location.hostname.includes('youtube.com');
    
    if (isYouTube) {
      // For YouTube, use viewport dimensions
      sendResponse({ width: window.innerWidth, height: window.innerHeight });
    } else {
      // For other sites, use the larger of viewport or document dimensions
      const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
      const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
      sendResponse({ width: viewportWidth, height: viewportHeight });
    }
    return true;  }  if (message.action === 'removeCursor') {
    // Ensure cursor is completely removed from the page
    if (cursor) {
      if (cursor.parentNode) {
        cursor.style.display = 'none';  // Hide immediately
        cursor.parentNode.removeChild(cursor);
      }
      cursor = null;
      console.log('Cursor removed from page');
    }
    
    // Find and remove any orphaned cursors by ID
    const orphanedCursors = document.querySelectorAll('#handtracking-cursor');
    orphanedCursors.forEach(orphanedCursor => {
      if (orphanedCursor && orphanedCursor.parentNode) {
        orphanedCursor.style.display = 'none';
        orphanedCursor.parentNode.removeChild(orphanedCursor);
        console.log('Orphaned cursor found and removed');
      }
    });
    
    // Find any cursors that might have been created with a different ID
    const allDivs = document.querySelectorAll('div');
    for (const div of allDivs) {
      // Check for elements that might be our cursor based on style properties
      if (div.style.backgroundColor && 
          (div.style.backgroundColor.includes('rgba(0, 255, 0') || 
           div.style.backgroundColor.includes('rgba(255, 0, 0'))) {
        if (div.style.position === 'fixed' || div.style.position === 'absolute') {
          if (div.parentNode) {
            div.style.display = 'none';
            div.parentNode.removeChild(div);
            console.log('Potential cursor element removed');
          }
        }
      }
    }
    
    sendResponse({ status: 'success' });
    return true;
  }if (message.action === 'moveCursor') {
    try {
      if (!cursor) createCursor();
      const { x, y, isHandVisible, isFist } = message;
      updateCursorPosition(x, y);
      cursor.style.opacity = isHandVisible ? '0.8' : '0.3';
      
      // Update cursor appearance based on gesture state
      if (isFist) {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
        cursor.style.backgroundColor = 'rgba(255, 0, 0, 0.7)'; // Red for active gesture
      } else {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.backgroundColor = 'rgba(0, 255, 0, 0.5)'; // Green for normal mode
      }
      
      sendResponse({ status: 'success' });
    } catch (error) {
      sendResponse({ status: 'error', message: error.message });
    }
    return true;
  }if (message.action === 'click') {
    try {
      if (!cursor) createCursor();
      const { x, y } = message;
      simulateClick(x, y);
      showClickFeedback();
      sendResponse({ status: 'success' });
    } catch (error) {
      sendResponse({ status: 'error', message: error.message });    }
    return true;
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  if (cursor && cursor.style.opacity === '0') {
    initializeCursor();
  }
});

// Notify that content script is loaded
console.log('Hand tracking cursor control content script loaded'); 