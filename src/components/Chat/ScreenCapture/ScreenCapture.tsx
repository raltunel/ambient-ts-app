/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useContext, useEffect, useRef, useState } from 'react';
import styles from './ScreenCapture.module.css';
// import { domToImage } from 'modern-screenshot';
import { AiOutlineWarning } from 'react-icons/ai';
import { BiScreenshot, BiSend } from 'react-icons/bi';
import { BsCopy } from 'react-icons/bs';
import { FaArrowLeft, FaQuestion, FaRocket } from 'react-icons/fa';
import { RiDownload2Line, RiScreenshot2Line } from 'react-icons/ri';
import { RxReset } from 'react-icons/rx';
import { useNavigate } from 'react-router-dom';
import { printDomToImage } from '../../../ambient-utils/dataLayer';
import { AppStateContext, UserDataContext } from '../../../contexts';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import { TextOnlyTooltip } from '../../Global/StyledTooltip/StyledTooltip';
import {
    AreaDrawStates,
    ScreenCaptureEditStates,
    ScreenCaptureOverlayTypes,
    ScreenCaptureStates,
} from '../ChatEnums';
import {
    DomPositionInterface,
    DomRectDefault,
    DomRectIF,
    ScreenCaptureMarker,
} from '../ChatIFs';
import { domDebug } from '../DomDebugger/DomDebuggerUtils';
import DraggableItem from '../DraggableItem/DraggableItem';
import useChatSocket from '../Service/useChatSocket';
import ScreenCaptureMessageInput from './ScreenCaptureMessageInput';
import { getStyleFromRect, screenCaptureMarkerIcons } from '../ChatRenderUtils';

interface propsIF {
    name?: string;
}

export default function ScreenCapture(props: propsIF) {
    const isChatPage =
        window.location.pathname === '/chat/' ||
        window.location.pathname === '/chat';

    const navigate = useNavigate();

    const blackListDomElements = ['current_row_scroll', 'chat-wrapper'];
    const [sendToChatActive, setSendToChatActive] = useState(false);

    const [markers, setMarkers] = useState<ScreenCaptureMarker[]>([]);

    const { sendMsg } = useChatSocket('Global', true, sendToChatActive);

    const [selectedMarkerType, setSelectedMarkerType] = useState<number>(0);

    const [areaDrawState, setAreaDrawState] = useState<AreaDrawStates>(
        AreaDrawStates.Idle,
    );
    const areaDrawStateRef = useRef<AreaDrawStates>(areaDrawState);
    areaDrawStateRef.current = areaDrawState;

    const [areaDrawStartPoint, setAreaDrawStartPoint] =
        useState<DomPositionInterface>();
    const areaDrawStartPointRef = useRef<DomPositionInterface>();
    areaDrawStartPointRef.current = areaDrawStartPoint;

    const [focusedMarkerId, setFocusedMarkerId] = useState<
        string | undefined
    >();

    useEffect(() => {
        setPreviewActive(false);
    }, [window.location.pathname]);

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

    const removeMarker = (id: string) => {
        setMarkers((prev) => {
            return prev.filter((marker) => marker.key !== id);
        });
    };

    useEffect(() => {
        if (!isMobile) {
            document.addEventListener('mousemove', mouseMoveListener);
            // document.addEventListener('mousedown', mouseDownListener);
            document.addEventListener('mouseup', mouseUpListener);
            document.addEventListener('keydown', keyDownListener);
        }
    }, []);

    const { isUserConnected } = useContext(UserDataContext);
    const editMasking = false;

    const {
        snackbar: { open: openSnackbar },
        walletModal: { open: openWalletModal },
        chat: { isOpen: isChatOpen, setIsOpen: setIsChatOpen },
        setLastCapturedScreenShot,
        screenCaptureActive,
        setScreenCaptureActive,
    } = useContext(AppStateContext);

    const mouseUpListener = (e: MouseEvent) => {
        handleDrawAreaEnd();
    };

    // const mouseDownListener = (e: MouseEvent) => {
    //     if(areaDrawActiveRef.current){
    //         console.log('>>> start area ');
    //         setAreaDrawStartPoint({x: e.clientX, y: e.clientY});
    //     }
    // }

    useEffect(() => {
        if (screenCaptureActive) {
            console.log('>>> screen capture active', imageComp);
            if (imageComp) {
                setCaptureState(ScreenCaptureStates.PreviewReady);
                setPreviewActive(true);
                return;
            }
            startCapture();
        } else {
            cancelCapture();
        }
    }, [screenCaptureActive]);

    const isMobile = useMediaQuery('(max-width: 768px)');

    const previewModalRef = useRef<HTMLDivElement>(null);

    const [, copy] = useCopyToClipboard();

    const [imageComp, setImageComp] = useState<any>();
    const [captureState, setCaptureState] = useState<ScreenCaptureStates>(
        // ScreenCaptureStates.Idle,
        ScreenCaptureStates.PreviewReady,
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

    const [areaDrawRect, setAreaDrawRect] = useState<DomRectIF>(DomRectDefault);
    const areaDrawRectRef = useRef<DomRectIF>(DomRectDefault);
    areaDrawRectRef.current = areaDrawRect;

    const croppedImageRef = useRef<HTMLDivElement>(null);

    const [debugMode, setDebugMode] = useState<boolean>(false);
    const [scaleFactor, setScaleFactor] = useState<number>(1);

    const startCapture = async () => {
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
        setSendToChatActive(false);
    };

    useEffect(() => {
        if (!previewActive) {
            setImageComp(null);
            setCaptureState(ScreenCaptureStates.Idle);
        } else {
            setSelectedMarkerType(0);
            setMarkers([]);
        }
    }, [previewActive]);

    useEffect(() => {
        setMarkers((prev) => {
            return prev.map((marker) => {
                return {
                    ...marker,
                    disabled: areaDrawState !== AreaDrawStates.Idle,
                };
            });
        });
        setAreaDrawRect(DomRectDefault);
    }, [areaDrawState]);

    const cancelCapture = () => {
        setImageComp(undefined);
        setCaptureState(ScreenCaptureStates.Idle);
        setPreviewActive(false);
        setOverlayRect(DomRectDefault);
        setSendToChatActive(false);
        if (!isMobile) {
            setPreviewActive(false);
        }
        setMarkers([]);
    };

    const previewModalOnClickOutside = () => {
        if (captureStateRef.current === ScreenCaptureStates.PreviewReady) {
            setScreenCaptureActive(false);
            setLastCapturedScreenShot(undefined);
        }
    };

    useOnClickOutside(previewModalRef, previewModalOnClickOutside);

    const debugBtnListener = async () => {
        setDebugMode(!debugMode);
    };

    const isCollidingWithBBox = (el: HTMLElement) => {
        if (!el) return false;

        const elBBox = el.getBoundingClientRect();
        const maskBBox = overlayRectRef.current;

        return (
            elBBox.left < maskBBox.rt.x &&
            elBBox.right > maskBBox.lt.x &&
            elBBox.top < maskBBox.lb.y &&
            elBBox.bottom > maskBBox.lt.y
        );
    };

    const ignoredBlackListElements = () => {
        const ret: string[] = [];

        blackListDomElements.forEach((e) => {
            const el = document.getElementById(e) as HTMLElement;
            if (!isCollidingWithBBox(el)) {
                if (el) {
                    el.classList.add(styles.ignored_element);
                }
                ret.push(e);
            } else {
                el.classList.remove(styles.ignored_element);
            }
        });

        return new Set(ret);
    };

    const captureDom = async () => {
        const ignoredElements = ignoredBlackListElements();

        ignoredElements.add('screen-capture-component');
        ignoredElements.add('ambient-header-wallet-name');

        const image = await printDomToImage(
            document.getElementById('root') as HTMLElement,
            undefined,
            undefined,
            undefined,
            (el: Node) => {
                return !ignoredElements.has((el as HTMLElement).id);
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
        if (!isMobile) return;
        maskStarter(e.touches[0].clientX, e.touches[0].clientY);
    };

    const maskStarter = (x: number, y: number) => {
        setMaskLT({ x: x, y: y });
        setTimeout(() => {
            setCaptureState(ScreenCaptureStates.Masking);
        }, 300);
        domDebug('maskLT', { x: x, y: y });
    };

    const mouseMoveListener = (e: MouseEvent) => {
        if (
            areaDrawStateRef.current == AreaDrawStates.Drawing &&
            areaDrawStartPointRef.current
        ) {
            return areaDrawMoveListener(e);
        }

        if (isMobile) return;
        maskingMouseMoveListener(e.clientX, e.clientY);
    };

    // useEffect(() => {
    //     console.log(areaDrawRect.lt.x, areaDrawRect.lt.y, ' | ' , areaDrawRect.rb.x, areaDrawRect.rb.y)
    // }, [areaDrawRect]);

    const touchMoveListener = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isMobile) return;

        maskingMouseMoveListener(e.touches[0].clientX, e.touches[0].clientY);
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
        if (captureStateRef.current == ScreenCaptureStates.Masking) {
            setPreviewActive(true);
            // copyCroppedImageToClipboard();
            setCaptureState(ScreenCaptureStates.PreviewReady);
            setTimeout(() => {
                setRenderOverlayRect(true);
            }, 400);
        }
        captureDom();
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

    useEffect(() => {
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
        const blobUrl = URL.createObjectURL(image);
        a.href = blobUrl;
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
            setScreenCaptureActive(false);
            if (!isMobile) {
                setCaptureState(ScreenCaptureStates.Idle);
                setPreviewActive(false);
            } else {
                // setSendToChatActive(true);

                setTimeout(() => {
                    if (isMobile) {
                        setTimeout(() => {
                            navigate('/chat');
                        }, 300);
                    }
                }, 1000);
            }
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

    const getCaptureStateDebugger = () => {
        switch (captureState) {
            case ScreenCaptureStates.Idle:
                return 'Idle';
            case ScreenCaptureStates.MaskReady:
                return 'Mask Ready';
            case ScreenCaptureStates.Masking:
                return 'Masking';
            case ScreenCaptureStates.PreviewReady:
                return 'Preview Ready';
            default:
                return 'Unknown';
        }
    };

    const getDebugger2Content = () => {
        return (
            <>
                <div>dom elements: {document.querySelectorAll('*').length}</div>
                <div>
                    table dom elements:{' '}
                    {
                        document
                            .getElementById('current_row_scroll')
                            ?.querySelectorAll('*').length
                    }
                </div>
                <div>
                    table rows:{' '}
                    {
                        document.querySelectorAll(
                            '#current_row_scroll > div > div',
                        ).length
                    }
                </div>
            </>
        );
    };

    const markerFocusListener = (id: string, focus: boolean) => {
        if (focus) {
            markers.forEach((marker) => {
                if (marker.key == id) {
                    marker.disabled = false;
                } else {
                    marker.disabled = true;
                }
            });
        } else {
            markers.forEach((marker) => {
                marker.disabled = false;
            });
        }

        setMarkers([...markers]);
    };

    const createMarkerContent = (marker: ScreenCaptureMarker) => {
        if (marker.markerType >= 0) {
            return (
                <span style={{ transform: 'scale(1.5)', display: 'block' }}>
                    {screenCaptureMarkerIcons[marker.markerType]}
                </span>
            );
        } else {
            return (
                <div
                    className={
                        styles.area_draw_marker + ' ' + 'area_draw_marker'
                    }
                    style={{
                        width: marker.shapeWidth,
                        height: marker.shapeHeight,
                    }}
                ></div>
            );
        }
    };

    const createMarker = (
        left: number,
        top: number,
        markerType: number,
        isShape: boolean,
        shapeWidth?: number,
        shapeHeight?: number,
    ) => {
        const markerId = `marker-${new Date().getTime()}`;

        return {
            key: markerId,
            disabled: false,
            left,
            top,
            markerType,
            isShape,
            shapeWidth,
            shapeHeight,
        };
    };

    const dblClickListener = (e: React.MouseEvent) => {
        if (croppedImageRef.current) {
            const wrapperRect = croppedImageRef.current.getBoundingClientRect();

            const left = (e.clientX -= wrapperRect.left);
            const top = (e.clientY -= wrapperRect.top);
            setMarkers((prev) => [
                ...prev,
                createMarker(left, top, selectedMarkerType, false),
            ]);
        }
    };

    const markerMoveListener = (e: React.MouseEvent) => {
        console.log('>>> marker move', e);
    };

    const getToolbarIcons = () => {
        return screenCaptureMarkerIcons.map((icon, index) => (
            <div
                className={
                    styles.marker_toolbar_item +
                    ' ' +
                    (selectedMarkerType == index ? styles.active : '')
                }
                key={`marker-${index}`}
                onClick={() => setSelectedMarkerType(index)}
            >
                {icon}
            </div>
        ));
    };

    const areaDrawStartListener = (e: React.MouseEvent) => {
        const parent = croppedImageRef.current?.getBoundingClientRect();
        if (parent) {
            setAreaDrawStartPoint({
                x: e.clientX - parent.left,
                y: e.clientY - parent.top,
            });
            setAreaDrawState(AreaDrawStates.Drawing);
        }
    };

    const areaDrawMoveListener = (e: MouseEvent) => {
        const parent = croppedImageRef.current?.getBoundingClientRect();
        if (parent && areaDrawStartPointRef.current) {
            const rect = getOverlayPoints(areaDrawStartPointRef.current, {
                x: e.clientX - parent.left,
                y: e.clientY - parent.top,
            });

            console.log(
                '>>> start',
                areaDrawStartPointRef.current.x,
                areaDrawStartPointRef.current.y,
            );
            console.log(
                '>>> current',
                e.clientX - parent.left,
                e.clientY - parent.top,
            );
            console.log('>>> rect', rect);
            console.log('>>> ............');

            setAreaDrawRect(rect);
            return;
        }
    };

    const areaDrawBtnListener = () => {
        if (areaDrawStateRef.current == AreaDrawStates.Idle) {
            setAreaDrawState(AreaDrawStates.Ready);
        } else {
            setAreaDrawState(AreaDrawStates.Idle);
        }
    };

    useEffect(() => {
        console.log('>>> markers', markers);
    }, [markers]);

    const handleDrawAreaEnd = () => {
        if (areaDrawStateRef.current == AreaDrawStates.Drawing) {
            const rect = areaDrawRectRef.current;
            if (rect) {
                setMarkers((prev) => [
                    ...prev,
                    createMarker(
                        rect.lt.x,
                        rect.lt.y,
                        -1,
                        true,
                        rect.rt.x - rect.lt.x,
                        rect.lb.y - rect.lt.y,
                    ),
                ]);
            }
            setAreaDrawState(AreaDrawStates.Idle);
        }
    };

    return (
        <>
            <span id='screen-capture-component'>
                <div className={styles.screenshot_state_debugger}>
                    {getCaptureStateDebugger()}
                </div>
                <div className={styles.screenshot_state_debugger2}>
                    {getDebugger2Content()}
                </div>

                {/* <div className={styles.mask_btn} onClick={startCapture}>
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

                {/* {captureState === ScreenCaptureStates.Idle && (
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
                            onClick={() => {setScreenCaptureActive(true)}}
                        >
                            <BiScreenshot size={18} />
                        </div>
                    </TextOnlyTooltip>
                )} */}

                {/* <div className={`${styles.start_capture_btn} ${!isUserConnected ? styles.not_connected : ''} ${captureState != ScreenCaptureStates.Idle ? styles.active : ''}` } onClick={maskBtnListener}>  
                <BiScreenshot size={18} />
            </div>
             */}

                {(captureState == ScreenCaptureStates.MaskReady ||
                    (captureState == ScreenCaptureStates.Masking &&
                        isMobile)) && (
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
                    <>                    <div
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
                            onClick={() => setScreenCaptureActive(false)}
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
                                onDoubleClick={dblClickListener}
                            >
                                {markers.map((marker) => (
                                    <DraggableItem
                                        key={marker.key}
                                        initialLeft={marker.left}
                                        initialTop={marker.top}
                                        id={marker.key}
                                        focusListener={markerFocusListener}
                                        isDisabled={marker.disabled}
                                        removeListener={removeMarker}
                                    >
                                        {createMarkerContent(marker)}
                                    </DraggableItem>
                                ))}

                                {areaDrawStateRef.current !==
                                    AreaDrawStates.Idle && (
                                    <>
                                        <div
                                            onMouseDown={areaDrawStartListener}
                                            className={
                                                styles.area_draw_backdrop
                                            }
                                        ></div>

                                        {areaDrawStateRef.current ==
                                            AreaDrawStates.Drawing && (
                                            <div
                                                className={styles.rect_marker}
                                                style={getStyleFromRect(
                                                    areaDrawRectRef.current,
                                                    0,
                                                    croppedImageRef.current
                                                        ?.clientWidth,
                                                    croppedImageRef.current
                                                        ?.clientHeight,
                                                )}
                                            ></div>
                                        )}
                                    </>
                                )}

                                <img
                                    src={URL.createObjectURL(imageComp)}
                                    alt='screenshot'
                                    style={getImageOffset()}
                                    className={styles.captured_raw_image}
                                />
                            </div>

                            <span className={styles.image_preview_helper_text}>
                                {' '}
                                Double click/tap to add marker
                            </span>
                            <div className={styles.marker_toolbar}>
                                {getToolbarIcons()}
                                <div className={styles.marker_divider}></div>
                                <div
                                    className={
                                        styles.marker_toolbar_item +
                                        ' ' +
                                        (areaDrawStateRef.current !==
                                        AreaDrawStates.Idle
                                            ? styles.active
                                            : '')
                                    }
                                    onClick={areaDrawBtnListener}
                                >
                                    <BiScreenshot size={18} />
                                </div>
                            </div>
                            <div
                                className={
                                    styles.icon_btn_wrapper +
                                    ' ' +
                                    styles.marker_reset_btn
                                }
                                onClick={() => setMarkers([])}
                            >
                                <RxReset size={18} />
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
                    {isUserConnected && isMobile && sendToChatActive && (
                        <ScreenCaptureMessageInput />
                    )}
                    <div className={styles.btn_section}>
                        {isUserConnected ? (
                            <div
                                className={`${styles.btn_wrapper} ${styles.primary_btn} ${imageComp ? '' : styles.disabled} ${!chatOnDom && !isMobile ? styles.hidden : ''}`}
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
                                    className={`${styles.btn_wrapper} ${styles.primary_btn} ${imageComp ? '' : styles.disabled} ${!chatOnDom && !isMobile ? styles.hidden : ''}`}
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
                                className={`${styles.icon_btn_wrapper} ${imageComp ? '' : styles.disabled}`}
                                onClick={downloadImage}
                            >
                                <RiDownload2Line
                                    size={18}
                                    color='var(--text3)'
                                />
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
                                className={`${styles.icon_btn_wrapper} ${imageComp ? '' : styles.disabled}`}
                                onClick={copyCroppedImageToClipboard}
                            >
                                <BsCopy size={18} color='var(--text3)' />
                            </div>
                        </TextOnlyTooltip>
                    </div>
                </div>
                <div
                    className={`${styles.preview_backdrop} ${previewActive ? styles.active : ''}`}
                ></div>
            </span>
        </>
    );
}
