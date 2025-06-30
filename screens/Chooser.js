import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Animated as RNAnimated,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES } from '../styles/theme';
import BottomNavBar from '../components/common/BottomNavBar';
import OnboardingScreen from './OnboardingScreen';

const { width, height } = Dimensions.get('window');

const SHEET_HEIGHT = height * 0.95;
const SHEET_TOP = height * 0.05;

const HomeScreen = () => {
  const [touches, setTouches] = useState([]); // {id, x, y, timestamp}
  const [selectedTouch, setSelectedTouch] = useState(null); // {id, x, y}
  const [anim] = useState(new RNAnimated.Value(1));
  const timerRef = useRef(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const sheetAnim = useRef(new RNAnimated.Value(height)).current;
  const dragY = useRef(new RNAnimated.Value(0)).current;
  const dragOffset = useRef(0);

  // Unified handler to close and reset onboarding
  const handleOnboardingDone = () => {
    setShowOnboarding(false);
    setResetKey(k => k + 1);
  };

  // Handle responder events
  const handleStartShouldSetResponder = () => true;

  const handleResponderGrant = (evt) => {
    const changedTouches = evt.nativeEvent.touches;
    const newTouches = Array.from(changedTouches).map(t => ({
      id: t.identifier,
      x: t.pageX,
      y: t.pageY,
      timestamp: Date.now(),
    }));
    setTouches(newTouches);
  };

  const handleResponderMove = (evt) => {
    const changedTouches = evt.nativeEvent.touches;
    const newTouches = Array.from(changedTouches).map(t => ({
      id: t.identifier,
      x: t.pageX,
      y: t.pageY,
      timestamp: Date.now(),
    }));
    setTouches(newTouches);
  };

  const handleResponderRelease = (evt) => {
    setTouches([]);
    setSelectedTouch(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    anim.setValue(1);
  };

  // Effect: Start timer when 2+ touches
  useEffect(() => {
    if (touches.length >= 2 && !selectedTouch) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        // Randomly select one
        const idx = Math.floor(Math.random() * touches.length);
        setSelectedTouch(touches[idx]);
        // Animate
        RNAnimated.loop(
          RNAnimated.sequence([
            RNAnimated.timing(anim, {
              toValue: 1.5,
              duration: 400,
              useNativeDriver: true,
            }),
            RNAnimated.timing(anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, 1500);
    } else if (touches.length < 2) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setSelectedTouch(null);
      anim.setValue(1);
    }
    // Cleanup on unmount
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line
  }, [touches]);

  // PanResponder for sheet drag
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only start pan if user is dragging down/up vertically from the top 40px of the sheet
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
        if (dragDistance > SHEET_HEIGHT * 0.3) {
          // Dismiss
          RNAnimated.timing(sheetAnim, {
            toValue: height,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            handleOnboardingDone();
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

  // Animate sheet in/out
  useEffect(() => {
    if (showOnboarding) {
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
  }, [showOnboarding]);

  // Render all touch circles, or just the selected one if chosen
  const renderTouchCircles = () => {
    if (selectedTouch) {
      return (
        <RNAnimated.View
          key={selectedTouch.id}
          style={[
            styles.touchCircle,
            {
              left: selectedTouch.x - 35,
              top: selectedTouch.y - 35,
              borderColor: '#00FF6A',
              backgroundColor: 'rgba(0,255,106,0.2)',
              transform: [{ scale: anim }],
              zIndex: 10,
            },
          ]}
        />
      );
    }
    // Show all current touches
    return touches.map((t) => (
      <View
        key={t.id}
        style={[
          styles.touchCircle,
          {
            left: t.x - 35,
            top: t.y - 35,
            borderColor: 'white',
            backgroundColor: 'rgba(255,255,255,0.3)',
          },
        ]}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#FF416C', '#FFB347']}
        style={styles.gradient}
      >
        <View
          style={{ flex: 1 }}
          onStartShouldSetResponder={handleStartShouldSetResponder}
          onResponderGrant={handleResponderGrant}
          onResponderMove={handleResponderMove}
          onResponderRelease={handleResponderRelease}
          onResponderTerminate={handleResponderRelease}
        >
          {/* Top Row */}
          <View style={styles.topRow} pointerEvents="box-none">
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowOnboarding(true)}>
              <Text style={styles.iconText}>?</Text>
            </TouchableOpacity>
            <View style={styles.rightIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="brush" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="settings" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Center Content */}
          <View style={styles.centerContent} pointerEvents="box-none">
            <Text style={styles.title}>CHOOSER</Text>
            <Text style={styles.subtitle}>A random finger selector.</Text>
          </View>

          {/* Render Touch Circles */}
          {renderTouchCircles()}

          {/* Bottom Navigation */}
          <BottomNavBar activeTab="chooser" />
        </View>
        {/* Onboarding Bottom Sheet */}
        {showOnboarding && (
          <RNAnimated.View
            style={[
              styles.sheetOverlay,
              { opacity: sheetAnim.interpolate({ inputRange: [SHEET_TOP, height], outputRange: [0.5, 0] }) }
            ]}
            pointerEvents={showOnboarding ? 'auto' : 'none'}
          />
        )}
        <RNAnimated.View
          style={[
            styles.bottomSheet,
            {
              height: SHEET_HEIGHT,
              transform: [
                { translateY: RNAnimated.add(sheetAnim, dragY) },
              ],
            },
          ]}
          pointerEvents={showOnboarding ? 'auto' : 'none'}
          {...panResponder.panHandlers}
        >
          <OnboardingScreen key={resetKey} resetKey={resetKey} onDone={handleOnboardingDone} style={{ height: SHEET_HEIGHT }} />
        </RNAnimated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: FONT_SIZES.subtitle,
    color: COLORS.text,
    opacity: 0.8,
  },
  bottomNav: {
    // removed, handled by BottomNavBar
  },
  navItems: {
    // removed, handled by BottomNavBar
  },
  navItem: {
    // removed, handled by BottomNavBar
  },
  navText: {
    // removed, handled by BottomNavBar
  },
  touchCircle: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: 'rgba(255,255,255,0.3)',
    zIndex: 10,
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
  bottomSheet: {
    position: 'absolute',
    left: 0,
    width: '100%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    zIndex: 200,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});

export default HomeScreen; 