
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useContext, useEffect, useRef, useState } from 'react';
import styles from './ScreenCapture.module.css';
// import { domToImage } from 'modern-screenshot';
import { BiSend } from 'react-icons/bi';
import { BsCopy } from 'react-icons/bs';
import { RiDownload2Line, RiScreenshot2Line } from 'react-icons/ri';
import { printDomToImage } from '../../../ambient-utils/dataLayer';
import { AppStateContext, UserDataContext } from '../../../contexts';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { TextOnlyTooltip } from '../../Global/StyledTooltip/StyledTooltip';
import { ScreenCaptureOverlayTypes, ScreenCaptureStates } from '../ChatEnums';
import { DomPositionInterface, DomRectIF } from '../ChatIFs';
import { domDebug } from '../DomDebugger/DomDebuggerUtils';
import ScreenCaptureMessageInput from './ScreenCaptureMessageInput';

interface propsIF {
    name?: string;
}

export default function ScreenCapture(props: propsIF) {
    useEffect(() => {
        console.log(props);
        if(!isMobile){
            document.addEventListener('mousemove', mouseMoveListener);
        }
    }, []);

    const {isUserConnected, setLastCapturedScreenShot} = useContext(UserDataContext);

    const {
        snackbar: { open: openSnackbar },
        walletModal: { open: openWalletModal },
        chat: { isOpen: isChatOpen, setIsOpen: setIsChatOpen },
    } = useContext(AppStateContext);

    const isMobile = useMediaQuery('(max-width: 768px)');

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

    const [previewActive, setPreviewActive] = useState<boolean>(false);

    const [overlayRect, setOverlayRect] = useState<DomRectIF>({ lt: { x: 0, y: 0 }, rt: { x: 0, y: 0 }, rb: { x: 0, y: 0 }, lb: { x: 0, y: 0 } });

    const croppedImageRef = useRef<HTMLDivElement>(null);

    const [debugMode, setDebugMode] = useState<boolean>(false);
    const btnListener = async () => {
        // const image = await domToImage(document.body);
        const image = await printDomToImage(document.getElementById('root') as HTMLElement);
        setImageComp(image);
    };
    const maskBtnListener = async () => {
        console.log('mask');
        setTimeout(() => {
            setCaptureState(ScreenCaptureStates.MaskReady);
        }, 200);
    };
    const resetBtnListener = async () => {
        setCaptureState(ScreenCaptureStates.Idle);
        setImageComp(undefined);
        setPreviewActive(false);
        setMaskLT({x: 0, y: 0});
        setMaskRB({x: 0, y: 0});
        setOverlayRect({ lt: { x: 0, y: 0 }, rt: { x: 0, y: 0 }, rb: { x: 0, y: 0 }, lb: { x: 0, y: 0 } });
        setLastCapturedScreenShot(undefined);

    };
    const debugBtnListener = async () => {
        setDebugMode(!debugMode);
    };

    const captureDom = async () => {
        const image = await printDomToImage(document.getElementById('root') as HTMLElement);
        setImageComp(image);
    };


    const overlayOnClick = (e: React.MouseEvent) => {
        console.log('overlay click');
        if(isMobile) return;
        maskStarter(e.clientX, e.clientY);
    }

    const overlayOnTouch = (e: React.TouchEvent) => {
        console.log('touch');
        if(!isMobile) return;
        maskStarter(e.touches[0].clientX, e.touches[0].clientY);
    }

    const maskStarter = (x: number, y:number) => {
        setMaskLT({ x: x, y: y });
        captureDom();
        setTimeout(() => {
            setCaptureState(ScreenCaptureStates.Masking);
        }, 300);
        domDebug('maskLT', { x: x, y: y });
    };

    const mouseMoveListener = (e: MouseEvent) => {
        if(isMobile) return;

        maskMoveListener(e.clientX, e.clientY);
    }

    const touchMoveListener = (e: React.TouchEvent<HTMLDivElement>) => {
        console.log('touch move');
        if(!isMobile) return;

        console.log(e.touches[0].clientX, e.touches[0].clientY);

        maskMoveListener(e.touches[0].clientX, e.touches[0].clientY);
    }

    const maskMoveListener = (x: number, y: number) => {
        
        if( captureStateRef.current == ScreenCaptureStates.PreviewReady) return;
        if (captureStateRef.current != ScreenCaptureStates.Masking) return;

        setMaskRB({ x: x, y: y });
        if(maskLTRef.current){
            setOverlayRect(getOverlayPoints(maskLTRef.current, { x: x, y: y }));
        }

        domDebug('maskRB', maskRB);
    };

    const copyCroppedImageToClipboard = async () => {
        if (croppedImageRef.current) {
            const image = await printDomToImage(croppedImageRef.current);
            if (image) {
                copy(image);
            }
            openSnackbar('Copied to clipboard!', 'success');
        }
    };

    const maskEndClickListener = () => {
        console.log('mask End click listener')
        if (captureStateRef.current == ScreenCaptureStates.Masking) {
            setPreviewActive(true);
            // copyCroppedImageToClipboard();
            setCaptureState(ScreenCaptureStates.PreviewReady);
        }
    };


    useEffect(() => {
        console.log(captureState);
    }, [captureState]);

    const getPosForOverlayRect = (type: ScreenCaptureOverlayTypes) => {
        if (maskLTRef.current == undefined || maskRBRef.current == undefined)
            return;
        const maskOverlayOffset = 10;
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
                    left: overlayRect.lt.x - maskOverlayOffset,
                    top: overlayRect.lt.y - maskOverlayOffset,
                    right: window.innerWidth - overlayRect.rt.x - maskOverlayOffset,
                    bottom: window.innerHeight - overlayRect.rb.y - maskOverlayOffset,
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

    const downloadBlob = async (image: Blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(image);
        a.download = 'screenshot-' + new Date().toISOString() + '.png';
        a.click();
    };

    const downloadImage = async () => {
        if (croppedImageRef.current) {
        const image = await printDomToImage(croppedImageRef.current);
        if(image) {
            downloadBlob(image);
        }
        }
    };

    const getOverlayPoints = (first: DomPositionInterface, second: DomPositionInterface) => {
        const lt = { x: Math.min(first.x, second.x), y: Math.min(first.y, second.y) };
        const rt = { x: Math.max(first.x, second.x), y: Math.min(first.y, second.y) };
        const lb = { x: Math.min(first.x, second.x), y: Math.max(first.y, second.y) };
        const rb = { x: Math.max(first.x, second.x), y: Math.max(first.y, second.y) };
        return { lt, rt, rb, lb};
    }

    

    const chatBtnListener = async () => {


        if(!isChatOpen){
            setIsChatOpen(true);
        }

        if (croppedImageRef.current) {
            const image = await printDomToImage(croppedImageRef.current);
            setLastCapturedScreenShot(image);
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

            {(captureState == ScreenCaptureStates.MaskReady || isMobile === true) && (
                <div
                    className={`${styles.overlay_effect} ${styles.full}`}
                    onClick={overlayOnClick}
                    onTouchStart={overlayOnTouch}
                    onTouchMove={touchMoveListener}
                    onTouchEnd={maskEndClickListener}
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
                        onClick={maskEndClickListener}
                        style={getPosForOverlayRect(
                            ScreenCaptureOverlayTypes.MaskArea,
                        )}
                        className={`${styles.overlay_effect} ${styles.mask}`}
                    ></div>
                </>
            )}

            <div  className={`${styles.preview_modal} ${previewActive ? styles.active : ''}`}>
                <div className={styles.modal_title}>Share Image
                    <div className={styles.close_btn} onClick={resetBtnListener}>X</div>
                </div>
                {imageComp && (
                    <span className={styles.image_preview_outer}>
                    <div ref={croppedImageRef}
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
                    </span>
                )} 
                {
                    !imageComp && (
                        <div className={styles.placeholder_wrapper}>
                            <RiScreenshot2Line size={64}  />
                            <div className={styles.placeholder_text}>The screen is being captured...</div>
                            <div className={ styles.placeholder_loader + ' ' + styles.placeholder_loader_horizontal}></div>
                            <div className={ styles.placeholder_loader + ' ' + styles.placeholder_loader_horizontal + ' ' + styles.reverse}></div>
                        </div>
                    )
                }
                {/* {isUserConnected && imageComp && <ScreenCaptureMessageInput />} */}
                <div className={styles.btn_section}>
                    {isUserConnected ? (   
                        <div className={styles.btn_wrapper + ' ' + styles.primary_btn} onClick={chatBtnListener}> <div className={styles.icon_wrapper_inner}><BiSend size={18} />
                        </div> Send to Chat </div>
                    ) : (
                        <TextOnlyTooltip title={<div className={styles.tooltip_wrapper}>Conect your wallet to send screenshot on chat</div>} placement='top' >
                        <div className={styles.btn_wrapper + ' ' + styles.primary_btn} onClick={openWalletModal}> <div className={styles.icon_wrapper_inner}><BiSend size={18} />
                        </div> Send to Chat</div>
                        </TextOnlyTooltip>
                    )}

                    <TextOnlyTooltip title={<div className={styles.tooltip_wrapper}>Download Image</div>} placement='top' >
                        <div className={styles.icon_btn_wrapper} onClick={downloadImage}>
                            <RiDownload2Line size={18} color='var(--text3)' />
                        </div>
                    </TextOnlyTooltip>
                    
                    <TextOnlyTooltip title={<div className={styles.tooltip_wrapper}>Copy to Clipboard</div>} placement='top' >
                        <div className={styles.icon_btn_wrapper} onClick={copyCroppedImageToClipboard}>
                            <BsCopy size={18} color='var(--text3)' />
                        </div>
                    </TextOnlyTooltip>
                </div>
            </div> 
        </>
    );
}
