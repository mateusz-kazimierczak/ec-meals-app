# EC Meals App

A cross-platform mobile and web application for managing meal preferences at Ernescliff. Students can view and set their weekly meal choices; admins can manage users, meals, diets, and view change logs.

## What It Does

- **Students**: Log in, select meals for each day of the week, manage notification preferences
- **Admins**: View/edit all users, manage daily meal rosters, define diet types, export reports, view audit logs
- **All users**: See upcoming meals and birthday reminders on the home screen

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.81 + Expo 54 |
| Web support | react-native-web |
| Navigation | React Navigation (tabs + stack) |
| State | Jotai (lightweight atoms) |
| Forms | React Hook Form + Yup |
| Push notifications | Expo Notifications + Firebase |
| Web deploy | Netlify |
| Native deploy | EAS (Expo Application Services) |

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- For iOS native: Xcode + Apple Developer account
- For Android native: Android Studio

### Installation
```bash
cd ec-meals-app
npm install
```

### Configuration

Create a `.env.local` file in the root of this directory:

```env
EXPO_PUBLIC_BACKEND_API=http://YOUR_LOCAL_IP:3000
EXPO_PUBLIC_BEFORE_WAIT_FOR_NEXT_CYCLE=10
EXPO_PUBLIC_AFTER_WAIT_FOR_NEXT_CYCLE=10
EXPO_PUBLIC_DEV_URL=http://localhost:3000
```

Update `EXPO_PUBLIC_BACKEND_API` to your local machine's IP when running against a local backend.

### Running

```bash
npm start           # Expo dev server (test environment)
npm run web         # Open in browser
npm run android     # Android emulator
npm run ios         # iOS simulator
npm run start_prod  # Use production backend
```

## Building & Deploying

### Web (Netlify)
```bash
npm run build       # Build to dist/: npx expo export -p web --clear
npm run publish     # Deploy to Netlify (production): sudo netlify deploy --dir dist --prod
npm run test        # Deploy to Netlify (test/staging)
```

### iOS (App Store)
```bash
npm run ios_deploy  # EAS build + submit to App Store
```

### Android
Configure a profile in `eas.json` and run:
```bash
eas build --platform android --profile production
```

## Project Structure

```
ec-meals-app/
├── App.js                    # Root component, navigation, auth gate
├── Pages/                    # Screen components
│   ├── Auth/                 # Login screen
│   ├── Home/                 # Home screen (meals widget, birthdays)
│   ├── Meals/                # Weekly meal selection
│   ├── Admin/                # Admin panel (users, meals, diets, logs)
│   └── Pref/                 # User preferences & notification settings
├── components/               # Reusable UI components
├── _helpers/                 # Hooks, utilities, global state
│   ├── Atoms.js              # Jotai atoms (auth state)
│   ├── useFetch.js           # Authenticated fetch hook
│   ├── useAlert.js           # Cross-platform alert
│   └── Schemas/              # Yup validation schemas
└── assets/                   # Images, sounds
```

## Authentication

JWT-based. On login, the token is stored in the Jotai auth atom (persisted via AsyncStorage on mobile). All API calls inject this token via the `useFetch` hook. A 401 response automatically clears auth and sends the user back to the login screen.

**User roles:**
- `student` — access to Meals and Preferences tabs
- `admin` — access to Meals, Admin, and Preferences tabs

## Environment Files

| File | Used For |
|---|---|
| `.env` | Default (currently empty) |
| `.env.test` | Local development (points to local backend) |
| `.env.production` | Production builds |

## Notable Dependencies

- `docx` — Generates Word document reports (admin export feature)
- `react-native-background-fetch` — Background polling for notifications
- `polyfills.js` — Must be first import; patches Node.js APIs for web builds

## Known Limitations

- No automated test suite — manual testing required before releases
- Development backend IP is hardcoded in `.env.test` — update to your machine's local IP
- The `app/` directory (Expo Router) exists but is unused — navigation uses React Navigation
