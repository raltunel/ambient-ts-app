import { useEffect, useRef, useState } from 'react';
import styles from './ScreenCapture.module.css';
// import { domToImage } from 'modern-screenshot';
import { printDomToImage } from '../../../ambient-utils/dataLayer';
import { ScreenCaptureOverlayTypes, ScreenCaptureStates } from '../ChatEnums';
import { DomPositionInterface, DomRectIF } from '../ChatIFs';
import { domDebug } from '../DomDebugger/DomDebuggerUtils';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
/* eslint-disable @typescript-eslint/no-explicit-any */

interface propsIF {
    name?: string;
}

export default function ScreenCapture(props: propsIF) {
    useEffect(() => {
        console.log(props);
        document.addEventListener('mousemove', maskMoveListener);
    }, []);

    const [, copy] = useCopyToClipboard();

    const [imageComp, setImageComp] = useState<any>(null);
    const [captureState, setCaptureState] = useState<ScreenCaptureStates>(
        ScreenCaptureStates.Idle,
    );
    const captureStateRef = useRef<ScreenCaptureStates>();
    captureStateRef.current = captureState;
    const [maskLT, setMaskLT] = useState<DomPositionInterface>();
    const maskLTRef = useRef<DomPositionInterface>();
    maskLTRef.current = maskLT;
    const [maskRB, setMaskRB] = useState<DomPositionInterface>();
    const maskRBRef = useRef<DomPositionInterface>();
    maskRBRef.current = maskRB;

    const [overlayRect, setOverlayRect] = useState<DomRectIF>({ lt: { x: 0, y: 0 }, rt: { x: 0, y: 0 }, rb: { x: 0, y: 0 }, lb: { x: 0, y: 0 } });

    const croppedImageRef = useRef<HTMLDivElement>(null);

    const [debugMode, setDebugMode] = useState<boolean>(false);
    const btnListener = async () => {
        // const image = await domToImage(document.body);
        const image = await printDomToImage(document.body);
        setImageComp(image);

        console.log(image);
    };
    const maskBtnListener = async () => {
        setTimeout(() => {
            setCaptureState(ScreenCaptureStates.MaskReady);
        }, 200);
    };
    const resetBtnListener = async () => {
        setCaptureState(ScreenCaptureStates.Idle);
        setImageComp(undefined);
    };
    const debugBtnListener = async () => {
        setDebugMode(!debugMode);
    };

    const captureDom = async () => {
        const image = await printDomToImage(document.body);
        setImageComp(image);
    };

    const maskStarter = (e: React.MouseEvent) => {
        setMaskLT({ x: e.clientX, y: e.clientY });
        captureDom();
        setTimeout(() => {
            setCaptureState(ScreenCaptureStates.Masking);
        }, 300);
        domDebug('maskLT', { x: e.clientX, y: e.clientY });
    };

    const maskMoveListener = (e: MouseEvent) => {
        if (captureStateRef.current != ScreenCaptureStates.Masking) return;

        setMaskRB({ x: e.clientX, y: e.clientY });
        if(maskLTRef.current){
            setOverlayRect(getOverlayPoints(maskLTRef.current, { x: e.clientX, y: e.clientY }));
        }

        domDebug('maskRB', maskRB);
    };

    console.log(overlayRect)
    const copyCroppedImageToClipboard = async () => {
        if (croppedImageRef.current) {
            const image = await printDomToImage(croppedImageRef.current);
            if (image) {
                copy(image);
            }
        }
    };

    const overlayClickListener = () => {
        if (captureStateRef.current == ScreenCaptureStates.Masking) {
            console.log('image copying');
            copyCroppedImageToClipboard();
        }
    };

    const getPosForOverlayRect = (type: ScreenCaptureOverlayTypes) => {
        if (maskLTRef.current == undefined || maskRBRef.current == undefined)
            return;
        switch (type) {
            case ScreenCaptureOverlayTypes.LeftTop:
                return {
                    left: 0,
                    top: 0,
                    // right: window.innerWidth - maskRBRef.current.x,
                    // bottom: window.innerHeight - maskLTRef.current.y,
                    right: window.innerWidth - maskRBRef.current.x,
                    bottom: window.innerHeight - maskLTRef.current.y,
                };
            case ScreenCaptureOverlayTypes.RightTop:
                return {
                    left: maskRBRef.current.x,
                    top: 0,
                    right: 0,
                    bottom: 0,
                };
            case ScreenCaptureOverlayTypes.RightBottom:
                return {
                    left: 0,
                    top: maskRBRef.current.y,
                    right: window.innerWidth - maskRBRef.current.x,
                    bottom: 0,
                };
            case ScreenCaptureOverlayTypes.LeftBottom:
                return {
                    left: 0,
                    top: maskLTRef.current.y,
                    right: window.innerWidth - maskLTRef.current.x,
                    bottom: window.innerHeight - maskRBRef.current.y,
                };
            case ScreenCaptureOverlayTypes.MaskArea:
                return {
                    // left: maskLTRef.current.x,
                    // top: maskLTRef.current.y,
                    // right: window.innerWidth - maskRBRef.current.x - 10,
                    // bottom: window.innerHeight - maskRBRef.current.y - 10,
                    left: overlayRect.lt.x,
                    top: overlayRect.lt.y,
                    right: window.innerWidth - overlayRect.rt.x,
                    bottom: window.innerHeight - overlayRect.rb.y,
                };
        }
    };

    const getImageOffset = () => {
            return {
                left: -1 * overlayRect.lt.x,
                top: -1 * overlayRect.lt.y,
            };
    };

    const getPreviewSize = () => {
            return {
                width: overlayRect.rt.x - overlayRect.lt.x,
                height: overlayRect.lb.y - overlayRect.lt.y,
            };
    };

    const getOverlayPoints = (first: DomPositionInterface, second: DomPositionInterface) => {
        const lt = { x: Math.min(first.x, second.x), y: Math.min(first.y, second.y) };
        const rt = { x: Math.max(first.x, second.x), y: Math.min(first.y, second.y) };
        const lb = { x: Math.min(first.x, second.x), y: Math.max(first.y, second.y) };
        const rb = { x: Math.max(first.x, second.x), y: Math.max(first.y, second.y) };
        return { lt, rt, rb, lb};
    }

    return (
        <>
            <div className={styles.capture_btn} onClick={btnListener}>
                {' '}
                Capture
            </div>
            <div className={styles.mask_btn} onClick={maskBtnListener}>
                {' '}
                Mask
            </div>
            <div className={styles.reset_btn} onClick={resetBtnListener}>
                {' '}
                Reset
            </div>
            <div className={styles.debug_btn} onClick={debugBtnListener}>
                {' '}
                Debug Overlays
            </div>

            {captureState == ScreenCaptureStates.MaskReady && (
                <div
                    className={`${styles.overlay_effect} ${styles.full}`}
                    onClick={maskStarter}
                ></div>
            )}
            {captureState == ScreenCaptureStates.Masking && (
                <>
                    <div
                        style={getPosForOverlayRect(
                            ScreenCaptureOverlayTypes.LeftTop,
                        )}
                        className={`${styles.overlay_effect} ${debugMode ? styles.dbg1 : ' '}`}
                    ></div>
                    <div
                        style={getPosForOverlayRect(
                            ScreenCaptureOverlayTypes.RightTop,
                        )}
                        className={`${styles.overlay_effect} ${debugMode ? styles.dbg2 : ' '}`}
                    ></div>
                    <div
                        style={getPosForOverlayRect(
                            ScreenCaptureOverlayTypes.RightBottom,
                        )}
                        className={`${styles.overlay_effect} ${debugMode ? styles.dbg3 : ' '}`}
                    ></div>
                    <div
                        style={getPosForOverlayRect(
                            ScreenCaptureOverlayTypes.LeftBottom,
                        )}
                        className={`${styles.overlay_effect} ${debugMode ? styles.dbg4 : ' '}`}
                    ></div>

                    <div
                        onClick={overlayClickListener}
                        style={getPosForOverlayRect(
                            ScreenCaptureOverlayTypes.MaskArea,
                        )}
                        className={`${styles.overlay_effect} ${styles.mask}`}
                    ></div>
                </>
            )}

            <div ref={croppedImageRef} className={styles.preview_modal}>
                {imageComp && (
                    <div
                        className={styles.image_preview_wrapper}
                        style={getPreviewSize()}
                    >
                        <img
                            src={URL.createObjectURL(imageComp)}
                            alt='screenshot'
                            style={getImageOffset()}
                            className={styles.captured_raw_image}
                        />
                    </div>
                )}
            </div>
        </>
    );
}
