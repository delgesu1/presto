"use client";

import React, { useState, useEffect } from 'react';
import { useReaderStore } from '@/store/useReaderStore';

export const Importer: React.FC = () => {
    const { setRawText, rawText, reset, tokens } = useReaderStore();
    const [input, setInput] = useState(rawText || '');

    const hasContent = tokens.length > 0;

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
        const demoText = "Welcome to the RSVP Reader. This is a demonstration of Rapid Serial Visual Presentation. By displaying words one at a time at a fixed focal point, RSVP eliminates the need for eye movements, which accounts for the majority of reading time. This allows you to read significantly faster while maintaining comprehension. Try adjusting the speed in the settings below to find your perfect pace. You can paste any article, book excerpt, or notes into this reader and speed through them with focus and clarity.";
        setInput(demoText);
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
