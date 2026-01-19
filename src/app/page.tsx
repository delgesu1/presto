"use client";

import { useReaderStore } from '@/store/useReaderStore';
import { ORPDisplay } from '@/components/reader/ORPDisplay';
import { PlayerControls } from '@/components/controls/PlayerControls';
import { ProgressBar } from '@/components/controls/ProgressBar';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { Importer } from '@/components/importer/Importer';
import { ReaderEngine } from '@/components/ReaderEngine';

export default function Home() {
    const { tokens } = useReaderStore();
    const hasContent = tokens.length > 0;

    return (
        <main className="min-h-screen bg-[var(--bg-primary)]">
            {/* Background gradient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,var(--accent-soft),transparent_60%)] opacity-30" />
            </div>

            <div className="relative z-10 px-6 py-12 sm:py-20">
                {/* Header */}
                <header className="max-w-[640px] mx-auto mb-10 text-center">
                    <h1 className="text-[1.75rem] font-semibold text-[var(--text-primary)] tracking-[-0.02em]">
                        RSVP Reader
                    </h1>
                    <p className="mt-2 text-[0.9375rem] text-[var(--text-secondary)]">
                        Speed reading with focus
                    </p>
                </header>

                {/* Reader Display */}
                <section className="max-w-[640px] mx-auto" style={{ marginBottom: '3.5rem' }}>
                    <div className="reader-card">
                        <ORPDisplay />
                        <ProgressBar />
                    </div>

                    {/* Player Controls - always visible, disabled when no content */}
                    <div className="mt-5">
                        <PlayerControls disabled={!hasContent} />
                    </div>
                </section>

                {/* Text Input */}
                <section className="max-w-[640px] mx-auto" style={{ marginBottom: '4rem' }}>
                    <Importer />
                </section>

                {/* Settings */}
                <section className="max-w-[520px] mx-auto" style={{ paddingBottom: '3rem' }}>
                    <SettingsPanel />
                </section>
            </div>

            <ReaderEngine />
        </main>
    );
}
