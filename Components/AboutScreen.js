// Components/AboutScreen.js
// About Lugano — collapsed/expanded (Read more) like your screenshot.
// FIX: gradient is a background (absolute), card height is stable, nothing gets cut.

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Platform,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const BG = require('../assets/bg.webp');
const STORAGE_KEY = 'about_expanded';

const TABBAR_SPACE = 110;     // место под таббар (если он overlay)
const PREVIEW_LINES = 8;      // чтобы Read more всегда помещался

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const { height: H } = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(STORAGE_KEY);
        setExpanded(v === '1');
      } catch (e) {}
    })();
  }, []);

  const setAndStore = useCallback(async v => {
    setExpanded(v);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, v ? '1' : '0');
    } catch (e) {}
  }, []);

  const title = 'About Lugano';

  const preview = useMemo(
    () =>
      `Lugano is a place where Switzerland meets Italy.\nItalian is spoken here, coffee is enjoyed slowly, and life moves at a gentler pace than in most Swiss cities.\n\nSet on the shores of Lake Lugano and surrounded by green hills and palm trees — yes, palm trees in Switzerland — the city feels warm, open, and relaxed. It is often considered one of the sunniest cities in the country.`,
    []
  );

  const fullText = useMemo(
    () =>
      `Lugano is a place where Switzerland meets Italy.\nItalian is spoken here, coffee is enjoyed slowly, and life moves at a gentler pace than in most Swiss cities.\n\nSet on the shores of Lake Lugano and surrounded by green hills and palm trees — yes, palm trees in Switzerland — the city feels warm, open, and relaxed. It is often considered one of the sunniest cities in the country.\n\nDespite its size, Lugano has a vibrant cultural rhythm, with festivals, music, art, and charming squares made for long walks. It’s a city where you can wander through old streets, sit by the water, and simply enjoy the view of the mountains.\nLugano doesn’t rush.\nAnd that might be its greatest charm.`,
    []
  );

  // доступная высота под карточку (чтобы она не залезала на таббар)
  const topPad = insets.top + 16;
  const bottomPad = Math.max(insets.bottom, 20) + TABBAR_SPACE;
  const available = Math.max(320, H - topPad - bottomPad);

  // как на твоём примере: collapsed меньше, expanded больше, но оба всегда полностью на экране
  const collapsedH = Math.min(available, Math.round(available * 0.52));
  const expandedH = Math.min(available, Math.round(available * 0.78));

  const cardHeight = expanded ? expandedH : collapsedH;

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground
        source={BG}
        style={styles.bg}
        resizeMode="cover"
        blurRadius={Platform.OS === 'ios' ? 14 : 10}
      >
        <View style={styles.dim} />

        <View style={[styles.cardWrap, { paddingTop: topPad, paddingBottom: bottomPad }]}>
          <View style={[styles.cardBorder, { height: cardHeight }]}>
            {/* FIX: gradient как ФОН, не как контейнер */}
            <LinearGradient
              colors={['rgba(58, 20, 117, 0.80)', 'rgba(23, 10, 46, 0.90)']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />

            {/* subtle gloss */}
            <LinearGradient
              colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.00)']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.gloss}
              pointerEvents="none"
            />

            <View style={styles.cardContent}>
              {/* Тап по заголовку в expanded => свернуть */}
              <Pressable
                onPress={() => expanded && setAndStore(false)}
                hitSlop={10}
              >
                <Text style={styles.title}>{title}</Text>
              </Pressable>

              {expanded ? (
                // expanded: скроллится ТОЛЬКО текст, карточка не "съезжает"
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingBottom: 6 }}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.body}>{fullText}</Text>
                </ScrollView>
              ) : (
                // collapsed: текст + Read more всегда виден
                <View style={{ flex: 1 }}>
                  <Text
                    style={styles.body}
                    numberOfLines={PREVIEW_LINES}
                    ellipsizeMode="tail"
                  >
                    {preview}
                  </Text>

                  <Pressable
                    onPress={() => setAndStore(true)}
                    hitSlop={10}
                    style={styles.readMoreWrap}
                  >
                    <Text style={styles.readMore}>Read more...</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },

  cardWrap: {
    alignItems: 'center',
    paddingHorizontal: 16,
    flex: 1,
    justifyContent: 'flex-start',
  },

  cardBorder: {
    width: '100%',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(215,197,138,0.55)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 18,
    overflow: 'hidden',
  },

  cardContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
  },

  gloss: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 50,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 14,
    letterSpacing: 0.2,
  },

  body: {
    color: 'rgba(255,255,255,0.94)',
    fontSize: 16,
    lineHeight: 24,
  },

  readMoreWrap: {
    marginTop: 10,
    alignSelf: 'flex-end', // как на примере — справа снизу
  },

  readMore: {
    fontWeight: '800',
    color: 'rgba(255,255,255,0.95)',
  },
});
