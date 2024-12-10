/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ReactNode, useEffect, useRef, useState } from 'react';
import { MdDelete, MdDeleteOutline } from 'react-icons/md';
import rotateIcon from '../../../assets/images/icons/rotate-option.svg';
import { DraggableItemControlStates, ScaleTypes } from '../ChatEnums';
import { DomRectIF, PageCoordsDefault, PageCoordsIF } from '../ChatIFs';
import {
    getAngleOfVector,
    getCoordsFromElement,
    getVectorBetweenPoints,
} from '../ChatRenderUtils';
import styles from './DraggableItem.module.css';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface propsIF {
    children: ReactNode;
    id?: string;
    initialTop?: number;
    initialLeft?: number;
    focusListener?: (id: string, focus: boolean) => void;
    isDisabled?: boolean;
    removeListener?: (id: string) => void;
    isShape?: boolean;
}

export default function DraggableItem(props: propsIF) {
    const controlNodes = ['t', 'rt', 'r', 'rb', 'b', 'lb', 'l', 'lt'];
    const colorSwatches = [
        'var(--accent1)',
        'var(--accent2)',
        'var(--accent3)',
        '#f0fc03',
        '#fc034a',
    ];

    const { isDisabled, isShape } = props;

    const showIndicators = false;
    const itemRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const controlPivotRef = useRef<HTMLDivElement>(null);
    const [scaleTriggerNode, setScaleTriggerNode] =
        useState<HTMLDivElement | null>(null);
    const scaleTriggerNodeRef = useRef<HTMLDivElement | null>(null);
    scaleTriggerNodeRef.current = scaleTriggerNode;
    const [rotateTriggerNode, setRotateTriggerNode] =
        useState<HTMLDivElement | null>(null);
    const rotateTriggerNodeRef = useRef<HTMLDivElement | null>(null);
    rotateTriggerNodeRef.current = rotateTriggerNode;
    const minScale = 0.5;
    const maxScale = 7;

    const [selectedColor, setSelectedColor] = useState<string>(
        colorSwatches[0],
    );

    const [parentBounds, setParentBounds] = useState<DomRectIF>();
    const parentBoundsRef = useRef<DomRectIF>();
    parentBoundsRef.current = parentBounds;

    const bindParentBounds = () => {
        if (itemRef.current) {
            const parentBounds =
                itemRef.current.parentElement?.getBoundingClientRect();
            if (parentBounds) {
                setParentBounds({
                    lt: { x: parentBounds.left, y: parentBounds.top },
                    rt: { x: parentBounds.right, y: parentBounds.top },
                    rb: { x: parentBounds.right, y: parentBounds.bottom },
                    lb: { x: parentBounds.left, y: parentBounds.bottom },
                });
            }
        }
    };

    useEffect(() => {
        document.addEventListener('mousemove', mouseMoveListener);
        document.addEventListener('mouseup', mouseUpListener);
        bindParentBounds();
    }, []);

    const [rotate, setRotate] = useState(0);
    const [prevRotation, setPrevRotation] = useState(0);
    const prevRotateRef = useRef(prevRotation);
    prevRotateRef.current = prevRotation;

    const [scale, setScale] = useState<number[]>([1, 1]);
    const [prevScale, setPrevScale] = useState([1, 1]);
    const prevScaleRef = useRef<number[]>(prevScale);
    prevScaleRef.current = prevScale;

    const [controlState, setControlState] = useState(
        DraggableItemControlStates.Idle,
    );
    const controlStateRef = useRef(controlState);
    controlStateRef.current = controlState;
    const [controlStart, setControlStart] = useState<
        PageCoordsIF | undefined
    >();
    const controlStartRef = useRef<PageCoordsIF | undefined>(undefined);
    controlStartRef.current = controlStart;

    const [itemMove, setItemMove] = useState<PageCoordsIF>(PageCoordsDefault);
    const itemMoveRef = useRef<PageCoordsIF>();
    itemMoveRef.current = itemMove;
    const [itemMoveDelta, setItemMoveDelta] =
        useState<PageCoordsIF>(PageCoordsDefault);
    const itemMoveDeltaRef = useRef<PageCoordsIF>();
    itemMoveDeltaRef.current = itemMoveDelta;

    const getControlStateString = () => {
        return DraggableItemControlStates[controlState];
    };

    const isMouseInParent = (point: PageCoordsIF) => {
        if (parentBoundsRef.current) {
            return (
                point.x >= parentBoundsRef.current.lt.x &&
                point.x <= parentBoundsRef.current.rb.x &&
                point.y >= parentBoundsRef.current.lt.y &&
                point.y <= parentBoundsRef.current.rb.y
            );
        }
        return false;
    };

    useEffect(() => {
        console.log('>>>controlState', getControlStateString());
        if (controlStateRef.current === DraggableItemControlStates.Idle) {
            setPrevScale(scale);
            setPrevRotation(rotate);
            props.focusListener?.(props.id || '', false);
        } else {
            props.focusListener?.(props.id || '', true);
        }
    }, [controlState]);

    const mouseUpListener = () => {
        setControlState(DraggableItemControlStates.Idle);
    };

    const getNewScale = (ratio: number[]) => {
        if (prevScaleRef.current) {
            const ret = [
                ratio[0] * prevScaleRef.current[0],
                ratio[1] * prevScaleRef.current[1],
            ];

            if (ret[0] < minScale) ret[0] = minScale;
            if (ret[1] < minScale) ret[1] = minScale;
            if (ret[0] > maxScale) ret[0] = maxScale;
            if (ret[1] > maxScale) ret[1] = maxScale;
            return ret;
        }
        return [1, 1];
    };

    const getScaleAsCoef = () => {
        let ret = 1;
        if (Array.isArray(scale)) {
            ret = scale[0] > scale[1] ? scale[0] : scale[1];
        } else {
            ret = scale;
        }
        return ret;
    };

    const getScaleExpression = () => {
        if (Array.isArray(scale)) {
            return `scale(${scale[0]}, ${scale[1]})`;
        } else {
            return `scale(${scale})`;
        }
    };

    const mouseMoveListener = (e: MouseEvent) => {
        if (isDisabled) return;
        const currentPoint = { x: e.clientX, y: e.clientY };
        if (!isMouseInParent(currentPoint)) {
            setControlState(DraggableItemControlStates.Idle);
            if (itemMoveDeltaRef.current) {
                setItemMove(itemMoveDeltaRef.current);
            }

            return;
        }

        switch (controlStateRef.current) {
            case DraggableItemControlStates.Rotating:
                if (
                    rotateTriggerNodeRef.current &&
                    controlPivotRef.current &&
                    controlStartRef.current
                ) {
                    const pivot = getCoordsFromElement(controlPivotRef.current);
                    const v1 = getVectorBetweenPoints(pivot, currentPoint);
                    const angle1 = getAngleOfVector(v1);

                    // const rotateTriggerNode = getCoordsFromElement(
                    //     rotateTriggerNodeRef.current,
                    // );
                    // const v2 = getVectorBetweenPoints(pivot, rotateTriggerNode);

                    const startPoint = controlStartRef.current;
                    const v2 = getVectorBetweenPoints(pivot, startPoint);
                    const angle2 = getAngleOfVector(v2);

                    const angle = angle2 - angle1;

                    setRotate(angle + prevRotateRef.current || 0);
                    // setRotate(angle);
                }
                break;
            case DraggableItemControlStates.Moving:
                if (!isMouseInParent(currentPoint)) return;
                if (controlStartRef.current && itemMoveRef.current) {
                    const gap = {
                        x: currentPoint.x - controlStartRef.current.x,
                        y: currentPoint.y - controlStartRef.current.y,
                    };
                    setItemMoveDelta({
                        x: gap.x + itemMoveRef.current.x,
                        y: gap.y + itemMoveRef.current.y,
                    });
                }
                break;
            case DraggableItemControlStates.Scaling:
                if (controlPivotRef.current && controlStartRef.current) {
                    const pivot = getCoordsFromElement(controlPivotRef.current);

                    const startPoint = controlStartRef.current;
                    const startPointX = startPoint.x - pivot.x;
                    const startPointY = startPoint.y - pivot.y;

                    const currentPointX = currentPoint.x - pivot.x;
                    const currentPointY = currentPoint.y - pivot.y;

                    const pivotToStartPointLength = Math.sqrt(
                        startPointX ** 2 + startPointY ** 2,
                    );
                    const pivotToCurrentPointLength = Math.sqrt(
                        currentPointX ** 2 + currentPointY ** 2,
                    );

                    const newScale = getNewScale([
                        pivotToCurrentPointLength / pivotToStartPointLength,
                        pivotToCurrentPointLength / pivotToStartPointLength,
                    ]);
                    setScale(newScale);
                }
                break;
            case DraggableItemControlStates.XScaling:
                if (controlPivotRef.current && controlStartRef.current) {
                    const pivot = getCoordsFromElement(controlPivotRef.current);
                    const startPoint = controlStartRef.current;
                    const startPointX = startPoint.x - pivot.x;
                    const currentPointX = currentPoint.x - pivot.x;
                    const newScale = getNewScale([
                        currentPointX / startPointX,
                        1,
                    ]);
                    setScale(newScale);
                }
                break;
            case DraggableItemControlStates.YScaling:
                if (controlPivotRef.current && controlStartRef.current) {
                    const pivot = getCoordsFromElement(controlPivotRef.current);
                    const startPoint = controlStartRef.current;
                    const startPointY = startPoint.y - pivot.y;
                    const currentPointY = currentPoint.y - pivot.y;
                    const newScale = getNewScale([
                        1,
                        currentPointY / startPointY,
                    ]);
                    setScale(newScale);
                }
                break;
        }

        e.preventDefault();
    };

    const startRotate = (e: React.MouseEvent<HTMLDivElement>) => {
        setControlStart({ x: e.clientX, y: e.clientY });
        setControlState(DraggableItemControlStates.Rotating);
        setRotateTriggerNode(e.target as HTMLDivElement);
    };

    const startMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (controlStateRef.current !== DraggableItemControlStates.Idle) return;

        setControlStart({ x: e.clientX, y: e.clientY });
        setControlState(DraggableItemControlStates.Moving);
    };

    const itemMouseDownListener = (e: React.MouseEvent<HTMLDivElement>) => {
        startMove(e);
    };

    const startScale = (
        e: React.MouseEvent<HTMLDivElement>,
        scaleType?: ScaleTypes,
    ) => {
        setControlStart({ x: e.clientX, y: e.clientY });
        console.log('>>>startScale', scaleType);
        if (scaleType !== undefined) {
            setControlState(
                scaleType === ScaleTypes.X
                    ? DraggableItemControlStates.XScaling
                    : DraggableItemControlStates.YScaling,
            );
        } else {
            setControlState(DraggableItemControlStates.Scaling);
        }
        setScaleTriggerNode(e.target as HTMLDivElement);
    };

    const scaleNodeMouseDownListener = (
        e: React.MouseEvent<HTMLDivElement>,
        scaleType?: ScaleTypes,
    ) => {
        startScale(e, scaleType);
        e.stopPropagation();
    };

    const calculateWithRound = (value: number) => {
        return Math.round(value * 4) / 4;
    };

    const rotateNodeMouseDownListener = (
        e: React.MouseEvent<HTMLDivElement>,
    ) => {
        startRotate(e);
        e.stopPropagation();
    };

    const itemMouseUpListener = (e: React.MouseEvent<HTMLDivElement>) => {
        setControlState(DraggableItemControlStates.Idle);
        if (itemMoveDeltaRef.current) {
            setItemMove({
                x: itemMoveDeltaRef.current.x,
                y: itemMoveDeltaRef.current.y,
            });
        }
    };

    const calculateControlNodeStyle = () => {
        return {
            width: calculateWithRound(8 / scale[0]) + 'px',
            height: calculateWithRound(8 / scale[1]) + 'px',
        };
    };

    const getScaleNodeElement = (node: string) => {
        let scaleType: ScaleTypes | undefined = undefined;

        if (isShape) {
            if (node === 't' || node === 'b') scaleType = ScaleTypes.Y;
            if (node === 'l' || node === 'r') scaleType = ScaleTypes.X;
        }
        return (
            <div
                onMouseDown={(e) => scaleNodeMouseDownListener(e, scaleType)}
                className={styles.scale_node + ' ' + styles[node]}
            >
                <div className={styles.scale_node_inner}>
                    <div
                        className={styles.scale_node_indicator}
                        style={calculateControlNodeStyle()}
                    ></div>
                </div>
            </div>
        );
    };

    const getRotateNodeElement = (pos: string) => {
        return (
            <div
                className={styles.rotate_node + ' ' + styles[pos]}
                style={{ cursor: 'url(' + rotateIcon + ') 16 16, auto' }}
                onMouseDown={rotateNodeMouseDownListener}
            ></div>
        );
    };

    const getMainRotateNodeElement = () => {
        if (isShape) return null;
        return (
            <>
                <div
                    className={styles.main_rotate_node}
                    onMouseDown={rotateNodeMouseDownListener}
                    style={{
                        top: -2 / scale[0] + 'rem',
                    }}
                >
                    <div className={styles.main_rotate_node_inner}>
                        <div
                            className={styles.main_rotate_node_indicator}
                            style={calculateControlNodeStyle()}
                        >
                            {/* <FaArrowRotateLeft size={4} /> */}
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        width: calculateWithRound(2 / scale[0]) + 'px',
                        height: 2 / scale[0] + 'rem',
                        top: -2 / scale[0] + 'rem',
                    }}
                    className={styles.main_rotate_node_tail}
                ></div>
            </>
        );
    };

    const getColorSwatchElement = (color: string) => {
        return (
            <div
                className={
                    styles.color_swatch +
                    ' ' +
                    (selectedColor === color ? styles.selected : '')
                }
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
            ></div>
        );
    };

    useEffect(() => {
        if (contentRef.current) {
            const svgs = contentRef.current.querySelectorAll('svg');
            svgs.forEach((svg) => {
                svg.style.fill = selectedColor;
            });

            const areaMakers =
                contentRef.current.querySelectorAll('.area_draw_marker');
            areaMakers.forEach((marker) => {
                (marker as HTMLElement).style.backgroundColor = selectedColor;
            });
        }
    }, [selectedColor]);

    return (
        <>
            <div
                ref={itemRef}
                className={
                    styles.draggable_wrapper +
                    ' ' +
                    (showIndicators ? styles.show_indicators : '') +
                    ' ' +
                    (isDisabled ? styles.disabled : '')
                }
                style={{
                    // transform: `translate(${itemMoveDelta?.x}px, ${itemMoveDelta?.y}px) scale(${scale})`,
                    transform: `translate(${itemMoveDelta?.x}px, ${itemMoveDelta?.y}px) ${getScaleExpression()}`,
                    top: props.initialTop || 0,
                    left: props.initialLeft || 0,
                }}
            >
                <div className={styles.draggable_wrapper_control}>
                    <div
                        className={styles.color_swatches}
                        style={{
                            transform: `translate(-50%, ${140 - 10 * getScaleAsCoef()}%) scale(${1 / scale[0]}, ${1 / scale[1]})`,
                        }}
                    >
                        {colorSwatches.map((color) =>
                            getColorSwatchElement(color),
                        )}
                    </div>
                    {/* {controlNodes.map((node) => getRotateNodeElement(node))} */}
                    {getMainRotateNodeElement()}
                    {controlNodes.map((node) => getScaleNodeElement(node))}
                    <div
                        className={styles.marker_remove_btn}
                        onClick={() => {
                            props.removeListener?.(props.id || '');
                        }}
                        style={{
                            transform: `translateY(-50%) scale(${1 / scale[0]}, ${1 / scale[1]})`,
                            // right: -75 + 4 * scale[0] + '%',
                            right: -1 - 1 / scale[0] + 'rem',
                        }}
                    >
                        <MdDeleteOutline size={24} />
                    </div>

                    <div
                        ref={controlPivotRef}
                        className={styles.scale_pivot}
                        style={calculateControlNodeStyle()}
                    ></div>

                    <div
                        ref={contentRef}
                        className={styles.draggable_wrapper_content}
                        style={{
                            borderWidth: `${calculateWithRound(2 / scale[0])}px`,
                        }}
                        onMouseDown={itemMouseDownListener}
                        onMouseUp={itemMouseUpListener}
                    >
                        <div style={{ transform: `rotate(${rotate}deg)` }}>
                            {props.children}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
