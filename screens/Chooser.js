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
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES } from '../styles/theme';
import BottomNavBar from '../components/common/BottomNavBar';
import OnboardingScreen from './OnboardingScreen';
import SettingsSheet from '../components/SettingsSheet';
import ThemesSheet from '../components/ThemesSheet';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

const SHEET_HEIGHT = height * 0.95;
const SHEET_TOP = height * 0.05;

// Load pop sounds
const popSounds = [
  require('../assets/Pop (1).mp3'),
  require('../assets/Pop (2).mp3'),
  require('../assets/Pop (3).mp3'),
  require('../assets/Pop (4).mp3'),
  require('../assets/Pop (5).mp3'),
];
const swishSound = require('../assets/Swish.mp3');

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

const HomeScreen = () => {
  const [touches, setTouches] = useState([]); // {id, x, y, timestamp}
  const [selectedTouch, setSelectedTouch] = useState(null); // {id, x, y}
  const [isSelecting, setIsSelecting] = useState(false);
  const [firstTouchTime, setFirstTouchTime] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const sheetAnim = useRef(new RNAnimated.Value(height)).current;
  const dragY = useRef(new RNAnimated.Value(0)).current;
  const dragOffset = useRef(0);
  
  // Animation values for title fade
  const titleOpacity = useRef(new RNAnimated.Value(1)).current;
  const subtitleOpacity = useRef(new RNAnimated.Value(1)).current;
  
  // Animation values for UI elements fade
  const topRowOpacity = useRef(new RNAnimated.Value(1)).current;
  const bottomNavOpacity = useRef(new RNAnimated.Value(1)).current;
  
  // Timer ref for selection
  const selectionTimerRef = useRef(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState({ type: 'gradient', key: 'virgin' });
  
  // Settings state
  const [settings, setSettings] = useState({
    winners: 1,
    rankWinners: false,
    sounds: true,
    vibrations: false,
  });

  // Unified handler to close and reset onboarding
  const handleOnboardingDone = () => {
    setShowOnboarding(false);
    // Delay the reset until after the sheet animation completes
    setTimeout(() => {
      setResetKey(k => k + 1);
    }, 300); // Match the sheet animation duration
  };

  // Play a random pop sound
  const playRandomPop = async () => {
    const idx = Math.floor(Math.random() * popSounds.length);
    const { sound } = await Audio.Sound.createAsync(popSounds[idx]);
    await sound.playAsync();
    // Unload after playing
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  };

  const playSwish = async () => {
    const { sound } = await Audio.Sound.createAsync(swishSound);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  };

  // Check if touch is within interactive areas (top row or bottom nav)
  const isTouchInInteractiveArea = (x, y) => {
    const topRowHeight = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10;
    const topRowBottom = topRowHeight + 40; // 40 is the height of the icon buttons
    
    const bottomNavTop = height - 80; // Approximate bottom nav area (adjust as needed)
    
    // Check if touch is in top row area
    if (y < topRowBottom && x >= 20 && x <= width - 20) {
      return true;
    }
    
    // Check if touch is in bottom nav area
    if (y > bottomNavTop) {
      return true;
    }
    
    return false;
  };

  // Handle touch events for multi-touch support
  const handleTouchStart = (evt) => {
    const touchesArr = evt.nativeEvent.touches;
    
    // Filter out touches in interactive areas
    const validTouches = Array.from(touchesArr).filter(t => 
      !isTouchInInteractiveArea(t.pageX, t.pageY)
    );
    
    if (validTouches.length === 0) {
      return; // No valid touches, don't process
    }
    
    const newTouches = validTouches.map(t => ({
      id: t.identifier,
      x: t.pageX,
      y: t.pageY,
      timestamp: Date.now(),
    }));

    // Detect new fingers (ids not in previous touches)
    const prevIds = touches.map(t => t.id);
    const newFingerTouches = newTouches.filter(t => !prevIds.includes(t.id));
    
    // Only play sounds if sounds are enabled
    if (settings.sounds) {
      newFingerTouches.forEach(() => playRandomPop());
    }
    
    // Vibrate when new fingers are placed
    if (settings.vibrations && newFingerTouches.length > 0) {
      Vibration.vibrate(50); // Short vibration for finger placement
    }

    // Check if we have enough fingers to start selection
    const minFingersNeeded = settings.winners + 1;
    
    // If this is the first touch (no previous touches), start the selection timer
    if (touchesArr.length === 1) {
      setFirstTouchTime(Date.now());
      // Only start timer if we have enough fingers
      if (newTouches.length >= minFingersNeeded) {
        startSelectionTimer();
      }
    }
    
    setTouches(newTouches);
    
    // Start timer if we now have enough fingers
    if (newTouches.length >= minFingersNeeded && !isSelecting && !selectedTouch) {
      startSelectionTimer();
    }
    
    if (titleOpacity._value > 0) {
      RNAnimated.parallel([
        RNAnimated.timing(titleOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        RNAnimated.timing(subtitleOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        RNAnimated.timing(topRowOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        RNAnimated.timing(bottomNavOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleTouchMove = (evt) => {
    const touches = evt.nativeEvent.touches;
    
    // Filter out touches in interactive areas
    const validTouches = Array.from(touches).filter(t => 
      !isTouchInInteractiveArea(t.pageX, t.pageY)
    );
    
    const newTouches = validTouches.map(t => ({
      id: t.identifier,
      x: t.pageX,
      y: t.pageY,
      timestamp: Date.now(),
    }));
    setTouches(newTouches);
  };

  const handleTouchEnd = (evt) => {
    const touches = evt.nativeEvent.touches;
    const newTouches = Array.from(touches).map(t => ({
      id: t.identifier,
      x: t.pageX,
      y: t.pageY,
      timestamp: Date.now(),
    }));
    
    console.log('Touch End:', newTouches.length, 'fingers remaining');
    
    // If no touches remain, reset everything
    if (newTouches.length === 0) {
      if (settings.sounds) {
        playSwish();
      }
      if (settings.vibrations) {
        Vibration.vibrate(75); // Short vibration when all fingers removed
      }
      setTouches([]);
      setSelectedTouch(null);
      setIsSelecting(false);
      setFirstTouchTime(null);
      
      // Clear selection timer
      if (selectionTimerRef.current) {
        clearTimeout(selectionTimerRef.current);
        selectionTimerRef.current = null;
      }
      
      // Reset title and subtitle opacity
      RNAnimated.parallel([
        RNAnimated.timing(titleOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        RNAnimated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        RNAnimated.timing(topRowOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        RNAnimated.timing(bottomNavOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Update touches with remaining fingers
      console.log('Updating with remaining fingers');
      setTouches(newTouches);
    }
  };

  // Start selection timer
  const startSelectionTimer = () => {
    if (selectionTimerRef.current) {
      clearTimeout(selectionTimerRef.current);
    }
    
    console.log('Starting selection timer');
    selectionTimerRef.current = setTimeout(() => {
      console.log('Timer fired, touches:', touches.length, 'isSelecting:', isSelecting, 'selectedTouch:', selectedTouch);
      if (touches.length > 0 && !isSelecting && !selectedTouch) {
        performSelection();
      }
    }, 3000);
  };

  // Perform the selection process
  const performSelection = () => {
    console.log('Performing selection with', touches.length, 'touches for', settings.winners, 'winners');
    setIsSelecting(true);
    
    // Vibrate when selection starts
    if (settings.vibrations) {
      Vibration.vibrate(100); // Medium vibration for selection start
    }
    
    // Wait for the fill animation to complete, then select winners
    setTimeout(() => {
      if (touches.length > 0) {
        const numWinners = Math.min(settings.winners, touches.length);
        
        if (settings.rankWinners) {
          // Select multiple winners and rank them
          const shuffledTouches = [...touches].sort(() => Math.random() - 0.5);
          const winners = shuffledTouches.slice(0, numWinners);
          setSelectedTouch(winners); // Store array of winners
        } else {
          // Select single winner (for now, just pick the first winner)
          const winnerIndex = Math.floor(Math.random() * touches.length);
          console.log('Selected winner at index:', winnerIndex);
          setSelectedTouch(touches[winnerIndex]);
        }
        
        // Vibrate when winners are chosen
        if (settings.vibrations) {
          Vibration.vibrate([0, 100, 50, 100]); // Pattern: wait, vibrate, wait, vibrate
        }
      }
    }, 800); // Wait for fill animation
  };

  // Effect to restart timer when new touches are added
  useEffect(() => {
    if (touches.length > 0 && !isSelecting && !selectedTouch) {
      // Reset timer when new touches are added
      startSelectionTimer();
    }
  }, [touches.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (selectionTimerRef.current) {
        clearTimeout(selectionTimerRef.current);
      }
    };
  }, []);

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

  // Render touch rings
  const renderTouchRings = () => {
    if (selectedTouch) {
      if (Array.isArray(selectedTouch)) {
        // Multiple winners (ranked)
        return selectedTouch.map((winner, index) => (
          <WinnerRing
            key={`winner-${winner.id}-${index}`}
            x={winner.x}
            y={winner.y}
            rank={index + 1}
          />
        ));
      } else {
        // Single winner
        return (
          <WinnerRing
            key={selectedTouch.id}
            x={selectedTouch.x}
            y={selectedTouch.y}
          />
        );
      }
    }

    if (isSelecting) {
      // Show all rings filled and scaled up
      return touches.map((t) => (
        <FilledRing
          key={t.id}
          x={t.x}
          y={t.y}
        />
      ));
    }

    // Show normal rings
    return touches.map((t) => (
      <TouchRing
        key={t.id}
        x={t.x}
        y={t.y}
      />
    ));
  };

  // Get theme object
  const getTheme = () => {
    if (selectedTheme.type === 'mono') {
      return MONOCHROME.find(t => t.key === selectedTheme.key);
    } else {
      return GRADIENTS.find(t => t.key === selectedTheme.key);
    }
  };
  const theme = getTheme();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={selectedTheme.type === 'gradient' && theme ? theme.colors : theme ? [theme.color, theme.color] : ['#232326', '#232326']}
        style={styles.gradient}
      >
        <View
          style={{ flex: 1 }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Row */}
          <RNAnimated.View style={[styles.topRow, { opacity: topRowOpacity }]} pointerEvents="box-none">
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowOnboarding(true)}>
              <Text style={styles.iconText}>?</Text>
            </TouchableOpacity>
            <View style={styles.rightIcons}>
              <TouchableOpacity style={styles.iconButton} onPress={() => setShowThemes(true)}>
                <Ionicons name="brush" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => setShowSettings(true)}>
                <Ionicons name="settings" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </RNAnimated.View>

          {/* Center Content */}
          <View style={styles.centerContent} pointerEvents="box-none">
            <RNAnimated.Text style={[styles.title, { opacity: titleOpacity }]}>CHOOSER</RNAnimated.Text>
            <RNAnimated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>A random finger selector.</RNAnimated.Text>
          </View>

          {/* Render Touch Rings */}
          {renderTouchRings()}

          {/* Bottom Navigation */}
          {/* <BottomNavBar activeTab="chooser" /> */}
          <RNAnimated.View style={{ opacity: bottomNavOpacity }}>
            <BottomNavBar activeTab="chooser" />
          </RNAnimated.View>
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
        {/* Settings Bottom Sheet */}
        <SettingsSheet 
          visible={showSettings} 
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSettingsChange={setSettings}
        />
        {/* Themes Bottom Sheet */}
        <ThemesSheet
          visible={showThemes}
          onClose={() => setShowThemes(false)}
          selectedTheme={selectedTheme}
          onSelectTheme={setSelectedTheme}
        />
      </LinearGradient>
    </View>
  );
};

// Touch Ring Component (hollow white ring with bounce animation)
const TouchRing = ({ x, y }) => {
  const scale = useRef(new RNAnimated.Value(0)).current;
  const pulseScale = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    // Initial bounce animation
    RNAnimated.sequence([
      RNAnimated.timing(scale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      RNAnimated.timing(scale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulse animation
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulseScale, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        RNAnimated.timing(pulseScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <RNAnimated.View
      style={[
        styles.touchRing,
        {
          left: x - 35,
          top: y - 35,
          transform: [{ scale: RNAnimated.multiply(scale, pulseScale) }],
        },
      ]}
    />
  );
};

// Filled Ring Component (solid white circle during selection)
const FilledRing = ({ x, y }) => {
  const scale = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    // Scale up animation
    RNAnimated.timing(scale, {
      toValue: 1.3,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <RNAnimated.View
      style={[
        styles.filledRing,
        {
          left: x - 35,
          top: y - 35,
          transform: [{ scale }],
        },
      ]}
    />
  );
};

// Winner Ring Component (pulsing winner)
const WinnerRing = ({ x, y, rank }) => {
  const pulseScale = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    // Initial bounce
    RNAnimated.sequence([
      RNAnimated.timing(pulseScale, {
        toValue: 1.5,
        duration: 300,
        useNativeDriver: true,
      }),
      RNAnimated.timing(pulseScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Start pulsing
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(pulseScale, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          RNAnimated.timing(pulseScale, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <RNAnimated.View
      style={[
        styles.winnerRing,
        {
          left: x - 35,
          top: y - 35,
          transform: [{ scale: pulseScale }],
        },
      ]}
    >
      {rank && (
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
      )}
    </RNAnimated.View>
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
  touchRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 6,
    borderColor: 'white',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  filledRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  winnerRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  rankBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FFA726',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
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