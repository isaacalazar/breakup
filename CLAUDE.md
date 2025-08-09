# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native Expo application called "Exhale" that uses file-based routing with expo-router. The project is set up with TypeScript, ESLint, and includes a comprehensive component system with theming support.

## Development Commands

- **Start development server**: `npm start` or `npx expo start`
- **iOS development**: `npm run ios` or `expo start --ios`
- **Android development**: `npm run android` or `expo start --android`  
- **Web development**: `npm run web` or `expo start --web`
- **Linting**: `npm run lint` (uses expo lint with ESLint config)
- **Reset project**: `npm run reset-project` (moves current app to app-example and creates blank app)

## Architecture

### File-based Routing
- Uses Expo Router with file-based routing
- Main app structure in `/app` directory
- Tab navigation setup in `/app/(tabs)/`
- Root layout handles theme provider and font loading

### Component Architecture
- **Themed Components**: `ThemedText`, `ThemedView` components that automatically adapt to light/dark themes
- **UI Components**: Reusable UI components in `/components/ui/` (IconSymbol, TabBarBackground)
- **Custom Hooks**: Theme-related hooks in `/hooks/` (useColorScheme, useThemeColor)
- **Constants**: Color definitions and themes in `/constants/Colors.ts`

### Key Directories
- `/app/`: Main application screens and routing
- `/components/`: Reusable UI components and themed components
- `/hooks/`: Custom React hooks for theme and color management
- `/constants/`: App constants including color schemes
- `/assets/`: Static assets (fonts, images)

### Theming System
The app uses a comprehensive theming system:
- Automatic light/dark mode detection
- Themed components that adapt colors based on current scheme
- Custom color constants defined in `/constants/Colors.ts`
- Theme provider setup in root layout

### Platform Support
- Supports iOS, Android, and Web
- Platform-specific styling using `Platform.select()`
- iOS-specific blur effects and positioning for tab bars

## TypeScript Configuration
- Strict TypeScript enabled
- Path aliases configured: `@/*` maps to project root
- Expo TypeScript base configuration extended

## Development Notes
- New React Architecture enabled in app.json
- Uses React Navigation with themed navigation
- SpaceMono font loaded asynchronously
- Haptic feedback integration for iOS tab interactions