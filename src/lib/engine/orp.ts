/**
 * Calculates the Optimal Recognition Point (ORP) index for a given word length.
 * Logic:
 * length 1–2 → pivot at index 0
 * length 3–5 → pivot at index 1
 * length 6–9 → pivot at index 2
 * length 10–13 → pivot at index 3
 * 14+ → pivot at index 4
 */
export function calculateORPIndex(word: string): number {
    const len = word.length;
    if (len === 0) return 0;
    if (len <= 2) return 0;
    if (len <= 5) return 1;
    if (len <= 9) return 2;
    if (len <= 13) return 3;
    return 4;
}
