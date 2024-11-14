import {
    AiOutlineClose
} from 'react-icons/ai';
import { getScreenshotURL } from '../ChatUtils';
import { Message } from '../Model/MessageModel';
import styles from './ChatImagePreview.module.css';
import { useRef } from 'react';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import { getMessageCard } from '../ChatRenderUtils';
/* eslint-disable @typescript-eslint/no-explicit-any */

interface propsIF {
    isActive: boolean;
    focusedMessage: Message | undefined;
    closeListener: () => void;


}

export default function ChatImagePreview(props: propsIF) {
    

    const imagePreviewRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(imagePreviewRef, props.closeListener);


    return (
        <>

        <div className={`${styles.image_preview_wrapper} ${props.isActive ? styles.active : ''}`} ref={imagePreviewRef}>
            {props.focusedMessage && props.focusedMessage.screenshot && <img src={getScreenshotURL(props.focusedMessage._id)} alt="screenshot" />}
            <div className={styles.close_button} onClick={props.closeListener}>
                <AiOutlineClose />
            </div>

            <div className={styles.image_preview_info}> 
                {
                    props.focusedMessage && getMessageCard(props.focusedMessage)
                }

            </div>
        </div>
        </>
    );
}
