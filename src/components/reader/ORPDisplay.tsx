"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useReaderStore } from '@/store/useReaderStore';
import { Token } from '@/lib/engine/types';

// Split a token into left/pivot/right parts based on ORP
function splitToken(token: Token) {
    const text = token.text;
    const idx = token.orpIndex;
    return {
        left: text.slice(0, idx),
        pivot: text[idx] || '',
        right: text.slice(idx + 1)
    };
}

export const ORPDisplay: React.FC = () => {
    const { tokens, currentIndex, settings } = useReaderStore();
    const hasContent = tokens.length > 0;
    const chunkSize = settings.chunkSize;
    const orpEnabled = settings.orpEnabled;
    const serifFont = settings.serifFont;

    const [isNeoTheme, setIsNeoTheme] = useState(false);

    useEffect(() => {
        const checkTheme = () => {
            setIsNeoTheme(document.documentElement.getAttribute('data-theme') === 'neo');
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    // Font family based on setting - serif overrides theme, otherwise use theme default
    const fontFamily = serifFont
        ? '"Times New Roman", Times, serif'
        : isNeoTheme
            ? 'var(--font-space-grotesk), "Space Grotesk", sans-serif'
            : 'var(--font-inter), Inter, sans-serif';

    // Letter spacing - 2% for serif, explicitly 0 for sans-serif to prevent inheritance
    const letterSpacing = serifFont ? '0.02em' : '0';

    // Get the chunk of tokens to display
    const chunk = useMemo(() => {
        if (tokens.length === 0) return [];
        const end = Math.min(currentIndex + chunkSize, tokens.length);
        return tokens.slice(currentIndex, end);
    }, [tokens, currentIndex, chunkSize]);

    // Get ORP split for single word mode
    const { left, pivot, right } = useMemo(() => {
        if (chunk.length === 0) return { left: '', pivot: '', right: '' };
        return splitToken(chunk[0]);
    }, [chunk]);

    // Reading state
    const showGuides = hasContent && chunkSize === 1 && orpEnabled;

    return (
        <div className="h-[180px] flex items-center justify-center px-8 relative">
            {/* Focus guide lines */}
            {showGuides && (
                <>
                    <div
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: 0,
                            width: '2px',
                            height: '18%',
                            background: 'var(--text-secondary)',
                            opacity: 0.15,
                            transform: 'translateX(-50%)',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            left: '50%',
                            bottom: 0,
                            width: '2px',
                            height: '18%',
                            background: 'var(--text-secondary)',
                            opacity: 0.15,
                            transform: 'translateX(-50%)',
                        }}
                    />
                </>
            )}
            {!hasContent ? (
                /* Empty state */
                <p className="text-xl text-[var(--text-secondary)]">
                    Ready to read
                </p>
            ) : (
                <div style={{ fontSize: `${settings.fontSize}rem`, lineHeight: 1, fontFamily, letterSpacing }}>
                    {chunkSize === 1 && orpEnabled ? (
                        /* Single word mode with Focus Letter - pivot pinned to center */
                        <div className="select-none" style={{ display: 'flex', alignItems: 'baseline', letterSpacing }}>
                            <span
                                className="text-[var(--text-primary)]"
                                style={{
                                    width: '12ch',
                                    textAlign: 'right',
                                    opacity: 0.8,
                                    flexShrink: 0,
                                    letterSpacing
                                }}
                            >
                                {left}
                            </span>
                            <span style={{ color: '#ef4444', flexShrink: 0, letterSpacing }}>
                                {pivot}
                            </span>
                            <span
                                className="text-[var(--text-primary)]"
                                style={{
                                    width: '12ch',
                                    textAlign: 'left',
                                    opacity: 0.8,
                                    flexShrink: 0,
                                    letterSpacing
                                }}
                            >
                                {right}
                            </span>
                        </div>
                    ) : (
                        /* Multi-word mode OR single word without Focus Letter: simple centered text */
                        <div className="select-none text-center text-[var(--text-primary)]" style={{ letterSpacing }}>
                            {chunk.map((token, i) => (
                                <span key={token.id}>
                                    {i > 0 && ' '}{token.text}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
