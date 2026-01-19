"use client";

import { useReaderStore } from '@/store/useReaderStore';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface PlayerControlsProps {
    disabled?: boolean;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({ disabled = false }) => {
    const { isPlaying, play, pause, seek, currentIndex, settings } = useReaderStore();
    const chunkSize = settings.chunkSize;

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
            </div>
        </div>
    );
};
