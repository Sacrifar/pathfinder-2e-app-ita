import React, { useRef, useEffect, useState } from 'react';

interface VirtualListProps<T> {
    items: T[];
    itemHeight: number;
    height: number;
    renderItem: (item: T, index: number) => React.ReactNode;
    overscan?: number;
}

/**
 * Componente VirtualList per renderizzare solo gli elementi visibili
 * Utile per liste lunghe come skills o feats
 */
export function VirtualList<T>({
    items,
    itemHeight,
    height,
    renderItem,
    overscan = 3,
}: VirtualListProps<T>) {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
        items.length - 1,
        Math.floor((scrollTop + height) / itemHeight) + overscan
    );
    const visibleItems = items.slice(startIndex, endIndex + 1);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    };

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{
                height: `${height}px`,
                overflow: 'auto',
            }}
        >
            <div
                style={{
                    height: `${totalHeight}px`,
                    position: 'relative',
                }}
            >
                {visibleItems.map((item, index) => (
                    <div
                        key={startIndex + index}
                        style={{
                            position: 'absolute',
                            top: `${(startIndex + index) * itemHeight}px`,
                            left: 0,
                            right: 0,
                            height: `${itemHeight}px`,
                        }}
                    >
                        {renderItem(item, startIndex + index)}
                    </div>
                ))}
            </div>
        </div>
    );
}
