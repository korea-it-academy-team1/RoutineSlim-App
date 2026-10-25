/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';

// The app is light-only for now, regardless of the device color scheme.
export function useTheme() {
  return Colors.light;
}
