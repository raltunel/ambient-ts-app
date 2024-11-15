

import styles from './ChatBtn.module.css';
/* eslint-disable @typescript-eslint/no-explicit-any */

interface propsIF {
    title?:string;
    onClick: () => void;
    icon?: React.ReactNode;
    children?: React.ReactNode;
    type?: 'primary' | 'secondary';
}

export default function ChatBtn(props: propsIF) {

    const getClassForType = () => {

        switch(props.type){
            case 'primary':
                return styles.primary_btn;
            default:
                return '';
        }
    }

    return (
        <div
            onClick={props.onClick} 
            className={styles.btn_wrapper + ' ' + getClassForType()}   
        >
            {props.icon && <div className={styles.icon}>{props.icon}</div>}
            {props.title && <div className={styles.title}>{props.title}</div>}
            {props.children && <div className={styles.children}>{props.children}</div>}
        </div>
    );
}
