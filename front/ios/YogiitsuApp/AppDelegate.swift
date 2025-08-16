import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

// 카카오/구글
import KakaoSDKCommon
import KakaoSDKAuth
import GoogleSignIn

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // RN 부트스트랩
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "YogiitsuApp",
      in: window,
      launchOptions: launchOptions
    )

    // Kakao SDK 초기화 (Info.plist -> KAKAO_APP_KEY)
    if let appKey = Bundle.main.object(forInfoDictionaryKey: "KAKAO_APP_KEY") as? String, !appKey.isEmpty {
      KakaoSDK.initSDK(appKey: appKey)
    }

    return true
  }

  // 소셜 복귀 콜백 (iOS 9+)
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey : Any] = [:]
  ) -> Bool {
    // Google
    if GIDSignIn.sharedInstance.handle(url) { return true }

    // Kakao
    if AuthApi.isKakaoTalkLoginUrl(url) {
      return AuthController.handleOpenUrl(url: url, options: options)
    }

    if RCTLinkingManager.application(app, open: url, options: options) {
      return true
    }
    return false
  }
}

// RN 기본 델리게이트
class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }
  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
