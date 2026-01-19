import { Token, ReadingSettings } from './types';

export class Scheduler {
    /**
     * Calculates the duration (in ms) for each token based on settings.
     */
    static schedule(tokens: Token[], settings: ReadingSettings): number[] {
        const trainingEnabled = settings.trainingModeEnabled && tokens.length > 1;
        const rawStartWpm = settings.trainingStartWpm ?? settings.wpm;
        const rawEndWpm = settings.trainingEndWpm ?? settings.wpm;
        const startWpm = Math.min(rawStartWpm, rawEndWpm);
        const endWpm = Math.max(rawStartWpm, rawEndWpm);
        const rampEndIndex = Math.max(1, Math.floor((tokens.length - 1) * 0.8));

        const getWpmForIndex = (index: number) => {
            if (!trainingEnabled) return settings.wpm;
            if (index <= rampEndIndex) {
                const progress = index / rampEndIndex;
                return startWpm + (endWpm - startWpm) * progress;
            }
            return endWpm;
        };

        return tokens.map((token, index) => {
            const wpm = Math.max(getWpmForIndex(index), 1);
            let duration = 60000 / wpm;

            // 1. Punctuation slowdown
            if (token.type === 'punctuation' || /[.,!?;:]/.test(token.text)) {
                duration += settings.punctuationSlowdown;
            }

            // 2. Length adjustment (long words take longer)
            // Standard RSVP usually keeps constant time, but a slight curve helps comprehension
            // Let's add 10ms per character over length 7
            if (token.text.length > 7) {
                duration += (token.text.length - 7) * 10;
            }

            // 3. Number handling (digits often take longer to parse)
            if (token.type === 'number') {
                duration += 20 + (token.text.length * 10);
            }

            // 4. Minimum duration catch
            return Math.max(duration, 30); // Hard floor
        });
    }

    /**
     * Calculates the cumulative start times for a timeline.
     */
    static generateTimeline(durations: number[]): number[] {
        let current = 0;
        const timeline = [0];
        for (let i = 0; i < durations.length - 1; i++) {
            current += durations[i];
            timeline.push(current);
        }
        return timeline;
    }
}
