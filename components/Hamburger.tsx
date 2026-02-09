import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface Props {
  color?: string;
  isOpen: boolean;
  onPress?: () => void;
}

export default function Hamburger({ color = "#111", isOpen, onPress }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(isOpen ? 1 : 0, { duration: 300 });
  }, [isOpen, progress]);

  const topStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [0, 8],
      Extrapolate.CLAMP,
    );
    const rotate = interpolate(
      progress.value,
      [0, 1],
      [0, 45],
      Extrapolate.CLAMP,
    );
    return {
      transform: [{ translateY }, { rotate: `${rotate}deg` }],
    };
  });

  const middleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 1],
      [1, 0],
      Extrapolate.CLAMP,
    );
    const scaleX = interpolate(
      progress.value,
      [0, 1],
      [1, 0],
      Extrapolate.CLAMP,
    );
    return {
      opacity,
      transform: [{ scaleX }],
    };
  });

  const bottomStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [0, -8],
      Extrapolate.CLAMP,
    );
    const rotate = interpolate(
      progress.value,
      [0, 1],
      [0, -45],
      Extrapolate.CLAMP,
    );
    return {
      transform: [{ translateY }, { rotate: `${rotate}deg` }],
    };
  });

  return (
    <Pressable onPress={onPress} style={styles.container} hitSlop={10}>
      <Animated.View
        style={[styles.line, { backgroundColor: color }, topStyle]}
      />
      <Animated.View
        style={[styles.line, { backgroundColor: color }, middleStyle]}
      />
      <Animated.View
        style={[styles.line, { backgroundColor: color }, bottomStyle]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    width: 20,
    height: 2,
    borderRadius: 2,
    marginVertical: 3,
  },
});
