// src/components/common/VersionGate.tsx
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  Platform,
  Linking,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import EncryptedStorage from 'react-native-encrypted-storage';

type RemoteConfig = {
  minSupportedVersion?: string;
  latestVersion: string;
  updateUrl?: string;
  message?: string;
};

type Props = {
  fallbackConfig: RemoteConfig;
  snoozeHours?: number; // "나중에" 눌렀을 때 재알림까지 시간
  aggressive?: boolean; // true면 시작 때마다(스누즈 제외) 계속 알림
};

const SNOOZE_KEY = 'version_gate_snooze_until';
const DISMISS_KEY_PREFIX = 'version_gate_dismissed_';

// --- Android 전용 스토어 링크 도우미 ---
function getAndroidPlayUrl() {
  const pkg = DeviceInfo.getBundleId();
  return __DEV__
    ? `https://play.google.com/store/apps/details?id=${pkg}` // 에뮬/테스트
    : `market://details?id=${pkg}`; // 실기기(스토어 앱)
}

async function openStore(updateUrl?: string) {
  const target = updateUrl || getAndroidPlayUrl();
  const can = await Linking.canOpenURL(target);
  if (!can && target.startsWith('market://')) {
    const pkg = DeviceInfo.getBundleId();
    return Linking.openURL(
      `https://play.google.com/store/apps/details?id=${pkg}`,
    );
  }
  return Linking.openURL(target);
}

// --- 버전 비교 ---
function cmp(a: string, b: string) {
  const A = a.split('.').map(Number),
    B = b.split('.').map(Number);
  for (let i = 0; i < Math.max(A.length, B.length); i++) {
    const d = (A[i] || 0) - (B[i] || 0);
    if (d) return d > 0 ? 1 : -1;
  }
  return 0;
}

export default function VersionGate({
  fallbackConfig,
  snoozeHours = 24,
  aggressive = true,
}: Props) {
  const [show, setShow] = useState(false);
  const [must, setMust] = useState(false);
  const [conf, setConf] = useState<RemoteConfig>(fallbackConfig);

  useEffect(() => {
    (async () => {
      // 스누즈 확인
      const until = await EncryptedStorage.getItem(SNOOZE_KEY);
      if (until && Number(until) > Date.now()) return;

      // (이번엔 원격 JSON 없이 fallback만 사용)
      const current = DeviceInfo.getVersion();
      const latest = conf.latestVersion;
      const min = conf.minSupportedVersion;

      if (!aggressive) {
        const dismissed = await EncryptedStorage.getItem(
          DISMISS_KEY_PREFIX + latest,
        );
        if (dismissed === '1') return;
      }

      if (min && cmp(current, min) < 0) {
        setMust(true);
        setShow(true);
        return;
      }
      if (cmp(current, latest) < 0) {
        setMust(false);
        setShow(true);
      }
    })();
  }, [conf, aggressive]);

  // 강제일 때 안드로이드 뒤로가기 막기
  useEffect(() => {
    const sub = BackHandler.addEventListener(
      'hardwareBackPress',
      () => must && show,
    );
    return () => sub.remove();
  }, [must, show]);

  if (!show) return null;

  const title = must ? '업데이트 필요' : '업데이트 권장';
  const body = '앱을 안정적으로 사용하려면 \n최신 버전으로 업데이트 해주세요.';

  const onUpdate = async () => {
    await openStore(conf.updateUrl);
  };

  const onLater = async () => {
    const until = Date.now() + snoozeHours * 60 * 60 * 1000;
    await EncryptedStorage.setItem(SNOOZE_KEY, String(until));
    setShow(false);
  };

  const onCloseThisVersion = async () => {
    if (!aggressive) {
      await EncryptedStorage.setItem(
        DISMISS_KEY_PREFIX + (conf.latestVersion || ''),
        '1',
      );
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
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 20,
            width: '100%',
            maxWidth: 420,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
            {title}
          </Text>
          <Text style={{ fontSize: 14, color: '#444', marginBottom: 16 }}>
            {body}
          </Text>

          <View
            style={{
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              onPress={onUpdate}
              style={{ paddingVertical: 10, paddingHorizontal: 14 }}
            >
              <Text style={{ fontWeight: '700' }}>지금 업데이트</Text>
            </TouchableOpacity>
            {!must && (
              <>
                <TouchableOpacity
                  onPress={onLater}
                  style={{ paddingVertical: 10, paddingHorizontal: 14 }}
                >
                  <Text>나중에</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onCloseThisVersion}
                  style={{ paddingVertical: 10, paddingHorizontal: 14 }}
                >
                  <Text>닫기</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
