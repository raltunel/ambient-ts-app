import {
    AiOutlineClose
} from 'react-icons/ai';
import { getScreenshotURL } from '../ChatUtils';
import { Message } from '../Model/MessageModel';
import styles from './ChatImagePreview.module.css';
import { useContext, useRef } from 'react';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import { getMessageCard } from '../ChatRenderUtils';
import ChatBtn from '../ChatBtn/ChatBtn';
import { AppStateContext, UserDataContext } from '../../../contexts';
import { UserSummaryModel } from '../Model/UserSummaryModel';
import { User } from '../Model/UserModel';
/* eslint-disable @typescript-eslint/no-explicit-any */

interface propsIF {
    isActive: boolean;
    focusedMessage: Message | undefined;
    closeListener: () => void;
    replyListener: () => void;
    userMap: Map<string, User | UserSummaryModel> | undefined;
}

export default function ChatImagePreview(props: propsIF) {

    const { isUserConnected } = useContext(UserDataContext);
    const {
        walletModal: { open: openWalletModal },
    } = useContext(AppStateContext);


    const imagePreviewRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(imagePreviewRef, props.closeListener);
    return (
        <>

        <div className={`${styles.image_preview_wrapper} ${props.isActive ? styles.active : ''}`} ref={imagePreviewRef}>
            <div className={styles.image_preview_content}>
            {props.focusedMessage && props.focusedMessage.screenshot && <img src={getScreenshotURL(props.focusedMessage._id)} alt="screenshot" />}



            
            <div className={styles.close_button} onClick={props.closeListener}>
                <AiOutlineClose />
            </div>

            <div className={styles.image_preview_info}> 
                {
                    props.focusedMessage && getMessageCard(props.focusedMessage, 24, props.userMap)
                }

            </div>

            <div className={styles.btn_section}>

                {isUserConnected ?
                (<ChatBtn type='primary' onClick={props.replyListener}>Reply</ChatBtn>)
                :
                (<ChatBtn type='primary' onClick={openWalletModal}>Connect to Reply</ChatBtn>)
            
            }
            <ChatBtn onClick={props.closeListener}>Close</ChatBtn>
            </div>
            </div>
        </div>
        </>
    );
}
