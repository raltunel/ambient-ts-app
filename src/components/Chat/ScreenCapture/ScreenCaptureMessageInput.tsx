
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useContext, useEffect, useRef, useState } from 'react';
import styles from './ScreenCaptureMessageInput.module.css';
// import { domToImage } from 'modern-screenshot';
import { BiSend } from 'react-icons/bi';
import { BsCopy } from 'react-icons/bs';
import { RiDownload2Line, RiScreenshot2Line } from 'react-icons/ri';
import { printDomToImage } from '../../../ambient-utils/dataLayer';
import { AppStateContext, UserDataContext } from '../../../contexts';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { TextOnlyTooltip } from '../../Global/StyledTooltip/StyledTooltip';
import { ScreenCaptureOverlayTypes, ScreenCaptureStates } from '../ChatEnums';
import { DomPositionInterface, DomRectIF } from '../ChatIFs';
import { domDebug } from '../DomDebugger/DomDebuggerUtils';

interface propsIF {
    name?: string;
}

export default function ScreenCaptureMessageInput(props: propsIF) {


    const [message, setMessage] = useState('');



    return (
        <>
            <div className={styles.message_input_wrapper}>
                <input type='text' 
                autoFocus
                placeholder='Please enter your message here...' 
                className={styles.message_input} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
        
        </>
    );
}
