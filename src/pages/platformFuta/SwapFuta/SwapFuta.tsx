import Seperator from '../../../components/Futa/Seperator/Seperator';
import Divider from '../../../components/Futa/Divider/FutaDivider';
import Comments from '../../../components/Futa/Comments/Comments';
import Swap from '../../platformAmbient/Trade/Swap/Swap';

import Trade from '../../platformAmbient/Trade/Trade';
import styles from './SwapFuta.module.css';

// import logo from '../../../assets/futa/logos/homeLogo.svg';

function SwapFuta() {
    return (
        <section className={styles.mainSection}>
            <div className={styles.chartSection}>
                <Divider count={2} />
                <Trade />
            </div>

            <Seperator dots={100} />

            <div>
                <span id='swapFutaTradeWrapper'>
                    <Divider count={2} />
                    <Swap isOnTradeRoute />
                    <Divider count={2} />
                </span>
                <Comments isForTrade={true} isSmall={true} />
            </div>
        </section>
    );
}

export default SwapFuta;
