/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FaRotate } from 'react-icons/fa6';
import styles from './DraggableItem.module.css';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { DraggableItemControlStates } from '../ChatEnums';
import { DomRectIF, PageCoordsDefault, PageCoordsIF } from '../ChatIFs';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface propsIF {
    children: ReactNode;
    initialTop?: number;
    initialLeft?: number;
}

export default function DraggableItem(props: propsIF) {
    const itemRef = useRef<HTMLDivElement>(null);
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
        bindParentBounds();
    }, []);

    const [rotate, setRotate] = useState(0);
    const [scale, setScale] = useState(1);

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
    }, [controlState]);

    const mouseMoveListener = (e: MouseEvent) => {
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
                break;
            case DraggableItemControlStates.Moving:
                if (!isMouseInParent(currentPoint)) return;

                console.log(
                    '>>>moving',
                    controlStartRef.current,
                    itemMoveRef.current,
                );
                if (controlStartRef.current && itemMoveRef.current) {
                    const gap = {
                        x: currentPoint.x - controlStartRef.current.x,
                        y: currentPoint.y - controlStartRef.current.y,
                    };
                    console.log('>>>gap', gap);
                    setItemMoveDelta({
                        x: gap.x + itemMoveRef.current.x,
                        y: gap.y + itemMoveRef.current.y,
                    });
                }
                break;
            case DraggableItemControlStates.Scaling:
                break;
        }

        e.preventDefault();
    };

    const startRotate = (e: React.MouseEvent<HTMLDivElement>) => {
        setControlStart({ x: e.clientX, y: e.clientY });
        setControlState(DraggableItemControlStates.Rotating);
    };

    const startMove = (e: React.MouseEvent<HTMLDivElement>) => {
        setControlStart({ x: e.clientX, y: e.clientY });
        setControlState(DraggableItemControlStates.Moving);
    };

    const itemMouseDownListener = (e: React.MouseEvent<HTMLDivElement>) => {
        console.log('>>>itemMouseDownListener');
        startMove(e);
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

    const startScale = (e: React.MouseEvent<HTMLDivElement>) => {
        setControlStart({ x: e.clientX, y: e.clientY });
        setControlState(DraggableItemControlStates.Scaling);
    };

    return (
        <>
            <div
                ref={itemRef}
                className={styles.draggable_wrapper}
                style={{
                    transform: `translate(${itemMoveDelta?.x}px, ${itemMoveDelta?.y}px)`,
                    top: props.initialTop || 0,
                    left: props.initialLeft || 0,
                }}
            >
                <div
                    className={styles.draggable_wrapper_content}
                    style={{ transform: `rotate(${rotate}deg)` }}
                    onMouseDown={itemMouseDownListener}
                    onMouseUp={itemMouseUpListener}
                >
                    <div className={styles.scale_node + ' ' + styles.t}></div>
                    <div className={styles.scale_node + ' ' + styles.rt}></div>
                    <div className={styles.scale_node + ' ' + styles.r}></div>
                    <div className={styles.scale_node + ' ' + styles.rb}></div>
                    <div className={styles.scale_node + ' ' + styles.b}></div>
                    <div className={styles.scale_node + ' ' + styles.lb}></div>
                    <div className={styles.scale_node + ' ' + styles.l}></div>
                    <div className={styles.scale_node + ' ' + styles.lt}></div>
                    {props.children}
                </div>
            </div>
        </>
    );
}
