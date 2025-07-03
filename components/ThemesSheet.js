import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated as RNAnimated,
  PanResponder,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const SHEET_HEIGHT = height * 0.95;
const SHEET_TOP = height * 0.05;

const MONOCHROME = [
  { key: 'alizarin', name: 'Alizarin', color: '#e74c3c' },
  { key: 'orange', name: 'Orange', color: '#f39c12' },
  { key: 'carrot', name: 'Carrot', color: '#e67e22' },
  { key: 'sunflower', name: 'Sun Flower', color: '#f1c40f' },
  { key: 'emerald', name: 'Emerald', color: '#2ecc71' },
  { key: 'turquoise', name: 'Turquoise', color: '#1abc9c' },
  { key: 'greensea', name: 'Green Sea', color: '#16a085' },
  { key: 'belizehole', name: 'Belize Hole', color: '#2980b9' },
  { key: 'wisteria', name: 'Wisteria', color: '#8e44ad' },
  { key: 'wetasphalt', name: 'Wet Asphalt', color: '#34495e' },
];

const GRADIENTS = [
  { key: 'virgin', name: 'Virgin America', colors: ['#7b4397', '#dc2430'] },
  { key: 'bloody', name: 'Bloody Mary', colors: ['#ff512f', '#dd2476'] },
  { key: 'orangecoral', name: 'Orange Coral', colors: ['#f83600', '#f9d423'] },
  { key: 'sweetmorning', name: 'Sweet Morning', colors: ['#ff5f6d', '#ffc371'] },
  { key: 'endlessriver', name: 'Endless River', colors: ['#43cea2', '#185a9d'] },
  { key: 'greenbeach', name: 'Green Beach', colors: ['#02aab0', '#00cdac'] },
  { key: 'sexyblue', name: 'Sexy Blue', colors: ['#2193b0', '#6dd5ed'] },
  { key: 'scooter', name: 'Scooter', colors: ['#36d1dc', '#5b86e5'] },
  { key: 'celestial', name: 'Celestial', colors: ['#c33764', '#1d2671'] },
  { key: 'shadesgrey', name: '50 Shades of Grey', colors: ['#bdc3c7', '#2c3e50'] },
];

const ThemeTile = ({ name, color, colors, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.tile}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {colors ? (
        <LinearGradient colors={colors} style={styles.tilePreview} start={{x:0,y:0}} end={{x:1,y:1}} />
      ) : (
        <View style={[styles.tilePreview, { backgroundColor: color }]} />
      )}
      <Text style={styles.tileLabel}>{name}</Text>
      {selected && (
        <View style={styles.checkCircle}>
          <Text style={{ color: '#FFA726', fontSize: 22, fontWeight: 'bold' }}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const ThemesSheet = ({ visible, onClose, selectedTheme, onSelectTheme }) => {
  const sheetAnim = useRef(new RNAnimated.Value(height)).current;
  const dragY = useRef(new RNAnimated.Value(0)).current;

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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy !== 0 && gestureState.moveY < SHEET_TOP + 60;
      },
      onPanResponderGrant: () => {
        dragY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          dragY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const dragDistance = gestureState.dy;
        if (dragDistance > SHEET_HEIGHT * 0.2) {
          RNAnimated.timing(sheetAnim, {
            toValue: height,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose && onClose();
            dragY.setValue(0);
          });
        } else {
          RNAnimated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

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
          <Text style={styles.headerTitle}>Themes</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Monochrome Section */}
          <Text style={styles.sectionLabel}>Monochrome</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tileRow}>
            {MONOCHROME.map(theme => (
              <ThemeTile
                key={theme.key}
                name={theme.name}
                color={theme.color}
                selected={selectedTheme.type === 'mono' && selectedTheme.key === theme.key}
                onPress={() => onSelectTheme({ type: 'mono', key: theme.key })}
              />
            ))}
          </ScrollView>
          {/* Gradients Section */}
          <Text style={styles.sectionLabel}>Gradients</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tileRow}>
            {GRADIENTS.map(theme => (
              <ThemeTile
                key={theme.key}
                name={theme.name}
                colors={theme.colors}
                selected={selectedTheme.type === 'gradient' && selectedTheme.key === theme.key}
                onPress={() => onSelectTheme({ type: 'gradient', key: theme.key })}
              />
            ))}
          </ScrollView>
        </ScrollView>
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
  sheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    zIndex: 100,
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
  doneText: {
    color: '#FFA726',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  sectionLabel: {
    color: '#aaa',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 22,
    marginBottom: 12,
    marginLeft: 18,
    letterSpacing: 1.2,
  },
  tileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 12,
    marginBottom: 8,
  },
  tile: {
    width: 140,
    height: 175,
    borderRadius: 21,
    marginRight: 8,
    backgroundColor: '#333',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  tilePreview: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  tileLabel: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    position: 'absolute',
    top: 12,
    left: 14,
    textAlign: 'left',
    width: 'auto',
    marginBottom: 0,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  checkCircle: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default ThemesSheet; 