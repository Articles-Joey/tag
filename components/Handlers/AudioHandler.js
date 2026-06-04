"use client";

import { useAudioStore } from "@/hooks/useAudioStore";
import { useStore } from "@/hooks/useStore";
import { useEffect, useRef } from "react";

export default function AudioHandler() {

    const game_music = "/audio/game-music.mp3"

    const audioSettings = useAudioStore((state) => state?.audioSettings);
    const setAudioSettings = useAudioStore((state) => state?.setAudioSettings);

    const musicRef = useRef(null);
    const interactedRef = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const music = new Audio(game_music);
        musicRef.current = music;

        music.onended = function () {
            music.currentTime = 0;
            music.play();
        };

        const tryPlay = () => {
            if (!interactedRef.current && audioSettings?.enabled) {
                interactedRef.current = true;
                music.play();
            }
        };

        const events = ['click', 'keydown', 'touchstart', 'pointerdown'];
        events.forEach((e) => document.addEventListener(e, tryPlay, { once: true }));

        return () => {
            events.forEach((e) => document.removeEventListener(e, tryPlay));
            music.pause();
            musicRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!musicRef.current) return;

        const music = musicRef.current;
        const volume = audioSettings?.enabled ? (audioSettings?.music_volume / 100) : 0;
        music.volume = volume;

        if (audioSettings?.enabled) {
            if (interactedRef.current) {
                music.play().catch(() => {
                    // Handle autoplay restriction if necessary
                });
            }
        } else {
            music.pause();
        }
    }, [audioSettings]);

    return null;

}