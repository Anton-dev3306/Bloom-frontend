'use client';

import { useRef, useState, useEffect } from 'react';

function formatDuration(s) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

// Array de barras(valores relativos)
const bars = [4,6,9,7,11,8,5,10,7,9,6,11,8,5,7,10,6,9,7,11,5,8,10,6,9,7,11,8,5,10,6,8,11,7,9,5,10,7,9,6];

export default function AudioBubble({ url, isOwn }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); // 0..100
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const svgRef = useRef(null);
    const clipId = useRef(`clip-${Math.random().toString(36).slice(2,9)}`).current;

    useEffect(() => {
        return () => {
            // cleanup listeners if component unmounts (none persistent here)
        };
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play();
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current || isDragging) return;
        const ct = audioRef.current.currentTime;
        const dur = audioRef.current.duration || 0;
        setCurrentTime(ct);
        setProgress(dur > 0 ? (ct / dur) * 100 : 0);
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration || 0);
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        if (audioRef.current) audioRef.current.currentTime = 0;
    };

    // --- SVG waveform config ---
    const barWidth = 2;
    const gap = 2;
    const maxBarValue = Math.max(...bars);
    // coordenadas SVG
    const totalWidth = bars.length * (barWidth + gap);
    // escala vertical
    const svgHeight = Math.round(maxBarValue * 2.4);
    const centerY = svgHeight / 2;

    const pctToSvgX = (pct) => (pct / 100) * totalWidth;

    // controlador de búsqueda (haga clic y arrastre en SVG)
    const seekFromClientX = (clientX) => {
        if (!svgRef.current || !audioRef.current || !duration) return;
        const rect = svgRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        // Convertir x (en px reales) al sistema de coordenadas SVG:
        // Dado que SVG será adaptable, calcular la relación
        const ratio = totalWidth / rect.width;
        const svgX = x * ratio;
        const pct = svgX / totalWidth;
        const newTime = pct * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        setProgress(pct * 100);
    };

    const onSvgClick = (e) => {
        seekFromClientX(e.clientX);
    };

    // Arrastre la perilla SVG
    const handleSvgPointerDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        seekFromClientX(e.clientX);

        const onMove = (ev) => {
            seekFromClientX(ev.clientX);
        };
        const onUp = (ev) => {
            seekFromClientX(ev.clientX);
            setIsDragging(false);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    // Calcular el punto X en *coordenadas SVG*
    const knobX = pctToSvgX(progress);

    return (
        <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] px-4 py-4 w-full max-w-[360px]">
            <audio
                ref={audioRef}
                src={url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                preload="metadata"
            />

            <div className="flex items-start gap-4">
                {/* Boton de reproduccion*/}
                <button
                    onClick={togglePlay}
                    className="relative w-12 h-12 rounded-full flex items-center justify-center"
                    aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                >
          <span
              className="absolute -inset-1 rounded-full"
              style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(59,130,246,0.22), rgba(59,130,246,0.06) 40%, transparent 60%)',
                  filter: 'blur(6px)'
              }}
          />
                    <span
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: 'linear-gradient(180deg,#2f7ffb,#1864d6)'
                        }}
                    />
                    <span className="relative z-10 text-white">
            {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
            ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                </svg>
            )}
          </span>
                </button>

                {/* Waveform / SVG */}
                <div className="flex-1">
                    <div className="w-full">
                        <svg
                            ref={svgRef}
                            onClick={onSvgClick}
                            onPointerDown={(e) => {
                                // Si hace clic cerca de la perilla, comience a arrastrar el puntero
                                const rect = svgRef.current.getBoundingClientRect();
                                const ratio = totalWidth / rect.width;
                                const clickX = e.clientX - rect.left;
                                const svgClickX = clickX * ratio;
                                const knobSvgX = knobX;
                                const distancePx = Math.abs(svgClickX - knobSvgX);
                                if (distancePx <= 8 * ratio) {
                                    handleSvgPointerDown(e);
                                } else {
                                    onSvgClick(e);
                                }
                            }}
                            viewBox={`0 0 ${totalWidth} ${svgHeight}`}
                            preserveAspectRatio="xMidYMid meet"
                            className="block w-full h-8"
                            style={{ overflow: 'visible' }}
                        >
                            {/*  */}
                            <g>
                                {bars.map((v, i) => {
                                    const barH = v / maxBarValue * (svgHeight * 0.9); // scale
                                    const x = i * (barWidth + gap);
                                    const y = (svgHeight - barH) / 2;
                                    return (
                                        <rect
                                            key={`bg-${i}`}
                                            x={x}
                                            y={y}
                                            width={barWidth}
                                            height={barH}
                                            rx={barWidth / 2}
                                            fill="#d1d5db"
                                        />
                                    );
                                })}
                            </g>

                            <clipPath id={clipId}>
                                <rect x="0" y="0" width={pctToSvgX(progress)} height={svgHeight} />
                            </clipPath>

                            <g clipPath={`url(#${clipId})`}>
                                {bars.map((v, i) => {
                                    const barH = v / maxBarValue * (svgHeight * 0.9);
                                    const x = i * (barWidth + gap);
                                    const y = (svgHeight - barH) / 2;
                                    return (
                                        <rect
                                            key={`fg-${i}`}
                                            x={x}
                                            y={y}
                                            width={barWidth}
                                            height={barH}
                                            rx={barWidth / 2}
                                            fill="#2563eb"
                                        />
                                    );
                                })}
                            </g>

                            <circle
                                cx={knobX}
                                cy={centerY}
                                r={4}
                                fill="#2563eb"
                                stroke="#fff"
                                strokeWidth={1}
                                style={{ cursor: 'grab' }}
                                onPointerDown={handleSvgPointerDown}
                            />
                        </svg>
                    </div>

                    {/* Control deslizante de retroceso para un arrastre y un control de tiempo precisos */}
                    <div className="flex items-center justify-between mt-2 px-1">
    <span className="text-xs text-gray-600 tabular-nums">
        {formatDuration(currentTime)}
    </span>

                        <span className="text-xs text-gray-400 tabular-nums">
        {formatDuration(duration)}
    </span>
                    </div>
                 </div>
                </div>
            </div>

    );
}