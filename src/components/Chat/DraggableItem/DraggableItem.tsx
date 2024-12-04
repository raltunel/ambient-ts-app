/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FaRotate } from 'react-icons/fa6';
import styles from './DraggableItem.module.css';
import {
    MutableRefObject,
    ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react';
import { DraggableItemControlStates } from '../ChatEnums';
import { DomRectIF, PageCoordsDefault, PageCoordsIF } from '../ChatIFs';
import rotateIcon from '../../../assets/images/icons/rotate-option.svg';
import {
    getAngleOfVector,
    getCoordsFromElement,
    getVectorBetweenPoints,
} from '../ChatRenderUtils';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface propsIF {
    children: ReactNode;
    id?: string;
    initialTop?: number;
    initialLeft?: number;
    focusListener?: (id: string) => void;
    isDisabled?: boolean;
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

    const { isDisabled } = props;

    const itemRef = useRef<HTMLDivElement>(null);
    const showIndicators = false;
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
    const maxScale = 5;

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

    const [scale, setScale] = useState(1);
    const [prevScale, setPrevScale] = useState(1);
    const prevScaleRef = useRef(prevScale);
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
        console.log('>>>>', getControlStateString());
        if (controlStateRef.current === DraggableItemControlStates.Idle) {
            setPrevScale(scale);
            setPrevRotation(rotate);
        }
    }, [controlState]);

    const mouseUpListener = () => {
        setControlState(DraggableItemControlStates.Idle);
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
                    console.log('>>>v1', v1);

                    // const rotateTriggerNode = getCoordsFromElement(
                    //     rotateTriggerNodeRef.current,
                    // );
                    // const v2 = getVectorBetweenPoints(pivot, rotateTriggerNode);

                    const startPoint = controlStartRef.current;
                    const v2 = getVectorBetweenPoints(pivot, startPoint);
                    const angle2 = getAngleOfVector(v2);

                    console.log('>>>v2', v2);

                    const angle = angle2 - angle1;

                    console.log('>>>angle', angle);
                    console.log('>>>.......................');
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
                console.log('>>>scaling');
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

                    let newScale =
                        pivotToCurrentPointLength / pivotToStartPointLength;
                    if (newScale < minScale) newScale = minScale;
                    if (newScale > maxScale) newScale = maxScale;
                    setScale(newScale * prevScaleRef.current || 1);
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
        console.log('>>>itemMouseDownListener');
        startMove(e);
    };

    const startScale = (e: React.MouseEvent<HTMLDivElement>) => {
        setControlStart({ x: e.clientX, y: e.clientY });
        setControlState(DraggableItemControlStates.Scaling);
        setScaleTriggerNode(e.target as HTMLDivElement);
    };

    const scaleNodeMouseDownListener = (
        e: React.MouseEvent<HTMLDivElement>,
    ) => {
        startScale(e);
        e.stopPropagation();
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
            width: parseFloat((8 / scale).toFixed(2)) + 'px',
            height: parseFloat((8 / scale).toFixed(2)) + 'px',
        };
    };

    const getScaleNodeElement = (node: string) => {
        return (
            <div
                onMouseDown={scaleNodeMouseDownListener}
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
                    transform: `translate(${itemMoveDelta?.x}px, ${itemMoveDelta?.y}px) scale(${scale})`,
                    top: props.initialTop || 0,
                    left: props.initialLeft || 0,
                }}
            >
                <div className={styles.draggable_wrapper_control}>
                    <div
                        className={styles.color_swatches}
                        style={{
                            transform: `translate(-50%, -100%) scale(${1 / scale})`,
                        }}
                    >
                        {colorSwatches.map((color) =>
                            getColorSwatchElement(color),
                        )}
                    </div>
                    {controlNodes.map((node) => getRotateNodeElement(node))}
                    {controlNodes.map((node) => getScaleNodeElement(node))}

                    <div
                        ref={controlPivotRef}
                        className={styles.scale_pivot}
                        style={calculateControlNodeStyle()}
                    ></div>

                    <div
                        ref={contentRef}
                        className={styles.draggable_wrapper_content}
                        style={{
                            borderWidth: `${2 / scale}px`,
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
