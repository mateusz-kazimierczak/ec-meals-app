const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
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
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
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