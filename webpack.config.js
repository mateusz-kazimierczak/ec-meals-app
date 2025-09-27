const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const fs = require('fs');
const path = require('path');

// Function to load environment variables from .env files
const loadEnvFile = (envPath) => {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          envVars[key.trim()] = value;
        }
      }
    });
    
    return envVars;
  }
  return {};
};

module.exports = async function(env, argv) {
  // Load environment variables from .env.prod if NODE_ENV is prod
  const envFile = process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env.test';
  const envPath = path.join(__dirname, envFile);
  const envVarsFromFile = loadEnvFile(envPath);
  
  // Merge with process.env (file variables take precedence if not already set)
  Object.keys(envVarsFromFile).forEach(key => {
    if (!process.env[key]) {
      process.env[key] = envVarsFromFile[key];
    }
  });
  
  console.log(`Loading environment from: ${envFile}`);
  console.log('Available EXPO_PUBLIC variables:', Object.keys(process.env).filter(k => k.startsWith('EXPO_PUBLIC_')));

  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@expo/vector-icons']
    }
  }, argv);

  // Add polyfills
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "buffer": require.resolve("buffer"),
    "stream": require.resolve("stream-browserify"),
    "process": require.resolve("process/browser"),
    "crypto": require.resolve("expo-crypto"),
    "expo-font": false // Disable expo-font for web
  };

  const webpack = require('webpack');
  
  // Get environment variables for injection
  const envVars = {};
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('EXPO_PUBLIC_') || key === 'NODE_ENV') {
      envVars[`process.env.${key}`] = JSON.stringify(process.env[key]);
    }
  });

  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      ...envVars, // Inject environment variables
      'global.ExpoFontLoader': JSON.stringify({
        default: {
          getLoadedFonts: () => [],
          loadAsync: () => Promise.resolve()
        }
      })
    })
  );

  return config;
};