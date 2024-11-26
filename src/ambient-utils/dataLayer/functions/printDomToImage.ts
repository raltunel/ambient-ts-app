import { domToBlob, domToDataUrl, domToCanvas } from 'modern-screenshot';

export const printDomToImage = async (
    node: HTMLElement,
    background?: string,
    additionalStyles?: Partial<CSSStyleDeclaration>,
    height?: number,
    filterNode?: (el: Node) => boolean,
    imgScale?: number,
) => {
    const scale = 2;
    try {
        const blob = await domToBlob(node, {
            height: (height || node.offsetHeight) * scale,
            width: node.offsetWidth * scale,
            backgroundColor: background,
            style: {
                transform: 'scale(' + scale + ')',
                transformOrigin: 'top left',
                width: node.offsetWidth + 'px',
                height: node.offsetHeight + 'px',
                ...additionalStyles,
            },
            filter: filterNode,
            features: {
                copyScrollbar: true,
                restoreScrollPosition: true,
            },
            scale: imgScale || 1,
        });
        return blob;
    } catch (e) {
        console.error('oops, something went wrong!', e);
    }
};

export const printDomToDataUrl = async (
    node: HTMLElement,
    background?: string,
    additionalStyles?: Partial<CSSStyleDeclaration>,
    height?: number,
    filterNode?: (el: Node) => boolean,
    imgScale?: number,
) => {
    const scale = 2;
    try {
        const dataUrl = await domToDataUrl(node, {
            height: (height || node.offsetHeight) * scale,
            width: node.offsetWidth * scale,
            backgroundColor: background,
            style: {
                transform: 'scale(' + scale + ')',
                transformOrigin: 'top left',
                width: node.offsetWidth + 'px',
                height: node.offsetHeight + 'px',
                ...additionalStyles,
            },
            filter: filterNode,
            features: {
                copyScrollbar: true,
                restoreScrollPosition: true,
            },
            scale: imgScale || 1,
            font: {
                cssText: 'Arial, sans-serif',
            },
        });
        return dataUrl;
    } catch (e) {
        console.error('oops, something went wrong!', e);
    }
};

export const printDomToCanvas = async (
    node: HTMLElement,
    background?: string,
    additionalStyles?: Partial<CSSStyleDeclaration>,
    height?: number,
    filterNode?: (el: Node) => boolean,
    imgScale?: number,
) => {
    const scale = 2;
    try {
        const dataUrl = await domToCanvas(node, {
            height: (height || node.offsetHeight) * scale,
            width: node.offsetWidth * scale,
            backgroundColor: background,
            style: {
                transform: 'scale(' + scale + ')',
                transformOrigin: 'top left',
                width: node.offsetWidth + 'px',
                height: node.offsetHeight + 'px',
                ...additionalStyles,
            },
            filter: filterNode,
            features: {
                copyScrollbar: true,
                restoreScrollPosition: true,
            },
            scale: imgScale || 1,
            // font: {
            //     // preferredFormat: '*',
            //     // cssText: 'Arial, sans-serif'
            // },
        });
        return dataUrl;
    } catch (e) {
        console.error('oops, something went wrong!', e);
    }
};
