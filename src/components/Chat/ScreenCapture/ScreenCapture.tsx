/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useContext, useEffect, useRef, useState } from 'react';
import styles from './ScreenCapture.module.css';
// import { domToImage } from 'modern-screenshot';
import { BiScreenshot, BiSend } from 'react-icons/bi';
import { BsCopy } from 'react-icons/bs';
import { RiDownload2Line, RiScreenshot2Line } from 'react-icons/ri';
import { printDomToImage } from '../../../ambient-utils/dataLayer';
import { AppStateContext, UserDataContext } from '../../../contexts';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { TextOnlyTooltip } from '../../Global/StyledTooltip/StyledTooltip';
import {
    ScreenCaptureEditStates,
    ScreenCaptureOverlayTypes,
    ScreenCaptureStates,
} from '../ChatEnums';
import { DomPositionInterface, DomRectDefault, DomRectIF } from '../ChatIFs';
import { domDebug } from '../DomDebugger/DomDebuggerUtils';
import ScreenCaptureMessageInput from './ScreenCaptureMessageInput';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import { useNavigate } from 'react-router-dom';

interface propsIF {
    name?: string;
}

export default function ScreenCapture(props: propsIF) {
    console.log(window.location.pathname);

    const isChatPage = window.location.pathname === '/chat/';

    const navigate = useNavigate();

    const chatOnDom = document.getElementById('ambient-chat-on-dom');

    const keyDownListener = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            resetBtnListener();
            e.preventDefault();
        }
    };

    const setDocumentMode = (capturing: boolean) => {
        document.body.classList.toggle(styles.page_on_crop, capturing);
    };

    useEffect(() => {
        if (!isMobile) {
            document.addEventListener('mousemove', mouseMoveListener);
            document.addEventListener('keydown', keyDownListener);
        }
    }, []);

    const { isUserConnected, setLastCapturedScreenShot } =
        useContext(UserDataContext);
    const editMasking = false;

    const {
        snackbar: { open: openSnackbar },
        walletModal: { open: openWalletModal },
        chat: { isOpen: isChatOpen, setIsOpen: setIsChatOpen },
    } = useContext(AppStateContext);

    const isMobile = useMediaQuery('(max-width: 768px)');

    const previewModalRef = useRef<HTMLDivElement>(null);

    const [, copy] = useCopyToClipboard();

    const [imageComp, setImageComp] = useState<any>(null);
    const [captureState, setCaptureState] = useState<ScreenCaptureStates>(
        ScreenCaptureStates.Idle,
    );

    const [captureEditState, setCaptureEditState] =
        useState<ScreenCaptureEditStates>(ScreenCaptureEditStates.Idle);
    const captureEditStateRef = useRef<ScreenCaptureEditStates>();
    captureEditStateRef.current = captureEditState;

    const [maskMoveStartPoint, setMaskMoveStartPoint] =
        useState<DomPositionInterface>();
    const maskMoveStartPointRef = useRef<DomPositionInterface>();
    maskMoveStartPointRef.current = maskMoveStartPoint;

    const [maskMoveEndPoint, setMaskMoveEndPoint] =
        useState<DomPositionInterface>();
    const maskMoveEndPointRef = useRef<DomPositionInterface>();
    maskMoveEndPointRef.current = maskMoveEndPoint;

    const [maskMoveGap, setMaskMoveGap] = useState<DomPositionInterface>();
    const maskMoveGapRef = useRef<DomPositionInterface>();
    maskMoveGapRef.current = maskMoveGap;

    const [renderOverlayRect, setRenderOverlayRect] = useState<boolean>(true);

    const captureStateRef = useRef<ScreenCaptureStates>();
    captureStateRef.current = captureState;
    const [maskLT, setMaskLT] = useState<DomPositionInterface>();
    const maskLTRef = useRef<DomPositionInterface>();
    maskLTRef.current = maskLT;
    const [maskRB, setMaskRB] = useState<DomPositionInterface>();
    const maskRBRef = useRef<DomPositionInterface>();
    maskRBRef.current = maskRB;

    const [previewActive, setPreviewActive] = useState<boolean>(false);

    const [overlayRect, setOverlayRect] = useState<DomRectIF>(DomRectDefault);
    const overlayRectRef = useRef<DomRectIF>(DomRectDefault);
    overlayRectRef.current = overlayRect;

    const croppedImageRef = useRef<HTMLDivElement>(null);

    const [debugMode, setDebugMode] = useState<boolean>(false);
    const [scaleFactor, setScaleFactor] = useState<number>(1);
    const btnListener = async () => {
        // const image = await domToImage(document.body);
        const image = await printDomToImage(
            document.getElementById('root') as HTMLElement,
        );
        setImageComp(image);
    };
    const maskBtnListener = async () => {
        setTimeout(() => {
            setCaptureState(ScreenCaptureStates.MaskReady);
        }, 200);
    };
    const resetBtnListener = async () => {
        setCaptureState(ScreenCaptureStates.Idle);
        setImageComp(undefined);
        setPreviewActive(false);
        setMaskLT({ x: 0, y: 0 });
        setMaskRB({ x: 0, y: 0 });
        setMaskMoveGap(undefined);
        setOverlayRect(DomRectDefault);
        setLastCapturedScreenShot(undefined);
    };

    const closePreviewModal = () => {
        setPreviewActive(false);
    };

    useOnClickOutside(previewModalRef, closePreviewModal);

    const debugBtnListener = async () => {
        setDebugMode(!debugMode);
    };

    const captureDom = async () => {
        const image = await printDomToImage(
            document.getElementById('root') as HTMLElement,
            undefined,
            undefined,
            undefined,
            (el: Node) => {
                return (el as HTMLElement).id !== 'ambient-header-wallet-name';
            },
            1,
        );
        setImageComp(image);
    };

    const overlayOnClick = (e: React.MouseEvent) => {
        if (isMobile) return;
        maskStarter(e.clientX, e.clientY);
    };

    const overlayOnTouch = (e: React.TouchEvent) => {
        console.log(
            'overlayOnTouch',
            e.touches[0].clientX,
            e.touches[0].clientY,
        );
        if (!isMobile) return;
        maskStarter(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
    };

    const maskStarter = (x: number, y: number) => {
        setMaskLT({ x: x, y: y });
        // captureDom();
        setTimeout(() => {
            setCaptureState(ScreenCaptureStates.Masking);
        }, 300);
        domDebug('maskLT', { x: x, y: y });
    };

    const mouseMoveListener = (e: MouseEvent) => {
        if (isMobile) return;
        maskingMouseMoveListener(e.clientX, e.clientY);
    };

    const touchMoveListener = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isMobile) return;

        maskingMouseMoveListener(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
    };

    const maskingMouseMoveListener = (x: number, y: number) => {
        if (captureStateRef.current == ScreenCaptureStates.PreviewReady) return;
        if (captureStateRef.current != ScreenCaptureStates.Masking) return;

        setMaskRB({ x: x, y: y });
        if (maskLTRef.current) {
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
        setRenderOverlayRect(false);
        bindScaleFactor();
        captureDom();
        if (captureStateRef.current == ScreenCaptureStates.Masking) {
            setPreviewActive(true);
            // copyCroppedImageToClipboard();
            setCaptureState(ScreenCaptureStates.PreviewReady);
            setTimeout(() => {
                setRenderOverlayRect(true);
            }, 400);
        }
    };

    const bindScaleFactor = () => {
        const ratio = isMobile ? 0.9 : 0.6;

        const rectWidth =
            overlayRectRef.current.rt.x - overlayRectRef.current.lt.x;
        const rectHeight =
            overlayRectRef.current.lb.y - overlayRectRef.current.lt.y;
        const maxWidth = window.innerWidth * ratio;
        const maxHeight = window.innerHeight * ratio;

        if (rectWidth > maxWidth || rectHeight > maxHeight) {
            const scale = Math.min(
                maxWidth / rectWidth,
                maxHeight / rectHeight,
            );
            setScaleFactor(scale);
        } else {
            setScaleFactor(1);
        }
    };

    console.log('scaleFactor', scaleFactor);

    useEffect(() => {
        console.log(
            'maskReady',
            captureState === ScreenCaptureStates.MaskReady,
        );
        console.log('masking ', captureState === ScreenCaptureStates.Masking);

        if (isMobile) {
            if (captureState === ScreenCaptureStates.Idle) {
                setDocumentMode(false);
            } else {
                setDocumentMode(true);
            }
        }
    }, [captureState]);

    const getPosForOverlayRect = (type: ScreenCaptureOverlayTypes) => {
        const oRect = overlayRectRef.current;
        if (!oRect) return;
        const maskOverlayOffset = 10;

        let transform = '';

        if (maskMoveGapRef.current) {
            transform = `translate(${maskMoveGapRef.current?.x}px, ${maskMoveGapRef.current?.y}px)`;
        }

        switch (type) {
            case ScreenCaptureOverlayTypes.LeftTop:
                return {
                    left: 0,
                    top: 0,
                    // right: window.innerWidth - maskRBRef.current.x,
                    // bottom: window.innerHeight - maskLTRef.current.y,
                    right: window.innerWidth - oRect.lt.x + maskOverlayOffset,
                    bottom: 0,
                };
            case ScreenCaptureOverlayTypes.RightTop:
                return {
                    left: oRect.lt.x - maskOverlayOffset,
                    top: 0,
                    right: 0,
                    bottom: window.innerHeight - oRect.lt.y + maskOverlayOffset,
                };
            case ScreenCaptureOverlayTypes.RightBottom:
                return {
                    left: oRect.rt.x + maskOverlayOffset,
                    top: oRect.rt.y - maskOverlayOffset,
                    right: 0,
                    bottom: 0,
                };
            case ScreenCaptureOverlayTypes.LeftBottom:
                return {
                    left: oRect.lb.x - maskOverlayOffset,
                    top: oRect.lb.y + maskOverlayOffset,
                    right: window.innerWidth - oRect.rb.x - maskOverlayOffset,
                    bottom: 0,
                };
            case ScreenCaptureOverlayTypes.MaskArea:
                return {
                    // left: maskLTRef.current.x,
                    // top: maskLTRef.current.y,
                    // right: window.innerWidth - maskRBRef.current.x - 10,
                    // bottom: window.innerHeight - maskRBRef.current.y - 10,
                    left: overlayRect.lt.x - maskOverlayOffset,
                    top: overlayRect.lt.y - maskOverlayOffset,
                    right:
                        window.innerWidth -
                        overlayRect.rt.x -
                        maskOverlayOffset,
                    bottom:
                        window.innerHeight -
                        overlayRect.rb.y -
                        maskOverlayOffset,
                    transform: transform,
                    display: renderOverlayRect ? 'block' : 'none',
                };
        }
    };

    const getImageOffset = () => {
        let gap = { x: 0, y: 0 };
        if (maskMoveGapRef.current) {
            gap = maskMoveGapRef.current;
        }

        const width = scaleFactor * 100;

        return {
            left: scaleFactor * -1 * overlayRect.lt.x - gap.x,
            top: scaleFactor * -1 * overlayRect.lt.y - gap.y,
            width: width + 'vw',
        };
    };

    const getPreviewSize = () => {
        return {
            width: scaleFactor * (overlayRect.rt.x - overlayRect.lt.x),
            height: scaleFactor * (overlayRect.lb.y - overlayRect.lt.y),
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
            if (image) {
                downloadBlob(image);
            }
        }
    };

    const getOverlayPoints = (
        first: DomPositionInterface,
        second: DomPositionInterface,
    ) => {
        const lt = {
            x: Math.min(first.x, second.x),
            y: Math.min(first.y, second.y),
        };
        const rt = {
            x: Math.max(first.x, second.x),
            y: Math.min(first.y, second.y),
        };
        const lb = {
            x: Math.min(first.x, second.x),
            y: Math.max(first.y, second.y),
        };
        const rb = {
            x: Math.max(first.x, second.x),
            y: Math.max(first.y, second.y),
        };
        return { lt, rt, rb, lb };
    };

    const overlayOnDrag = (e: React.MouseEvent) => {
        if (isMobile) return;
    };

    const chatBtnListener = async () => {
        if (!isChatOpen && !isMobile) {
            setIsChatOpen(true);
        }

        if (croppedImageRef.current) {
            const image = await printDomToImage(croppedImageRef.current);
            setLastCapturedScreenShot(image);
            setCaptureState(ScreenCaptureStates.Idle);
            setPreviewActive(false);
        }

        if (isMobile) {
            navigate('/chat');
        }
    };

    const connectBtnListener = async () => {
        if (croppedImageRef.current) {
            const image = await printDomToImage(croppedImageRef.current);
            setLastCapturedScreenShot(image);
            setIsChatOpen(true);
        }
        openWalletModal();
    };

    const previewMaskClickListener = (e: React.MouseEvent) => {
        setCaptureEditState(ScreenCaptureEditStates.MaskMoving);
        setMaskMoveStartPoint({ x: e.clientX, y: e.clientY });
    };

    const previewMaskMoveListener = (e: React.MouseEvent) => {
        if (captureEditStateRef.current != ScreenCaptureEditStates.MaskMoving)
            return;

        const currentPoint = { x: e.clientX, y: e.clientY };

        if (maskMoveStartPointRef.current) {
            const gap = {
                x: currentPoint.x - maskMoveStartPointRef.current.x,
                y: currentPoint.y - maskMoveStartPointRef.current.y,
            };
            setMaskMoveGap(gap);
        }
    };

    const previewMaskMoveEndListener = () => {
        setCaptureEditState(ScreenCaptureEditStates.Idle);
        if (maskMoveGapRef.current) {
            const gap = maskMoveGapRef.current;
            setOverlayRect((prev) => {
                return {
                    lt: { x: prev.lt.x + gap.x, y: prev.lt.y + gap.y },
                    rt: { x: prev.rt.x + gap.x, y: prev.rt.y + gap.y },
                    rb: { x: prev.rb.x + gap.x, y: prev.rb.y + gap.y },
                    lb: { x: prev.lb.x + gap.x, y: prev.lb.y + gap.y },
                };
            });
            setMaskMoveGap(undefined);
        }
    };

    const getPlaceholderSize = () => {
        return {
            width: (overlayRect.rt.x - overlayRect.lt.x) * scaleFactor + 'px',
            height: (overlayRect.lb.y - overlayRect.lt.y) * scaleFactor + 'px',
        };
    };

    return (
        <>
            <div className={styles.capture_btn} onClick={btnListener}>
                {' '}
                Capture
            </div>
            {/* <div className={styles.mask_btn} onClick={maskBtnListener}>
                {' '}
                Mask
            </div> */}

            <div className={styles.reset_btn} onClick={resetBtnListener}>
                {' '}
                Reset
            </div>
            <div className={styles.debug_btn} onClick={debugBtnListener}>
                {' '}
                Debug Overlays
            </div>

            <TextOnlyTooltip
                title={
                    <div className={styles.tooltip_wrapper}>
                        Take Screenshot
                    </div>
                }
                placement='bottom'
            >
                <div
                    className={`${styles.start_capture_btn} ${!isUserConnected ? styles.not_connected : ''} 
                ${captureState != ScreenCaptureStates.Idle ? styles.active : ''} ${isChatPage ? styles.chat_page : ''}`}
                    onClick={maskBtnListener}
                >
                    <BiScreenshot size={18} />
                </div>
            </TextOnlyTooltip>

            {/* <div className={`${styles.start_capture_btn} ${!isUserConnected ? styles.not_connected : ''} ${captureState != ScreenCaptureStates.Idle ? styles.active : ''}` } onClick={maskBtnListener}>  
                <BiScreenshot size={18} />
            </div>
             */}

            {(captureState == ScreenCaptureStates.MaskReady ||
                (captureState == ScreenCaptureStates.Masking && isMobile)) && (
                <div
                    className={`${styles.overlay_effect} ${styles.full} ${styles.mask_ready_overlay} ${captureState == ScreenCaptureStates.Masking && isMobile ? styles.transparent : ''}`}
                    onClick={overlayOnClick}
                    onMouseDown={overlayOnClick}
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
                        onMouseUp={maskEndClickListener}
                        style={getPosForOverlayRect(
                            ScreenCaptureOverlayTypes.MaskArea,
                        )}
                        className={`${styles.overlay_effect} ${styles.mask}`}
                    ></div>
                </>
            )}

            {/* {
                previewActive && (
                    <>
                    <div
                    style={getPosForOverlayRect(
                        ScreenCaptureOverlayTypes.MaskArea,
                    )}
                    className={`${styles.overlay_effect} ${styles.mask}`}
                    onDrag={editMasking ? overlayOnDrag : undefined}
                    onClick={editMasking ? previewMaskClickListener : undefined}
                    onMouseDown={editMasking ? previewMaskClickListener : undefined}
                    onMouseUp={editMasking ? previewMaskMoveEndListener : undefined}
                    ></div>

                    { editMasking && <div className={styles.mask_move_overlay}
                            onMouseMove={previewMaskMoveListener}
                            onMouseUp={previewMaskMoveEndListener}
                            onMouseDown={previewMaskClickListener}
                        >
                    </div>}
                    </>
                )
            } */}

            <div
                className={`${styles.preview_modal} ${previewActive ? styles.active : ''}`}
                ref={previewModalRef}
            >
                <div className={styles.modal_title}>
                    Share Image
                    <div
                        className={styles.close_btn}
                        onClick={resetBtnListener}
                    >
                        X
                    </div>
                </div>
                {imageComp && (
                    <span className={styles.image_preview_outer}>
                        <div
                            ref={croppedImageRef}
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
                {!imageComp && (
                    <div
                        className={styles.placeholder_wrapper}
                        style={getPlaceholderSize()}
                    >
                        <RiScreenshot2Line size={64} />
                        <div className={styles.placeholder_text}>
                            The screen is being captured...
                        </div>
                        <div
                            className={
                                styles.placeholder_loader +
                                ' ' +
                                styles.placeholder_loader_horizontal
                            }
                        ></div>
                        <div
                            className={
                                styles.placeholder_loader +
                                ' ' +
                                styles.placeholder_loader_horizontal +
                                ' ' +
                                styles.reverse
                            }
                        ></div>
                    </div>
                )}
                {/* {isUserConnected && imageComp && <ScreenCaptureMessageInput />} */}
                <div className={styles.btn_section}>
                    {isUserConnected ? (
                        <div
                            className={`${styles.btn_wrapper} ${styles.primary_btn} ${!chatOnDom && !isMobile ? styles.hidden : ''}`}
                            onClick={chatBtnListener}
                        >
                            {' '}
                            <div className={styles.icon_wrapper_inner}>
                                <BiSend size={18} />
                            </div>{' '}
                            Send to Chat{' '}
                        </div>
                    ) : (
                        <TextOnlyTooltip
                            title={
                                <div className={styles.tooltip_wrapper}>
                                    Conect your wallet to send screenshot on
                                    chat
                                </div>
                            }
                            placement='top'
                        >
                            <div
                                className={`${styles.btn_wrapper} ${styles.primary_btn} ${!chatOnDom && !isMobile ? styles.hidden : ''}`}
                                onClick={connectBtnListener}
                            >
                                {' '}
                                <div className={styles.icon_wrapper_inner}>
                                    <BiSend size={18} />
                                </div>{' '}
                                Send to Chat
                            </div>
                        </TextOnlyTooltip>
                    )}

                    <TextOnlyTooltip
                        title={
                            <div className={styles.tooltip_wrapper}>
                                Download Image
                            </div>
                        }
                        placement='top'
                    >
                        <div
                            className={styles.icon_btn_wrapper}
                            onClick={downloadImage}
                        >
                            <RiDownload2Line size={18} color='var(--text3)' />
                        </div>
                    </TextOnlyTooltip>

                    <TextOnlyTooltip
                        title={
                            <div className={styles.tooltip_wrapper}>
                                Copy to Clipboard
                            </div>
                        }
                        placement='top'
                    >
                        <div
                            className={styles.icon_btn_wrapper}
                            onClick={copyCroppedImageToClipboard}
                        >
                            <BsCopy size={18} color='var(--text3)' />
                        </div>
                    </TextOnlyTooltip>
                </div>
            </div>
        </>
    );
}
