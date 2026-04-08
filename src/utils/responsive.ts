// === FILE: src/utils/responsive.ts ===
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const wp = (percentage: number): number => {
  return (screenWidth * percentage) / 100;
};

export const hp = (percentage: number): number => {
  return (screenHeight * percentage) / 100;
};

export const scale = (size: number): number => {
  const baseWidth = 375;
  const baseHeight = 812;
  const widthScale = screenWidth / baseWidth;
  const heightScale = screenHeight / baseHeight;
  const scaleFactor = Math.min(widthScale, heightScale);
  return size * scaleFactor;
};

export const screenWidthPx = screenWidth;
export const screenHeightPx = screenHeight;
