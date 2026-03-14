# EC Meals App — CLAUDE.md

## Project Overview
React Native + Expo mobile/web app for meal management at Ernescliff (EC). Supports student and admin roles. Deployed as a web app (Netlify/Vercel) and native iOS app (App Store via EAS).

## Tech Stack
- **Framework**: React Native 0.81.4 + Expo 54
- **Navigation**: React Navigation (bottom tabs + stack)
- **State**: Jotai atoms (auth state, persisted via AsyncStorage on mobile)
- **Forms**: React Hook Form + Yup validation
- **Push Notifications**: Expo Notifications + Firebase
- **Deployment**: Netlify (web), EAS (iOS/Android)

## Key Files
- `App.js` — Root component, navigation setup, role-based tabs
- `_helpers/Atoms.js` — All global Jotai atoms (token, username, role, preferences)
- `_helpers/useFetch.js` — Auth-injecting fetch hook; auto-logs out on 401
- `_helpers/Schemas/` — Yup form schemas
- `Pages/Meals/Week.js` — Core meal selection UI (7-day × meal-type matrix)
- `Pages/Admin/` — Admin-only screens (users, meals, diets, logs)
- `app.config.js` — Expo config (version, permissions, plugins, project ID)
- `eas.json` — Native build profiles (dev, preview, production)
- `.env.test` / `.env.production` — Environment configs

## Environment Variables
| Variable | Purpose | Example |
|---|---|---|
| `EXPO_PUBLIC_BACKEND_API` | Backend URL | `https://ec-meals-backend.vercel.app` |
| `EXPO_PUBLIC_BEFORE_WAIT_FOR_NEXT_CYCLE` | Timer config (seconds) | `10` |
| `EXPO_PUBLIC_AFTER_WAIT_FOR_NEXT_CYCLE` | Timer config (seconds) | `10` |

Development backend: `http://192.168.168.89:3000` (update `.env.test` to match your local IP).

## Running Locally
```bash
npm start           # Dev server (test env)
npm run start_prod  # Dev server (production env)
npm run web         # Web browser
npm run android     # Android emulator
npm run ios         # iOS simulator
```

## Building & Deploying
```bash
npm run build       # Build web (dist/)
npm run publish     # Deploy web to Netlify (production)
npm run test        # Deploy web to Netlify (test)
npm run ios_deploy  # EAS build + submit to App Store
```

## Architecture Notes
- **Role-based navigation**: Auth atom `role` field controls which tabs are rendered
- **Polling**: Uses `useTimer` hook to poll for updates; no WebSocket/real-time
- **Polyfills**: `polyfills.js` must be first import in `index.js` (Buffer, process, crypto for web)
- **Web vs Mobile**: AsyncStorage persistence only runs on mobile (`Platform.OS !== 'web'`)
- **Firebase**: `google-services.json` and admin SDK key are in the repo — do not add new secrets to version control

## Common Patterns
- All API calls go through `useFetch` which injects the JWT token from Jotai atom
- 401 responses automatically clear auth state and force re-login
- `useAlert` wraps platform differences between React Native Alert and web browser confirm/alert
- Admin screens are inside a Stack navigator mounted within the tab navigator

## Things to Watch Out For
- No test suite exists — test manually before deploying
- `.env` (dev) is intentionally empty; `.env.test` is used for local dev
- The `app/` directory (Expo Router structure) exists but is not actively used — navigation is handled by React Navigation in `App.js`
- `docx` library is used to generate Word document reports — see admin export screens
