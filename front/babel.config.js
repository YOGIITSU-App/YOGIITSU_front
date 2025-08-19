module.exports = function (api) {
  const plugins = [];

  // 릴리즈(프로덕션)에서만 콘솔 제거
  if (api.env('production')) {
    plugins.push(['transform-remove-console', { exclude: ['error', 'warn'] }]);
  }

  // Reanimated 플러그인은 항상 마지막!
  plugins.push('react-native-reanimated/plugin');

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins,
  };
};
