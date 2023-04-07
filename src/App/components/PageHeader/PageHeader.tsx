import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimateSharedLayout } from 'framer-motion';
import Account from './Account/Account';
import NetworkSelector from './NetworkSelector/NetworkSelector';
import SwitchNetwork from '../../../components/Global/SwitchNetworkAlert/SwitchNetwork/SwitchNetwork';
import styles from './PageHeader.module.css';
import trimString from '../../../utils/functions/trimString';
import headerLogo from '../../../assets/images/logos/header_logo.svg';
import NotificationCenter from '../../../components/Global/NotificationCenter/NotificationCenter';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { recentPoolsMethodsIF } from '../../hooks/useRecentPools';
import { useAccount, useEnsName } from 'wagmi';
import { ChainSpec } from '@crocswap-libs/sdk';
import { useUrlParams } from '../../../utils/hooks/useUrlParams';
import { TokenIF } from '../../../utils/interfaces/exports';
import { BiGitBranch } from 'react-icons/bi';
import { APP_ENVIRONMENT, BRANCH_NAME } from '../../../constants';

interface HeaderPropsIF {
    isUserLoggedIn: boolean | undefined;
    clickLogout: () => void;
    ensName: string;
    shouldDisplayAccountTab: boolean | undefined;
    chainId: string;
    isChainSupported: boolean;
    openWagmiModalWallet: () => void;
    ethMainnetUsdPrice?: number;
    isTutorialMode: boolean;
    setIsTutorialMode: Dispatch<SetStateAction<boolean>>;
    isMobileSidebarOpen: boolean;
    setIsMobileSidebarOpen: Dispatch<SetStateAction<boolean>>;
    lastBlockNumber: number;
    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;
    isAppOverlayActive: boolean;
    poolPriceDisplay: number | undefined;
    setIsAppOverlayActive: Dispatch<SetStateAction<boolean>>;
    recentPools: recentPoolsMethodsIF;
    switchTheme: () => void;
    theme: string;
    chainData: ChainSpec;
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
}

export default function PageHeader(props: HeaderPropsIF) {
    const {
        ethMainnetUsdPrice,
        chainId,
        isChainSupported,
        openWagmiModalWallet,
        lastBlockNumber,
        isAppOverlayActive,
        setIsAppOverlayActive,
        switchTheme,
        recentPools,
        theme,
        poolPriceDisplay,
        chainData,
        isTutorialMode,
        setIsTutorialMode,
        clickLogout,
    } = props;

    const { address, isConnected } = useAccount();
    const { data: ensName } = useEnsName({ address });

    const { t } = useTranslation();

    // eslint-disable-next-line
    const [mobileNavToggle, setMobileNavToggle] = useState<boolean>(false);

    const accountAddress =
        isConnected && address ? trimString(address, 6, 6) : '';
    const userData = useAppSelector((state) => state.userData);

    const connectedUserNativeToken = userData.tokens.nativeToken;

    const accountProps = {
        nativeBalance:
            connectedUserNativeToken?.combinedBalanceDisplayTruncated,
        accountAddress: accountAddress,
        accountAddressFull: isConnected && address ? address : '',
        ensName: ensName || '',
        isUserLoggedIn: isConnected,
        clickLogout: clickLogout,
        chainId: chainId,
        isAppOverlayActive: isAppOverlayActive,
        setIsAppOverlayActive: setIsAppOverlayActive,
        ethMainnetUsdPrice: ethMainnetUsdPrice,
        switchTheme: switchTheme,
        theme: theme,
        lastBlockNumber: lastBlockNumber,
        chainData: chainData,

        isTutorialMode: isTutorialMode,
        setIsTutorialMode: setIsTutorialMode,
    };

    const connectWagmiButton = (
        <button
            className={styles.authenticate_button}
            onClick={() => openWagmiModalWallet()}
        >
            Connect Wallet
        </button>
    );
    // ----------------------------NAVIGATION FUNCTIONALITY-------------------------------------

    const location = useLocation();

    const tradeData = useAppSelector((state) => state.tradeData);

    const paramsSlug =
        '/chain=' +
        tradeData.chainId +
        '&tokenA=' +
        tradeData.tokenA.address +
        '&tokenB=' +
        tradeData.tokenB.address;

    const baseSymbol = tradeData.baseToken.symbol;
    const quoteSymbol = tradeData.quoteToken.symbol;
    const isDenomBase = tradeData.isDenomBase;
    const baseAddressInRtk = tradeData.baseToken.address;
    const quoteAddressInRtk = tradeData.quoteToken.address;

    useEffect(() => {
        if (baseAddressInRtk && quoteAddressInRtk) {
            recentPools.addPool(tradeData.baseToken, tradeData.quoteToken);
        }
    }, [baseAddressInRtk, quoteAddressInRtk]);

    const poolPriceDisplayWithDenom = poolPriceDisplay
        ? isDenomBase
            ? 1 / poolPriceDisplay
            : poolPriceDisplay
        : undefined;

    const truncatedPoolPrice =
        !poolPriceDisplayWithDenom ||
        poolPriceDisplayWithDenom === Infinity ||
        poolPriceDisplayWithDenom === 0
            ? ''
            : poolPriceDisplayWithDenom < 2
            ? poolPriceDisplayWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : poolPriceDisplayWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    useEffect(() => {
        const path = location.pathname;

        const pathNoLeadingSlash = path.slice(1);

        const isAddressEns = pathNoLeadingSlash?.endsWith('.eth');
        const isAddressHex =
            (pathNoLeadingSlash?.startsWith('0x') &&
                pathNoLeadingSlash?.length == 42) ||
            (pathNoLeadingSlash?.startsWith('account/0x') &&
                pathNoLeadingSlash?.length == 50);

        const isPathValidAddress = path && (isAddressEns || isAddressHex);

        if (pathNoLeadingSlash === 'account') {
            document.title = 'My Account ~ ambient.finance';
        } else if (isPathValidAddress) {
            const pathNoPrefix = pathNoLeadingSlash.replace(/account\//, '');
            const ensNameOrAddressTruncated = isAddressEns
                ? pathNoPrefix.length > 15
                    ? trimString(pathNoPrefix, 10, 3, '…')
                    : pathNoPrefix
                : trimString(pathNoPrefix, 6, 0, '…');
            document.title = `${ensNameOrAddressTruncated} ~ ambient.finance`;
        } else if (
            location.pathname.includes('swap') ||
            location.pathname.includes('trade')
        ) {
            document.title = isDenomBase
                ? `${baseSymbol}/${quoteSymbol} ${truncatedPoolPrice} ~ ambient.finance`
                : `${quoteSymbol}/${baseSymbol} ${truncatedPoolPrice} ~ ambient.finance`;
        } else if (location.pathname.includes('chat')) {
            document.title = 'Chat ~ ambient.finance';
        } else {
            document.title = 'Home ~ ambient.finance';
        }
    }, [baseSymbol, quoteSymbol, isDenomBase, location, truncatedPoolPrice]);

    const tradeDestination = location.pathname.includes('trade/market')
        ? '/trade/market'
        : location.pathname.includes('trade/limit')
        ? '/trade/limit'
        : location.pathname.includes('trade/range')
        ? '/trade/range'
        : location.pathname.includes('trade/edit')
        ? '/trade/edit'
        : '/trade/market';

    const linkData = [
        { title: t('common:homeTitle'), destination: '/', shouldDisplay: true },
        {
            title: t('common:swapTitle'),
            destination: '/swap' + paramsSlug,
            shouldDisplay: true,
        },
        {
            title: t('common:tradeTitle'),
            destination: tradeDestination + paramsSlug,
            shouldDisplay: true,
        },
        {
            title: t('common:analyticsTitle'),
            destination: '/analytics',
            shouldDisplay: false,
        },
        {
            title: t('common:accountTitle'),
            destination: '/account',
            shouldDisplay: isConnected,
        },
    ];

    // Most of this functionality can be achieve by using the NavLink instead of Link and accessing the isActive prop on the
    // Navlink. Access to this is needed outside of the link itself for animation purposes, which is why it is being done in this way.

    const routeDisplay = (
        <AnimateSharedLayout>
            <nav
                className={styles.primary_navigation}
                id='primary_navigation'
                data-visible={mobileNavToggle}
            >
                {linkData.map((link, idx) =>
                    link.shouldDisplay ? (
                        <Link
                            tabIndex={0}
                            className={
                                link.destination.includes('/trade')
                                    ? location.pathname.includes(
                                          tradeDestination,
                                      )
                                        ? styles.active
                                        : styles.inactive
                                    : link.destination.includes('/swap')
                                    ? location.pathname.includes('/swap')
                                        ? styles.active
                                        : styles.inactive
                                    : location.pathname === link.destination
                                    ? styles.active
                                    : styles.inactive
                            }
                            to={link.destination}
                            key={idx}
                        >
                            {link.title}

                            {((link.destination.includes('/trade') &&
                                location.pathname.includes(tradeDestination)) ||
                                (location.pathname.includes('/swap') &&
                                    link.destination.includes('/swap')) ||
                                location.pathname === link.destination) && (
                                <motion.div
                                    className={styles.underline}
                                    layoutId='underline'
                                />
                            )}
                        </Link>
                    ) : null,
                )}
            </nav>
        </AnimateSharedLayout>
    );

    // ----------------------------END OF NAVIGATION FUNCTIONALITY-------------------------------------
    const [showNotificationTable, setShowNotificationTable] = useState(false);

    // TODO (#1436): logo padding is problematic in mobile views
    return (
        <header data-testid={'page-header'} className={styles.primary_header}>
            <Link to='/' className={styles.logo_container}>
                <img src={headerLogo} alt='ambient' />
                <img src='./ambient_logo_1.png' alt='' width='25' />
            </Link>
            {routeDisplay}
            <div>
                <div className={styles.account}>
                    <div className={styles.branch_name}>
                        {APP_ENVIRONMENT !== 'local' &&
                        APP_ENVIRONMENT !== 'production' ? (
                            <div className={styles.branch}>
                                {BRANCH_NAME} <BiGitBranch color='yellow' />
                            </div>
                        ) : null}
                    </div>
                    <NetworkSelector chainId={chainId} />
                    {!isConnected && connectWagmiButton}
                    <Account {...accountProps} />
                    <NotificationCenter
                        showNotificationTable={showNotificationTable}
                        setShowNotificationTable={setShowNotificationTable}
                        lastBlockNumber={lastBlockNumber}
                        chainId={chainId}
                    />
                </div>
            </div>
            {isChainSupported || <SwitchNetwork />}
        </header>
    );
}
