import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

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
  }, [visible, from, to, delay, onSettled]);
  if (!visible) return null;
  return (
    <Animated.Image source={source} style={[style, { transform: [{ translateX }] }]} resizeMode="contain" />
  );
};

export default AnimatedFinger; 