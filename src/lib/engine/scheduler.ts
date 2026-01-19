import { Token, ReadingSettings } from './types';

export class Scheduler {
    /**
     * Calculates the duration (in ms) for each token based on settings.
     */
    static schedule(tokens: Token[], settings: ReadingSettings): number[] {
        const baseDuration = 60000 / settings.wpm;

        return tokens.map((token) => {
            let duration = baseDuration;

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
