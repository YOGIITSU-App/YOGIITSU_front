#import "AppDelegate.h"

#import <GoogleMaps/GoogleMaps.h>
#import "RNBootSplash.h"
#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [GMSServices provideAPIKey:@"AIzaSyDxlyBJc6WN2jviOaeQbL-4aRu4_Cydxr0"];
  self.moduleName = @"YogiitsuApp";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  // 먼저 super를 호출해 React Native의 window 및 rootView를 생성
  BOOL didLaunch = [super application:application didFinishLaunchingWithOptions:launchOptions];

  // 그 다음에 BootSplash를 초기화하여 RootView 위에 덮어놓기
  [RNBootSplash initWithStoryboard:@"BootSplash"
                          rootView:self.window.rootViewController.view];

  return didLaunch;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
