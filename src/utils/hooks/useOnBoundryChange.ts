import { useEffect, useRef, useState } from 'react';

export type Event = MouseEvent | TouchEvent;

interface ElementBoundry {
    width: number;
    height: number;
}

const useOnBoundryChange = (
    elementId: string,
    checkFrequency: number,
    handler: (newBoundries: ElementBoundry) => void,
) => {
    const [boundryChecker, setBoundryChecker] = useState<NodeJS.Timer>();
    const checkerRef = useRef<NodeJS.Timer>();
    checkerRef.current = boundryChecker;

    const [elementWidth, setElementWidth] = useState<number>();
    const widthRef = useRef<number>();
    widthRef.current = elementWidth;
    const [elementHeight, setElementHeight] = useState<number>();
    const heightRef = useRef<number>();
    heightRef.current = elementHeight;

    const bindListener = () => {
        // assign el, and t0 dimension props
        if (checkerRef.current) return;

        const el = document.getElementById(elementId);
        if (el) {
            setElementWidth(el.getBoundingClientRect().width);
            setElementHeight(el.getBoundingClientRect().height);

            // start interval
            const interval = setInterval(() => {
                if (checkerRef.current) {
                    clearInterval(checkerRef.current);
                }
                console.log('checking boundry for ', elementId);
                const newWidth = el.getBoundingClientRect().width;
                const newHeight = el.getBoundingClientRect().height;
                if (
                    newWidth !== widthRef.current ||
                    newHeight !== heightRef.current
                ) {
                    handler({ width: newWidth, height: newHeight });
                }
                setElementWidth(newWidth);
                setElementHeight(newHeight);
            }, checkFrequency);

            setBoundryChecker(interval);
        }
    };

    useEffect(() => {
        return () => {
            if (checkerRef.current) {
                clearInterval(checkerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        bindListener();
    }, [elementId, checkFrequency, handler]);
};
export default useOnBoundryChange;
