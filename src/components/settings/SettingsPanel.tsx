"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { useReaderStore } from '@/store/useReaderStore';

const JAZZ_STREAM_URL = 'https://jazzfm91.streamb.live/SB00023';

export const SettingsPanel: React.FC = () => {
    const { settings, setSettings } = useReaderStore();

    const wpmRef = useRef<HTMLInputElement>(null);
    const fontSizeRef = useRef<HTMLInputElement>(null);
    const pauseRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const WPM_MIN = 100;
    const WPM_MAX = 1500;
    const WPM_STEP = 50;
    const trainingStartWpm = settings.trainingStartWpm ?? settings.wpm;
    const trainingEndWpm = settings.trainingEndWpm ?? settings.wpm;
    const rangeStartWpm = Math.min(trainingStartWpm, trainingEndWpm);
    const rangeEndWpm = Math.max(trainingStartWpm, trainingEndWpm);
    const rangeStartPercent = ((rangeStartWpm - WPM_MIN) / (WPM_MAX - WPM_MIN)) * 100;
    const rangeEndPercent = ((rangeEndWpm - WPM_MIN) / (WPM_MAX - WPM_MIN)) * 100;

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

    // Handle music playback based on settings
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (settings.musicEnabled) {
            audio.play().catch(() => {
                // Autoplay was prevented, user needs to interact first
                setSettings({ musicEnabled: false });
            });
        } else {
            audio.pause();
        }
    }, [settings.musicEnabled, setSettings]);

    const handleMusicToggle = useCallback(() => {
        setSettings({ musicEnabled: !settings.musicEnabled });
    }, [settings.musicEnabled, setSettings]);

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
                            style={{
                                '--range-start': `${rangeStartPercent}%`,
                                '--range-end': `${rangeEndPercent}%`,
                            } as React.CSSProperties}
                        >
                            <div className="settings-range-track" />
                            <input
                                type="range"
                                min={WPM_MIN}
                                max={WPM_MAX}
                                step={WPM_STEP}
                                value={trainingStartWpm}
                                onChange={(e) =>
                                    handleSliderChange(e, (v) =>
                                        setSettings({ trainingStartWpm: Math.min(v, trainingEndWpm) })
                                    )
                                }
                                className="settings-slider settings-range-input settings-range-input-start"
                                aria-label="Training start speed"
                            />
                            <input
                                type="range"
                                min={WPM_MIN}
                                max={WPM_MAX}
                                step={WPM_STEP}
                                value={trainingEndWpm}
                                onChange={(e) =>
                                    handleSliderChange(e, (v) =>
                                        setSettings({ trainingEndWpm: Math.max(v, trainingStartWpm) })
                                    )
                                }
                                className="settings-slider settings-range-input settings-range-input-end"
                                aria-label="Training end speed"
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
                        max="5"
                        step="0.5"
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

                {/* Background Music */}
                <div className="settings-row-inline">
                    <span className="settings-label">Background Music</span>
                    <button
                        onClick={handleMusicToggle}
                        className={`settings-toggle ${settings.musicEnabled ? 'settings-toggle-on' : ''}`}
                        role="switch"
                        aria-checked={settings.musicEnabled}
                    >
                        <span className="settings-toggle-thumb" />
                    </button>
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

            {/* Hidden audio element for background music */}
            <audio ref={audioRef} src={JAZZ_STREAM_URL} />
        </div>
    );
};
