// Import polyfills first - CRITICAL: Must be loaded before any other modules
import 'react-native-get-random-values';
import 'text-encoding-polyfill';

// Buffer polyfill for web - Required for docx and other Node.js libraries
import { Buffer } from 'buffer';
const process = require('process/browser');

// Set up global Buffer and process for all environments
const setupGlobals = () => {
  // Set up for Node.js-like global
  if (typeof global !== 'undefined') {
    global.Buffer = global.Buffer || Buffer;
    global.process = global.process || process;
  }

  // Set up for browser window
  if (typeof window !== 'undefined') {
    window.Buffer = window.Buffer || Buffer;
    window.process = window.process || process;
    // Ensure global also points to window in browser
    window.global = window.global || window;
  }

  // Set up for modern environments
  if (typeof globalThis !== 'undefined') {
    globalThis.Buffer = globalThis.Buffer || Buffer;
    globalThis.process = globalThis.process || process;
    globalThis.global = globalThis.global || globalThis;
  }

  // Fallback setup
  try {
    if (!globalThis.Buffer) {
      Object.defineProperty(globalThis, 'Buffer', {
        value: Buffer,
        writable: false,
        configurable: false
      });
    }
    if (!globalThis.process) {
      Object.defineProperty(globalThis, 'process', {
        value: process,
        writable: false,
        configurable: false
      });
    }
  } catch (e) {
    // Ignore errors if properties can't be defined
  }
};

// Setup immediately
setupGlobals();

// Additional polyfills for crypto if needed
if (typeof window !== 'undefined' && !window.crypto) {
  try {
    window.crypto = require('expo-crypto');
  } catch (e) {
    // Fallback if expo-crypto is not available
    console.warn('expo-crypto not available for crypto polyfill');
  }
}

// Font polyfill for web - Required for @expo/vector-icons
if (typeof window !== 'undefined') {
  // Mock expo-font for web environments
  const fontLoader = {
    default: {
      getLoadedFonts: () => {
        console.warn('ExpoFontLoader.getLoadedFonts called on web - returning empty array');
        return [];
      },
      loadAsync: (fontFamily, source) => {
        console.warn('ExpoFontLoader.loadAsync called on web - fonts should be loaded via CSS');
        return Promise.resolve();
      }
    }
  };

  // Set up in multiple ways to ensure it's available
  window.ExpoFontLoader = fontLoader;
  global.ExpoFontLoader = fontLoader;
  
  // Also try to set it on globalThis
  if (typeof globalThis !== 'undefined') {
    globalThis.ExpoFontLoader = fontLoader;
  }
}

// BackHandler polyfill for React Native compatibility
try {
  const { BackHandler } = require('react-native');
  
  // Check if BackHandler exists and patch it if needed
  if (BackHandler && !BackHandler.removeEventListener) {
    console.log('Patching BackHandler for compatibility');
    
    // Store original methods
    const originalAddEventListener = BackHandler.addEventListener;
    
    // Create a map to store event listeners
    const eventListeners = new Map();
    
    // Override addEventListener to track listeners
    BackHandler.addEventListener = function(eventName, handler) {
      // Call original method
      const subscription = originalAddEventListener.call(this, eventName, handler);
      
      // Store the subscription for removal
      if (!eventListeners.has(eventName)) {
        eventListeners.set(eventName, new Set());
      }
      eventListeners.get(eventName).add({ handler, subscription });
      
      return subscription;
    };
    
    // Add removeEventListener for backward compatibility
    BackHandler.removeEventListener = function(eventName, handler) {
      console.log('BackHandler.removeEventListener called (polyfilled)');
      
      const listeners = eventListeners.get(eventName);
      if (listeners) {
        for (const listener of listeners) {
          if (listener.handler === handler) {
            // Remove the subscription
            if (listener.subscription && listener.subscription.remove) {
              listener.subscription.remove();
            }
            listeners.delete(listener);
            break;
          }
        }
      }
    };
  }
} catch (e) {
  console.warn('BackHandler polyfill failed:', e.message);
}

// Ensure the polyfills are applied
console.log('Polyfills loaded - Buffer available:', typeof Buffer !== 'undefined');
