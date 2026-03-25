export default {
  "expo": {
    "name": "EC Meals",
    "slug": "ec",
    "scheme": "ec",
    "version": "1.2.3",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "buildNumber": "3",
      "supportsTablet": false,
      "bundleIdentifier": "com.anonymous.ec",
      "infoPlist": {
        "NSAppTransportSecurity": {
          "NSExceptionDomains": {
            "example.com": {
              "NSIncludesSubdomains": true,
              "NSTemporaryExceptionAllowsInsecureHTTPLoads": true,
              "NSTemporaryExceptionMinimumTLSVersion": "TLSv1.1"
            }
          }
        }
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.anonymous.ec",
      "googleServicesFile": process.env.GOOGLE_SERVICES_JSON,
      "softwareKeyboardLayoutMode": "pan",
      "navigationBar": {
        "visible": true,
        "style": "light"
      }
    },
    "web": {
      "bundler": "metro",
      "build": {
        "babel": {
          "include": ["@expo/vector-icons"]
        }
      }
    },
    "plugins": [
      "expo-router",
      "react-native-background-fetch",
      [
        "expo-build-properties",
        {
          "android": {
            "usesCleartextTraffic": true
          }
        }
      ],
      "react-native-background-fetch",
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#ffffff",
          "defaultChannel": "default",
          "sounds": [
            "./assets/bell.wav",
          ]
        }
      ]
    ],
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "352dbf17-b2c1-4500-9e25-3273903254fe"
      }
    }
  }
}
