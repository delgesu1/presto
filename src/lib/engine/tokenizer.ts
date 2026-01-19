import { Token, TokenType } from './types';
import { calculateORPIndex } from './orp';

export class Tokenizer {
    /**
     * Splits raw text into tokens suitable for RSVP reading.
     * Handles hyphenated words as single tokens.
     * Attaches trailing punctuation to words (so "hello." is one token, not two).
     */
    static tokenize(text: string): Token[] {
        // Normalize quotes
        const normalized = text.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');

        // Split by whitespace first, then handle each chunk
        const chunks = normalized.split(/\s+/).filter(chunk => chunk.length > 0);

        const tokens: Token[] = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];

            // Extract the "clean" word (letters/numbers only) for ORP calculation
            const cleanText = chunk.replace(/[^a-zA-Z0-9\u00C0-\u00FF'-]/g, '');

            // Determine token type
            let type: TokenType = 'word';
            if (/^\d+$/.test(cleanText)) {
                type = 'number';
            } else if (cleanText.length === 0) {
                // Pure punctuation - skip it as standalone token
                // (This handles cases like "..." or "—" alone)
                continue;
            }

            // Calculate ORP based on clean text
            const orpIndex = calculateORPIndex(cleanText);

            // Find where the clean text starts in the full chunk (to adjust ORP)
            const leadingPunct = chunk.match(/^[^a-zA-Z0-9\u00C0-\u00FF]*/)?.[0] || '';
            const adjustedOrpIndex = leadingPunct.length + orpIndex;

            tokens.push({
                id: `tok_${i}_${Math.random().toString(36).substr(2, 5)}`,
                text: chunk,
                cleanText,
                type,
                orpIndex: Math.min(adjustedOrpIndex, chunk.length - 1),
                offset: i,
            });
        }

        return tokens;
    }
}
