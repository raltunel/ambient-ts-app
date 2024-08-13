import { useEffect, useRef, useState } from 'react';
import styles from './ScreenCapture.module.css';
// import { domToImage } from 'modern-screenshot';
import { printDomToImage } from '../../../ambient-utils/dataLayer';
import { ScreenCaptureOverlayTypes, ScreenCaptureStates } from '../ChatEnums';
import { DomPositionInterface } from '../ChatIFs';
import { domDebug } from '../DomDebugger/DomDebuggerUtils';
/* eslint-disable @typescript-eslint/no-explicit-any */

interface propsIF {
    name?: string;
}

export default function ScreenCapture(props: propsIF) {
    useEffect(() => {
        console.log(props);
        document.addEventListener('mousemove', maskMoveListener);
    }, []);

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

    const [debugMode, setDebugMode] = useState<boolean>(false);
    const btnListener = async () => {
        // const image = await domToImage(document.body);
        const image = await printDomToImage(document.body);

        console.log(image);
        setImageComp(image);
    };
    const maskBtnListener = async () => {
        setCaptureState(ScreenCaptureStates.MaskReady);
    };
    const resetBtnListener = async () => {
        setCaptureState(ScreenCaptureStates.Idle);
    };
    const debugBtnListener = async () => {
        setDebugMode(!debugMode);
    };

    const maskStarter = (e: React.MouseEvent) => {
        setMaskLT({ x: e.clientX, y: e.clientY });
        setCaptureState(ScreenCaptureStates.Masking);

        domDebug('maskLT', { x: e.clientX, y: e.clientY });
    };

    const maskMoveListener = (e: MouseEvent) => {
        if (captureStateRef.current != ScreenCaptureStates.Masking) return;

        setMaskRB({ x: e.clientX, y: e.clientY });

        domDebug('maskRB', maskRB);
        console.log(e.clientX, e.clientY);
    };

    const getPosForOverlayRect = (type: ScreenCaptureOverlayTypes) => {
        if (maskLTRef.current == undefined || maskRBRef.current == undefined)
            return;
        switch (type) {
            case ScreenCaptureOverlayTypes.LeftTop:
                return {
                    left: 0,
                    top: 0,
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
        }
    };
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
                </>
            )}

            <div className={styles.preview}>
                {imageComp && (
                    <img
                        src={URL.createObjectURL(imageComp)}
                        alt='screenshot'
                    />
                )}
            </div>
        </>
    );
}
