"use client";

import React, { useState, useEffect } from 'react';
import { useReaderStore } from '@/store/useReaderStore';
import { demoTexts } from '@/lib/demoTexts';

export const Importer: React.FC = () => {
    const { setRawText, rawText, reset, tokens, currentIndex, isPlaying } = useReaderStore();
    const [input, setInput] = useState(rawText || '');

    const hasContent = tokens.length > 0;
    const hasStarted = currentIndex > 0 || isPlaying;
    const buttonLabel = hasStarted ? 'Update' : 'Start Reading';

    useEffect(() => {
        if (rawText) {
            setInput(rawText);
        }
    }, [rawText]);

    const handleStart = () => {
        if (!input.trim()) return;
        setRawText(input);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInput(text);
        } catch (err) {
            console.error('Failed to read clipboard', err);
        }
    };

    const handleClear = () => {
        reset();
        setInput('');
    };

    const loadDemo = () => {
        const randomIndex = Math.floor(Math.random() * demoTexts.length);
        setInput(demoTexts[randomIndex]);
    };

    const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

    return (
        <div className="importer-container">
            <div className="importer-header">
                <span className="importer-title">Text</span>
                <div className="importer-actions">
                    <button onClick={loadDemo} className="importer-btn-ghost">
                        Try demo
                    </button>
                    <button onClick={handlePaste} className="importer-btn-secondary">
                        Paste from clipboard
                    </button>
                </div>
            </div>

            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste or type your text here..."
                className="importer-textarea"
                style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
            />

            <div className="importer-footer">
                <span className="importer-wordcount">
                    {wordCount > 0 ? `${wordCount} words` : 'No content'}
                </span>
                <div className="importer-actions">
                    {hasContent && (
                        <button onClick={handleClear} className="importer-btn-danger">
                            Clear
                        </button>
                    )}
                    <button
                        onClick={handleStart}
                        disabled={!input.trim()}
                        className="importer-btn-primary"
                    >
                        {hasContent ? 'Update' : 'Start Reading'}
                    </button>
                </div>
            </div>
        </div>
    );
};
