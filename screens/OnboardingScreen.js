import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../styles/theme';

const { width, height } = Dimensions.get('window');

// Animated pulsing ring (uses shared scale)
const AnimatedRing = ({ x, y, visible = true, size, scale }) => {
  if (!visible) return null;
  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: x,
          top: y,
          transform: [{ scale }],
          opacity: visible ? 1 : 0,
        },
      ]}
    />
  );
};

// Animated solid circle (uses shared scale, always rendered for pulsing)
const SolidCircle = ({ x, y, size, scale, visible }) => {
  return (
    <Animated.View
      style={[
        styles.solidCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: x,
          top: y,
          transform: [{ scale }],
          opacity: visible ? 1 : 0,
        },
      ]}
    />
  );
};

// Animated finger image
const AnimatedFinger = ({ source, style, from, to, visible = true, delay = 0, onSettled }) => {
  const translateX = useRef(new Animated.Value(from)).current;
  useEffect(() => {
    if (visible) {
      Animated.timing(translateX, {
        toValue: to,
        duration: 500,
        delay,
        useNativeDriver: true,
      }).start(() => onSettled && onSettled());
    } else {
      translateX.setValue(from);
    }
  }, [visible]);
  if (!visible) return null;
  return (
    <Animated.Image source={source} style={[style, { transform: [{ translateX }] }]} resizeMode="contain" />
  );
};

const OnboardingScreen = ({ onDone, resetKey = 0, ...props }) => {
  const [step, setStep] = useState(0);
  // Step 1/2 animation state
  const sharedScale = useRef(new Animated.Value(1)).current;
  const [showStep1Rings, setShowStep1Rings] = useState(false);
  const [showStep1Hands, setShowStep1Hands] = useState(false);
  const [leftHandFlyOut, setLeftHandFlyOut] = useState(false);
  const [showSolidCircle, setShowSolidCircle] = useState(false);
  const leftHandTranslateX = useRef(new Animated.Value(-300)).current;

  // Fade out overlay for step 2
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  // For step 2, track when both hands have settled
  const [handsSettled, setHandsSettled] = useState(false);
  // For step 3, fade out left ring
  const [showLeftRing, setShowLeftRing] = useState(true);

  // Asset paths
  const phone = require('../assets/phone.png');
  const fingerWhite = require('../assets/finger-white.png');
  const fingerBlack = require('../assets/finger-black.png');

  // Step transitions
  useEffect(() => {
    if (step === 1) {
      setShowStep1Rings(true);
      setShowStep1Hands(false);
      setLeftHandFlyOut(false);
      setShowSolidCircle(false);
      leftHandTranslateX.setValue(-300); // Reset position immediately
      setTimeout(() => {
        setShowStep1Hands(true);
        Animated.timing(leftHandTranslateX, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 600);
    } else if (step === 2) {
      // First, show solid circle and hide right ring, then animate hand out and hide left ring
      setShowSolidCircle(true); // show solid circle at right ring
      setShowStep1Rings(false); // hide right ring
      setTimeout(() => {
        setLeftHandFlyOut(true);
        Animated.timing(leftHandTranslateX, {
          toValue: -300,
          duration: 500,
          useNativeDriver: true,
        }).start();
        setTimeout(() => {
          setShowStep1Rings(false); // hide left ring
        }, 400);
      }, 300);
    } else {
      setShowStep1Rings(false);
      setShowStep1Hands(false);
      setLeftHandFlyOut(false);
      setShowSolidCircle(false);
      leftHandTranslateX.setValue(-300);
    }
  }, [step]);

  // When both hands have settled, show rings
  useEffect(() => {
    if (handsSettled && step === 1) {
      setTimeout(() => setShowRings(true), 200);
    }
  }, [handsSettled, step]);

  // Reset step to 0 when resetKey changes
  useEffect(() => {
    setStep(0);
  }, [resetKey]);

  // Shared pulsing animation for ring and solid circle
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sharedScale, { toValue: 1.25, duration: 600, useNativeDriver: true }),
        Animated.timing(sharedScale, { toValue: 1.0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Layout constants (relative to phone mockup)
  const mockupWidth = 220;
  const mockupHeight = 340;
  const mockupCenterX = mockupWidth / 2;
  const mockupCenterY = mockupHeight / 2;

  const handWidth = 70 * 2.5;
  const handHeight = 120 * 2.5; 
  const ringSize = 60;

  // Example offsets (tune as needed)
  const leftHandOffset = { x: -55, y: -100 };
  const rightHandOffset = { x: 55, y: 100 };
  const leftRingOffset = { x: -30, y: -94 };
  const rightRingOffset = { x: -30, y: 30 };

  const leftHandStyle = {
    position: 'absolute',
    width: handWidth,
    height: handHeight,
    left: mockupCenterX + leftHandOffset.x - handWidth / 2,
    top: mockupCenterY + leftHandOffset.y - handHeight / 2,
    zIndex: 2,
  };
  const rightHandStyle = {
    position: 'absolute',
    width: handWidth,
    height: handHeight,
    left: mockupCenterX + rightHandOffset.x - handWidth / 2,
    top: mockupCenterY + rightHandOffset.y - handHeight / 2,
    zIndex: 2,
  };
  const leftRingPos = {
    x: mockupCenterX + leftRingOffset.x,
    y: mockupCenterY + leftRingOffset.y,
  };
  const rightRingPos = {
    x: mockupCenterX + rightRingOffset.x,
    y: mockupCenterY + rightRingOffset.y,
  };

  return (
    <View style={[styles.container, props.style]}>
      {/* Drag handle */}
      <View style={styles.dragHandleContainer} pointerEvents="none">
        <View style={styles.dragHandle} />
      </View>
      <View style={styles.content}>
        {/* Title and subtitle */}
        <Text style={styles.title}>{step === 0 ? 'Welcome' : step === 1 ? 'Step 1' : 'Step 2'}</Text>
        <Text style={styles.subtitle}>
          {step === 0
            ? 'This app selects a random finger among the fingers placed on the screen.'
            : step === 1
            ? 'Simply place two or more fingers on the screen.'
            : 'After three seconds, one is randomly chosen!'}
        </Text>
        {/* Phone mockup with overlayed content */}
        <View style={[styles.phoneContainer, { width: mockupWidth, height: mockupHeight }]}>
          <Image source={phone} style={styles.phoneImage} resizeMode="contain" />
          {/* Overlayed content inside phone */}
          {/* Step 0: Welcome overlay */}
          {step === 0 && (
            <View style={styles.overlayContainer} pointerEvents="none">
              <Text style={styles.overlayTitle}>CHOOSER</Text>
              <Text style={styles.overlaySubtitle}>A random finger selector.</Text>
            </View>
          )}
          {/* Step 1 & 2: Rings and hands, correct layer order, always rendered for continuity */}
          {(step === 1 || step === 2) && (
            <>
              {/* Left ring: only show in step 1 and if left hand is not flying out */}
              {showStep1Rings && !leftHandFlyOut && (
                <AnimatedRing x={leftRingPos.x} y={leftRingPos.y} visible={true} size={ringSize} scale={sharedScale} />
              )}
              {/* Right ring: only show in step 1 and if not showing solid circle */}
              {showStep1Rings && !showSolidCircle && (
                <AnimatedRing x={rightRingPos.x} y={rightRingPos.y} visible={true} size={ringSize} scale={sharedScale} />
              )}
              {/* Solid circle: only show in step 2 at right ring position */}
              <SolidCircle x={rightRingPos.x} y={rightRingPos.y} size={ringSize} scale={sharedScale} visible={showSolidCircle} />
              {/* Hands: left hand always rendered, animate in or out based on leftHandFlyOut */}
              {showStep1Hands && (
                <Animated.Image
                  source={fingerWhite}
                  style={[
                    styles.handStyle,
                    { ...leftHandStyle, width: handWidth, height: handHeight },
                    { transform: [{ translateX: leftHandTranslateX }] },
                  ]}
                  resizeMode="contain"
                />
              )}
              {showStep1Hands && (
                <AnimatedFinger
                  source={fingerBlack}
                  style={[styles.handStyle, { ...rightHandStyle, width: handWidth, height: handHeight }]}
                  from={300}
                  to={0}
                  visible={true}
                  delay={0}
                />
              )}
            </>
          )}
        </View>
        {/* Button */}
        <TouchableOpacity
          style={step < 2 ? styles.buttonBlue : styles.buttonGreen}
          onPress={() => {
            if (step < 2) setStep(step + 1);
            else if (onDone) onDone();
          }}
        >
          <Text style={styles.buttonText}>{step < 2 ? 'Next' : 'Done'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 40,
    paddingBottom: 24,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.title,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 0,
    letterSpacing: 0.2,
  },
  subtitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.subtitle,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    opacity: 0.85,
    fontWeight: '500',
    lineHeight: 24,
  },
  phoneContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 46,
    marginBottom: 46,
  },
  phoneImage: {
    width: 220,
    height: 340,
    borderRadius: 32,
  },
  overlayContainer: {
    position: 'absolute',
    top: 90,
    left: 0,
    width: 220,
    alignItems: 'center',
    zIndex: 3,
  },
  overlayTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.overlayTitle,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 45,
    marginBottom: 0,
    letterSpacing: 0.5,
  },
  overlaySubtitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.overlaySubtitle,
    textAlign: 'center',
    opacity: 0.85,
  },
  ring: {
    position: 'absolute',
    borderWidth: 6,
    borderColor: COLORS.ring,
    zIndex: 1,
  },
  solidCircle: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.ring,
    zIndex: 1,
  },
  buttonBlue: {
    backgroundColor: COLORS.buttonBlue,
    borderRadius: SPACING.buttonRadius,
    paddingVertical: SPACING.buttonVertical,
    width: '90%',
    alignSelf: 'center',
    marginTop: 32,
    marginBottom: 0,
  },
  buttonGreen: {
    backgroundColor: COLORS.buttonGreen,
    borderRadius: SPACING.buttonRadius,
    paddingVertical: SPACING.buttonVertical,
    width: '90%',
    alignSelf: 'center',
    marginTop: 32,
    marginBottom: 0,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.button,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  handStyle: {
    position: 'absolute',
    width: 90,
    resizeMode: 'contain',
    zIndex: 2,
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 0,
    zIndex: 100,
  },
  dragHandle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.dragHandle || '#444',
    opacity: 0.18,
    marginBottom: 6,
  },
});

export default OnboardingScreen; 