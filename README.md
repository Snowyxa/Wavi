# 👋 Wavi - Hand Gesture Cursor Control

**Wave goodbye to traditional mouse controls!** Wavi is a Chrome extension that transforms your webcam into a powerful gesture controller, allowing you to navigate websites with simple hand movements.

<div align="center">

![Version](https://img.shields.io/badge/version-1.1.4-blue.svg)
![Chrome Extension](https://img.shields.io/badge/chrome-extension-green.svg)
![Privacy First](https://img.shields.io/badge/privacy-first-orange.svg)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)

</div>

## ✨ Features

### 🎯 **Intuitive Control**
- **Index Finger Tracking** - Move your index finger to control the cursor
- **Fist Gestures** - Make a fist to click anywhere on the page
- **Real-time Response** - Ultra-low latency tracking for smooth interaction

### 🌐 **Universal Compatibility**
- **Works Everywhere** - Compatible with all websites including YouTube, social media, and complex web apps
- **Adaptive Positioning** - Automatically adjusts to different site layouts and UI structures
- **High Z-Index** - Cursor always visible, even on complex interfaces

### 🔒 **Privacy-Focused**
- **100% Local Processing** - All hand tracking happens in your browser
- **No Data Transmission** - Zero data sent to external servers
- **Camera Control** - Full control over when your camera is active

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
1. **🎬 Start Tracking** - Click the Wavi extension icon → "Start Tracking"
2. **📹 Grant Camera Access** - Allow camera permissions when prompted
3. **✋ Position Your Hand** - Hold your hand clearly in view of the camera
4. **👆 Point & Navigate** - Move your index finger to control the cursor
5. **🎯 Choose Your Gesture** - Select from multiple click options for accessibility
6. **📜 Scroll & Explore** - Enable scroll mode for hands-free page navigation

## 🎮 How to Use

### Click Gestures (Choose Your Preferred Method)
| Gesture | Action | Best For | Visual Feedback |
|---------|--------|----------|----------------|
| **👌 Pinch** | Touch thumb to index finger | Motor difficulties, precision | Red cursor when active |
| **✌️ Peace Sign** | Extend index & middle fingers | Quick gestures | Red cursor when active |
| **👍 Thumbs Up** | Thumb up, others closed | One-handed operation | Red cursor when active |
| **🖐️ Palm Close** | Open hand to closed fist | Traditional feel | Red cursor when active |
| **👊 Fist** | Make a fist (legacy) | Original users | Red cursor when active |

### Navigation & Movement
| Gesture | Action | Visual Feedback |
|---------|--------|----------------|
| **👆 Point** | Move cursor | Green circular cursor follows your finger |
| **📜 Scroll Mode** | Hand movement scrolls page | Blue cursor indicates scroll mode |
| **🖐️ Open Hand** | Idle state | Cursor remains visible but inactive |

### Pro Tips
- **Gesture Selection**: Use the dropdown menu to choose your preferred click gesture
- **Accessibility**: Pinch gesture is easiest for users with limited hand mobility  
- **Scroll Mode**: Toggle scroll mode on/off, adjust sensitivity as needed
- **Lighting**: Works best in well-lit environments
- **Distance**: Keep hand 1-2 feet from camera for optimal tracking
- **Stability**: Small, deliberate movements work better than large gestures

## 📁 Project Structure

```
wavi-extension/
├── 📄 manifest.json           # Extension configuration & permissions
├── 🎨 popup.html             # Extension popup interface
├── 🧠 popup.js               # Hand tracking engine & gesture logic
├── 🎯 content.js             # Cursor overlay & click handling
├── 💄 styles.css             # UI styling & animations
├── 📚 docs/                  # Documentation folder
│   ├── API-REFERENCE.md      # Technical API documentation
│   ├── DOCUMENTATION.md      # Complete implementation guide
│   ├── TROUBLESHOOTING.md    # Common issues & solutions
│   ├── requirements.md       # System requirements
│   ├── implementation-checklist.md
│   └── version-roadmap.md    # Development roadmap
└── 📦 lib/                   # MediaPipe libraries
    ├── hands_solution_packed_assets_loader.js
    ├── hands_solution_simd_wasm_bin.js
    ├── hands.js
    ├── camera_utils.js
    └── drawing_utils.js
```

## 📖 Documentation

| Document | Description |
|----------|-------------|
| 📘 **[Technical Documentation](./docs/DOCUMENTATION.md)** | Complete implementation guide & architecture |
| 🔧 **[API Reference](./docs/API-REFERENCE.md)** | Function definitions & code examples |
| 🆘 **[Troubleshooting Guide](./docs/TROUBLESHOOTING.md)** | Common issues & solutions |
| 📋 **[Requirements](./docs/requirements.md)** | System requirements & compatibility |
| 🗺️ **[Roadmap](./docs/version-roadmap.md)** | Future features & development timeline |

## 🎯 Current Status: v1.1.1

### ✅ Working Features
- ✅ **Real-time Hand Tracking** - MediaPipe-powered gesture recognition
- ✅ **Cursor Movement** - Smooth, responsive finger tracking
- ✅ **Click Functionality** - Reliable fist-based clicking
- ✅ **Site Compatibility** - Optimized for YouTube & complex layouts
- ✅ **Visual Feedback** - Clear cursor states and click confirmation
- ✅ **Privacy Protection** - 100% local processing

### 🔧 Recent Fixes (v1.1.1)
- **Fixed Y-axis Tracking** - Cursor no longer gets stuck at screen edges
- **YouTube Optimization** - Enhanced compatibility with complex website layouts
- **Coordinate Precision** - Resolved scaling issues for accurate positioning
- **Improved Responsiveness** - Better initial cursor placement and sensitivity

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