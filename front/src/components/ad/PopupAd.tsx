import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Text,
  StatusBar,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import analytics from '@react-native-firebase/analytics';

const { width } = Dimensions.get('window');
const AD_WIDTH = width * 0.85;

const AD_CONFIG_URL =
  'https://yogiitsu-s3.s3.ap-northeast-2.amazonaws.com/ad/ad-config.json';

type PopupAdType = {
  id: string;
  image: string;
  link?: string;
  linkType?: 'instagram_profile' | 'instagram_post' | 'web';
  startDate: string;
  endDate: string;
};

declare global {
  var popupAdShown: boolean | undefined;
}

export default function PopupAd() {
  const [visible, setVisible] = useState(false);
  const [ad, setAd] = useState<PopupAdType | null>(null);

  useEffect(() => {
    if (globalThis.popupAdShown) return;

    globalThis.popupAdShown = true;

    loadAd();
  }, []);

  const handleClose = async () => {
    await analytics().logEvent('popup_ad_close', {
      ad_id: ad?.id,
    });

    setVisible(false);
  };

  const hideForToday = async () => {
    const today = new Date().toISOString().slice(0, 10);

    await analytics().logEvent('popup_ad_hide_today', {
      ad_id: ad?.id,
    });

    await EncryptedStorage.setItem(`HIDE_POPUP_AD_${ad?.id}`, today);

    setVisible(false);
  };

  const loadAd = async () => {
    try {
      const res = await fetch(AD_CONFIG_URL);
      const json = await res.json();

      const now = new Date();

      const activeAd = json?.popupAds?.find((ad: PopupAdType) => {
        const start = new Date(ad.startDate);
        const end = new Date(ad.endDate);
        return now >= start && now <= end;
      });

      if (!activeAd) return;

      const today = new Date().toISOString().slice(0, 10);

      const hideToday = await EncryptedStorage.getItem(
        `HIDE_POPUP_AD_${activeAd.id}`,
      );

      if (hideToday === today) {
        return;
      }

      console.log('hideToday:', hideToday);
      console.log('today:', today);

      setAd(activeAd);

      await analytics().logEvent('popup_ad_impression', {
        ad_id: activeAd.id,
      });

      setVisible(true);
    } catch (err) {
      console.log('ad load fail', err);
    }
  };

  const handlePress = async () => {
    try {
      await analytics().logEvent('popup_ad_click', {
        ad_id: ad?.id,
      });

      setVisible(false);

      if (!ad?.link) return;

      if (ad.linkType === 'instagram_profile') {
        const match = ad.link.match(/instagram\.com\/([^/?]+)/);
        const username = match?.[1];

        if (username) {
          const appUrl = `instagram://user?username=${username}`;
          const canOpen = await Linking.canOpenURL(appUrl);

          if (canOpen) {
            await Linking.openURL(appUrl);
            return;
          }
        }
      }

      await Linking.openURL(ad.link);
    } catch (e) {
      console.log('ad link open fail', e);
    }
  };

  if (!ad) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      <View style={styles.overlay}>
        <View style={styles.adWrapper}>
          <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
            <Image source={{ uri: ad.image }} style={styles.image} />
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <TouchableOpacity
              onPress={hideForToday}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.bottomText}>하루동안 보지 않기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.bottomText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  adWrapper: {
    width: AD_WIDTH,
  },

  image: {
    width: AD_WIDTH,
    aspectRatio: 1080 / 1350,
    resizeMode: 'cover',
    borderRadius: 4,
  },

  bottomRow: {
    width: AD_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  bottomText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    paddingVertical: 4,
  },
});
