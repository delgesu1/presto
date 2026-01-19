# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RSVP Reader is a speed reading web application using Rapid Serial Visual Presentation (RSVP) technique. Users paste text and read it word-by-word (or in chunks) at adjustable speeds with optional ORP (Optimal Recognition Point) highlighting.

## Commands

- `npm run dev` - Start development server (Webpack mode)
- `npm run build` - Production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

### Data Flow

```
User Input (Importer) → Zustand Store (setRawText) → Tokenizer → Scheduler → ReaderEngine (timing loop) → UI Components
```

### Core Processing Pipeline

1. **Tokenizer** (`src/lib/engine/tokenizer.ts`): Splits raw text into Token objects, each containing the word text and pre-calculated ORP index
2. **Scheduler** (`src/lib/engine/scheduler.ts`): Calculates display duration per token based on WPM, punctuation pauses, word length, and number penalties
3. **ORP Calculator** (`src/lib/engine/orp.ts`): Determines the pivot character position for each word based on length

### State Management

Zustand store (`src/store/useReaderStore.ts`) with localStorage persistence:
- Persisted: `rawText`, `settings`
- Runtime: `tokens`, `timings`, `isPlaying`, `currentIndex`

### Component Structure

- `ReaderEngine.tsx` - Core timing engine using useEffect-based scheduler
- `reader/ORPDisplay.tsx` - Word display with optional ORP pivot highlighting (red focus letter)
- `controls/PlayerControls.tsx` - Play/pause/skip/restart buttons
- `controls/ProgressBar.tsx` - Progress indicator with seek functionality
- `importer/Importer.tsx` - Text input and demo text loader
- `settings/SettingsPanel.tsx` - Theme selector, WPM slider, font/display options

### Theme System

10 themes defined via CSS custom properties in `globals.css`. Theme switching uses `data-theme` attribute on document root.

## Key Algorithms

**ORP Positioning**: Word length determines pivot index (1-2 chars: 0, 3-5: 1, 6-9: 2, 10-13: 3, 14+: 4)

**Timing Calculation**: Base duration (60000/WPM ms) modified by punctuation (+50% for ,.;: and +100% for .!?), word length adjustment, and number penalty

## Tech Stack

- Next.js 16 with App Router (all components use "use client")
- React 19, TypeScript 5.9 (strict mode)
- Zustand 5 for state management
- Tailwind CSS 4 for styling
- PWA-enabled with next-pwa and Workbox (disabled in dev)

## Path Alias

`@/*` maps to `./src/*`
