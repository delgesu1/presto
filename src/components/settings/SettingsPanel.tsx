"use client";

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useReaderStore } from '@/store/useReaderStore';
import type { MusicType } from '@/lib/engine/types';

const MUSIC_STREAMS: Record<Exclude<MusicType, 'none'>, string> = {
    jazz: 'https://jazzfm91.streamb.live/SB00023',
    baroque: 'http://mediaserv73.live-streams.nl:8058/stream',
};

const CROSSFADE_DURATION = 500; // ms

export const SettingsPanel: React.FC = () => {
    const { settings, setSettings } = useReaderStore();

    const wpmRef = useRef<HTMLInputElement>(null);
    const fontSizeRef = useRef<HTMLInputElement>(null);
    const pauseRef = useRef<HTMLInputElement>(null);
    const jazzAudioRef = useRef<HTMLAudioElement>(null);
    const baroqueAudioRef = useRef<HTMLAudioElement>(null);
    const fadeIntervalRef = useRef<number | null>(null);

    const WPM_MIN = 100;
    const WPM_MAX = 1500;
    const WPM_STEP = 50;
    const trainingStartWpm = settings.trainingStartWpm ?? settings.wpm;
    const trainingEndWpm = settings.trainingEndWpm ?? settings.wpm;
    const rangeStartWpm = Math.min(trainingStartWpm, trainingEndWpm);
    const rangeEndWpm = Math.max(trainingStartWpm, trainingEndWpm);
    const rangeStartPercent = ((rangeStartWpm - WPM_MIN) / (WPM_MAX - WPM_MIN)) * 100;
    const rangeEndPercent = ((rangeEndWpm - WPM_MIN) / (WPM_MAX - WPM_MIN)) * 100;
    const [activeHandle, setActiveHandle] = useState<'start' | 'end' | null>(null);
    const rangeRef = useRef<HTMLDivElement>(null);

    const themes = [
        { id: 'light', label: 'Light', bg: '#ffffff', text: '#1a1a2e', accent: '#3b82f6' },
        { id: 'dark', label: 'Dark', bg: '#1a1a24', text: '#f4f4f5', accent: '#60a5fa' },
        { id: 'cream', label: 'Sepia', bg: '#fffefb', text: '#3d3527', accent: '#b8860b' },
        { id: 'rose', label: 'Rose', bg: '#fdf2f4', text: '#4a2c35', accent: '#e11d48' },
        { id: 'lavender', label: 'Lavender', bg: '#f5f3ff', text: '#3b2e5a', accent: '#7c3aed' },
        { id: 'sand', label: 'Sand', bg: '#f7f5f0', text: '#44403c', accent: '#c2850a' },
        { id: 'midnight', label: 'Midnight', bg: '#0f172a', text: '#f1f5f9', accent: '#f59e0b' },
        { id: 'ocean', label: 'Ocean', bg: '#0c1222', text: '#e2e8f0', accent: '#06b6d4' },
        { id: 'forest', label: 'Forest', bg: '#0f1a14', text: '#dcebe0', accent: '#10b981' },
        { id: 'noir', label: 'Noir', bg: '#18181b', text: '#fafafa', accent: '#ffffff' },
        { id: 'neo', label: 'Neo', bg: '#000000', text: '#00ff41', accent: '#00ff41' },
    ];

    // Apply theme to document on mount and when it changes
    useEffect(() => {
        const themeId = settings.theme;
        document.documentElement.setAttribute('data-theme', themeId === 'light' ? '' : themeId);
    }, [settings.theme]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem('rsvp-reader-storage');
            if (stored) return;
        } catch {
            return;
        }

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            setSettings({ theme: 'dark' });
        }
    }, [setSettings]);

    // Update slider fill on mount and value change
    useEffect(() => {
        const updateSliderFill = (slider: HTMLInputElement | null) => {
            if (!slider) return;
            const min = parseFloat(slider.min);
            const max = parseFloat(slider.max);
            const value = parseFloat(slider.value);
            const percent = ((value - min) / (max - min)) * 100;
            slider.style.setProperty('--slider-fill', `${percent}%`);
        };

        updateSliderFill(wpmRef.current);
        updateSliderFill(fontSizeRef.current);
        updateSliderFill(pauseRef.current);
    }, [settings.wpm, settings.fontSize, settings.punctuationSlowdown, settings.trainingModeEnabled]);

    // Crossfade helper function
    const crossfade = useCallback((
        fadeOut: HTMLAudioElement | null,
        fadeIn: HTMLAudioElement | null,
        onComplete?: () => void
    ) => {
        // Clear any existing fade interval
        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
        }

        const steps = 20;
        const stepDuration = CROSSFADE_DURATION / steps;
        let step = 0;

        // Set initial volumes
        if (fadeIn) {
            fadeIn.volume = 0;
            fadeIn.play().catch(() => {
                setSettings({ musicType: 'none' });
            });
        }

        fadeIntervalRef.current = window.setInterval(() => {
            step++;
            const progress = step / steps;

            if (fadeOut) {
                fadeOut.volume = Math.max(0, 1 - progress);
            }
            if (fadeIn) {
                fadeIn.volume = Math.min(1, progress);
            }

            if (step >= steps) {
                if (fadeIntervalRef.current) {
                    clearInterval(fadeIntervalRef.current);
                    fadeIntervalRef.current = null;
                }
                if (fadeOut) {
                    fadeOut.pause();
                    fadeOut.volume = 1;
                }
                onComplete?.();
            }
        }, stepDuration);
    }, [setSettings]);

    // Handle music playback based on settings
    useEffect(() => {
        const jazzAudio = jazzAudioRef.current;
        const baroqueAudio = baroqueAudioRef.current;

        if (settings.musicType === 'none') {
            // Fade out whichever is playing
            if (jazzAudio && !jazzAudio.paused) {
                crossfade(jazzAudio, null);
            }
            if (baroqueAudio && !baroqueAudio.paused) {
                crossfade(baroqueAudio, null);
            }
        } else if (settings.musicType === 'jazz') {
            if (baroqueAudio && !baroqueAudio.paused) {
                // Crossfade from baroque to jazz
                crossfade(baroqueAudio, jazzAudio);
            } else if (jazzAudio?.paused) {
                // Just start jazz
                jazzAudio.volume = 1;
                jazzAudio.play().catch(() => {
                    setSettings({ musicType: 'none' });
                });
            }
        } else if (settings.musicType === 'baroque') {
            if (jazzAudio && !jazzAudio.paused) {
                // Crossfade from jazz to baroque
                crossfade(jazzAudio, baroqueAudio);
            } else if (baroqueAudio?.paused) {
                // Just start baroque
                baroqueAudio.volume = 1;
                baroqueAudio.play().catch(() => {
                    setSettings({ musicType: 'none' });
                });
            }
        }
    }, [settings.musicType, crossfade, setSettings]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (fadeIntervalRef.current) {
                clearInterval(fadeIntervalRef.current);
            }
        };
    }, []);

    const handleMusicChange = useCallback((type: MusicType) => {
        setSettings({ musicType: type });
    }, [setSettings]);

    const handleTrainingToggle = useCallback(() => {
        setSettings({ trainingModeEnabled: !settings.trainingModeEnabled });
    }, [settings.trainingModeEnabled, setSettings]);

    const handleThemeChange = (themeId: string) => {
        setSettings({ theme: themeId });
    };

    const handleSliderChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: (value: number) => void,
        isFloat = false
    ) => {
        const value = isFloat ? parseFloat(e.target.value) : parseInt(e.target.value);
        setter(value);

        // Update fill immediately
        const slider = e.target;
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const percent = ((value - min) / (max - min)) * 100;
        slider.style.setProperty('--slider-fill', `${percent}%`);
    };

    const clampToStep = useCallback((value: number) => {
        const steps = Math.round(value / WPM_STEP);
        return Math.min(WPM_MAX, Math.max(WPM_MIN, steps * WPM_STEP));
    }, [WPM_MAX, WPM_MIN, WPM_STEP]);

    const getWpmFromPointer = useCallback((clientX: number) => {
        const rect = rangeRef.current?.getBoundingClientRect();
        if (!rect) return WPM_MIN;

        const ratio = (clientX - rect.left) / rect.width;
        const rawValue = WPM_MIN + ratio * (WPM_MAX - WPM_MIN);
        return clampToStep(rawValue);
    }, [clampToStep, WPM_MAX, WPM_MIN]);

    const applyHandleValue = useCallback(
        (handle: 'start' | 'end', clientX: number) => {
            const value = getWpmFromPointer(clientX);
            if (handle === 'start') {
                setSettings({ trainingStartWpm: Math.min(value, trainingEndWpm) });
            } else {
                setSettings({ trainingEndWpm: Math.max(value, trainingStartWpm) });
            }
        },
        [getWpmFromPointer, setSettings, trainingEndWpm, trainingStartWpm]
    );

    const handleRangePointerDown = useCallback(
        (handle: 'start' | 'end') => (event: React.PointerEvent<HTMLButtonElement>) => {
            event.preventDefault();
            setActiveHandle(handle);
            applyHandleValue(handle, event.clientX);
        },
        [applyHandleValue]
    );

    const handleRangeKeyDown = useCallback(
        (handle: 'start' | 'end') => (event: React.KeyboardEvent<HTMLButtonElement>) => {
            const stepChange =
                event.key === 'ArrowRight' || event.key === 'ArrowUp'
                    ? WPM_STEP
                    : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
                        ? -WPM_STEP
                        : 0;
            if (stepChange === 0) return;

            event.preventDefault();
            if (handle === 'start') {
                const newValue = clampToStep(trainingStartWpm + stepChange);
                setSettings({ trainingStartWpm: Math.min(newValue, trainingEndWpm) });
            } else {
                const newValue = clampToStep(trainingEndWpm + stepChange);
                setSettings({ trainingEndWpm: Math.max(newValue, trainingStartWpm) });
            }
        },
        [trainingEndWpm, trainingStartWpm, clampToStep, setSettings]
    );

    const handleRangePointerDownCapture = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        if (!target.classList.contains('settings-range-handle')) {
            event.preventDefault();
        }
    }, []);

    useEffect(() => {
        if (!activeHandle) return;

        const onPointerMove = (event: PointerEvent) => {
            event.preventDefault();
            applyHandleValue(activeHandle, event.clientX);
        };

        const onPointerUp = () => {
            setActiveHandle(null);
        };

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);

        return () => {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
        };
    }, [activeHandle, applyHandleValue]);

    return (
        <div className="settings-container">
            {/* Reading Section */}
            <div className="settings-section">
                <h3 className="settings-section-title">Reading</h3>

                {/* Training Mode */}
                <div className="settings-row-inline">
                    <div className="settings-label-group">
                        <span className="settings-label">Training Mode</span>
                        <span className="settings-hint">Ramp speed to the target by 80% of the text</span>
                    </div>
                    <button
                        onClick={handleTrainingToggle}
                        className={`settings-toggle ${settings.trainingModeEnabled ? 'settings-toggle-on' : ''}`}
                        role="switch"
                        aria-checked={settings.trainingModeEnabled}
                    >
                        <span className="settings-toggle-thumb" />
                    </button>
                </div>

                {/* Speed */}
                {!settings.trainingModeEnabled ? (
                    <div className="settings-row">
                        <div className="settings-row-header">
                            <span className="settings-label">Speed</span>
                            <span className="settings-value">{settings.wpm} <span className="settings-unit">WPM</span></span>
                        </div>
                        <input
                            ref={wpmRef}
                            type="range"
                            min={WPM_MIN}
                            max={WPM_MAX}
                            step={WPM_STEP}
                            value={settings.wpm}
                            onChange={(e) => handleSliderChange(e, (v) => setSettings({ wpm: v }))}
                            className="settings-slider"
                        />
                    </div>
                ) : (
                <div className="settings-row">
                    <div className="settings-row-header">
                        <span className="settings-label">Training Speed</span>
                        <span className="settings-value">
                            {trainingStartWpm} to {trainingEndWpm} <span className="settings-unit">WPM</span>
                        </span>
                    </div>
                    <div
                        className="settings-range"
                        ref={rangeRef}
                        onPointerDownCapture={handleRangePointerDownCapture}
                        style={
                            {
                                '--range-start': `${rangeStartPercent}%`,
                                '--range-end': `${rangeEndPercent}%`,
                            } as React.CSSProperties
                        }
                    >
                        <div className="settings-range-track" />
                        <button
                            type="button"
                            className={`settings-range-handle ${activeHandle === 'start' ? 'settings-range-handle-active' : ''}`}
                            role="slider"
                            aria-label="Training start speed"
                            aria-valuemin={WPM_MIN}
                            aria-valuemax={WPM_MAX}
                            aria-valuenow={trainingStartWpm}
                            onPointerDown={handleRangePointerDown('start')}
                            onKeyDown={handleRangeKeyDown('start')}
                            style={{ left: `${rangeStartPercent}%` }}
                            tabIndex={0}
                        />
                        <button
                            type="button"
                            className={`settings-range-handle ${activeHandle === 'end' ? 'settings-range-handle-active' : ''}`}
                            role="slider"
                            aria-label="Training end speed"
                            aria-valuemin={WPM_MIN}
                            aria-valuemax={WPM_MAX}
                            aria-valuenow={trainingEndWpm}
                            onPointerDown={handleRangePointerDown('end')}
                            onKeyDown={handleRangeKeyDown('end')}
                            style={{ left: `${rangeEndPercent}%` }}
                            tabIndex={0}
                        />
                    </div>
                </div>
                )}

                {/* Punctuation Pause */}
                <div className="settings-row">
                    <div className="settings-row-header">
                        <span className="settings-label">Punctuation Pause</span>
                        <span className="settings-value">{settings.punctuationSlowdown}<span className="settings-unit">ms</span></span>
                    </div>
                    <input
                        ref={pauseRef}
                        type="range"
                        min="0"
                        max="200"
                        step="10"
                        value={settings.punctuationSlowdown}
                        onChange={(e) => handleSliderChange(e, (v) => setSettings({ punctuationSlowdown: v }))}
                        className="settings-slider"
                    />
                </div>

                {/* Words per flash */}
                <div className="settings-row-inline">
                    <span className="settings-label">Words per flash</span>
                    <div className="settings-chip-group">
                        {[1, 2, 3].map((size) => (
                            <button
                                key={size}
                                onClick={() => setSettings({ chunkSize: size })}
                                className={`settings-chip ${settings.chunkSize === size ? 'settings-chip-active' : ''}`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Focus Letter */}
                <div className={`settings-row-inline ${settings.chunkSize !== 1 ? 'settings-row-disabled' : ''}`}>
                    <div className="settings-label-group">
                        <span className="settings-label">Focus Letter</span>
                        {settings.chunkSize !== 1 && (
                            <span className="settings-hint">Single word only</span>
                        )}
                    </div>
                    <button
                        onClick={() => settings.chunkSize === 1 && setSettings({ orpEnabled: !settings.orpEnabled })}
                        className={`settings-toggle ${settings.orpEnabled && settings.chunkSize === 1 ? 'settings-toggle-on' : ''}`}
                        role="switch"
                        aria-checked={settings.orpEnabled && settings.chunkSize === 1}
                        disabled={settings.chunkSize !== 1}
                    >
                        <span className="settings-toggle-thumb" />
                    </button>
                </div>
            </div>

            {/* Display Section */}
            <div className="settings-section">
                <h3 className="settings-section-title">Display</h3>

                {/* Font Size */}
                <div className="settings-row">
                    <div className="settings-row-header">
                        <span className="settings-label">Font Size</span>
                        <span className="settings-value">{settings.fontSize}</span>
                    </div>
                    <input
                        ref={fontSizeRef}
                        type="range"
                        min="1"
                        max="3"
                        step="0.25"
                        value={settings.fontSize}
                        onChange={(e) => handleSliderChange(e, (v) => setSettings({ fontSize: v }), true)}
                        className="settings-slider"
                    />
                </div>

                {/* Serif Font */}
                <div className="settings-row-inline">
                    <span className="settings-label">Serif Font</span>
                    <button
                        onClick={() => setSettings({ serifFont: !settings.serifFont })}
                        className={`settings-toggle ${settings.serifFont ? 'settings-toggle-on' : ''}`}
                        role="switch"
                        aria-checked={settings.serifFont}
                    >
                        <span className="settings-toggle-thumb" />
                    </button>
                </div>

                {/* Music */}
                <div className="settings-row-inline">
                    <span className="settings-label">Music</span>
                    <div className="settings-chip-group">
                        <button
                            onClick={() => handleMusicChange('none')}
                            className={`settings-chip ${settings.musicType === 'none' ? 'settings-chip-active' : ''}`}
                        >
                            Off
                        </button>
                        <button
                            onClick={() => handleMusicChange('jazz')}
                            className={`settings-chip ${settings.musicType === 'jazz' ? 'settings-chip-active' : ''}`}
                        >
                            Jazz
                        </button>
                        <button
                            onClick={() => handleMusicChange('baroque')}
                            className={`settings-chip ${settings.musicType === 'baroque' ? 'settings-chip-active' : ''}`}
                        >
                            Baroque
                        </button>
                    </div>
                </div>

                {/* Theme */}
                <div className="settings-row">
                    <span className="settings-label">Theme</span>
                    <div className="settings-theme-grid">
                        {themes.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => handleThemeChange(theme.id)}
                                className={`settings-theme-btn ${settings.theme === theme.id ? 'settings-theme-btn-active' : ''}`}
                                style={{
                                    '--theme-bg': theme.bg,
                                    '--theme-text': theme.text,
                                    '--theme-accent': theme.accent,
                                } as React.CSSProperties}
                            >
                                <span
                                    className="settings-theme-swatch"
                                    style={{ background: theme.bg, borderColor: theme.id === 'light' ? 'rgba(0,0,0,0.1)' : 'transparent' }}
                                >
                                    <span
                                        className="settings-theme-swatch-text"
                                        style={{ color: theme.text }}
                                    >
                                        Aa
                                    </span>
                                </span>
                                <span className="settings-theme-label">{theme.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hidden audio elements for background music */}
            <audio ref={jazzAudioRef} src={MUSIC_STREAMS.jazz} />
            <audio ref={baroqueAudioRef} src={MUSIC_STREAMS.baroque} />
        </div>
    );
};
