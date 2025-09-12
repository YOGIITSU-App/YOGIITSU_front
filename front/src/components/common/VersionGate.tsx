import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  Linking,
  Platform,
  Image,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import EncryptedStorage from 'react-native-encrypted-storage';
import { fetchVersionPolicy } from '../../api/versionApi';
import { colors } from '../../constants';

type RemoteConfig = {
  minSupportedVersion?: string; // fallback 강제 기준(미만이면 HARD)
  latestVersion: string; // fallback 권장 기준(미만이면 SOFT)
  updateUrl?: string; // 서버/프론트에서 스토어 URL 직접 지정 시 사용 가능
};

type Props = {
  fallbackConfig: RemoteConfig;
  snoozeHours?: number; // SOFT일 때 “나중에” 숨김 시간
  aggressive?: boolean; // false면 동일 latest에 대해 “닫기” 기억
  defaultMessage?: string; // 서버에서 message 안 줄 때 사용할 고정 문구
  iosAppStoreId?: string; // iOS App Store ID (없으면 앱스토어 메인으로)
  androidPackageName?: string; // 안드로이드 패키지명(없으면 현재 번들ID)
};

const SNOOZE_KEY = 'version_gate_snooze_until';
const DISMISS_KEY_PREFIX = 'version_gate_dismissed_';
const DEFAULT_MESSAGE =
  '안정적인 서비스 이용을 위해 최신 버전으로 업데이트 해주세요.';

// semver 비교: a<b → -1, a=b → 0, a>b → 1
const cmp = (a: string, b: string) => {
  const A = a.split('.').map(Number);
  const B = b.split('.').map(Number);
  for (let i = 0; i < Math.max(A.length, B.length); i++) {
    const d = (A[i] || 0) - (B[i] || 0);
    if (d) return d > 0 ? 1 : -1;
  }
  return 0;
};

// 스토어 URL 유틸
const getAndroidPlayUrl = (pkg?: string) =>
  `https://play.google.com/store/apps/details?id=${
    pkg || DeviceInfo.getBundleId()
  }`;

const getIosAppStoreUrl = (appId?: string) =>
  appId
    ? `itms-apps://itunes.apple.com/app/id${appId}`
    : `https://apps.apple.com/`;

const getIosAppStoreHttps = (appId?: string) =>
  appId ? `https://apps.apple.com/app/id${appId}` : `https://apps.apple.com/`;

export default function VersionGate({
  fallbackConfig,
  snoozeHours = 24,
  aggressive = true,
  defaultMessage,
  iosAppStoreId,
  androidPackageName,
}: Props) {
  const [show, setShow] = useState(false);
  const [hard, setHard] = useState(false);
  const [message, setMessage] = useState<string>(
    defaultMessage ?? DEFAULT_MESSAGE,
  );
  const [storeUrl, setStoreUrl] = useState<string | undefined>();
  const [latest, setLatest] = useState<string | undefined>(
    fallbackConfig.latestVersion,
  );

  // 플랫폼별 스토어 열기
  const openStore = async (updateUrl?: string) => {
    let target = updateUrl;

    if (!target) {
      if (Platform.OS === 'ios') {
        target = getIosAppStoreUrl(iosAppStoreId);
      } else {
        target = getAndroidPlayUrl(androidPackageName);
      }
    }

    let can = await Linking.canOpenURL(target);
    if (!can) {
      // iOS: itms-apps를 못 여는 환경(시뮬레이터 등)은 https로 폴백
      if (Platform.OS === 'ios' && target.startsWith('itms-apps://')) {
        target = getIosAppStoreHttps(iosAppStoreId);
        can = await Linking.canOpenURL(target);
      }
      // Android: market 스킴을 쓰지 않지만 혹시 실패하면 https로 폴백
      if (!can && Platform.OS !== 'ios') {
        target = getAndroidPlayUrl(androidPackageName);
      }
    }
    return Linking.openURL(target);
  };

  useEffect(() => {
    (async () => {
      let type: 'NONE' | 'SOFT' | 'HARD' = 'NONE';
      let latestCandidate: string | undefined = fallbackConfig.latestVersion;

      try {
        const policy = await fetchVersionPolicy();
        type = policy.updateType;
        latestCandidate = policy.latestVersion ?? fallbackConfig.latestVersion;
        setLatest(latestCandidate);
        setStoreUrl(policy.storeUrl);
      } catch {
        const current = DeviceInfo.getVersion();
        const min = fallbackConfig.minSupportedVersion;
        if (min && cmp(current, min) < 0) type = 'HARD';
        else if (cmp(current, fallbackConfig.latestVersion) < 0) type = 'SOFT';
        latestCandidate = fallbackConfig.latestVersion;
      }

      if (
        !aggressive &&
        (type === 'SOFT' || type === 'NONE') &&
        latestCandidate
      ) {
        const dismissed = await EncryptedStorage.getItem(
          `${DISMISS_KEY_PREFIX}${latestCandidate}`,
        );
        if (dismissed === '1') return;
      }

      if (type === 'SOFT' || type === 'HARD') {
        setHard(type === 'HARD');
        setShow(true);
      }
    })();
  }, [aggressive, fallbackConfig]);

  // 강제(HARD)일 때 안드로이드 하드웨어 뒤로가기 차단
  useEffect(() => {
    const sub = BackHandler.addEventListener(
      'hardwareBackPress',
      () => hard && show,
    );
    return () => sub.remove();
  }, [hard, show]);

  if (!show) return null;

  const onUpdate = () => openStore(storeUrl);
  const onLater = async () => {
    const until = Date.now() + snoozeHours * 60 * 60 * 1000;
    await EncryptedStorage.setItem(SNOOZE_KEY, String(until));
    setShow(false);
  };
  const onCloseThisVersion = async () => {
    if (!aggressive && latest) {
      await EncryptedStorage.setItem(`${DISMISS_KEY_PREFIX}${latest}`, '1');
    }
    setShow(false);
  };

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 25,
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 6,
            padding: 24,
            width: '100%',
            maxWidth: 420,
            alignItems: 'center',
          }}
        >
          {hard ? (
            <Image
              source={require('../../assets/Warning-icon-blue.png')}
              style={{ width: 28, height: 28, marginBottom: 18 }}
            />
          ) : (
            <Image
              source={require('../../assets/Warning-icon-gray.png')}
              style={{ width: 28, height: 28, marginBottom: 18 }}
            />
          )}

          {/* 제목 */}
          <Text
            style={{
              color: colors.BLACK_700,
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 13,
            }}
          >
            {hard ? '업데이트 필요' : '업데이트 권장'}
          </Text>

          {/* 메시지 */}
          <Text
            style={{
              fontSize: 14,
              color: '#999',
              fontWeight: '600',
              marginBottom: 30,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            {message}
          </Text>

          {/* 버튼 영역 */}
          {hard ? (
            // HARD 모드
            <TouchableOpacity
              onPress={onUpdate}
              style={{
                backgroundColor: colors.BLUE_700,
                borderRadius: 8,
                paddingVertical: 16,
                paddingHorizontal: 20,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>
                스토어로 이동
              </Text>
            </TouchableOpacity>
          ) : (
            // SOFT 모드
            <View style={{ flexDirection: 'row', width: '100%' }}>
              <TouchableOpacity
                onPress={onLater}
                style={{
                  flex: 1,
                  backgroundColor: colors.GRAY_700,
                  borderRadius: 6,
                  paddingVertical: 16,
                  marginRight: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>나중에</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onUpdate}
                style={{
                  flex: 1,
                  backgroundColor: colors.BLUE_700,
                  borderRadius: 8,
                  paddingVertical: 12,
                  marginLeft: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>
                  스토어로 이동
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
