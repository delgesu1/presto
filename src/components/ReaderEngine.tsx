"use client";

import { useEffect, useRef } from 'react';
import { useReaderStore } from '@/store/useReaderStore';

export const ReaderEngine: React.FC = () => {
    const { isPlaying, timings, currentIndex, next, settings } = useReaderStore();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isPlaying && timings[currentIndex]) {
            // Sum up the timings for all words in the chunk
            const chunkSize = settings.chunkSize;
            const endIndex = Math.min(currentIndex + chunkSize, timings.length);
            let duration = 0;
            for (let i = currentIndex; i < endIndex; i++) {
                duration += timings[i] || 0;
            }

            timerRef.current = setTimeout(() => {
                next();
            }, duration);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isPlaying, currentIndex, timings, next, settings.chunkSize]);

    return null; // This component handles logic only
};
