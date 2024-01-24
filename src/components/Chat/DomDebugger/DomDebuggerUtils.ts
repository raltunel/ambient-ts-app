import styles from './DomDebugger.module.css';

export const domDebug = (key: string, value: string) => {
    const el = document.getElementById('dom-debugger');
    if (el === null) {
        return; // not in debug mode
    }

    if (key) {
        key = key.trim();
        key = key.replaceAll(' ', '_');
    }

    el.classList.add(styles.active);

    const dbgNode = el?.querySelectorAll('.dbg-' + key)[0];
    if (dbgNode) {
        dbgNode.classList.add(styles.dom_debug_signal);
        setTimeout(() => {
            dbgNode.classList.remove(styles.dom_debug_signal);
        }, 200);

        try {
            const count = parseInt(
                dbgNode.getAttribute('data-changed-count') || '0',
            );
            dbgNode.setAttribute('data-changed-count', (count + 1).toString());
        } catch (err) {
            console.error(err);
        }

        const valueDiv = dbgNode.querySelectorAll(
            '.' + styles.dom_debug_value,
        )[0];

        valueDiv.innerHTML = value;
    } else {
        const debugNodesWrapper = el.querySelectorAll(
            '.' + styles.dom_debug_nodes_wrapper,
        )[0];
        const newNode = document.createElement('div');
        newNode.setAttribute('data-changed-count', '1');
        newNode.setAttribute(
            'data-track-start',
            new Date().getTime().toString(),
        );
        newNode.classList.add(styles.dom_debug_node);
        newNode.classList.add('dbg-' + key);
        debugNodesWrapper?.appendChild(newNode);

        const keyDiv = document.createElement('div');
        keyDiv.classList.add(styles.dom_debug_key);
        keyDiv.innerHTML = key;

        newNode.appendChild(keyDiv);

        const valueDiv = document.createElement('div');
        valueDiv.classList.add(styles.dom_debug_value);
        valueDiv.innerHTML = value;
        newNode.appendChild(valueDiv);
    }
};

export const clearDomDebug = () => {
    const el = document.getElementById('dom-debugger');
    if (el === null) {
        return; // not in debug mode
    }

    const debugNodesWrapper = el.querySelectorAll(
        '.' + styles.dom_debug_nodes_wrapper,
    )[0];
    if (debugNodesWrapper) {
        debugNodesWrapper.innerHTML = '';
    }

    setTimeout(() => {
        el.classList.remove(styles.active);
    }, 100);
};
