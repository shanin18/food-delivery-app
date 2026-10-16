import { useState } from 'react';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
type Props = PressableProps & { feedback?: 'button' | 'row'; ref?: React.Ref<React.ComponentRef<typeof Pressable>> };

export function InteractivePressable({ style, children, onPressIn, onPressOut, disabled, feedback = 'button', ...props }: Props) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const progress = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  const resolved = typeof style === 'function' ? style({ pressed, hovered }) : style;
  const original = StyleSheet.flatten(resolved);
  const animated = useAnimatedStyle(() => ({
    opacity: (typeof original?.opacity === 'number' ? original.opacity : 1) * (1 - progress.value * 0.12),
    transform: [...(Array.isArray(original?.transform) ? original.transform : []), { scale: 1 - progress.value * (reducedMotion || !children ? 0 : feedback === 'row' ? 0.008 : 0.025) }],
  }));
  return <AnimatedPressable {...props} disabled={disabled} onHoverIn={event => { setHovered(true); props.onHoverIn?.(event); }} onHoverOut={event => { setHovered(false); props.onHoverOut?.(event); }} style={[resolved, feedback === 'row' && { borderRadius: original?.borderRadius ?? 12 }, pressed && feedback === 'row' && { backgroundColor: '#FFF0E6' }, animated]}
    onPressIn={event => { setPressed(true); progress.set(withTiming(1, { duration: reducedMotion ? 0 : 90 })); onPressIn?.(event); }}
    onPressOut={event => { setPressed(false); progress.set(withTiming(0, { duration: reducedMotion ? 0 : 160 })); onPressOut?.(event); }}>
    {typeof children === 'function' ? children({ pressed, hovered }) : children}
  </AnimatedPressable>;
}
