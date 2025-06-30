import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const PHONE_WIDTH = 220;
const PHONE_HEIGHT = 340;
const phone = require('../../assets/phone.png');

const PhoneMockup = ({ children }) => (
  <View style={styles.container}>
    <Image source={phone} style={styles.image} resizeMode="contain" />
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: PHONE_WIDTH,
    height: PHONE_HEIGHT,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
});

export default PhoneMockup; 