'use client';

import { useId } from 'react';

interface DotPatternProps {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    cx?: number;
    cy?: number;
    cr?: number;
    className?: string;
    dotColor?: string;
    fadeEdges?: boolean;
}

export default function DotPattern({
    width = 24,
    height = 24,
    x = 0,
    y = 0,
    cx = 1,
    cy = 1,
    cr = 1,
    className = '',
    dotColor = 'currentColor',
    fadeEdges = true,
}: DotPatternProps) {
    const id = useId();
    const patternId = `dot-pattern-${id}`;
    const maskId = `dot-mask-${id}`;

    return (
        <svg
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
        >
            <defs>
                <pattern
                    id={patternId}
                    width={width}
                    height={height}
                    patternUnits="userSpaceOnUse"
                    patternContentUnits="userSpaceOnUse"
                    x={x}
                    y={y}
                >
                    <circle
                        cx={cx}
                        cy={cy}
                        r={cr}
                        fill={dotColor}
                        fillOpacity={0.15}
                    />
                </pattern>
                {fadeEdges && (
                    <radialGradient id={maskId} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="white" />
                        <stop offset="70%" stopColor="white" />
                        <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                )}
            </defs>
            {fadeEdges ? (
                <rect
                    width="100%"
                    height="100%"
                    fill={`url(#${patternId})`}
                    style={{
                        mask: `url(#${maskId})`,
                        WebkitMask: `radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)`,
                    }}
                />
            ) : (
                <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            )}
        </svg>
    );
}
