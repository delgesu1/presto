"use client";

import { useReaderStore } from '@/store/useReaderStore';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface PlayerControlsProps {
    disabled?: boolean;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({ disabled = false }) => {
    const { isPlaying, play, pause, seek, currentIndex, tokens, settings } = useReaderStore();
    const chunkSize = settings.chunkSize;

    // Calculate current WPM based on training mode progress
    const getCurrentWpm = () => {
        if (!settings.trainingModeEnabled || tokens.length <= 1) {
            return settings.wpm;
        }
        const rawStartWpm = settings.trainingStartWpm ?? settings.wpm;
        const rawEndWpm = settings.trainingEndWpm ?? settings.wpm;
        const startWpm = Math.min(rawStartWpm, rawEndWpm);
        const endWpm = Math.max(rawStartWpm, rawEndWpm);
        const rampEndIndex = Math.max(1, Math.floor((tokens.length - 1) * 0.8));

        if (currentIndex <= rampEndIndex) {
            const progress = currentIndex / rampEndIndex;
            return Math.round(startWpm + (endWpm - startWpm) * progress);
        }
        return endWpm;
    };

    const currentWpm = getCurrentWpm();

    const togglePlay = () => isPlaying ? pause() : play();

    // Skip forward/back by chunk size
    const skipBack = () => seek(Math.max(0, currentIndex - chunkSize));
    const skipForward = () => seek(currentIndex + chunkSize);

    return (
        <div className={`player-controls ${disabled ? 'player-controls-disabled' : ''}`}>
            {/* Left side */}
            <div className="player-controls-side player-controls-side-left">
                <button
                    onClick={() => seek(0)}
                    className="btn-player"
                    aria-label="Restart"
                    disabled={disabled}
                >
                    <RotateCcw size={16} strokeWidth={1.5} />
                </button>
                <button
                    onClick={skipBack}
                    className="btn-player"
                    aria-label="Previous"
                    disabled={disabled}
                >
                    <SkipBack size={16} strokeWidth={1.5} />
                </button>
            </div>

            {/* Center - Play button */}
            <button
                onClick={togglePlay}
                className="btn-player btn-player-main"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                disabled={disabled}
            >
                {isPlaying ? (
                    <Pause size={18} fill="currentColor" strokeWidth={0} />
                ) : (
                    <Play size={18} fill="currentColor" strokeWidth={0} style={{ marginLeft: 2 }} />
                )}
            </button>

            {/* Right side */}
            <div className="player-controls-side player-controls-side-right">
                <button
                    onClick={skipForward}
                    className="btn-player"
                    aria-label="Next"
                    disabled={disabled}
                >
                    <SkipForward size={16} strokeWidth={1.5} />
                </button>
                <span className="player-wpm-indicator">
                    {currentWpm}<span className="player-wpm-unit">wpm</span>
                </span>
            </div>
        </div>
    );
};
