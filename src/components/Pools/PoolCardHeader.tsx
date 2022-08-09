import { SORT_FIELD } from './Pools';
import styles from './PoolCardHeader.module.css';

interface PoolCardHeaderProps {
    arrow: (field: string) => '↑' | '↓' | '';
    sort(newField: string): void;
}

export default function PoolCardHeader(props: PoolCardHeaderProps) {
    const arrow = props.arrow;
    const sort = props.sort;

    return (
        <div className={styles.main_container}>
            <div className={styles.token_logos} />
            <div className={styles.row_container}>
                <p>Pool</p>
                <p className={styles.pCursor} onClick={() => sort(SORT_FIELD.tvlUSD)}>
                    TVL {arrow(SORT_FIELD.tvlUSD)}
                </p>
                <p className={styles.pCursor} onClick={() => sort(SORT_FIELD.volumeUSD)}>
                    Volume 24H {arrow(SORT_FIELD.volumeUSD)}
                </p>
                <p className={styles.pCursor} onClick={() => sort(SORT_FIELD.volumeUSDWeek)}>
                    Volume 7D {arrow(SORT_FIELD.volumeUSDWeek)}
                </p>
                <p className={styles.pCursor} onClick={() => sort(SORT_FIELD.feeTier)}>
                    TVL Change {arrow(SORT_FIELD.feeTier)}
                </p>
                <p>APY</p>
            </div>

            <div></div>
        </div>
    );
}
