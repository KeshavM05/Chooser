import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

const AnimatedRing = ({ x, y, visible = true, size = 44, borderWidth = 3, borderColor = 'white', pulseDuration = 600 }) => {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.25, duration: pulseDuration, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.0, duration: pulseDuration, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scale.setValue(1);
    }
  }, [visible, pulseDuration]);
  if (!visible) return null;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth,
        borderColor,
        left: x,
        top: y,
        transform: [{ scale }],
        opacity: visible ? 1 : 0,
        zIndex: 1,
      }}
    />
  );
};

export default AnimatedRing; 