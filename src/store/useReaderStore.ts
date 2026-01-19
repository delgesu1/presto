import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Token, ReadingSettings } from '@/lib/engine/types';
import { Tokenizer } from '@/lib/engine/tokenizer';
import { Scheduler } from '@/lib/engine/scheduler';
import { demoTexts } from '@/lib/demoTexts';

const DEFAULT_SETTINGS: ReadingSettings = {
    wpm: 300,
    trainingModeEnabled: true,
    trainingStartWpm: 150,
    trainingEndWpm: 1000,
    fontSize: 2, // rem
    chunkSize: 1,
    orpEnabled: true,
    punctuationSlowdown: 100, // ms
    serifFont: true,
    musicType: 'none',
    theme: 'light',
};
const DEFAULT_TEXT = demoTexts[0];
const DEFAULT_TOKENS = Tokenizer.tokenize(DEFAULT_TEXT);
const DEFAULT_TIMINGS = Scheduler.schedule(DEFAULT_TOKENS, DEFAULT_SETTINGS);

interface ReaderState {
    // Data
    rawText: string;
    tokens: Token[];
    timings: number[]; // Duration per token

    // Playback State
    isPlaying: boolean;
    currentIndex: number;

    // Settings
    settings: ReadingSettings;

    // Actions
    setRawText: (text: string) => void;
    setSettings: (settings: Partial<ReadingSettings>) => void;
    play: () => void;
    pause: () => void;
    seek: (index: number) => void;
    next: () => void; // Advance one step (used by the loop)
    reset: () => void;
}

export const useReaderStore = create<ReaderState>()(
    persist(
        (set, get) => ({
            rawText: DEFAULT_TEXT,
            tokens: DEFAULT_TOKENS,
            timings: DEFAULT_TIMINGS,
            isPlaying: false,
            currentIndex: 0,
            settings: {
                ...DEFAULT_SETTINGS,
            },

            setRawText: (text: string) => {
                const tokens = Tokenizer.tokenize(text);
                const { settings } = get();
                const timings = Scheduler.schedule(tokens, settings);
                set({ rawText: text, tokens, timings, currentIndex: 0, isPlaying: false });
            },

            setSettings: (newSettings) => {
                const currentSettings = get().settings;
                const settings = { ...currentSettings, ...newSettings };
                // Re-calculate timings if WPM or relevant settings change
                const tokens = get().tokens;
                // Only re-schedule if we have tokens
                if (tokens.length > 0) {
                    const timings = Scheduler.schedule(tokens, settings);
                    set({ settings, timings });
                } else {
                    set({ settings });
                }
            },

            play: () => set({ isPlaying: true }),
            pause: () => set({ isPlaying: false }),
            seek: (index: number) => {
                const { tokens } = get();
                const safeIndex = Math.max(0, Math.min(index, tokens.length - 1));
                set({ currentIndex: safeIndex });
            },

            next: () => {
                const { currentIndex, tokens, settings } = get();
                const chunkSize = settings.chunkSize;
                const nextIndex = currentIndex + chunkSize;
                if (nextIndex >= tokens.length) {
                    set({ isPlaying: false });
                } else {
                    set({ currentIndex: nextIndex });
                }
            },

            reset: () => set({ currentIndex: 0, isPlaying: false, rawText: '', tokens: [], timings: [] }),
        }),
        {
            name: 'rsvp-reader-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ settings: state.settings }), // persist settings only, not text
            merge: (persistedState, currentState) => {
                const persisted = persistedState as Partial<typeof currentState>;
                const merged = { ...currentState, ...persisted } as typeof currentState;
                return {
                    ...merged,
                    settings: {
                        ...currentState.settings,
                        ...persisted?.settings,
                    },
                };
            },
        }
    )
);
