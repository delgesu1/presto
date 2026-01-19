"use client";

import React from 'react';
import { useReaderStore } from '@/store/useReaderStore';

export const ProgressBar: React.FC = () => {
    const { tokens, currentIndex, seek, timings, settings } = useReaderStore();
    const chunkSize = settings.chunkSize;
    const hasContent = tokens.length > 0;

    const timeRemaining = React.useMemo(() => {
        if (!timings || timings.length === 0) return '0:00';
        const remainingMs = timings.slice(currentIndex).reduce((a, b) => a + b, 0);
        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, [currentIndex, timings]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!hasContent) return;
        // Snap to chunk boundaries when chunkSize > 1
        const value = parseInt(e.target.value);
        const snappedValue = chunkSize > 1 ? Math.floor(value / chunkSize) * chunkSize : value;
        seek(snappedValue);
    };

    const progress = tokens.length > 1 ? (currentIndex / (tokens.length - 1)) * 100 : 0;

    return (
        <div className={`progress-container ${!hasContent ? 'progress-container-disabled' : ''}`}>
            {/* Labels */}
            <div className="progress-labels">
                <span className="progress-label">
                    {hasContent ? `${currentIndex + 1} / ${tokens.length}` : '— / —'}
                </span>
                <span className="progress-label">
                    {hasContent ? timeRemaining : '—:——'}
                </span>
            </div>
            {/* Click-to-seek progress bar */}
            <div className="progress-bar-wrapper">
                <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <input
                    type="range"
                    min="0"
                    max={tokens.length - 1 || 0}
                    value={currentIndex}
                    onChange={handleSeek}
                    className="progress-input"
                    disabled={!hasContent}
                />
            </div>
        </div>
    );
};
