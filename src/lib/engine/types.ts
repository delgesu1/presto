export type TokenType = 'word' | 'punctuation' | 'number' | 'whitespace';

export interface Token {
    id: string; // Unique ID for React keys
    text: string; // The full token text
    cleanText: string; // Text stripped of punctuation for ORP calculation
    type: TokenType;
    orpIndex: number; // The index of the pivot character in cleanText
    offset: number; // Character offset in the original text (optional, for syncing)
    matches?: string[]; // If we decide to keep the breakdown (prefix, pivot, suffix)
}

export type MusicType = 'none' | 'jazz' | 'baroque';

export interface ReadingSettings {
    wpm: number;
    trainingModeEnabled: boolean;
    trainingStartWpm: number;
    trainingEndWpm: number;
    fontSize: number; // in rem or px
    chunkSize: number; // number of words per flash
    orpEnabled: boolean;
    punctuationSlowdown: number; // extra ms per punctuation
    serifFont: boolean;
    musicType: MusicType;
    theme: string;
}
