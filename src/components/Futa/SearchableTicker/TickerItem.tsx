import { Link } from 'react-router-dom';
import styles from './SearchableTicker.module.css';
import {
    getFormattedNumber,
    getTimeRemainingAbbrev,
} from '../../../ambient-utils/dataLayer';
import moment from 'moment';
import { useContext } from 'react';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { AuctionDataIF } from '../../../contexts/AuctionsContext';

export default function TickerItem(props: AuctionDataIF) {
    const { ticker, marketCap, createdAt, status } = props;

    const { nativeTokenUsdPrice } = useContext(ChainDataContext);

    const timeRemaining = getTimeRemainingAbbrev(
        moment(createdAt * 1000).diff(Date.now() - 604800000, 'seconds'),
    );

    const status2 =
        timeRemaining === 'COMPLETE' ? 'var(--accent1)' : 'var(--accent4)';

    const marketCapUsdValue =
        nativeTokenUsdPrice !== undefined && marketCap !== undefined
            ? nativeTokenUsdPrice * marketCap
            : undefined;

    const formattedMarketCap =
        marketCapUsdValue !== undefined
            ? marketCapUsdValue
                ? getFormattedNumber({
                      value: marketCapUsdValue,
                      minFracDigits: 0,
                      maxFracDigits: 0,
                      isUSD: true,
                  })
                : '$0'
            : undefined;

    return (
        <Link
            className={styles.tickerItemContainer}
            to={'/auctions/v1/' + ticker}
        >
            <p>{ticker}</p>
            <p className={styles.marketCap}>{formattedMarketCap}</p>
            <p style={{ color: status ? status : 'var(--text1)' }}>
                {timeRemaining}
            </p>
            <div className={styles.statusContainer}>
                {status2 && (
                    <span
                        className={styles.tickerStatus}
                        style={{ background: status2 ? status2 : '' }}
                    />
                )}
            </div>
        </Link>
    );
}