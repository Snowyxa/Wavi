// ui/handVisualization.js - Hand visualization and drawing utilities

/**
 * Hand Visualization Module
 * Handles drawing hand landmarks and connections on canvas
 */
class HandVisualization {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  /**
   * Process MediaPipe hand tracking results and draw visualization
   * @param {Object} results - MediaPipe results object
   * @param {Function} onHandDetected - Callback for when hand is detected with landmarks
   */
  processResults(results, onHandDetected) {
    // Clear canvas
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);
    
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
        // Draw hand landmarks and connections
        this.drawHandVisualization(landmarks);
        
        // Call the callback with landmarks for further processing
        if (onHandDetected) {
          onHandDetected(landmarks);
        }
      }
    }
    
    this.ctx.restore();
  }

  /**
   * Draw hand visualization (landmarks and connections)
   * @param {Array} landmarks - Hand landmarks
   */
  drawHandVisualization(landmarks) {
    // Draw connections
    if (typeof drawConnectors === 'function' && typeof HAND_CONNECTIONS !== 'undefined') {
      drawConnectors(this.ctx, landmarks, HAND_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 2
      });
    } else {
      console.warn('drawConnectors or HAND_CONNECTIONS not available - drawing basic connections');
      this.drawBasicHandConnections(landmarks);
    }
    
    // Draw landmarks
    if (typeof drawLandmarks === 'function') {
      drawLandmarks(this.ctx, landmarks, {
        color: '#FF0000',
        lineWidth: 1
      });
    } else {
      console.warn('drawLandmarks not available - drawing basic landmarks');
      this.drawBasicHandLandmarks(landmarks);
    }
  }

  /**
   * Fallback function to draw basic hand connections when MediaPipe drawing utils aren't available
   * @param {Array} landmarks - Hand landmarks
   */
  drawBasicHandConnections(landmarks) {
    if (!landmarks || landmarks.length < 21) return;
    
    // Basic hand connections (simplified version of HAND_CONNECTIONS)
    const connections = [
      [0,1],[1,2],[2,3],[3,4],     // Thumb
      [0,5],[5,6],[6,7],[7,8],     // Index finger
      [5,9],[9,10],[10,11],[11,12], // Middle finger
      [9,13],[13,14],[14,15],[15,16], // Ring finger
      [13,17],[0,17],[17,18],[18,19],[19,20] // Pinky and palm
    ];
    
    this.ctx.strokeStyle = '#00FF00';
    this.ctx.lineWidth = 2;
    
    connections.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      
      if (start && end) {
        this.ctx.beginPath();
        this.ctx.moveTo(start.x * this.canvas.width, start.y * this.canvas.height);
        this.ctx.lineTo(end.x * this.canvas.width, end.y * this.canvas.height);
        this.ctx.stroke();
      }
    });
  }

  /**
   * Fallback function to draw basic hand landmarks when MediaPipe drawing utils aren't available
   * @param {Array} landmarks - Hand landmarks
   */
  drawBasicHandLandmarks(landmarks) {
    if (!landmarks || landmarks.length < 21) return;
    
    this.ctx.fillStyle = '#FF0000';
    
    landmarks.forEach((landmark, index) => {
      if (landmark) {
        const x = landmark.x * this.canvas.width;
        const y = landmark.y * this.canvas.height;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, index === 8 ? 4 : 2, 0, 2 * Math.PI); // Larger dot for index finger tip
        this.ctx.fill();
      }
    });
  }
}

// Export for global access
window.HandVisualization = HandVisualization;
