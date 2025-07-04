import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated as RNAnimated,
  PanResponder,
  Switch,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES } from '../styles/theme';

const { width, height } = Dimensions.get('window');
const SHEET_HEIGHT = height * 0.95;
const SHEET_TOP = height * 0.05;

const AppIconCircle = () => (
  <View style={styles.appIconOuter}>
    <View style={styles.appIconInner} />
  </View>
);

const SettingsSheet = ({ visible, onClose, settings, onSettingsChange }) => {
  // Bottom sheet animation
  const sheetAnim = useRef(new RNAnimated.Value(height)).current;
  const dragY = useRef(new RNAnimated.Value(0)).current;
  const dragOffset = useRef(0);

  // Settings state - use props as initial values
  const [winners, setWinners] = useState(settings?.winners || 1);
  const [rankWinners, setRankWinners] = useState(settings?.rankWinners || false);
  const [sounds, setSounds] = useState(settings?.sounds !== false); // default to true
  const [vibrations, setVibrations] = useState(settings?.vibrations === true); // default to false

  // Update local state when props change
  React.useEffect(() => {
    if (settings) {
      setWinners(settings.winners || 1);
      setRankWinners(settings.rankWinners || false);
      setSounds(settings.sounds !== false);
      setVibrations(settings.vibrations === true);
    }
  }, [settings]);

  // Call onSettingsChange when any setting changes
  const updateSetting = (key, value) => {
    const newSettings = {
      winners,
      rankWinners,
      sounds,
      vibrations,
      [key]: value
    };
    
    // Update local state
    switch (key) {
      case 'winners':
        setWinners(value);
        break;
      case 'rankWinners':
        setRankWinners(value);
        break;
      case 'sounds':
        setSounds(value);
        break;
      case 'vibrations':
        setVibrations(value);
        break;
    }
    
    // Notify parent
    onSettingsChange && onSettingsChange(newSettings);
  };

  // Animate sheet in/out
  React.useEffect(() => {
    if (visible) {
      RNAnimated.timing(sheetAnim, {
        toValue: SHEET_TOP,
        duration: 350,
        useNativeDriver: true,
      }).start();
    } else {
      RNAnimated.timing(sheetAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // PanResponder for drag
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy !== 0 && gestureState.moveY < SHEET_TOP + 60;
      },
      onPanResponderGrant: () => {
        dragY.setValue(0);
        dragOffset.current = 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          dragY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const dragDistance = gestureState.dy;
        if (dragDistance > SHEET_HEIGHT * 0.2) {
          // Dismiss
          RNAnimated.timing(sheetAnim, {
            toValue: height,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose && onClose();
            dragY.setValue(0);
          });
        } else {
          // Snap back
          RNAnimated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Segmented control for winners
  const renderWinnersSegment = () => (
    <View style={styles.segmentContainer}>
      {[1, 2, 3, 4].map((num) => (
        <TouchableOpacity
          key={num}
          style={[styles.segment, winners === num && styles.segmentSelected]}
          onPress={() => updateSetting('winners', num)}
        >
          <Text style={[styles.segmentText, winners === num && styles.segmentTextSelected]}>{num}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <>
      {/* Overlay */}
      {visible && (
        <RNAnimated.View
          style={[
            styles.sheetOverlay,
            {
              opacity: sheetAnim.interpolate({
                inputRange: [SHEET_TOP, height],
                outputRange: [0.5, 0],
              }),
            },
          ]}
          pointerEvents={visible ? 'auto' : 'none'}
        />
      )}
      <RNAnimated.View
        style={[
          styles.sheet,
          {
            height: SHEET_HEIGHT,
            transform: [
              { translateY: RNAnimated.add(sheetAnim, dragY) },
            ],
          },
        ]}
        pointerEvents={visible ? 'auto' : 'none'}
        {...panResponder.panHandlers}
      >
        {/* Drag handle */}
        <View style={styles.dragHandleContainer} pointerEvents="none">
          <View style={styles.dragHandle} />
        </View>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
        {/* General Section */}
        <Text style={styles.sectionLabel}>GENERAL</Text>
        <View style={styles.sectionBox}>
          <View style={styles.rowCard}>
            <View style={styles.row}>
              <Ionicons name="people-outline" size={20} color="#aaa" style={styles.rowIcon} />
              <Text style={styles.rowLabel}>Winners</Text>
              <View style={{ flex: 1 }} />
              {renderWinnersSegment()}
            </View>
          </View>
          <View style={styles.rowCard}>
            <View style={styles.row}>
              <MaterialCommunityIcons name="trophy-outline" size={20} color="#aaa" style={styles.rowIcon} />
              <Text style={styles.rowLabel}>Rank winners</Text>
              <View style={{ flex: 1 }} />
              <Switch value={rankWinners} onValueChange={(value) => updateSetting('rankWinners', value)} trackColor={{ true: '#2ecc40', false: '#888' }} thumbColor={rankWinners ? '#fff' : '#eee'} />
            </View>
          </View>
          <View style={styles.rowCard}>
            <View style={styles.row}>
              <Ionicons name="volume-medium-outline" size={20} color="#aaa" style={styles.rowIcon} />
              <Text style={styles.rowLabel}>Sounds</Text>
              <View style={{ flex: 1 }} />
              <Switch value={sounds} onValueChange={(value) => updateSetting('sounds', value)} trackColor={{ true: '#2ecc40', false: '#888' }} thumbColor={sounds ? '#fff' : '#eee'} />
            </View>
          </View>
          <View style={styles.rowCard}>
            <View style={styles.row}>
              <Ionicons name="help-circle-outline" size={20} color="#aaa" style={styles.rowIcon} />
              <Text style={styles.rowLabel}>Vibrations</Text>
              <View style={{ flex: 1 }} />
              <Switch value={vibrations} onValueChange={(value) => updateSetting('vibrations', value)} trackColor={{ true: '#2ecc40', false: '#888' }} thumbColor={vibrations ? '#fff' : '#eee'} />
            </View>
          </View>
        </View>
        {/* Appearance Section */}
        <Text style={styles.sectionLabel}>APPEARANCE</Text>
        <View style={styles.sectionBox}>
          <TouchableOpacity style={styles.rowCard} onPress={() => console.log('App Icon pressed')}>
            <View style={styles.row}>
              <AppIconCircle />
              <Text style={[styles.rowLabel, { color: '#fff', fontWeight: 'bold' }]}>App Icon</Text>
              <View style={{ flex: 1 }} />
              <Text style={styles.valueText}>Solar</Text>
              <Ionicons name="chevron-forward" size={20} color="#aaa" style={{ marginLeft: 2 }} />
            </View>
          </TouchableOpacity>
        </View>
        {/* Contact Section */}
        <Text style={styles.sectionLabel}>CONTACT</Text>
        <View style={styles.sectionBox}>
          <TouchableOpacity style={styles.rowCard} onPress={() => console.log('Write a Review pressed')}>
            <View style={styles.row}>
              <MaterialCommunityIcons name="star-outline" size={20} color="#aaa" style={styles.rowIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Write a Review</Text>
                <Text style={styles.subLabel}>It's greatly appreciated.</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </RNAnimated.View>
    </>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    width: '100%',
    backgroundColor: '#232326',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    zIndex: 200,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    paddingBottom: 24,
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
    backgroundColor: '#444',
    opacity: 0.18,
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  closeText: {
    color: '#FFA726',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionLabel: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 22,
    marginBottom: 4,
    marginLeft: 24,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sectionBox: {
    marginHorizontal: 12,
    marginBottom: 12,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    borderRadius: 0,
  },
  rowCard: {
    backgroundColor: '#323236',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 8,
  },
  rowIcon: {
    marginRight: 12,
    opacity: 0.7,
  },
  rowLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  valueText: {
    color: '#FFA726',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 2,
  },
  subLabel: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '400',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#18181A',
    borderRadius: 10,
    padding: 2,
    marginLeft: 8,
  },
  segment: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'transparent',
    marginHorizontal: 2,
  },
  segmentSelected: {
    backgroundColor: '#39393D',
  },
  segmentText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: 'bold',
  },
  segmentTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  appIconOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: '#FF416C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appIconInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF416C',
  },
  sheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    zIndex: 100,
  },
});

export default SettingsSheet; 