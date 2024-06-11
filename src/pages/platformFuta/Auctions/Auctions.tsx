import styles from './Auctions.module.css';
import SearchableTicker from '../../../components/Futa/SearchableTicker/SearchableTicker';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import ConsoleComponent from '../../../components/Futa/ConsoleComponent/ConsoleComponent';
import Divider from '../../../components/Futa/Divider/Divider';
import AuctionLoader from '../../../components/Futa/AuctionLoader/AuctionLoader';
import { AuctionsContext } from '../../../contexts/AuctionsContext';
import { useContext } from 'react';

export interface auctionDataIF {
    ticker: string;
    marketCap: number;
    timeRem: string;
}

export default function Auctions() {
    const {
        isLoading,
        setIsLoading,
        // auctions,
    } = useContext(AuctionsContext);

    const desktopScreen = useMediaQuery('(min-width: 1280px)');

    const desktopVersion = (
        <div className={styles.desktopContainer}>
            <ConsoleComponent />
            <div className={styles.auctions_main}>
                <Divider count={2} />
                <h3>AUCTIONS</h3>
                {isLoading ? (
                    <AuctionLoader setIsLoading={setIsLoading} />
                ) : (
                    <SearchableTicker />
                )}
            </div>
        </div>
    );
    if (desktopScreen) return desktopVersion;
    return (
        <div className={styles.auctions_main}>
            <h3>AUCTIONS</h3>
            <SearchableTicker />
        </div>
    );
}
