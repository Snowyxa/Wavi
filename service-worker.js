// service-worker.js - Background script for hand tracking extension
// Handles communication between popup and content scripts

console.log('Hand tracking service worker loaded');

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Service worker received message:', message.action, 'from:', sender.tab ? 'content script' : 'popup');
  // Handle cursor removal with highest priority
  if (message.action === 'removeCursor') {
    // Forward remove cursor message to all tabs to ensure it's removed everywhere
    chrome.tabs.query({}, function(tabs) {
      let successCount = 0;
      const tabCount = tabs.filter(tab => !tab.url.startsWith('chrome://')).length;
      
      // For each valid tab, try to remove the cursor
      for (const tab of tabs) {
        if (!tab.url.startsWith('chrome://')) {
          try {
            // First try simple message sending
            chrome.tabs.sendMessage(tab.id, message)
              .then(() => {
                successCount++;
                console.log(`Cursor removal successful for tab ${tab.id}`);
                // If all tabs processed, respond
                if (successCount >= tabCount) {
                  sendResponse({ status: 'success', tabsProcessed: successCount });
                }
              })
              .catch(error => {
                console.log(`Failed to remove cursor from tab ${tab.id}, attempting script injection:`, error);
                
                // If message sending fails, try to inject the content script and retry
                chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  files: ['content.js']
                })
                .then(() => {
                  // Wait a bit for the script to initialize
                  setTimeout(() => {
                    chrome.tabs.sendMessage(tab.id, message)
                      .then(() => {
                        successCount++;
                        console.log(`Cursor removal successful after injection for tab ${tab.id}`);
                        // If all tabs processed, respond
                        if (successCount >= tabCount) {
                          sendResponse({ status: 'success', tabsProcessed: successCount });
                        }
                      })
                      .catch(retryError => {
                        console.log(`Failed to remove cursor after injection for tab ${tab.id}:`, retryError);
                        // Count it as processed anyway
                        successCount++;
                        if (successCount >= tabCount) {
                          sendResponse({ status: 'success', tabsProcessed: successCount });
                        }
                      });
                  }, 200);
                })
                .catch(injectionError => {
                  console.log(`Failed to inject content script into tab ${tab.id}:`, injectionError);
                  // Count as processed anyway
                  successCount++;
                  if (successCount >= tabCount) {
                    sendResponse({ status: 'success', tabsProcessed: successCount });
                  }
                });
              });
          } catch (error) {
            console.log(`Error processing tab ${tab.id}:`, error);
            successCount++;
            if (successCount >= tabCount) {
              sendResponse({ status: 'success', tabsProcessed: successCount });
            }
          }
        }
      }
      
      // If no valid tabs were found, respond immediately
      if (tabCount === 0) {
        sendResponse({ status: 'success', tabsProcessed: 0 });
      }
    });
    return true;
  }
  
  // Handle other actions
  if (message.action === 'moveCursor' || message.action === 'click' || message.action === 'getDimensions' || message.action === 'ping') {
    // Forward message to active content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        console.log('Forwarding message to tab:', tabs[0].id, 'URL:', tabs[0].url);        chrome.tabs.sendMessage(tabs[0].id, message)
          .then(response => {
            console.log('Content script responded:', response);
            sendResponse(response);
          })
          .catch(error => {
            console.log('Content script communication failed, attempting injection:', error);
            // Try to inject content script and then retry
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              files: ['content.js']
            }).then(() => {
              console.log('Content script injected, retrying message');
              // Wait a bit for the script to initialize
              setTimeout(() => {
                chrome.tabs.sendMessage(tabs[0].id, message)
                  .then(response => {
                    console.log('Content script responded after injection:', response);
                    sendResponse(response);
                  })
                  .catch(retryError => {
                    console.log('Content script still not responding after injection:', retryError);
                    sendResponse({ status: 'error', message: 'Content script injection failed' });
                  });
              }, 100);
            }).catch(injectionError => {
              console.log('Content script injection failed:', injectionError);
              sendResponse({ status: 'error', message: 'Content script injection failed' });
            });
          });
      } else {
        console.log('No active tab found');
        sendResponse({ status: 'error', message: 'No active tab found' });
      }
    });
    return true; // Keep message channel open for async response
  }
});

// Handle tab updates to ensure content script is injected
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    // Try to inject content script if it's not already there
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(error => {
      // Script might already be injected, ignore errors
      console.log('Content script injection result:', error.message);
    });
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Hand tracking extension started');
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Hand tracking extension installed');
});
