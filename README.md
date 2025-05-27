# 👋 Wavi - Auto-Starting Hand Gesture Control

**Wave goodbye to traditional mouse controls!** Wavi is a Chrome extension that transforms your webcam into a powerful gesture controller, allowing you to navigate websites with simple hand movements. Now with **instant auto-start** - no buttons needed!

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Chrome Extension](https://img.shields.io/badge/chrome-extension-green.svg)
![Auto Start](https://img.shields.io/badge/auto--start-enabled-brightgreen.svg)
![Privacy First](https://img.shields.io/badge/privacy-first-orange.svg)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)

</div>

## ✨ Features

### 🚀 **Instant Auto-Start**
- **Zero-Click Activation** - Tracking starts automatically when you open the extension
- **No Button Required** - Simply open the popup and start gesturing
- **Instant Feedback** - Modern UI with real-time status indicators

### 🎯 **Intuitive Control**
- **Index Finger Tracking** - Move your index finger to control the cursor
- **Fist Gestures** - Make a fist to click anywhere on the page
- **Real-time Response** - Ultra-low latency tracking for smooth interaction

### 🎨 **Beautiful Modern Interface**
- **Gradient Design** - Sleek, modern UI with smooth animations
- **Status Indicators** - Visual feedback with color-coded status dots
- **Dark Mode Support** - Automatically adapts to your system theme
- **Responsive Layout** - Works perfectly on all screen sizes

### 🌐 **Universal Compatibility**
- **Works Everywhere** - Compatible with all websites including YouTube, social media, and complex web apps
- **Adaptive Positioning** - Automatically adjusts to different site layouts and UI structures
- **High Z-Index** - Cursor always visible, even on complex interfaces

### 🔒 **Privacy-Focused**
- **100% Local Processing** - All hand tracking happens in your browser
- **No Data Transmission** - Zero data sent to external servers
- **Camera Control** - Full control over when your camera is active
- **Secure by Design** - No tracking, no analytics, no data collection

### ⚡ **Performance Optimized**
- **MediaPipe Integration** - Leverages Google's advanced hand tracking technology
- **Adaptive Sensitivity** - Automatically adjusts to your screen resolution
- **Advanced Smoothing** - Multi-layer smoothing system reduces jitter for improved accessibility
- **Dead Zone Technology** - Ignores micro-movements for stable cursor positioning

## 🚀 Quick Start

### Installation
1. **Download & Install**
   ```bash
   git clone https://github.com/your-username/wavi-extension.git
   cd wavi-extension
   ```

2. **Load in Chrome**
   - Open Chrome → Navigate to `chrome://extensions/`
   - Enable **"Developer mode"** (top-right toggle)
   - Click **"Load unpacked"** → Select the project folder
   - 🎉 Wavi icon appears in your toolbar!

### First Use
1. **🎬 Instant Start** - Click the Wavi extension icon and tracking starts automatically!
2. **📹 Grant Camera Access** - Allow camera permissions when prompted (one-time only)
3. **✋ Position Your Hand** - Hold your hand clearly in view of the camera
4. **👆 Point & Navigate** - Move your index finger to control the cursor immediately
5. **✊ Make a Fist** - Close your hand to click anywhere on the page
6. **🎯 Enjoy Seamless Control** - No buttons to press, no setup required!

## 🎮 How to Use

### Core Gestures
| Gesture | Action | Visual Feedback |
|---------|--------|----------------|
| **👆 Point** | Move cursor | Green circular cursor follows your finger |
| **✊ Fist** | Click action | Red cursor when fist is detected |
| **🖐️ Open Hand** | Idle state | Normal cursor, no action |

### Getting Started
1. **Open Extension** - Click the Wavi icon in your Chrome toolbar
2. **Auto-Start Magic** - Tracking begins automatically (no buttons needed!)
3. **Grant Permissions** - Allow camera access when prompted
4. **Start Gesturing** - Point your index finger to move the cursor
5. **Click with Fist** - Make a fist gesture to click

### Pro Tips
- **Lighting**: Works best in well-lit environments
- **Distance**: Keep hand 1-2 feet from camera for optimal tracking
- **Stability**: Small, deliberate movements work better than large gestures
- **Camera Position**: Ensure your hand is clearly visible in the camera view
- **Performance**: Close other camera-using apps for best performance

## 📁 Project Structure

```
wavi-extension/
├── 📄 manifest.json           # Extension configuration & permissions
├── 🎨 popup.html             # Modern auto-start interface
├── 🧠 popup.js               # Auto-starting hand tracking engine
├── 🎯 content.js             # Cursor overlay & click handling
├── 💄 styles.css             # Beautiful modern UI with animations
├── ⚙️ config.js              # Configuration settings
├── 🔧 service-worker.js      # Background service worker
├── 📚 docs/                  # Comprehensive documentation
│   ├── API-REFERENCE.md      # Technical API documentation
│   ├── DOCUMENTATION.md      # Complete implementation guide
│   ├── TROUBLESHOOTING.md    # Common issues & solutions
│   ├── requirements.md       # System requirements
│   └── version-roadmap.md    # Development roadmap
├── 🎨 icons/                 # Extension icons
│   └── icon.svg
├── 📦 lib/                   # MediaPipe libraries
│   ├── hands_solution_packed_assets_loader.js
│   ├── hands_solution_simd_wasm_bin.js
│   ├── hands.js
│   ├── camera_utils.js
│   └── drawing_utils.js
└── 🔧 modules/               # Modular components
    ├── cameraUtils.js
    ├── communication.js
    ├── gestureDetection.js
    ├── handTracking.js
    └── smoothing.js
```

## 📖 Documentation

| Document | Description |
|----------|-------------|
| 📘 **[Technical Documentation](./docs/DOCUMENTATION.md)** | Complete implementation guide & architecture |
| 🔧 **[API Reference](./docs/API-REFERENCE.md)** | Function definitions & code examples |
| 🆘 **[Troubleshooting Guide](./docs/TROUBLESHOOTING.md)** | Common issues & solutions |
| 📋 **[Requirements](./docs/requirements.md)** | System requirements & compatibility |
| 🗺️ **[Roadmap](./docs/version-roadmap.md)** | Future features & development timeline |

## 🎯 Current Status: v2.0.0

### 🆕 New in v2.0.0
- ✅ **Auto-Start Technology** - Tracking begins instantly when popup opens
- ✅ **Modern UI Redesign** - Beautiful gradient interface with status indicators
- ✅ **Zero-Button Experience** - No more start/stop buttons needed
- ✅ **Enhanced Visual Feedback** - Color-coded status dots and smooth animations
- ✅ **Dark Mode Support** - Automatically adapts to system preferences
- ✅ **Improved Accessibility** - Better contrast and visual indicators

### ✅ Core Features
- ✅ **Real-time Hand Tracking** - MediaPipe-powered gesture recognition
- ✅ **Cursor Movement** - Smooth, responsive finger tracking
- ✅ **Click Functionality** - Reliable fist-based clicking
- ✅ **Site Compatibility** - Optimized for YouTube & complex layouts
- ✅ **Visual Feedback** - Clear cursor states and click confirmation
- ✅ **Privacy Protection** - 100% local processing

### 🔧 Technical Improvements
- **Enhanced Performance** - Optimized initialization and resource management
- **Better Error Handling** - Improved camera permission and error states
- **Smoother Animations** - Hardware-accelerated CSS transitions
- **Responsive Design** - Mobile and desktop optimized layouts

## 🔧 System Requirements

- **Browser**: Chrome 88+ (Chromium-based browsers)
- **Camera**: Any standard webcam (built-in or external)
- **Lighting**: Adequate ambient lighting for hand detection
- **Performance**: Modern CPU for real-time processing

## 🛡️ Privacy & Security

Wavi is designed with **privacy-first principles**:

- 🔒 **Local Processing Only** - Hand tracking happens entirely in your browser
- 🚫 **Zero Data Collection** - No personal data, images, or gestures are stored
- 📹 **Camera Control** - You control when the camera is active
- 🌐 **No Network Requests** - Extension works completely offline
- 🔐 **Standard Permissions** - Only requests necessary camera access

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and feel free to:

- 🐛 **Report Bugs** - Help us improve by reporting issues
- 💡 **Suggest Features** - Share ideas for new gestures or functionality
- 🔧 **Submit PRs** - Contribute code improvements or new features
- 📖 **Improve Docs** - Help make our documentation even better

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google MediaPipe** - For the incredible hand tracking technology
- **Chrome Extensions API** - For providing the platform
- **Open Source Community** - For inspiration and continuous improvement

---

<div align="center">

**Made with ❤️ for a more accessible web**

[Documentation](./docs/DOCUMENTATION.md) • [API Reference](./docs/API-REFERENCE.md) • [Troubleshooting](./docs/TROUBLESHOOTING.md)

</div>
- Requires camera access for hand tracking functionality

## License

MIT License