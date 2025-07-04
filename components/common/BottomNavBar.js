import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../styles/theme';

const TABS = [
  { key: 'chooser', label: 'Chooser', icon: <Ionicons name="hand-left" size={33} /> },
  { key: 'lucky', label: 'Lucky', icon: <Ionicons name="arrow-forward" size={33} /> },
  { key: 'roulette', label: 'Roulette', icon: <MaterialIcons name="casino" size={33} /> },
  { key: 'number', label: 'Number', icon: <MaterialIcons name="looks-one" size={33} /> },
  { key: 'coin', label: 'Coin', icon: <Ionicons name="star" size={33} /> },
];

const BottomNavBar = ({ activeTab = 'chooser', onTabPress }) => (
  <View style={styles.bottomNav}>
    <View style={styles.navItems}>
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={styles.navItem}
          onPress={() => onTabPress && onTabPress(tab.key)}
        >
          {React.cloneElement(tab.icon, {
            color: activeTab === tab.key ? 'white' : COLORS.buttonBlue,
          })}
          <Text style={[styles.navText, activeTab === tab.key && { color: 'white' }]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  bottomNav: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 20,
    paddingBottom: 35,
  },
  navItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: COLORS.buttonBlue,
    fontSize: 12,
    marginTop: 4,
  },
});

export default BottomNavBar; 