import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import PhoneMockup from '../common/PhoneMockup';
import AnimatedRing from './AnimatedRing';
import AnimatedFinger from './AnimatedFinger';
import { Animated } from 'react-native';
import { COLORS, SPACING } from '../../styles/theme';

const HAND_WIDTH = 70 * 2.5;
const HAND_HEIGHT = 120 * 2.5;
const RING_SIZE = 44;
const RING_BORDER_WIDTH = 3;
const RING_PULSE_DURATION = 600;

// Center-based offsets (tune as needed)
const leftHandOffset = { x: -55, y: -80 };
const rightHandOffset = { x: 55, y: 80 };
const leftRingOffset = { x: -30, y: -30 };
const rightRingOffset = { x: 30, y: 30 };

const fingerWhite = require('../../assets/finger-white.png');
const fingerBlack = require('../../assets/finger-black.png');

const PhoneWidth = 220;
const PhoneHeight = 340;
const mockupCenterX = PhoneWidth / 2;
const mockupCenterY = PhoneHeight / 2;

const StepSelection = () => {
  // Animation state
  const [hideLeft, setHideLeft] = useState(false);
  const [showSolid, setShowSolid] = useState(false);
  const [showLeftRing, setShowLeftRing] = useState(true);

  // Animate left hand out, fade out left ring, show solid circle
  useEffect(() => {
    setTimeout(() => {
      setHideLeft(true);
      setShowLeftRing(false);
      setTimeout(() => setShowSolid(true), 400);
    }, 400);
  }, []);

  // Calculate positions
  const leftHandStyle = {
    position: 'absolute',
    width: HAND_WIDTH,
    height: HAND_HEIGHT,
    left: mockupCenterX + leftHandOffset.x - HAND_WIDTH / 2,
    top: mockupCenterY + leftHandOffset.y - HAND_HEIGHT / 2,
    zIndex: 2,
  };
  const rightHandStyle = {
    position: 'absolute',
    width: HAND_WIDTH,
    height: HAND_HEIGHT,
    left: mockupCenterX + rightHandOffset.x - HAND_WIDTH / 2,
    top: mockupCenterY + rightHandOffset.y - HAND_HEIGHT / 2,
    zIndex: 2,
  };
  const leftRingPos = {
    x: mockupCenterX + leftRingOffset.x - RING_SIZE / 2,
    y: mockupCenterY + leftRingOffset.y - RING_SIZE / 2,
  };
  const rightRingPos = {
    x: mockupCenterX + rightRingOffset.x - RING_SIZE / 2,
    y: mockupCenterY + rightRingOffset.y - RING_SIZE / 2,
  };

  // Solid pulsing circle for selection
  const scale = React.useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (showSolid) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.15, duration: RING_PULSE_DURATION, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.0, duration: RING_PULSE_DURATION, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [showSolid]);

  return (
    <View style={styles.container}>
      <PhoneMockup>
        {/* Rings first (zIndex 1) */}
        {showLeftRing && <AnimatedRing x={leftRingPos.x} y={leftRingPos.y} visible={true} size={RING_SIZE} borderWidth={RING_BORDER_WIDTH} pulseDuration={RING_PULSE_DURATION} />}
        {!showSolid && <AnimatedRing x={rightRingPos.x} y={rightRingPos.y} visible={true} size={RING_SIZE} borderWidth={RING_BORDER_WIDTH} pulseDuration={RING_PULSE_DURATION} />}
        {showSolid && (
          <Animated.View
            style={{
              position: 'absolute',
              width: RING_SIZE,
              height: RING_SIZE,
              borderRadius: RING_SIZE / 2,
              backgroundColor: COLORS.ring,
              left: rightRingPos.x,
              top: rightRingPos.y,
              transform: [{ scale }],
              zIndex: 1,
            }}
          />
        )}
        {/* Hands on top (zIndex 2) */}
        {!hideLeft && <AnimatedFinger source={fingerWhite} style={leftHandStyle} from={0} to={-300} visible={true} />}
        <AnimatedFinger source={fingerBlack} style={rightHandStyle} from={0} to={0} visible={true} />
      </PhoneMockup>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.topMargin,
    backgroundColor: COLORS.background,
  },
});

export default StepSelection; 