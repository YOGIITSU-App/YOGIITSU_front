import analytics from '@react-native-firebase/analytics';

export const logScreen = async (screenName: string) => {
  await analytics().logScreenView({
    screen_name: screenName,
    screen_class: screenName,
  });
};
