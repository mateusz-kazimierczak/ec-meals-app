module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      // The preset and its options are now in a single nested array
      ['babel-preset-expo'],
    ],
  };
};
