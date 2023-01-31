import styles from './SidebarRangePositionsCard.module.css';
import { PositionIF, TokenIF } from '../../../../utils/interfaces/exports';
import { useMemo, SetStateAction, Dispatch } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import { getPositionValue } from './functions/getPositionValue';
import { getSymbols } from './functions/getSymbols';

interface propsIF {
    isDenomBase: boolean;
    position: PositionIF;
    tokenMap: Map<string, TokenIF>;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    tabToSwitchToBasedOnRoute: number;
}

export default function SidebarRangePositionsCard(props: propsIF) {
    const {
        // tokenMap,
        isDenomBase,
        position,
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentPositionActive,
        setIsShowAllEnabled,
        tabToSwitchToBasedOnRoute,
    } = props;

    // const getToken = (addr: string) => tokenMap.get(addr.toLowerCase()) as TokenIF;
    // const baseToken = getToken(position.base + '_' + position.chainId);
    // const quoteToken = getToken(position.quote + '_' + position.chainId);

    const { pathname } = useLocation();

    const linkPath = useMemo(() => {
        let locationSlug = '';
        if (pathname.startsWith('/trade/market') || pathname.startsWith('/account')) {
            locationSlug = '/trade/market';
        } else if (pathname.startsWith('/trade/limit')) {
            locationSlug = '/trade/limit';
        } else if (pathname.startsWith('/trade/range')) {
            locationSlug = '/trade/range';
        } else if (pathname.startsWith('/swap')) {
            locationSlug = '/swap';
        }
        return locationSlug + '/chain=0x5&tokenA=' + position.base + '&tokenB=' + position.quote;
    }, [pathname]);

    const navigate = useNavigate();

    function handleRangePositionClick(pos: PositionIF) {
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        setCurrentPositionActive(pos.positionStorageSlot);
        setIsShowAllEnabled(false);
        navigate(linkPath);
    }

    // const liqTotalUSD =
    //     '$' +
    //     position.positionLiqTotalUSD.toLocaleString(undefined, {
    //         minimumFractionDigits: 2,
    //         maximumFractionDigits: 2,
    //     });

    // human-readable string showing the tokens in the pool
    const pair = getSymbols(isDenomBase, position.baseSymbol, position.quoteSymbol);

    // human-readable string showing total value of the position
    const value = getPositionValue(position.totalValueUSD);

    const rangeStatusStyle =
        position.positionType === 'ambient'
            ? styles.inner_circle_ambient
            : position.isPositionInRange
            ? styles.inner_circle_positive
            : styles.inner_circle_negative;

    const baseTokenCharacter = position?.baseSymbol
        ? getUnicodeCharacter(position?.baseSymbol)
        : '';
    const quoteTokenCharacter = position?.quoteSymbol
        ? getUnicodeCharacter(position?.quoteSymbol)
        : '';

    const rangeDisplay =
        position?.positionType === 'ambient'
            ? 'ambient'
            : isDenomBase
            ? `${quoteTokenCharacter}${position?.lowRangeShortDisplayInBase}-${quoteTokenCharacter}${position?.highRangeShortDisplayInBase}`
            : `${baseTokenCharacter}${position?.lowRangeShortDisplayInQuote}-${baseTokenCharacter}${position?.highRangeShortDisplayInQuote}`;

    return (
        <div className={styles.container} onClick={() => handleRangePositionClick(position)}>
            <div>{pair}</div>
            <div>
                {rangeDisplay}
            <div className={styles.range_status_container}>
                <div className={rangeStatusStyle}>
                    <div className={styles.inner_circle_2}></div>
                </div>
            </div>
            </div>
            <div className={styles.status_display}>{value}</div>
        </div>
    );
}
