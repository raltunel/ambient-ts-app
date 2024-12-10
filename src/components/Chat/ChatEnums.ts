export enum ChatVerificationTypes {
    VerifyWallet,
    VerifyMessages,
}

export enum ScreenCaptureStates {
    Idle,
    MaskReady,
    Masking,
    PreviewReady,
}

export enum ScreenCaptureOverlayTypes {
    LeftTop,
    RightTop,
    RightBottom,
    LeftBottom,
    MaskArea,
}

export enum ScreenCaptureEditStates {
    Idle,
    MaskMoving,
}

export enum DraggableItemControlStates {
    Idle,
    Rotating,
    Moving,
    Scaling,
    XScaling,
    YScaling,
}

export enum AreaDrawStates {
    Idle,
    Ready,
    Drawing,
}

export enum ScaleTypes {
    X,
    Y,
}
