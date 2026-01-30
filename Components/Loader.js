// Components/Loader.js (WebView loader + PNG logo)
import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Animated,
  Platform,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';

const BG = require('../assets/bg.webp');
const LOGO = require('../assets/logo.webp'); // <-- твой PNG с текстом внутри

const LOADER_HTML = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <style>
    html, body { width:100%; height:100%; margin:0; background:transparent; overflow:hidden; }
    body { display:flex; align-items:center; justify-content:center; -webkit-tap-highlight-color:transparent; }

    /* From Uiverse.io by Z4drus */
    .loader {
      position: relative;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.05) 30%, transparent 70%);
      overflow: hidden;
    }
    .loader::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 4px solid transparent;
      border-top-color: rgba(255, 255, 255, 0.6);
      animation: loader-spin 2s linear infinite;
    }
    .loader::after {
      content: "";
      position: absolute;
      inset: 10%;
      border-radius: 50%;
      background: conic-gradient(from 90deg, rgba(255,255,255,0.2), transparent);
      filter: blur(2px);
      animation: loader-spin-reverse 1.5s linear infinite;
    }
    .loader__inner {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 30px;
      height: 30px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
      animation: loader-pulse 1s ease-in-out infinite;
    }
    .loader__orbit {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      animation: orbit-rotate 3s linear infinite;
    }
    .loader__dot {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 8px; height: 8px;
      background: rgba(255,255,255,0.8);
      border-radius: 50%;
    }
    .loader__dot:nth-child(1) { transform: rotate(0deg) translate(60px); }
    .loader__dot:nth-child(2) { transform: rotate(90deg) translate(60px); }
    .loader__dot:nth-child(3) { transform: rotate(180deg) translate(60px); }
    .loader__dot:nth-child(4) { transform: rotate(270deg) translate(60px); }

    @keyframes loader-spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
    @keyframes loader-spin-reverse { 0%{transform:rotate(0deg)} 100%{transform:rotate(-360deg)} }
    @keyframes loader-pulse { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.2)} }
    @keyframes orbit-rotate { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
  </style>
</head>
<body>
  <div class="loader">
    <div class="loader__inner"></div>
    <div class="loader__orbit">
      <div class="loader__dot"></div>
      <div class="loader__dot"></div>
      <div class="loader__dot"></div>
      <div class="loader__dot"></div>
    </div>
  </div>
</body>
</html>`;

const Loader = ({ navigation }) => {
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Анимация появления WebView loader
    Animated.timing(loaderOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    // WebView loader работает 5 секунд, потом исчезает
    const t1 = setTimeout(() => {
      Animated.timing(loaderOpacity, { toValue: 0, duration: 350, useNativeDriver: true }).start();
    }, 5000);

    // После исчезновения анимации появляется лого
    const t2 = setTimeout(() => {
      Animated.timing(logoOpacity, { toValue: 1, duration: 450, useNativeDriver: true }).start();
    }, 5400);

    // Дальше: onboarding или main
    const t3 = setTimeout(async () => {
      try {
        const seen = await AsyncStorage.getItem('onboarding_seen');
        navigation.replace(seen === '1' ? 'Main' : 'Onboarding');
      } catch {
        navigation.replace('Onboarding');
      }
    }, 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [navigation, loaderOpacity, logoOpacity]);

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        <View style={styles.dim} />

        {/* WEBVIEW LOADER */}
        <Animated.View style={[styles.center, { opacity: loaderOpacity }]}>
          <WebView
            originWhitelist={['*']}
            source={{ html: LOADER_HTML }}
            style={styles.webview}
            containerStyle={styles.webview}
            scrollEnabled={false}
            bounces={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            javaScriptEnabled
            domStorageEnabled
            setSupportMultipleWindows={false}
            opaque={false}
            {...(Platform.OS === 'ios' ? { backgroundColor: 'transparent' } : {})}
          />
        </Animated.View>

        {/* PNG LOGO */}
        <Animated.View style={[styles.center, { opacity: logoOpacity }]}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </Animated.View>
      </ImageBackground>
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.12)' },

  center: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },

  webview: {
    width: 220,
    height: 220,
    backgroundColor: 'transparent',
  },

  // размер отображения (не "правит" PNG, просто как он стоит на экране)
  logo: {
    width: 260,
    height: 260,
    borderRadius: 25,
    overflow: 'hidden',
  },
});
