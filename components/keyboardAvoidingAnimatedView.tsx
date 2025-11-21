import React, { useEffect, useRef, forwardRef } from 'react';
import { Platform, View, KeyboardAvoidingView, Dimensions } from 'react-native';
import type { ViewProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useAnimatedKeyboard,
  type SharedValue,
} from 'react-native-reanimated';

interface KeyboardAvoidingAnimatedViewProps extends ViewProps {
  behavior?: 'height' | 'position' | 'padding';
  keyboardVerticalOffset?: number;
  enabled?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

type MaybeSharedValue<T> = T | SharedValue<T>;

const KeyboardAvoidingAnimatedView = forwardRef<View, KeyboardAvoidingAnimatedViewProps>(
  (props, ref) => {
    const {
      children,
      behavior = Platform.OS === 'ios' ? 'padding' : 'height',
      keyboardVerticalOffset = 0,
      style,
      contentContainerStyle,
      enabled = true,
      onLayout,
      ...rest
    } = props;

    if (Platform.OS === 'web') {
      return (
        <KeyboardAvoidingView
          behavior={behavior}
          keyboardVerticalOffset={keyboardVerticalOffset}
          style={style}
          contentContainerStyle={contentContainerStyle}
          enabled={enabled}
          {...rest}
        >
          {children}
        </KeyboardAvoidingView>
      );
    }

    const keyboard = useAnimatedKeyboard();
    const viewRef = useRef<View>(null);
    const initialHeightSV = useSharedValue(0);
    const viewBottomSV = useSharedValue(0);
    const screenHeightSV = useSharedValue(Dimensions.get('window').height);
    const offsetSV = useSharedValue(keyboardVerticalOffset);
    const enabledSV = useSharedValue(enabled);

    useEffect(() => {
      offsetSV.value = keyboardVerticalOffset;
    }, [keyboardVerticalOffset, offsetSV]);

    useEffect(() => {
      enabledSV.value = enabled;
    }, [enabled, enabledSV]);

    useEffect(() => {
      const listener = Dimensions.addEventListener('change', ({ window }) => {
        screenHeightSV.value = window.height;
      });
      return () => listener.remove();
    }, [screenHeightSV]);

    const handleLayout = (event: any) => {
      viewRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
        viewBottomSV.value = y + height;
        if (behavior === 'height' && initialHeightSV.value === 0 && keyboard.state.value === 0) {
          initialHeightSV.value = height;
        }
      });
      onLayout?.(event);
    };

    const animatedStyle = useAnimatedStyle<ViewStyle>(() => {
      if (!enabledSV.value) {
        return {};
      }
      const kbHeight: MaybeSharedValue<number> = keyboard.height.value;
      const shift = Math.max(0, viewBottomSV.value - screenHeightSV.value + (kbHeight as number) + offsetSV.value);
      if (behavior === 'padding') {
        return {
          paddingBottom: shift,
        };
      } else if (behavior === 'height') {
        return {
          height: initialHeightSV.value - shift,
          flex: shift > 0 ? 0 : undefined,
        };
      } else if (behavior === 'position') {
        return {};
      }
      return {};
    }, [behavior]);

    const positionAnimatedStyle = useAnimatedStyle<ViewStyle>(() => {
      if (!enabledSV.value || behavior !== 'position') {
        return {};
      }
      const kbHeight: MaybeSharedValue<number> = keyboard.height.value;
      const shift = Math.max(0, viewBottomSV.value - screenHeightSV.value + (kbHeight as number) + offsetSV.value);
      return {
        transform: [{ translateY: -shift }],
      };
    }, [behavior]);

    const renderContent = () => {
      if (behavior === 'position') {
        return (
          <Animated.View style={[contentContainerStyle, positionAnimatedStyle]}>
            {children}
          </Animated.View>
        );
      }
      return children;
    };

    return (
      <Animated.View
        ref={viewRef}
        style={[style, animatedStyle]}
        onLayout={handleLayout}
        {...rest}
      >
        {renderContent()}
      </Animated.View>
    );
  }
);

export default KeyboardAvoidingAnimatedView;