import { useContext, useRef, useState } from 'react';
import styles from './CommentInput.module.css';
import { AiOutlineSend } from 'react-icons/ai';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { domDebug } from '../../../Chat/DomDebugger/DomDebuggerUtils';
import CircularProgressBarForComments from '../../../Global/OpenOrderStatus/CircularProgressBarForComments';
import { AppStateContext } from '../../../../contexts/AppStateContext';

interface CommentInputProps {
    commentInputDispatch: (message: string) => void;
    currentUserID: string;
}

export default function CommentInput(props: CommentInputProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [inputLength, setInputLength] = useState(0);
    const _characterLimit = 180;
    const [message, setMessage] = useState('');
    const _onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const inputVal = e.currentTarget.value;
        const pressedKey = e.key;

        if (pressedKey == 'Enter' && inputVal.trim().length > 0) {
            sendAction(inputVal);
            setInputLength(0);
        }
        setMessage(inputVal);
    };

    const shouldShowCircularProgressBar = inputLength > 140;
    const fillPercentage = (inputLength / _characterLimit) * 100;

    const handleInputChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const newMessage = e.currentTarget.value;
        setMessage(newMessage);
        setInputLength(newMessage.length);
    };

    const {
        walletModal: { open: openWalletModal },
    } = useContext(AppStateContext);

    const _onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (
            e.currentTarget.value.length >= _characterLimit &&
            e.key != 'Backspace' &&
            e.key != 'Delete' &&
            e.key != 'ArrowDown' &&
            e.key != 'ArrowLeft' &&
            e.key != 'ArrowUp' &&
            e.key != 'ArrowRight' &&
            !(e.ctrlKey && e.key == 'a')
        ) {
            e.preventDefault();
        }
    };

    const sendAction = (message: string) => {
        props.commentInputDispatch(message);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        setInputLength(0);
    };

    return (
        <div className={styles.comment_input_wrapper}>
            <>
                {props.currentUserID && props.currentUserID.length > 0 ? (
                    <>
                        <input
                            ref={inputRef}
                            placeholder='ENTER MESSAGE...'
                            onKeyUp={_onKeyUp}
                            onKeyDown={_onKeyDown}
                            onInput={handleInputChange}
                            className={`${inputLength > 140 ? styles.about_filled : ''} `}
                        />
                        <AiOutlineSend
                            onClick={() => {
                                sendAction(message);
                            }}
                            size={15}
                        />
                        {shouldShowCircularProgressBar && (
                            <>
                                <div className={styles.progress_wrapper}>
                                    <div className={styles.circular_progress}>
                                        <CircularProgressBarForComments
                                            radius={6}
                                            fillPercentage={fillPercentage}
                                        />
                                    </div>
                                    <span className={styles.character_limit}>
                                        {message.length}/{_characterLimit}
                                    </span>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <div
                            className={styles.connect_to_chat_placeholder}
                            onClick={openWalletModal}
                        >
                            CONNECT WALLET
                        </div>
                    </>
                )}
            </>
        </div>
    );
}