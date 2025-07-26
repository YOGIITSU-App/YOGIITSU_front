module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        allowUndefined: true,
      },
    ],
    ...(process.env.NODE_ENV === 'production'
      ? [['transform-remove-console', {exclude: ['error', 'warn']}]]
      : []),
    'react-native-reanimated/plugin', // 항상 마지막에 위치!
  ],
};
