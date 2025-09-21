// Custom entry point to ensure polyfills load first
import './polyfills';

// Now load the main app
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
