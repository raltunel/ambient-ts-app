/** ***** Import React and Dongles *******/
import { useEffect, useState, useMemo } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

import { useIdleTimer } from 'react-idle-timer';

import {
    resetUserGraphData,
    setPositionsByPool,
    setPositionsByUser,
    setChangesByUser,
    setChangesByPool,
    // addSwapsByUser,
    // addSwapsByPool,
    // CandleData,
    // setCandles,
    // addCandles,
    setLiquidity,
    setPoolVolumeSeries,
    setPoolTvlSeries,
    addPositionsByUser,
    addPositionsByPool,
    setLimitOrdersByUser,
    setLimitOrdersByPool,
    CandlesByPoolAndDuration,
    CandleData,
    // ITransaction,
    addChangesByUser,
    setLastBlock,
    addLimitOrderChangesByUser,
    ITransaction,
    setLeaderboardByPool,
    setDataLoadingStatus,
    resetConnectedUserDataLoadingStatus,
    // ChangesByUser,
} from '../utils/state/graphDataSlice';

import { useAccount, useDisconnect, useProvider, useSigner } from 'wagmi';

import useWebSocket from 'react-use-websocket';
import { sortBaseQuoteTokens, toDisplayPrice, CrocEnv, toDisplayQty } from '@crocswap-libs/sdk';
import { resetReceiptData } from '../utils/state/receiptDataSlice';

import SnackbarComponent from '../components/Global/SnackbarComponent/SnackbarComponent';

/** ***** Import JSX Files *******/
import PageHeader from './components/PageHeader/PageHeader';
import Sidebar from './components/Sidebar/Sidebar';
import PageFooter from './components/PageFooter/PageFooter';
import Home from '../pages/Home/Home';
import Analytics from '../pages/Analytics/Analytics';
import Portfolio from '../pages/Portfolio/Portfolio';
import Limit from '../pages/Trade/Limit/Limit';
import Range from '../pages/Trade/Range/Range';
import Swap from '../pages/Swap/Swap';
import Edit from '../pages/Trade/Edit/Edit';
import TermsOfService from '../pages/TermsOfService/TermsOfService';
import TestPage from '../pages/TestPage/TestPage';
import NotFound from '../pages/NotFound/NotFound';
import Trade from '../pages/Trade/Trade';
import InitPool from '../pages/InitPool/InitPool';
import Reposition from '../pages/Trade/Reposition/Reposition';
import SidebarFooter from '../components/Global/SIdebarFooter/SidebarFooter';

/** * **** Import Local Files *******/
import './App.css';
import { useAppDispatch, useAppSelector } from '../utils/hooks/reduxToolkit';
import { defaultTokens } from '../utils/data/defaultTokens';
import initializeUserLocalStorage from './functions/initializeUserLocalStorage';
import { LimitOrderIF, TokenIF, TokenListIF, PositionIF } from '../utils/interfaces/exports';
import { fetchTokenLists } from './functions/fetchTokenLists';
import {
    resetTokens,
    // resetTradeData,
    setAdvancedHighTick,
    setAdvancedLowTick,
    setAdvancedMode,
    setDenomInBase,
    setDidUserFlipDenom,
    setLimitTick,
    setLiquidityFee,
    setPoolPriceNonDisplay,
    setPrimaryQuantityRange,
    setSimpleRangeWidth,
} from '../utils/state/tradeDataSlice';
import {
    memoizeQuerySpotPrice,
    // querySpotPrice,
} from './functions/querySpotPrice';
import { memoizeFetchAddress } from './functions/fetchAddress';
import {
    memoizeFetchErc20TokenBalances,
    memoizeFetchNativeTokenBalance,
} from './functions/fetchTokenBalances';
import { getNFTs } from './functions/getNFTs';
// import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { useSlippage } from './useSlippage';
import { useFavePools } from './hooks/useFavePools';
import { useAppChain } from './hooks/useAppChain';
import {
    resetTokenData,
    resetUserAddresses,
    setAddressAtLogin,
    setAddressCurrent,
    setEnsNameCurrent,
    setEnsOrAddressTruncated,
    setErc20Tokens,
    setIsLoggedIn,
    setIsUserIdle,
    setNativeToken,
    setRecentTokens,
} from '../utils/state/userDataSlice';
import { checkIsStable } from '../utils/data/stablePairs';
import { useTokenMap } from '../utils/hooks/useTokenMap';
// import { validateChain } from './validateChain';
import { testTokenMap } from '../utils/data/testTokenMap';
import { ZERO_ADDRESS } from '../constants';
import { useModal } from '../components/Global/Modal/useModal';
import { useGlobalModal } from './components/GlobalModal/useGlobalModal';

import { getVolumeSeries } from './functions/getVolumeSeries';
import { getTvlSeries } from './functions/getTvlSeries';
import GlobalModal from './components/GlobalModal/GlobalModal';
import { memoizeTokenPrice } from './functions/fetchTokenPrice';
import ChatPanel from '../components/Chat/ChatPanel';
import { getPositionData } from './functions/getPositionData';
import { getLimitOrderData } from './functions/getLimitOrderData';
// import { getTransactionData } from './functions/getTransactionData';
import { fetchPoolRecentChanges } from './functions/fetchPoolRecentChanges';
import { fetchUserRecentChanges } from './functions/fetchUserRecentChanges';
import { getTransactionData } from './functions/getTransactionData';
import AppOverlay from '../components/Global/AppOverlay/AppOverlay';
import { getLiquidityFee } from './functions/getLiquidityFee';
import Analytics2 from '../pages/Analytics/Analytics2';
import AnalyticsOverview from '../components/Analytics/AnalyticsOverview/AnalyticsOverview';
import TopPools from '../components/Analytics/TopPools/TopPools';
import TrendingPools from '../components/Analytics/TrendingPools/TrendingPools';
import TopRanges from '../components/Analytics/TopRanges/TopRanges';
import TopTokens from '../components/Analytics/TopTokens/TopTokens';
import AnalyticsTransactions from '../components/Analytics/AnalyticsTransactions/AnalyticsTransactions';
import trimString from '../utils/functions/trimString';
import { memoizeFetchContractDetails } from './functions/fetchContractDetails';
import { useToken } from './hooks/useToken';
import { useSidebar } from './hooks/useSidebar';
import useDebounce from './hooks/useDebounce';
import { useRecentTokens } from './hooks/useRecentTokens';
import { useTokenSearch } from './hooks/useTokenSearch';
import WalletModalWagmi from './components/WalletModal/WalletModalWagmi';
import Moralis from 'moralis';
import { usePoolList } from './hooks/usePoolList';
import { useRecentPools } from './hooks/useRecentPools';
import useMediaQuery from '../utils/hooks/useMediaQuery';

// import { memoizeQuerySpotTick } from './functions/querySpotTick';
// import PhishingWarning from '../components/Global/PhisingWarning/PhishingWarning';

const cachedFetchAddress = memoizeFetchAddress();
const cachedFetchNativeTokenBalance = memoizeFetchNativeTokenBalance();
const cachedFetchErc20TokenBalances = memoizeFetchErc20TokenBalances();
const cachedFetchTokenPrice = memoizeTokenPrice();
const cachedQuerySpotPrice = memoizeQuerySpotPrice();
const cachedFetchContractDetails = memoizeFetchContractDetails();
// const cachedQuerySpotTick = memoizeQuerySpotTick();

const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';
const wssGraphCacheServerDomain = 'wss://809821320828123.de:5000';

const shouldCandleSubscriptionsReconnect = true;
const shouldNonCandleSubscriptionsReconnect = true;

const startMoralis = async () => {
    await Moralis.start({
        apiKey: 'xcsYd8HnEjWqQWuHs63gk7Oehgbusa05fGdQnlVPFV9qMyKYPcRlwBDLd1C2SVx5',
        // ...and any other configuration
    });
};

startMoralis();

/** ***** React Function *******/
export default function App() {
    // console.log('rendering app');
    const { disconnect } = useDisconnect();

    const { address: account, isConnected } = useAccount();

    const tradeData = useAppSelector((state) => state.tradeData);
    const location = useLocation();

    // hook to check if token addresses in URL match token addresses in RTK
    const rtkMatchesParams = useMemo(() => {
        // output value, false is default return
        let matching = false;
        // address of token A as held by RTK
        const rtkTokenA = tradeData.tokenA.address;
        // address of token B as held by RTK
        const rtkTokenB = tradeData.tokenB.address;
        // current URL pathway
        const { pathname } = location;
        // make sure app is on a pathway with two URLs in params
        if (pathname.includes('tokenA') && pathname.includes('tokenB')) {
            // function to extract token addresses from URL string (absolute)
            const getAddrFromParams = (token: string) => {
                const idx = pathname.indexOf(token);
                const address = pathname.substring(idx + 7, idx + 49);
                return address;
            };
            // address of token A from URL params
            const addrTokenA = getAddrFromParams('tokenA');
            // address of token B from URL params
            const addrTokenB = getAddrFromParams('tokenB');
            // check if URL param addresses match RTK token addresses
            if (
                addrTokenA.toLowerCase() === rtkTokenA.toLowerCase() &&
                addrTokenB.toLowerCase() === rtkTokenB.toLowerCase()
            ) {
                // if match set return value as true
                matching = true;
            }
        }
        // return output variable (boolean)
        return matching;
        // run hook when URL or token addresses in RTK change
    }, [location, tradeData.tokenA.address, tradeData.tokenB.address]);

    const onIdle = () => {
        console.log('user is idle');
        dispatch(setIsUserIdle(true));
    };

    const onActive = () => {
        // const onActive = (event: Event | undefined) => {
        // console.log({ event });
        console.log('user is active');
        dispatch(setIsUserIdle(false));
    };

    useIdleTimer({
        //    onPrompt,
        onIdle,
        onActive,
        //    onAction,
        timeout: 1000 * 60 * 5, // set user to idle after 5 minutes
        promptTimeout: 0,
        events: [
            'mousemove',
            'keydown',
            'wheel',
            'DOMMouseScroll',
            'mousewheel',
            'mousedown',
            'touchstart',
            'touchmove',
            'MSPointerDown',
            'MSPointerMove',
            'visibilitychange',
        ],
        immediateEvents: [],
        debounce: 0,
        throttle: 0,
        eventsThrottle: 200,
        element: document,
        startOnMount: true,
        startManually: false,
        stopOnIdle: false,
        crossTab: false,
        name: 'idle-timer',
        syncTimers: 0,
        leaderElection: false,
    });

    const userData = useAppSelector((state) => state.userData);

    const isUserLoggedIn = isConnected;
    // const isUserLoggedIn = userData.isLoggedIn;
    const isUserIdle = userData.isUserIdle;

    // allow a local environment variable to be defined in [app_repo]/.env.local to turn off connections to the cache server
    const isServerEnabled =
        process.env.REACT_APP_CACHE_SERVER_IS_ENABLED !== undefined
            ? process.env.REACT_APP_CACHE_SERVER_IS_ENABLED === 'true'
            : true;

    const [loginCheckDelayElapsed, setLoginCheckDelayElapsed] = useState(false);

    useEffect(() => {
        console.log('firing');
        const timer = setTimeout(() => {
            setLoginCheckDelayElapsed(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isConnected || (isConnected === false && loginCheckDelayElapsed)) {
            if (isConnected && userData.isLoggedIn !== isConnected && account) {
                console.log('settting to logged in');
                dispatch(setIsLoggedIn(true));
                dispatch(setAddressAtLogin(account));
            } else if (!isConnected && userData.isLoggedIn !== false) {
                console.log('settting to logged out');

                dispatch(setIsLoggedIn(false));
                dispatch(resetUserAddresses());
            }
        }
    }, [loginCheckDelayElapsed, isConnected]);

    // this is another case where true vs false is an arbitrary distinction
    const [activeTokenListsChanged, indicateActiveTokenListsChanged] = useState(false);

    const tokensOnActiveLists = useTokenMap(
        activeTokenListsChanged,
        JSON.parse(localStorage.getItem('user') as string)?.activeTokenLists ?? [
            '/ambient-token-list.json',
        ],
    );

    const [candleData, setCandleData] = useState<CandlesByPoolAndDuration | undefined>();
    const [isCandleSelected, setIsCandleSelected] = useState<boolean | undefined>();

    // custom hook to manage chain the app is using
    // `chainData` is data on the current chain retrieved from our SDK
    // `isChainSupported` is a boolean indicating whether the chain is supported by Ambient
    // `switchChain` is a function to switch to a different chain
    // `'0x5'` is the chain the app should be on by default
    const [chainData, isChainSupported] = useAppChain('0x5', isUserLoggedIn);

    const [
        localTokens,
        verifyToken,
        getAllTokens,
        getAmbientTokens,
        getTokensOnChain,
        getTokenByAddress,
        getTokensByName,
        acknowledgeToken,
    ] = useToken(chainData.chainId);
    false && localTokens;
    false && getAllTokens;
    false && getTokensOnChain;

    const { addRecentPool, getRecentPools } = useRecentPools(
        chainData.chainId,
        tradeData.tokenA.address,
        tradeData.tokenB.address,
        verifyToken,
    );

    const [tokenPairLocal, setTokenPairLocal] = useState<string[] | null>(null);

    const [isShowAllEnabled, setIsShowAllEnabled] = useState(true);
    const [currentTxActiveInTransactions, setCurrentTxActiveInTransactions] = useState('');
    const [currentPositionActive, setCurrentPositionActive] = useState('');
    const [expandTradeTable, setExpandTradeTable] = useState(false);
    const [userIsOnline, setUserIsOnline] = useState(navigator.onLine);

    const [ethMainnetUsdPrice, setEthMainnetUsdPrice] = useState<number | undefined>();

    window.ononline = () => setUserIsOnline(true);
    window.onoffline = () => setUserIsOnline(false);

    const [crocEnv, setCrocEnv] = useState<CrocEnv | undefined>();

    const {
        data: signer,
        //  isError, isLoading
    } = useSigner();

    const provider = useProvider();

    const isInitialized = !!provider;

    useEffect(() => {
        (async () => {
            if (!provider && !signer) {
                return;
            } else {
                console.log('setting new crocEnv');
                setCrocEnv(new CrocEnv(signer?.provider || provider));
            }
        })();
    }, [provider, signer]);

    useEffect(() => {
        if (provider) {
            (async () => {
                console.log('fetching WETH price from mainnet');
                const mainnetEthPrice = await cachedFetchTokenPrice(
                    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                    '0x1',
                );
                const usdPrice = mainnetEthPrice?.usdPrice;
                setEthMainnetUsdPrice(usdPrice);
            })();
        }
    }, [provider]);

    // function exposeProviderUrl(provider?: ethers.providers.Provider): string {
    //     if (provider && 'connection' in provider) {
    //         return (provider as ethers.providers.WebSocketProvider).connection?.url;
    //     } else {
    //         return '';
    //     }
    // }

    // function exposeProviderChain(provider?: ethers.providers.Provider): number {
    //     if (provider && 'network' in provider) {
    //         return (provider as ethers.providers.WebSocketProvider).network?.chainId;
    //     } else {
    //         return -1;
    //     }
    // }

    // const [metamaskLocked, setMetamaskLocked] = useState<boolean>(true);
    // useEffect(() => {
    //     try {
    //         // console.log('Init provider' + provider);
    //         const url = exposeProviderUrl(provider);
    //         const onChain = exposeProviderChain(provider) === parseInt(chainData.chainId);

    //         // console.log('Exposed URL ' + url);

    //         if (isAuthenticated) {
    //             if (provider && url === 'metamask' && !metamaskLocked && onChain) {
    //                 return;
    //             } else if (provider && url === 'metamask' && metamaskLocked) {
    //                 clickLogout();
    //             } else if (
    //                 window.ethereum &&
    //                 !metamaskLocked &&
    //                 validateChain(window.ethereum.chainId)
    //             ) {
    //                 console.log('use metamask as provider');
    //                 // console.log(window.ethereum.chainId)
    //                 const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    //                 setProvider(metamaskProvider);
    //             }
    //         } else if (!provider || !onChain) {
    //             // console.log('use infura as provider');
    //             const chainSpec = lookupChain(chainData.chainId);
    //             const url = chainSpec.nodeUrl;
    //             // const url = chainSpec.wsUrl ? chainSpec.wsUrl : chainSpec.nodeUrl;
    //             console.log('setting up new provider: ' + url);
    //             setProvider(new ethers.providers.JsonRpcProvider(url));
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }, [isUserLoggedIn, chainData.chainId, metamaskLocked]);

    useEffect(() => {
        console.log('firing');
        dispatch(resetTokens(chainData.chainId));
        dispatch(resetTokenData());
    }, [chainData.chainId]);

    const poolList = usePoolList(chainData.chainId, chainData.poolIndex);

    useEffect(() => {
        console.log('firing');
        dispatch(resetTokenData());
        if (account) {
            dispatch(setAddressCurrent(account));
        } else {
            dispatch(setAddressCurrent(undefined));
        }
    }, [isUserLoggedIn, account]);

    const dispatch = useAppDispatch();

    // current configurations of trade as specified by the user
    const currentPoolInfo = tradeData;

    // tokens specifically imported by the end user
    const [importedTokens, setImportedTokens] = useState<TokenIF[]>(defaultTokens);
    // all tokens from active token lists
    const [searchableTokens, setSearchableTokens] = useState<TokenIF[]>(defaultTokens);

    const [needTokenLists, setNeedTokenLists] = useState(true);

    // trigger a useEffect() which needs to run when new token lists are received
    // true vs false is an arbitrary distinction here
    const [tokenListsReceived, indicateTokenListsReceived] = useState(false);

    if (needTokenLists) {
        console.log('firing');
        setNeedTokenLists(false);
        fetchTokenLists(tokenListsReceived, indicateTokenListsReceived);
    }

    useEffect(() => {
        console.log('initializing local storage');
        initializeUserLocalStorage();
        getImportedTokens();
    }, [tokenListsReceived]);

    useEffect(() => {
        console.log(chainData.nodeUrl);
        fetch(chainData.nodeUrl2, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_blockNumber',
                params: [],
                id: 5,
            }),
        })
            .then((response) => response?.json())

            .then((json) => {
                if (lastBlockNumber !== parseInt(json?.result)) {
                    setLastBlockNumber(parseInt(json?.result));
                    dispatch(setLastBlock(parseInt(json?.result)));
                }
            })
            .catch(console.log);
    }, []);

    const { sendMessage: send, lastMessage: lastNewHeadMessage } = useWebSocket(
        chainData.wsUrl || '',
        {
            onOpen: () => {
                // console.log('infura newHeads subscription opened');
                send('{"jsonrpc":"2.0","method":"eth_subscribe","params":["newHeads"],"id":5}');
            },
            onClose: (event: CloseEvent) => {
                false && console.log('infura newHeads subscription closed');
                false && console.log({ event });
            },
            shouldReconnect: () => shouldNonCandleSubscriptionsReconnect,
        },
    );

    useEffect(() => {
        if (lastNewHeadMessage !== null) {
            if (lastNewHeadMessage?.data) {
                const lastMessageData = JSON.parse(lastNewHeadMessage?.data);
                if (lastMessageData) {
                    const lastBlockNumberHex = lastMessageData.params?.result?.number;
                    if (lastBlockNumberHex) {
                        const newBlockNum = parseInt(lastBlockNumberHex);
                        if (lastBlockNumber !== newBlockNum) {
                            console.log('setting new block number');
                            setLastBlockNumber(parseInt(lastBlockNumberHex));
                            dispatch(setLastBlock(parseInt(lastBlockNumberHex)));
                        }
                    }
                }
            }
        }
    }, [lastNewHeadMessage]);

    // hook holding values and setter functions for slippage
    // holds stable and volatile values for swap and mint transactions
    const [swapSlippage, mintSlippage] = useSlippage();

    const [favePools, addPoolToFaves, removePoolFromFaves] = useFavePools();

    const isPairStable = useMemo(
        () => checkIsStable(tradeData.tokenA.address, tradeData.tokenB.address, chainData.chainId),
        [tradeData.tokenA.address, tradeData.tokenB.address, chainData.chainId],
    );

    // update local state with searchable tokens once after initial load of app
    useEffect(() => {
        console.log('setting searchable tokens');
        // pull activeTokenLists from local storage and parse
        // do we need to add gatekeeping in case there is not a valid value?
        const { activeTokenLists } = JSON.parse(localStorage.getItem('user') as string);
        // update local state with array of all tokens from searchable lists
        setSearchableTokens(getTokensFromLists(activeTokenLists));
        // TODO:  this hook runs once after the initial load of the app, we may need to add
        // TODO:  additional triggers for DOM interactions
    }, [tokenListsReceived, activeTokenListsChanged]);

    function getTokensFromLists(tokenListURIs: Array<string>) {
        // retrieve and parse all token lists held in local storage
        const tokensFromLists = localStorage.allTokenLists
            ? JSON.parse(localStorage.getItem('allTokenLists') as string)
                  // remove all lists with URIs not included in the URIs array passed as argument
                  .filter((tokenList: TokenListIF) => tokenListURIs.includes(tokenList.uri ?? ''))
                  // extract array of tokens from active lists and flatten into single array
                  .flatMap((tokenList: TokenListIF) => tokenList.tokens)
            : defaultTokens;
        // return array of all tokens from lists as specified by token list URI
        return tokensFromLists;
    }

    // function to return array of all tokens on lists as specified by URI
    function getImportedTokens() {
        // see if there's a user object in local storage
        if (localStorage.user) {
            // if user object exists, pull it
            const user = JSON.parse(localStorage.getItem('user') as string);
            // if imported tokens are listed, hold in local state
            user.tokens && setImportedTokens(user.tokens);
        }
    }
    const [sidebarManuallySet, setSidebarManuallySet] = useState<boolean>(false);
    const [showSidebar, setShowSidebar] = useState<boolean>(false);

    const [lastBlockNumber, setLastBlockNumber] = useState<number>(0);

    const receiptData = useAppSelector((state) => state.receiptData);

    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    const lastReceipt =
        receiptData?.sessionReceipts.length > 0
            ? JSON.parse(receiptData.sessionReceipts[receiptData.sessionReceipts.length - 1])
            : null;

    const isLastReceiptSuccess = lastReceipt?.status === 1;

    const snackMessage = lastReceipt
        ? isLastReceiptSuccess
            ? `Transaction ${lastReceipt.transactionHash} successfully completed`
            : `Transaction ${lastReceipt.transactionHash} failed`
        : '';

    const snackbarContent = (
        <SnackbarComponent
            severity={isLastReceiptSuccess ? 'info' : 'warning'}
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {snackMessage}
        </SnackbarComponent>
    );

    useEffect(() => {
        console.log('firing');
        if (lastReceipt) {
            setOpenSnackbar(true);
        }
    }, [JSON.stringify(lastReceipt)]);

    // useEffect(() => {
    //     (async () => {
    //         if (window.ethereum) {
    //             // console.log('requesting eth_accounts');
    //             const metamaskAccounts = await window.ethereum.request({ method: 'eth_accounts' });
    //             if (metamaskAccounts?.length > 0) {
    //                 setMetamaskLocked(false);
    //             } else {
    //                 setMetamaskLocked(true);
    //             }
    //         }
    //     })();
    // }, [window.ethereum, account]);

    // const [ensName, setEnsName] = useState('');
    const ensName = userData.ensNameCurrent || '';

    // check for ENS name account changes
    useEffect(() => {
        (async () => {
            console.log('firing');
            if (isUserLoggedIn && account && provider) {
                try {
                    const ensName = await cachedFetchAddress(provider, account, chainData.chainId);
                    if (ensName) {
                        // setEnsName(ensName);
                        dispatch(setEnsNameCurrent(ensName));
                        if (ensName.length > 15) {
                            dispatch(setEnsOrAddressTruncated(trimString(ensName, 10, 3, '…')));
                        } else {
                            dispatch(setEnsOrAddressTruncated(ensName));
                        }
                    } else {
                        dispatch(setEnsNameCurrent(undefined));
                        // setEnsName('');

                        dispatch(setEnsOrAddressTruncated(trimString(account, 5, 3, '…')));
                    }
                } catch (error) {
                    dispatch(setEnsNameCurrent(undefined));
                    // setEnsName('');
                    dispatch(setEnsOrAddressTruncated(trimString(account, 5, 3, '…')));
                }
            } else if (!isUserLoggedIn || !account) {
                dispatch(setEnsOrAddressTruncated(undefined));
            }
        })();
    }, [isUserLoggedIn, account, chainData.chainId]);

    const everyEigthBlock = useMemo(() => Math.floor(lastBlockNumber / 8), [lastBlockNumber]);
    // check for token balances every eight blocks

    const addTokenInfo = (token: TokenIF): TokenIF => {
        const newToken = { ...token };
        const tokenAddress = token.address;
        const key = tokenAddress.toLowerCase() + '_0x' + token.chainId.toString(16);

        const tokenName = tokensOnActiveLists.get(key)?.name;

        const tokenLogoURI = tokensOnActiveLists.get(key)?.logoURI;

        newToken.name = tokenName ?? '';

        newToken.logoURI = tokenLogoURI ?? '';

        return newToken;
    };

    useEffect(() => {
        (async () => {
            console.log('fetching native token and erc20 token balances');
            if (crocEnv && isUserLoggedIn && account && chainData.chainId) {
                try {
                    // console.log('fetching native token balance');
                    const newNativeToken: TokenIF = await cachedFetchNativeTokenBalance(
                        account,
                        chainData.chainId,
                        everyEigthBlock,
                        crocEnv,
                    );

                    dispatch(setNativeToken(newNativeToken));
                } catch (error) {
                    console.log({ error });
                }
                try {
                    const erc20Results: TokenIF[] = await cachedFetchErc20TokenBalances(
                        account,
                        chainData.chainId,
                        everyEigthBlock,
                        crocEnv,
                    );
                    const erc20TokensWithLogos = erc20Results.map((token) => addTokenInfo(token));

                    dispatch(setErc20Tokens(erc20TokensWithLogos));
                } catch (error) {
                    console.log({ error });
                }
            }
        })();
    }, [
        crocEnv,
        isUserLoggedIn,
        account,
        chainData.chainId,
        everyEigthBlock,
        // JSON.stringify(connectedUserTokens),
    ]);

    const [baseTokenAddress, setBaseTokenAddress] = useState<string>('');
    const [quoteTokenAddress, setQuoteTokenAddress] = useState<string>('');

    const [mainnetBaseTokenAddress, setMainnetBaseTokenAddress] = useState<string>('');
    const [mainnetQuoteTokenAddress, setMainnetQuoteTokenAddress] = useState<string>('');

    const [baseTokenDecimals, setBaseTokenDecimals] = useState<number>(0);
    const [quoteTokenDecimals, setQuoteTokenDecimals] = useState<number>(0);

    const [isTokenABase, setIsTokenABase] = useState<boolean>(false);

    const [ambientApy, setAmbientApy] = useState<number | undefined>();

    // TODO:  @Emily useMemo() this value
    const tokenPair = {
        dataTokenA: tradeData.tokenA,
        dataTokenB: tradeData.tokenB,
    };

    const pool = useMemo(
        () => crocEnv?.pool(tradeData.baseToken.address, tradeData.quoteToken.address),
        [crocEnv, tradeData.baseToken.address, tradeData.quoteToken.address],
    );

    // value for whether a pool exists on current chain and token pair
    // ... true => pool exists
    // ... false => pool does not exist
    // ... null => no crocEnv to check if pool exists
    const [poolExists, setPoolExists] = useState<boolean | undefined>();
    useEffect(() => console.log({ poolExists }), [poolExists]);

    // hook to update `poolExists` when crocEnv changes
    useEffect(() => {
        console.log('firing');
        setPoolExists(undefined);
        if (crocEnv && tokenPairLocal) {
            if (tokenPairLocal[0].toLowerCase() === tokenPairLocal[1].toLowerCase()) return;
            // token pair has an initialized pool on-chain
            // returns a promise object
            const doesPoolExist = crocEnv
                // TODO: make this function pill addresses directly from URL params
                .pool(tokenPairLocal[0], tokenPairLocal[1])
                .isInit();
            // resolve the promise object to see if pool exists
            Promise.resolve(doesPoolExist)
                // track whether pool exists on state (can be undefined)
                .then((res) => setPoolExists(res));
        }
        // run every time crocEnv updates
        // this indirectly tracks a new chain being used
    }, [crocEnv, tokenPairLocal]);

    const tokenPairStringified = useMemo(() => JSON.stringify(tokenPair), [tokenPair]);

    const [resetLimitTick, setResetLimitTick] = useState(false);
    useEffect(() => {
        console.log('resetting limit tick');
        dispatch(setPoolPriceNonDisplay(0));

        dispatch(setLimitTick(0));
        // }, [JSON.stringify({ base: baseTokenAddress, quote: quoteTokenAddress })]);
    }, [resetLimitTick]);

    useEffect(() => {
        dispatch(setLimitTick(0));
        dispatch(setPrimaryQuantityRange(''));
        dispatch(setSimpleRangeWidth(10));
        dispatch(setAdvancedMode(false));
        setPoolPriceDisplay(undefined);
        dispatch(setDidUserFlipDenom(false)); // reset so a new token pair is re-evaluated for price > 1
        const sliderInput = document.getElementById('input-slider-range') as HTMLInputElement;
        if (sliderInput) sliderInput.value = '10';
    }, [JSON.stringify({ base: baseTokenAddress, quote: quoteTokenAddress })]);

    useEffect(() => {
        (async () => {
            if (isServerEnabled && baseTokenAddress && quoteTokenAddress) {
                const poolAmbientApyCacheEndpoint =
                    'https://809821320828123.de:5000' + '/pool_ambient_apy_cached?';

                fetch(
                    poolAmbientApyCacheEndpoint +
                        new URLSearchParams({
                            base: baseTokenAddress.toLowerCase(),
                            quote: quoteTokenAddress.toLowerCase(),
                            poolIdx: chainData.poolIndex.toString(),
                            chainId: chainData.chainId,
                            concise: 'true',
                            lookback: '604800',
                            // n: 10 // positive integer	(Optional.) If n and page are provided, query returns a page of results with at most n entries.
                            // page: 0 // nonnegative integer	(Optional.) If n and page are provided, query returns the page-th page of results. Page numbers are 0-indexed.
                        }),
                )
                    .then((response) => response?.json())
                    .then((json) => {
                        const ambientApy = json?.data?.apy;
                        setAmbientApy(ambientApy);
                    });
            }
        })();
    }, [isServerEnabled, JSON.stringify({ base: baseTokenAddress, quote: quoteTokenAddress })]);

    // useEffect that runs when token pair changes
    useEffect(() => {
        console.log('firing');
        if (rtkMatchesParams) {
            if (provider) {
                (async () => {
                    const contractDetails = await cachedFetchContractDetails(
                        provider,
                        tradeData.tokenB.address,
                        chainData.chainId,
                    );
                    console.log({ contractDetails });
                })();
            }

            // console.log(tradeData.tokenA.address);
            // console.log(tradeData.tokenB.address);

            // reset rtk values for user specified range in ticks
            console.log('resetting advanced ticks');
            dispatch(setAdvancedLowTick(0));
            dispatch(setAdvancedHighTick(0));

            const tokenAAddress = tokenPair?.dataTokenA?.address;
            const tokenBAddress = tokenPair?.dataTokenB?.address;

            if (tokenAAddress && tokenBAddress) {
                const sortedTokens = sortBaseQuoteTokens(tokenAAddress, tokenBAddress);
                const tokenAMainnetEquivalent =
                    tokenAAddress === ZERO_ADDRESS
                        ? tokenAAddress
                        : testTokenMap
                              .get(tokenAAddress.toLowerCase() + '_' + chainData.chainId)
                              ?.split('_')[0];
                const tokenBMainnetEquivalent =
                    tokenBAddress === ZERO_ADDRESS
                        ? tokenBAddress
                        : testTokenMap
                              .get(tokenBAddress.toLowerCase() + '_' + chainData.chainId)
                              ?.split('_')[0];

                if (tokenAMainnetEquivalent && tokenBMainnetEquivalent) {
                    const sortedMainnetTokens = sortBaseQuoteTokens(
                        tokenAMainnetEquivalent,
                        tokenBMainnetEquivalent,
                    );

                    setMainnetBaseTokenAddress(sortedMainnetTokens[0]);
                    setMainnetQuoteTokenAddress(sortedMainnetTokens[1]);
                } else {
                    setMainnetBaseTokenAddress('');
                    setMainnetQuoteTokenAddress('');
                }

                setBaseTokenAddress(sortedTokens[0]);
                setQuoteTokenAddress(sortedTokens[1]);
                if (tokenPair.dataTokenA.address === sortedTokens[0]) {
                    setIsTokenABase(true);
                    setBaseTokenDecimals(tokenPair.dataTokenA.decimals);
                    setQuoteTokenDecimals(tokenPair.dataTokenB.decimals);
                } else {
                    setIsTokenABase(false);
                    setBaseTokenDecimals(tokenPair.dataTokenB.decimals);
                    setQuoteTokenDecimals(tokenPair.dataTokenA.decimals);
                }

                // retrieve pool liquidity provider fee

                if (isServerEnabled && httpGraphCacheServerDomain) {
                    getLiquidityFee(
                        sortedTokens[0],
                        sortedTokens[1],
                        chainData.poolIndex,
                        chainData.chainId,
                    )
                        .then((liquidityFeeNum) => {
                            if (liquidityFeeNum) dispatch(setLiquidityFee(liquidityFeeNum));
                        })
                        .catch(console.log);

                    // retrieve pool TVL series
                    getTvlSeries(
                        sortedTokens[0],
                        sortedTokens[1],
                        chainData.poolIndex,
                        chainData.chainId,
                        600, // 10 minute resolution
                    )
                        .then((tvlSeries) => {
                            if (
                                tvlSeries &&
                                tvlSeries.base &&
                                tvlSeries.quote &&
                                tvlSeries.poolIdx &&
                                tvlSeries.seriesData
                            )
                                dispatch(
                                    setPoolTvlSeries({
                                        dataReceived: true,
                                        pools: [
                                            {
                                                dataReceived: true,
                                                pool: {
                                                    base: tvlSeries.base,
                                                    quote: tvlSeries.quote,
                                                    poolIdx: tvlSeries.poolIdx,
                                                    chainId: chainData.chainId,
                                                },
                                                tvlData: tvlSeries,
                                            },
                                        ],
                                    }),
                                );
                        })
                        .catch(console.log);

                    // retrieve pool volume series
                    getVolumeSeries(
                        sortedTokens[0],
                        sortedTokens[1],
                        chainData.poolIndex,
                        chainData.chainId,
                        600, // 10 minute resolution
                    )
                        .then((volumeSeries) => {
                            if (
                                volumeSeries &&
                                volumeSeries.base &&
                                volumeSeries.quote &&
                                volumeSeries.poolIdx &&
                                volumeSeries.seriesData
                            )
                                dispatch(
                                    setPoolVolumeSeries({
                                        dataReceived: true,
                                        pools: [
                                            {
                                                dataReceived: true,
                                                pool: {
                                                    base: volumeSeries.base,
                                                    quote: volumeSeries.quote,
                                                    poolIdx: volumeSeries.poolIdx,
                                                    chainId: chainData.chainId,
                                                },
                                                volumeData: volumeSeries,
                                            },
                                        ],
                                    }),
                                );
                        })
                        .catch(console.log);

                    // retrieve pool liquidity

                    const poolLiquidityCacheEndpoint =
                        httpGraphCacheServerDomain + '/pool_liquidity_distribution?';

                    fetch(
                        poolLiquidityCacheEndpoint +
                            new URLSearchParams({
                                base: sortedTokens[0].toLowerCase(),
                                quote: sortedTokens[1].toLowerCase(),
                                poolIdx: chainData.poolIndex.toString(),
                                chainId: chainData.chainId,
                                concise: 'true',
                                // n: 10 // positive integer	(Optional.) If n and page are provided, query returns a page of results with at most n entries.
                                // page: 0 // nonnegative integer	(Optional.) If n and page are provided, query returns the page-th page of results. Page numbers are 0-indexed.
                            }),
                    )
                        .then((response) => response?.json())
                        .then((json) => {
                            const poolLiquidity = json?.data;

                            if (poolLiquidity) {
                                dispatch(
                                    setLiquidity({
                                        pool: {
                                            baseAddress: sortedTokens[0].toLowerCase(),
                                            quoteAddress: sortedTokens[1].toLowerCase(),
                                            poolIdx: chainData.poolIndex,
                                            chainId: chainData.chainId,
                                        },
                                        liquidityData: poolLiquidity,
                                    }),
                                );
                            }
                        })
                        .catch(console.log);

                    if (crocEnv) {
                        // retrieve pool_positions

                        // console.log('fetching pool positions');
                        const allPositionsCacheEndpoint =
                            httpGraphCacheServerDomain + '/pool_positions?';
                        fetch(
                            allPositionsCacheEndpoint +
                                new URLSearchParams({
                                    base: sortedTokens[0].toLowerCase(),
                                    quote: sortedTokens[1].toLowerCase(),
                                    poolIdx: chainData.poolIndex.toString(),
                                    chainId: chainData.chainId,
                                    annotate: 'true', // token quantities
                                    ensResolution: 'true',
                                    omitEmpty: 'true',
                                    omitKnockout: 'true',
                                    addValue: 'true',
                                }),
                        )
                            .then((response) => response.json())
                            .then((json) => {
                                const poolPositions = json.data;
                                dispatch(
                                    setDataLoadingStatus({
                                        datasetName: 'poolRangeData',
                                        loadingStatus: false,
                                    }),
                                );

                                if (poolPositions && crocEnv) {
                                    // console.log({ poolPositions });
                                    Promise.all(
                                        poolPositions.map((position: PositionIF) => {
                                            return getPositionData(
                                                position,
                                                searchableTokens,
                                                crocEnv,
                                                chainData.chainId,
                                                lastBlockNumber,
                                            );
                                        }),
                                    )
                                        .then((updatedPositions) => {
                                            // console.log({ updatedPositions });
                                            if (
                                                JSON.stringify(
                                                    graphData.positionsByUser.positions,
                                                ) !== JSON.stringify(updatedPositions)
                                            ) {
                                                dispatch(
                                                    setPositionsByPool({
                                                        dataReceived: true,
                                                        positions: updatedPositions,
                                                    }),
                                                );
                                            }
                                        })
                                        .catch(console.log);
                                }
                            })
                            .catch(console.log);

                        // retrieve positions for leaderboard
                        // console.log('fetching leaderboard positions');
                        const poolPositionsCacheEndpoint =
                            httpGraphCacheServerDomain + '/annotated_pool_positions?';
                        fetch(
                            poolPositionsCacheEndpoint +
                                new URLSearchParams({
                                    base: sortedTokens[0].toLowerCase(),
                                    quote: sortedTokens[1].toLowerCase(),
                                    poolIdx: chainData.poolIndex.toString(),
                                    chainId: chainData.chainId,
                                    ensResolution: 'true',
                                    omitEmpty: 'true',
                                    // omitKnockout: 'true',
                                    addValue: 'true',
                                    sortByAPY: 'true',
                                    n: '50',
                                }),
                        )
                            .then((response) => response.json())
                            .then((json) => {
                                const leaderboardPositions = json.data;

                                if (leaderboardPositions && crocEnv) {
                                    Promise.all(
                                        leaderboardPositions.map((position: PositionIF) => {
                                            return getPositionData(
                                                position,
                                                searchableTokens,
                                                crocEnv,
                                                chainData.chainId,
                                                lastBlockNumber,
                                            );
                                        }),
                                    )
                                        .then((updatedPositions) => {
                                            const top10Positions = updatedPositions
                                                .filter((updatedPosition: PositionIF) => {
                                                    return updatedPosition.isPositionInRange;
                                                })
                                                .slice(0, 10);

                                            // console.log({ top10Positions });

                                            if (
                                                JSON.stringify(
                                                    graphData.leaderboardByPool.positions,
                                                ) !== JSON.stringify(top10Positions)
                                            ) {
                                                dispatch(
                                                    setLeaderboardByPool({
                                                        dataReceived: true,
                                                        positions: top10Positions,
                                                    }),
                                                );
                                            }
                                        })
                                        .catch(console.log);
                                }
                            })
                            .catch(console.log);

                        // retrieve pool recent changes
                        fetchPoolRecentChanges({
                            tokensOnActiveLists: tokensOnActiveLists,
                            base: sortedTokens[0],
                            quote: sortedTokens[1],
                            poolIdx: chainData.poolIndex,
                            chainId: chainData.chainId,
                            annotate: true,
                            addValue: true,
                            simpleCalc: true,
                            annotateMEV: false,
                            ensResolution: true,
                            n: 100,
                        })
                            .then((poolChangesJsonData) => {
                                if (poolChangesJsonData) {
                                    dispatch(
                                        setChangesByPool({
                                            dataReceived: true,
                                            changes: poolChangesJsonData,
                                        }),
                                    );
                                }
                            })
                            .catch(console.log);

                        // retrieve pool limit order states

                        const poolLimitOrderStatesCacheEndpoint =
                            httpGraphCacheServerDomain + '/pool_limit_order_states?';

                        fetch(
                            poolLimitOrderStatesCacheEndpoint +
                                new URLSearchParams({
                                    base: sortedTokens[0].toLowerCase(),
                                    quote: sortedTokens[1].toLowerCase(),
                                    poolIdx: chainData.poolIndex.toString(),
                                    chainId: chainData.chainId,
                                    ensResolution: 'true',
                                    omitEmpty: 'true',
                                    // n: 10 // positive integer	(Optional.) If n and page are provided, query returns a page of results with at most n entries.
                                    // page: 0 // nonnegative integer	(Optional.) If n and page are provided, query returns the page-th page of results. Page numbers are 0-indexed.
                                }),
                        )
                            .then((response) => response?.json())
                            .then((json) => {
                                const poolLimitOrderStates = json?.data;

                                dispatch(
                                    setDataLoadingStatus({
                                        datasetName: 'poolOrderData',
                                        loadingStatus: false,
                                    }),
                                );

                                if (poolLimitOrderStates) {
                                    Promise.all(
                                        poolLimitOrderStates.map((limitOrder: LimitOrderIF) => {
                                            return getLimitOrderData(limitOrder, searchableTokens);
                                        }),
                                    ).then((updatedLimitOrderStates) => {
                                        console.log({ updatedLimitOrderStates });
                                        dispatch(
                                            setLimitOrdersByPool({
                                                dataReceived: true,
                                                limitOrders: updatedLimitOrderStates,
                                            }),
                                        );
                                    });
                                }
                            })
                            .catch(console.log);
                    }
                }
            }
        }
    }, [rtkMatchesParams, isServerEnabled, tokenPairStringified, chainData.chainId, crocEnv]);

    const activePeriod = tradeData.activeChartPeriod;

    useEffect(() => {
        console.log('firing');
        setCandleData(undefined);
        fetchCandles();
    }, [mainnetBaseTokenAddress, mainnetQuoteTokenAddress, activePeriod]);

    const fetchCandles = () => {
        if (
            isServerEnabled &&
            baseTokenAddress &&
            quoteTokenAddress &&
            mainnetBaseTokenAddress &&
            mainnetQuoteTokenAddress &&
            activePeriod
        ) {
            try {
                if (httpGraphCacheServerDomain) {
                    // console.log('fetching candles');
                    const candleSeriesCacheEndpoint =
                        httpGraphCacheServerDomain + '/candle_series?';

                    fetch(
                        candleSeriesCacheEndpoint +
                            new URLSearchParams({
                                base: mainnetBaseTokenAddress.toLowerCase(),
                                quote: mainnetQuoteTokenAddress.toLowerCase(),
                                poolIdx: chainData.poolIndex.toString(),
                                period: activePeriod.toString(),
                                // time: '1657833300', // optional
                                n: '200', // positive integer
                                // page: '0', // nonnegative integer
                                chainId: '0x1',
                                dex: 'all',
                                poolStats: 'true',
                                concise: 'true',
                                poolStatsChainIdOverride: '0x5',
                                poolStatsBaseOverride: baseTokenAddress.toLowerCase(),
                                poolStatsQuoteOverride: quoteTokenAddress.toLowerCase(),
                                poolStatsPoolIdxOverride: chainData.poolIndex.toString(),
                            }),
                    )
                        .then((response) => response?.json())
                        .then((json) => {
                            const candles = json?.data;

                            if (candles) {
                                // Promise.all(candles.map(getCandleData)).then((updatedCandles) => {
                                if (JSON.stringify(candleData) !== JSON.stringify(candles)) {
                                    setCandleData({
                                        pool: {
                                            baseAddress: baseTokenAddress.toLowerCase(),
                                            quoteAddress: quoteTokenAddress.toLowerCase(),
                                            poolIdx: chainData.poolIndex,
                                            network: chainData.chainId,
                                        },
                                        duration: activePeriod,
                                        candles: candles,
                                    });
                                }
                            }
                        })
                        .catch(console.log);
                }
            } catch (error) {
                console.log({ error });
            }
        }
    };

    const poolLiqChangesCacheSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_pool_liqchanges?' +
            new URLSearchParams({
                base: baseTokenAddress.toLowerCase(),
                // baseTokenAddress.toLowerCase() || '0x0000000000000000000000000000000000000000',
                quote: quoteTokenAddress.toLowerCase(),
                // quoteTokenAddress.toLowerCase() || '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
                poolIdx: chainData.poolIndex.toString(),
                chainId: chainData.chainId,
                ensResolution: 'true',
                annotate: 'true',
                addCachedAPY: 'true',
                omitKnockout: 'true',
                addValue: 'true',
            }),
        [baseTokenAddress, quoteTokenAddress, chainData.chainId],
    );

    const {
        //  sendMessage,
        lastMessage: lastPoolLiqChangeMessage,
        //  readyState
    } = useWebSocket(
        poolLiqChangesCacheSubscriptionEndpoint,
        {
            // share:  true,
            // onOpen: () => console.log('pool liqChange subscription opened'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // onClose: (event: any) => console.log({ event }),
            // onClose: () => console.log('allPositions websocket connection closed'),
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => shouldNonCandleSubscriptionsReconnect,
        },
        // only connect if base/quote token addresses are available
        isServerEnabled && baseTokenAddress !== '' && quoteTokenAddress !== '',
    );

    useEffect(() => {
        console.log('firing');
        if (lastPoolLiqChangeMessage !== null) {
            const lastMessageData = JSON.parse(lastPoolLiqChangeMessage.data).data;
            // console.log({ lastMessageData });
            if (lastMessageData && crocEnv) {
                Promise.all(
                    lastMessageData.map((position: PositionIF) => {
                        return getPositionData(
                            position,
                            searchableTokens,
                            crocEnv,
                            chainData.chainId,
                            lastBlockNumber,
                        );
                    }),
                ).then((updatedPositions) => {
                    dispatch(addPositionsByPool(updatedPositions));
                });
            }
        }
    }, [lastPoolLiqChangeMessage]);

    const candleSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_candles?' +
            new URLSearchParams({
                base: mainnetBaseTokenAddress.toLowerCase(),
                quote: mainnetQuoteTokenAddress.toLowerCase(),
                poolIdx: chainData.poolIndex.toString(),
                period: activePeriod.toString(),
                chainId: '0x1',
                dex: 'all',
                poolStats: 'true',
                concise: 'true',
                poolStatsChainIdOverride: '0x5',
                poolStatsBaseOverride: baseTokenAddress.toLowerCase(),
                poolStatsQuoteOverride: quoteTokenAddress.toLowerCase(),
                poolStatsPoolIdxOverride: chainData.poolIndex.toString(),
            }),
        [mainnetBaseTokenAddress, mainnetQuoteTokenAddress, chainData.poolIndex, activePeriod],
    );

    const { lastMessage: candlesMessage } = useWebSocket(
        candleSubscriptionEndpoint,
        {
            onOpen: () => {
                // console.log({ candleSubscriptionEndpoint });
                fetchCandles();
            },
            onClose: (event) => console.log({ event }),
            shouldReconnect: () => shouldCandleSubscriptionsReconnect,
        },
        // only connect if base/quote token addresses are available
        isServerEnabled && mainnetBaseTokenAddress !== '' && mainnetQuoteTokenAddress !== '',
    );

    const candleDomains = tradeData.candleDomains;
    const domainBoundaryInSeconds = Math.floor((candleDomains?.domainBoundry || 0) / 1000);

    const domainBoundaryInSecondsDebounced = useDebounce(domainBoundaryInSeconds, 500);

    function getTime() {
        if (candleData) {
            return candleData.candles.map((d) => d.time);
        } else {
            return [0];
        }
    }
    function getMinTime() {
        return Math.min(...getTime());
    }

    useEffect(() => {
        // console.log({ debouncedBoundary });
        // console.log({ activePeriod });
        // console.log({ candleData });

        console.log('domain boundary changes');

        const minTime = getMinTime();
        // console.log({ minTime });

        const numDurationsNeeded = Math.floor(
            (minTime - domainBoundaryInSecondsDebounced) / activePeriod,
        );

        if (
            numDurationsNeeded > 0 &&
            isServerEnabled &&
            httpGraphCacheServerDomain &&
            domainBoundaryInSecondsDebounced &&
            minTime
        ) {
            console.log('fetching new candles');
            const candleSeriesCacheEndpoint = httpGraphCacheServerDomain + '/candle_series?';

            fetch(
                candleSeriesCacheEndpoint +
                    new URLSearchParams({
                        base: mainnetBaseTokenAddress.toLowerCase(),
                        quote: mainnetQuoteTokenAddress.toLowerCase(),
                        poolIdx: chainData.poolIndex.toString(),
                        period: activePeriod.toString(),
                        time: minTime.toString(),
                        // time: debouncedBoundary.toString(),
                        n: numDurationsNeeded.toString(), // positive integer
                        // page: '0', // nonnegative integer
                        chainId: '0x1',
                        dex: 'all',
                        poolStats: 'true',
                        concise: 'true',
                        poolStatsChainIdOverride: '0x5',
                        poolStatsBaseOverride: baseTokenAddress.toLowerCase(),
                        poolStatsQuoteOverride: quoteTokenAddress.toLowerCase(),
                        poolStatsPoolIdxOverride: chainData.poolIndex.toString(),
                    }),
            )
                .then((response) => response?.json())
                .then((json) => {
                    const fetchedCandles = json?.data;
                    console.log({ candleData });
                    if (fetchedCandles && candleData) {
                        const newCandles: CandleData[] = [];
                        const updatedCandles: CandleData[] = candleData.candles;

                        for (let index = 0; index < fetchedCandles.length; index++) {
                            const messageCandle = fetchedCandles[index];
                            const indexOfExistingCandle = candleData.candles.findIndex(
                                (savedCandle) => savedCandle.time === messageCandle.time,
                            );

                            if (indexOfExistingCandle === -1) {
                                newCandles.push(messageCandle);
                            } else if (
                                JSON.stringify(candleData.candles[indexOfExistingCandle]) !==
                                JSON.stringify(messageCandle)
                            ) {
                                updatedCandles[indexOfExistingCandle] = messageCandle;
                            }
                        }
                        // console.log({ newCandles });
                        const newCandleData: CandlesByPoolAndDuration = {
                            pool: candleData.pool,
                            duration: candleData.duration,
                            candles: newCandles.concat(updatedCandles),
                        };
                        setCandleData(newCandleData);
                    }
                })
                .catch(console.log);
        }
    }, [domainBoundaryInSecondsDebounced]);

    useEffect(() => {
        if (candlesMessage) {
            const lastMessageData = JSON.parse(candlesMessage.data).data;
            // console.log({ lastMessageData });
            if (lastMessageData && candleData) {
                const newCandles: CandleData[] = [];
                const updatedCandles: CandleData[] = candleData.candles;

                for (let index = 0; index < lastMessageData.length; index++) {
                    const messageCandle = lastMessageData[index];
                    const indexOfExistingCandle = candleData.candles.findIndex(
                        (savedCandle) => savedCandle.time === messageCandle.time,
                    );

                    if (indexOfExistingCandle === -1) {
                        console.log('pushing new candle from message');
                        newCandles.push(messageCandle);
                    } else if (
                        JSON.stringify(candleData.candles[indexOfExistingCandle]) !==
                        JSON.stringify(messageCandle)
                    ) {
                        updatedCandles[indexOfExistingCandle] = messageCandle;
                    }
                }
                // console.log({ newCandles });
                const newCandleData: CandlesByPoolAndDuration = {
                    pool: candleData.pool,
                    duration: candleData.duration,
                    candles: newCandles.concat(updatedCandles),
                };
                setCandleData(newCandleData);
            }
        }
    }, [candlesMessage]);

    const userLiqChangesCacheSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_user_liqchanges?' +
            new URLSearchParams({
                user: account || '',
                chainId: chainData.chainId,
                annotate: 'true',
                addCachedAPY: 'true',
                omitKnockout: 'true',
                ensResolution: 'true',
                addValue: 'true',
                // user: account || '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            }),
        [account, chainData.chainId],
    );

    const {
        //  sendMessage,
        lastMessage: lastUserPositionsMessage,
        //  readyState
    } = useWebSocket(
        userLiqChangesCacheSubscriptionEndpoint,
        {
            // share: true,
            onOpen: () => console.log('user liqChange subscription opened'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClose: (event: any) => console.log({ event }),
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => shouldNonCandleSubscriptionsReconnect,
        },
        // only connect is account is available
        isServerEnabled && account !== null && account !== undefined,
    );

    useEffect(() => {
        if (lastUserPositionsMessage !== null) {
            const lastMessageData = JSON.parse(lastUserPositionsMessage.data).data;
            console.log('firing');
            if (lastMessageData && crocEnv) {
                Promise.all(
                    lastMessageData.map((position: PositionIF) => {
                        return getPositionData(
                            position,
                            searchableTokens,
                            crocEnv,
                            chainData.chainId,
                            lastBlockNumber,
                        );
                    }),
                ).then((updatedPositions) => {
                    dispatch(addPositionsByUser(updatedPositions));
                });
            }
        }
    }, [lastUserPositionsMessage]);

    const userRecentChangesCacheSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_user_recent_changes?' +
            new URLSearchParams({
                user: account || '',
                chainId: chainData.chainId,
                addValue: 'true',
                annotate: 'true',
                ensResolution: 'true',
            }),
        [account, chainData.chainId],
    );

    const { lastMessage: lastUserRecentChangesMessage } = useWebSocket(
        userRecentChangesCacheSubscriptionEndpoint,
        {
            // share: true,
            onOpen: () => console.log('user recent changes subscription opened'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClose: (event: any) => console.log({ event }),
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => shouldNonCandleSubscriptionsReconnect,
        },
        // only connect is account is available
        isServerEnabled && account !== null && account !== undefined,
    );

    useEffect(() => {
        if (lastUserRecentChangesMessage !== null) {
            console.log('received new user recent change');
            const lastMessageData = JSON.parse(lastUserRecentChangesMessage.data).data;

            if (lastMessageData) {
                Promise.all(
                    lastMessageData.map((tx: ITransaction) => {
                        return getTransactionData(tx, tokensOnActiveLists);
                    }),
                )
                    .then((updatedTransactions) => {
                        dispatch(addChangesByUser(updatedTransactions));
                    })
                    .catch(console.log);
            }
        }
    }, [lastUserRecentChangesMessage]);

    const userLimitOrderChangesCacheSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_user_limit_order_changes?' +
            new URLSearchParams({
                user: account || '',
                chainId: chainData.chainId,
                addValue: 'true',
                ensResolution: 'true',
            }),
        [account, chainData.chainId],
    );

    const { lastMessage: lastUserLimitOrderChangesMessage } = useWebSocket(
        userLimitOrderChangesCacheSubscriptionEndpoint,
        {
            // share: true,
            onOpen: () => console.log('user limit order changes subscription opened'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClose: (event: any) => console.log({ event }),
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => shouldNonCandleSubscriptionsReconnect,
        },
        // only connect is account is available
        isServerEnabled && account !== null && account !== undefined,
    );

    useEffect(() => {
        if (lastUserLimitOrderChangesMessage !== null) {
            const lastMessageData = JSON.parse(lastUserLimitOrderChangesMessage.data).data;

            if (lastMessageData) {
                console.log('received new user limit order change');
                Promise.all(
                    lastMessageData.map((limitOrder: LimitOrderIF) => {
                        return getLimitOrderData(limitOrder, searchableTokens);
                    }),
                ).then((updatedLimitOrderStates) => {
                    dispatch(addLimitOrderChangesByUser(updatedLimitOrderStates));
                });
            }
        }
    }, [lastUserLimitOrderChangesMessage]);

    const [baseTokenBalance, setBaseTokenBalance] = useState<string>('');
    const [quoteTokenBalance, setQuoteTokenBalance] = useState<string>('');
    const [baseTokenDexBalance, setBaseTokenDexBalance] = useState<string>('');
    const [quoteTokenDexBalance, setQuoteTokenDexBalance] = useState<string>('');

    // const [poolPriceTick, setPoolPriceTick] = useState<number | undefined>();
    // const [poolPriceNonDisplay, setPoolPriceNonDisplay] = useState<number | undefined>();
    const [poolPriceDisplay, setPoolPriceDisplay] = useState<number | undefined>();

    const poolPriceNonDisplay = tradeData.poolPriceNonDisplay;

    useEffect(() => {
        console.log('firing');
        setPoolPriceDisplay(0);
        // setPoolPriceTick(undefined);
    }, [JSON.stringify({ base: baseTokenAddress, quote: quoteTokenAddress })]);

    // useEffect to get spot price when tokens change and block updates
    useEffect(() => {
        if (
            !isUserIdle &&
            crocEnv &&
            baseTokenAddress &&
            quoteTokenAddress &&
            baseTokenDecimals &&
            quoteTokenDecimals &&
            lastBlockNumber !== 0
        ) {
            (async () => {
                const spotPrice = await cachedQuerySpotPrice(
                    crocEnv,
                    baseTokenAddress,
                    quoteTokenAddress,
                    chainData.chainId,
                    lastBlockNumber,
                );

                if (spotPrice) {
                    const newDisplayPrice = toDisplayPrice(
                        spotPrice,
                        baseTokenDecimals,
                        quoteTokenDecimals,
                    );
                    if (newDisplayPrice !== poolPriceDisplay) {
                        console.log('setting display pool price');
                        setPoolPriceDisplay(newDisplayPrice);
                    }
                }
                if (spotPrice !== poolPriceNonDisplay) {
                    console.log('dispatching new non-display spot price');
                    dispatch(setPoolPriceNonDisplay(spotPrice));
                }
            })();
        }
    }, [
        isUserIdle,
        lastBlockNumber,
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenDecimals,
        quoteTokenDecimals,
        chainData.chainId,
        crocEnv,
        poolPriceNonDisplay === 0,
    ]);

    // useEffect to update selected token balances
    useEffect(() => {
        (async () => {
            if (
                crocEnv &&
                account &&
                isUserLoggedIn &&
                tradeData.baseToken.address &&
                tradeData.quoteToken.address
            ) {
                crocEnv
                    .token(tradeData.baseToken.address)
                    .walletDisplay(account)
                    .then((bal: string) => {
                        if (bal !== baseTokenBalance) {
                            console.log('setting base token wallet balance');
                            setBaseTokenBalance(bal);
                        }
                    })
                    .catch(console.log);
                crocEnv
                    .token(tradeData.baseToken.address)
                    .balanceDisplay(account)
                    .then((bal: string) => {
                        if (bal !== baseTokenDexBalance) {
                            console.log('setting base token dex balance');
                            setBaseTokenDexBalance(bal);
                        }
                    })
                    .catch(console.log);
                crocEnv
                    .token(tradeData.quoteToken.address)
                    .walletDisplay(account)
                    .then((bal: string) => {
                        if (bal !== quoteTokenBalance) {
                            console.log('setting quote token balance');

                            setQuoteTokenBalance(bal);
                        }
                    })
                    .catch(console.log);
                crocEnv
                    .token(tradeData.quoteToken.address)
                    .balanceDisplay(account)
                    .then((bal: string) => {
                        if (bal !== quoteTokenDexBalance) {
                            console.log('setting quote token dex balance');

                            setQuoteTokenDexBalance(bal);
                        }
                    })
                    .catch(console.log);
            }
        })();
    }, [
        crocEnv,
        isUserLoggedIn,
        account,
        tradeData.baseToken.address,
        tradeData.quoteToken.address,
        lastBlockNumber,
    ]);

    const [tokenAAllowance, setTokenAAllowance] = useState<string>('');
    const [tokenBAllowance, setTokenBAllowance] = useState<string>('');

    const [recheckTokenAApproval, setRecheckTokenAApproval] = useState<boolean>(false);
    const [recheckTokenBApproval, setRecheckTokenBApproval] = useState<boolean>(false);

    const tokenAAddress = tokenPair?.dataTokenA?.address;
    const tokenADecimals = tokenPair?.dataTokenA?.decimals;
    const tokenBAddress = tokenPair?.dataTokenB?.address;
    const tokenBDecimals = tokenPair?.dataTokenB?.decimals;
    // useEffect to check if user has approved CrocSwap to sell the token A
    useEffect(() => {
        (async () => {
            if (crocEnv && account && tokenAAddress) {
                try {
                    const allowance = await crocEnv.token(tokenAAddress).allowance(account);
                    const newTokenAllowance = toDisplayQty(allowance, tokenADecimals);
                    if (tokenAAllowance !== newTokenAllowance) {
                        console.log('firing');
                        setTokenAAllowance(newTokenAllowance);
                    }
                } catch (err) {
                    console.log(err);
                }
                if (recheckTokenAApproval) setRecheckTokenAApproval(false);
            }
        })();
    }, [crocEnv, tokenAAddress, lastBlockNumber, account, recheckTokenAApproval]);

    // useEffect to check if user has approved CrocSwap to sell the token B
    useEffect(() => {
        (async () => {
            if (crocEnv && tokenBAddress && tokenBDecimals && account) {
                try {
                    const allowance = await crocEnv.token(tokenBAddress).allowance(account);
                    const newTokenAllowance = toDisplayQty(allowance, tokenBDecimals);
                    if (tokenBAllowance !== newTokenAllowance) {
                        console.log('firing');
                        setTokenBAllowance(newTokenAllowance);
                    }
                } catch (err) {
                    console.log(err);
                }
                if (recheckTokenBApproval) setRecheckTokenBApproval(false);
            }
        })();
    }, [crocEnv, tokenBAddress, lastBlockNumber, account, recheckTokenBApproval]);

    const graphData = useAppSelector((state) => state.graphData);

    const userLimitOrderStatesCacheEndpoint =
        httpGraphCacheServerDomain + '/user_limit_order_states?';

    useEffect(() => {
        if (isServerEnabled && isUserLoggedIn && account && crocEnv) {
            dispatch(resetConnectedUserDataLoadingStatus());

            console.log('fetching user positions');

            const userPositionsCacheEndpoint = httpGraphCacheServerDomain + '/user_positions?';

            try {
                fetch(
                    userPositionsCacheEndpoint +
                        new URLSearchParams({
                            user: account,
                            chainId: chainData.chainId,
                            ensResolution: 'true',
                            annotate: 'true',
                            omitEmpty: 'true',
                            omitKnockout: 'true',
                            addValue: 'true',
                        }),
                )
                    .then((response) => response?.json())
                    .then((json) => {
                        const userPositions = json?.data;

                        dispatch(
                            setDataLoadingStatus({
                                datasetName: 'connectedUserRangeData',
                                loadingStatus: false,
                            }),
                        );

                        if (userPositions && crocEnv) {
                            Promise.all(
                                userPositions.map((position: PositionIF) => {
                                    return getPositionData(
                                        position,
                                        searchableTokens,
                                        crocEnv,
                                        chainData.chainId,
                                        lastBlockNumber,
                                    );
                                }),
                            ).then((updatedPositions) => {
                                if (
                                    JSON.stringify(graphData.positionsByUser.positions) !==
                                    JSON.stringify(updatedPositions)
                                ) {
                                    dispatch(
                                        setPositionsByUser({
                                            dataReceived: true,
                                            positions: updatedPositions,
                                        }),
                                    );
                                }
                            });
                        }
                    })
                    .catch(console.log);
            } catch (error) {
                console.log;
            }

            console.log('fetching user limit orders ');

            fetch(
                userLimitOrderStatesCacheEndpoint +
                    new URLSearchParams({
                        user: account,
                        chainId: chainData.chainId,
                        ensResolution: 'true',
                        omitEmpty: 'true',
                    }),
            )
                .then((response) => response?.json())
                .then((json) => {
                    const userLimitOrderStates = json?.data;
                    dispatch(
                        setDataLoadingStatus({
                            datasetName: 'connectedUserOrderData',
                            loadingStatus: false,
                        }),
                    );
                    if (userLimitOrderStates) {
                        Promise.all(
                            userLimitOrderStates.map((limitOrder: LimitOrderIF) => {
                                return getLimitOrderData(limitOrder, searchableTokens);
                            }),
                        ).then((updatedLimitOrderStates) => {
                            dispatch(
                                setLimitOrdersByUser({
                                    dataReceived: true,
                                    limitOrders: updatedLimitOrderStates,
                                }),
                            );
                        });
                    }
                })
                .catch(console.log);

            try {
                fetchUserRecentChanges({
                    tokensOnActiveLists: tokensOnActiveLists,
                    user: account,
                    chainId: chainData.chainId,
                    annotate: true,
                    addValue: true,
                    simpleCalc: true,
                    annotateMEV: false,
                    ensResolution: true,
                    n: 500, // fetch last 500 changes,
                })
                    .then((updatedTransactions) => {
                        dispatch(
                            setDataLoadingStatus({
                                datasetName: 'connectedUserTxData',
                                loadingStatus: false,
                            }),
                        );
                        if (updatedTransactions) {
                            dispatch(
                                setChangesByUser({
                                    dataReceived: true,
                                    changes: updatedTransactions,
                                }),
                            );
                        }
                        const result: TokenIF[] = [];
                        const tokenMap = new Map();
                        const ambientTokens = getAmbientTokens();
                        for (const item of updatedTransactions as ITransaction[]) {
                            if (!tokenMap.has(item.base)) {
                                const isFoundInAmbientList = ambientTokens.some((ambientToken) => {
                                    if (
                                        ambientToken.address.toLowerCase() ===
                                        item.base.toLowerCase()
                                    )
                                        return true;
                                    return false;
                                });
                                if (!isFoundInAmbientList) {
                                    tokenMap.set(item.base, true); // set any value to Map
                                    result.push({
                                        name: item.baseName,
                                        address: item.base,
                                        symbol: item.baseSymbol,
                                        decimals: item.baseDecimals,
                                        chainId: parseInt(item.chainId),
                                        logoURI: item.baseTokenLogoURI,
                                    });
                                }
                            }
                            if (!tokenMap.has(item.quote)) {
                                const isFoundInAmbientList = ambientTokens.some((ambientToken) => {
                                    if (
                                        ambientToken.address.toLowerCase() ===
                                        item.quote.toLowerCase()
                                    )
                                        return true;
                                    return false;
                                });
                                if (!isFoundInAmbientList) {
                                    tokenMap.set(item.quote, true); // set any value to Map
                                    result.push({
                                        name: item.quoteName,
                                        address: item.quote,
                                        symbol: item.quoteSymbol,
                                        decimals: item.quoteDecimals,
                                        chainId: parseInt(item.chainId),
                                        logoURI: item.quoteTokenLogoURI,
                                    });
                                }
                            }
                        }
                        // const transactedTokensMinusAmbientTokens = result.filter((token) => )
                        dispatch(setRecentTokens(result));
                    })
                    .catch(console.log);
            } catch (error) {
                console.log;
            }
        }
    }, [isServerEnabled, isUserLoggedIn, account, chainData.chainId, crocEnv]);

    // run function to initialize local storage
    // internal controls will only initialize values that don't exist
    // existing values will not be overwritten

    // determine whether the user is connected to a supported chain
    // the user being connected to a non-supported chain or not being
    // ... connected at all are both reflected as `false`
    // later we can make this available to the rest of the app through
    // ... the React Router context provider API
    // const isChainValid = chainData.chainId ? validateChain(chainData.chainId as string) : false;

    const currentLocation = location.pathname;

    const showSidebarByDefault = useMediaQuery('(min-width: 1776px)');

    function toggleSidebarBasedOnRoute() {
        if (sidebarManuallySet || !showSidebarByDefault) {
            return;
        } else {
            setShowSidebar(true);
            if (
                currentLocation === '/' ||
                currentLocation === '/swap' ||
                currentLocation.includes('/account')
            ) {
                setShowSidebar(false);
            }
        }
    }

    function toggleTradeTabBasedOnRoute() {
        setOutsideControl(true);
        // console.log({ currentLocation });
        if (currentLocation.includes('/market')) {
            setSelectedOutsideTab(0);
        } else if (currentLocation.includes('/limit')) {
            setSelectedOutsideTab(1);
        } else if (currentLocation.includes('/range')) {
            setSelectedOutsideTab(2);
        }
    }

    useEffect(() => {
        toggleSidebarBasedOnRoute();
        if (!isCandleSelected && !currentTxActiveInTransactions && !currentPositionActive)
            toggleTradeTabBasedOnRoute();
    }, [location, isCandleSelected]);

    // function to sever connection between user wallet and Moralis server
    const clickLogout = async () => {
        setBaseTokenBalance('');
        setQuoteTokenBalance('');
        setBaseTokenDexBalance('');
        setQuoteTokenDexBalance('');
        // dispatch(resetTradeData());
        dispatch(resetUserGraphData());
        dispatch(resetReceiptData());
        dispatch(resetTokenData());
        dispatch(resetUserAddresses());

        disconnect();
    };

    const [gasPriceInGwei, setGasPriceinGwei] = useState<number | undefined>();
    // const [gasPriceinDollars, setGasPriceinDollars] = useState<string | undefined>();

    useEffect(() => {
        fetch(
            'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=KNJM7A9ST1Q1EESYXPPQITIP7I8EFSY456',
        )
            .then((response) => response.json())
            .then((response) => {
                if (response.result.ProposeGasPrice) {
                    const newGasPrice = parseInt(response.result.ProposeGasPrice);
                    if (gasPriceInGwei !== newGasPrice) {
                        console.log('setting new gas price');
                        setGasPriceinGwei(newGasPrice);
                    }
                }
            })
            .catch(console.log);
    }, [lastBlockNumber]);

    const shouldDisplayAccountTab = isUserLoggedIn && account !== undefined;

    const [isWagmiModalOpenWallet, openWagmiModalWallet, closeWagmiModalWallet] = useModal();

    const [isGlobalModalOpen, openGlobalModal, closeGlobalModal, currentContent, title] =
        useGlobalModal();

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const [isAppOverlayActive, setIsAppOverlayActive] = useState(false);

    // ------------------- FOLLOWING CODE IS PURELY RESPONSIBLE FOR PULSE ANIMATION------------

    const [isSwapCopied, setIsSwapCopied] = useState(false);
    const [isOrderCopied, setIsOrderCopied] = useState(false);
    const [isRangeCopied, setIsRangeCopied] = useState(false);

    const handlePulseAnimation = (type: string) => {
        switch (type) {
            case 'swap':
                setIsSwapCopied(true);
                setTimeout(() => {
                    setIsSwapCopied(false);
                }, 3000);
                break;
            case 'limitOrder':
                setIsOrderCopied(true);
                setTimeout(() => {
                    setIsOrderCopied(false);
                }, 3000);
                break;
            case 'range':
                setIsRangeCopied(true);

                setTimeout(() => {
                    setIsRangeCopied(false);
                }, 3000);
                break;
            default:
                break;
        }
    };

    // END OF------------------- FOLLOWING CODE IS PURELY RESPONSIBLE FOR PULSE ANIMATION------------

    // --------------THEME--------------------------
    // const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [theme, setTheme] = useState('dark');

    const switchTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    // const themeButtons = (
    //     <div
    //         style={{
    //             display: 'flex',
    //             flexDirection: 'column',
    //             justifyContent: 'center',
    //             alignItems: 'center',
    //         }}
    //     >
    //         <button onClick={switchTheme}>Switch Theme</button>
    //     </div>
    // );

    // --------------END OF THEME--------------------------

    const connectedUserErc20Tokens = useAppSelector((state) => state.userData.tokens.erc20Tokens);
    // TODO: move this function up to App.tsx
    const getImportedTokensPlus = () => {
        // array of all tokens on Ambient list
        const ambientTokens = getAmbientTokens();
        // array of addresses on Ambient list
        const ambientAddresses = ambientTokens.map((tkn) => tkn.address.toLowerCase());
        // use Ambient token list as scaffold to build larger token array
        const output = ambientTokens;
        // limiter for tokens to add from connected wallet
        let tokensAdded = 0;
        // iterate over tokens in connected wallet
        connectedUserErc20Tokens?.forEach((tkn) => {
            // gatekeep to make sure token is not already in the array,
            // ... that the token can be verified against a known list,
            // ... that user has a positive balance of the token, and
            // ... that the limiter has not been reached
            if (
                !ambientAddresses.includes(tkn.address.toLowerCase()) &&
                tokensOnActiveLists.get(tkn.address + '_' + chainData.chainId) &&
                parseInt(tkn.combinedBalance as string) > 0 &&
                tokensAdded < 4
            ) {
                tokensAdded++;
                output.push({ ...tkn, fromList: 'wallet' });
                // increment the limiter by one
                tokensAdded++;
                // add the token to the output array
                output.push({ ...tkn, fromList: 'wallet' });
            }
        });
        // limiter for tokens to add from in-session recent tokens list
        let recentTokensAdded = 0;
        // iterate over tokens in recent tokens list
        getRecentTokens().forEach((tkn) => {
            // gatekeep to make sure the token isn't already in the list,
            // ... is on the current chain, and that the limiter has not
            // ... yet been reached
            if (
                !output.some(
                    (tk) =>
                        tk.address.toLowerCase() === tkn.address.toLowerCase() &&
                        tk.chainId === tkn.chainId,
                ) &&
                tkn.chainId === parseInt(chainData.chainId) &&
                recentTokensAdded < 2
            ) {
                // increment the limiter by one
                recentTokensAdded++;
                // add the token to the output array
                output.push(tkn);
            }
        });
        // return compiled array of tokens
        return output;
    };

    const { addRecentToken, getRecentTokens } = useRecentTokens(chainData.chainId);

    // props for <PageHeader/> React element
    const headerProps = {
        isUserLoggedIn: isUserLoggedIn,
        clickLogout: clickLogout,
        // metamaskLocked: metamaskLocked,
        ensName: ensName,
        shouldDisplayAccountTab: shouldDisplayAccountTab,
        chainId: chainData.chainId,
        isChainSupported: isChainSupported,
        openWagmiModalWallet: openWagmiModalWallet,
        openMoralisModalWallet: openWagmiModalWallet,
        lastBlockNumber: lastBlockNumber,
        isMobileSidebarOpen: isMobileSidebarOpen,
        setIsMobileSidebarOpen: setIsMobileSidebarOpen,
        poolPriceDisplay: poolPriceDisplay,
        openGlobalModal: openGlobalModal,
        closeGlobalModal: closeGlobalModal,
        isAppOverlayActive: isAppOverlayActive,
        setIsAppOverlayActive: setIsAppOverlayActive,
        ethMainnetUsdPrice: ethMainnetUsdPrice,
        addRecentPool: addRecentPool,
        switchTheme: switchTheme,
        theme: theme,
    };

    const [outputTokens, validatedInput, setInput, searchType] = useTokenSearch(
        chainData.chainId,
        verifyToken,
        getTokenByAddress,
        getTokensByName,
        getAmbientTokens(),
        connectedUserErc20Tokens ?? [],
        getRecentTokens(),
    );

    // props for <Swap/> React element
    const swapProps = {
        crocEnv: crocEnv,
        isUserLoggedIn: isUserLoggedIn,
        account: account,
        importedTokens: importedTokens,
        setImportedTokens: setImportedTokens,
        provider: provider,
        swapSlippage: swapSlippage,
        isPairStable: isPairStable,
        gasPriceInGwei: gasPriceInGwei,
        ethMainnetUsdPrice: ethMainnetUsdPrice,
        lastBlockNumber: lastBlockNumber,
        baseTokenBalance: baseTokenBalance,
        quoteTokenBalance: quoteTokenBalance,
        baseTokenDexBalance: baseTokenDexBalance,
        quoteTokenDexBalance: quoteTokenDexBalance,
        isSellTokenBase: isTokenABase,
        tokenPair: tokenPair,
        poolPriceDisplay: poolPriceDisplay,
        tokenAAllowance: tokenAAllowance,
        setRecheckTokenAApproval: setRecheckTokenAApproval,
        chainId: chainData.chainId,
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
        openModalWallet: openWagmiModalWallet,
        isInitialized: isInitialized,
        poolExists: poolExists,
        setTokenPairLocal: setTokenPairLocal,
        openGlobalModal: openGlobalModal,
        verifyToken: verifyToken,
        getTokensByName: getTokensByName,
        getTokenByAddress: getTokenByAddress,
        importedTokensPlus: getImportedTokensPlus(),
        getRecentTokens: getRecentTokens,
        addRecentToken: addRecentToken,
        outputTokens: outputTokens,
        validatedInput: validatedInput,
        setInput: setInput,
        searchType: searchType,
        acknowledgeToken: acknowledgeToken,
    };

    // props for <Swap/> React element on trade route
    const swapPropsTrade = {
        pool: pool,
        crocEnv: crocEnv,
        isUserLoggedIn: isConnected,
        account: account,
        importedTokens: importedTokens,
        setImportedTokens: setImportedTokens,
        provider: provider,
        swapSlippage: swapSlippage,
        isPairStable: isPairStable,
        isOnTradeRoute: true,
        gasPriceInGwei: gasPriceInGwei,
        ethMainnetUsdPrice: ethMainnetUsdPrice,
        lastBlockNumber: lastBlockNumber,
        baseTokenBalance: baseTokenBalance,
        quoteTokenBalance: quoteTokenBalance,
        baseTokenDexBalance: baseTokenDexBalance,
        quoteTokenDexBalance: quoteTokenDexBalance,
        isSellTokenBase: isTokenABase,
        tokenPair: tokenPair,
        poolPriceDisplay: poolPriceDisplay,
        setRecheckTokenAApproval: setRecheckTokenAApproval,
        tokenAAllowance: tokenAAllowance,
        chainId: chainData.chainId,
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
        openModalWallet: openWagmiModalWallet,
        isInitialized: isInitialized,
        poolExists: poolExists,
        openGlobalModal: openGlobalModal,
        isSwapCopied: isSwapCopied,
        verifyToken: verifyToken,
        getTokensByName: getTokensByName,
        getTokenByAddress: getTokenByAddress,
        importedTokensPlus: getImportedTokensPlus(),
        getRecentTokens: getRecentTokens,
        addRecentToken: addRecentToken,
        outputTokens: outputTokens,
        validatedInput: validatedInput,
        setInput: setInput,
        searchType: searchType,
        acknowledgeToken: acknowledgeToken,
    };

    // props for <Limit/> React element on trade route

    const limitPropsTrade = {
        account: account,
        pool: pool,
        crocEnv: crocEnv,
        chainData: chainData,
        isUserLoggedIn: isUserLoggedIn,
        importedTokens: importedTokens,
        setImportedTokens: setImportedTokens,
        provider: provider,
        mintSlippage: mintSlippage,
        isPairStable: isPairStable,
        isOnTradeRoute: true,
        gasPriceInGwei: gasPriceInGwei,
        ethMainnetUsdPrice: ethMainnetUsdPrice,
        lastBlockNumber: lastBlockNumber,
        baseTokenBalance: baseTokenBalance,
        quoteTokenBalance: quoteTokenBalance,
        baseTokenDexBalance: baseTokenDexBalance,
        quoteTokenDexBalance: quoteTokenDexBalance,
        isSellTokenBase: isTokenABase,
        tokenPair: tokenPair,
        poolPriceDisplay: poolPriceDisplay,
        // poolPriceNonDisplay: poolPriceNonDisplay,
        setRecheckTokenAApproval: setRecheckTokenAApproval,
        tokenAAllowance: tokenAAllowance,
        chainId: chainData.chainId,
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
        openModalWallet: openWagmiModalWallet,

        openGlobalModal: openGlobalModal,
        closeGlobalModal: closeGlobalModal,
        poolExists: poolExists,
        isOrderCopied: isOrderCopied,
        // limitRate: limitRate,
        // setLimitRate: setLimitRate,
        verifyToken: verifyToken,
        getTokensByName: getTokensByName,
        getTokenByAddress: getTokenByAddress,
        importedTokensPlus: getImportedTokensPlus(),
        getRecentTokens: getRecentTokens,
        addRecentToken: addRecentToken,
        setResetLimitTick: setResetLimitTick,
        outputTokens: outputTokens,
        validatedInput: validatedInput,
        setInput: setInput,
        searchType: searchType,
        acknowledgeToken: acknowledgeToken,
    };

    // props for <Range/> React element

    const [rangetokenAQtyLocal, setRangeTokenAQtyLocal] = useState<number>(0);
    const [rangetokenBQtyLocal, setRangeTokenBQtyLocal] = useState<number>(0);

    const rangeProps = {
        account: account,
        crocEnv: crocEnv,
        isUserLoggedIn: isUserLoggedIn,
        importedTokens: importedTokens,
        setImportedTokens: setImportedTokens,
        provider: provider,
        mintSlippage: mintSlippage,
        isPairStable: isPairStable,
        lastBlockNumber: lastBlockNumber,
        gasPriceInGwei: gasPriceInGwei,
        ethMainnetUsdPrice: ethMainnetUsdPrice,
        baseTokenAddress: baseTokenAddress,
        quoteTokenAddress: quoteTokenAddress,
        poolPriceNonDisplay: poolPriceNonDisplay,
        poolPriceDisplay: poolPriceDisplay ? poolPriceDisplay.toString() : '0',
        tokenAAllowance: tokenAAllowance,
        setRecheckTokenAApproval: setRecheckTokenAApproval,
        baseTokenBalance: baseTokenBalance,
        quoteTokenBalance: quoteTokenBalance,
        baseTokenDexBalance: baseTokenDexBalance,
        quoteTokenDexBalance: quoteTokenDexBalance,
        tokenBAllowance: tokenBAllowance,
        setRecheckTokenBApproval: setRecheckTokenBApproval,
        chainId: chainData.chainId,
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
        openModalWallet: openWagmiModalWallet,
        ambientApy: ambientApy,

        openGlobalModal: openGlobalModal,

        poolExists: poolExists,
        isRangeCopied: isRangeCopied,
        tokenAQtyLocal: rangetokenAQtyLocal,
        tokenBQtyLocal: rangetokenBQtyLocal,
        setTokenAQtyLocal: setRangeTokenAQtyLocal,
        setTokenBQtyLocal: setRangeTokenBQtyLocal,
        verifyToken: verifyToken,
        getTokensByName: getTokensByName,
        getTokenByAddress: getTokenByAddress,
        importedTokensPlus: getImportedTokensPlus(),
        getRecentTokens: getRecentTokens,
        addRecentToken: addRecentToken,
        outputTokens: outputTokens,
        validatedInput: validatedInput,
        setInput: setInput,
        searchType: searchType,
        acknowledgeToken: acknowledgeToken,
    };

    function toggleSidebar() {
        setShowSidebar(!showSidebar);
        setSidebarManuallySet(true);
    }

    const [selectedOutsideTab, setSelectedOutsideTab] = useState(0);
    const [outsideControl, setOutsideControl] = useState(false);
    const [chatStatus, setChatStatus] = useState(false);

    const [fullScreenChart, setFullScreenChart] = useState(false);

    const [analyticsSearchInput, setAnalyticsSearchInput] = useState('');

    // props for <Sidebar/> React element
    const sidebarProps = {
        tradeData: tradeData,
        isDenomBase: tradeData.isDenomBase,
        showSidebar: showSidebar,
        toggleSidebar: toggleSidebar,
        setShowSidebar: setShowSidebar,
        chainId: chainData.chainId,

        currentTxActiveInTransactions: currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions: setCurrentTxActiveInTransactions,
        isShowAllEnabled: isShowAllEnabled,
        setIsShowAllEnabled: setIsShowAllEnabled,
        expandTradeTable: expandTradeTable,
        setExpandTradeTable: setExpandTradeTable,
        tokenMap: tokensOnActiveLists,
        lastBlockNumber: lastBlockNumber,
        favePools: favePools,

        selectedOutsideTab: selectedOutsideTab,
        setSelectedOutsideTab: setSelectedOutsideTab,
        outsideControl: outsideControl,
        setOutsideControl: setOutsideControl,

        currentPositionActive: currentPositionActive,
        setCurrentPositionActive: setCurrentPositionActive,

        analyticsSearchInput: analyticsSearchInput,
        setAnalyticsSearchInput: setAnalyticsSearchInput,
        openModalWallet: openWagmiModalWallet,
        poolList: poolList,
        verifyToken: verifyToken,
        getTokenByAddress: getTokenByAddress,
        tokenPair: tokenPair,
        getRecentPools: getRecentPools,
        isConnected: isConnected,
        addPoolToFaves: addPoolToFaves,
        removePoolFromFaves: removePoolFromFaves,
        positionsByUser: graphData.positionsByUser.positions,
    };

    const analyticsProps = {
        setSelectedOutsideTab: setSelectedOutsideTab,
        setOutsideControl: setOutsideControl,
        favePools: favePools,
        removePoolFromFaves: removePoolFromFaves,
        addPoolToFaves: addPoolToFaves,
    };

    function updateDenomIsInBase() {
        // console.log('------------');
        // we need to know if the denom token is base or quote
        // currently the denom token is the cheaper one by default
        // ergo we need to know if the cheaper token is base or quote
        // whether pool price is greater or less than 1 indicates which is more expensive
        // if pool price is < 0.1 then denom token will be quote (cheaper one)
        // if pool price is > 0.1 then denom token will be base (also cheaper one)
        // then reverse if didUserToggleDenom === true

        if (!poolPriceDisplay) return;
        const isDenomInBase =
            poolPriceDisplay && poolPriceDisplay < 1
                ? tradeData.didUserFlipDenom
                    ? false
                    : true
                : tradeData.didUserFlipDenom
                ? true
                : false;
        return isDenomInBase;
    }

    useEffect(() => {
        console.log('denomination changed');
        const isDenomBase = updateDenomIsInBase();
        if (isDenomBase !== undefined) {
            if (tradeData.isDenomBase !== isDenomBase) {
                dispatch(setDenomInBase(isDenomBase));
            }
        }
    }, [tradeData.didUserFlipDenom, tokenPair]);
    // }, [tradeData.didUserFlipDenom, JSON.stringify(tokenPair)]);

    const [imageData, setImageData] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            console.log('firing');
            if (account) {
                const imageLocalURLs = await getNFTs(account);
                if (imageLocalURLs) setImageData(imageLocalURLs);
            }
        })();
    }, [account]);

    // const mainLayoutStyle = showSidebar ? 'main-layout-2' : 'main-layout';
    // take away margin from left if we are on homepage or swap

    const swapBodyStyle = currentLocation.startsWith('/swap') ? 'swap-body' : null;

    // Show sidebar on all pages except for home and swap
    const sidebarRender = currentLocation !== '/' &&
        currentLocation !== '/swap' &&
        currentLocation !== '/404' &&
        !fullScreenChart && <Sidebar {...sidebarProps} />;

    useEffect(() => {
        if (!currentLocation.startsWith('/trade')) {
            setFullScreenChart(false);
        }
    }, [currentLocation]);

    const sidebarDislayStyle = showSidebar
        ? 'sidebar_content_layout'
        : 'sidebar_content_layout_close';

    const showSidebarOrNullStyle =
        currentLocation == '/' ||
        currentLocation == '/swap' ||
        currentLocation == '/404' ||
        currentLocation.startsWith('/swap')
            ? 'hide_sidebar'
            : sidebarDislayStyle;

    // hook to track user's sidebar preference open or closed
    // also functions to toggle sidebar status between open and closed
    const [sidebarStatus, openSidebar, closeSidebar, togggggggleSidebar] = useSidebar(
        location.pathname,
    );
    // these lines are just here to make the linter happy
    // take them out before production, they serve no other purpose
    false && sidebarStatus;

    const containerStyle = currentLocation.includes('trade')
        ? 'content-container-trade'
        : 'content-container';

    const defaultUrlParams = {
        swap: '/swap/chain=0x5&tokenA=0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C&tokenB=0x0000000000000000000000000000000000000000',
        // swap: '/swap/chain=0x5&tokenA=0x0000000000000000000000000000000000000000&tokenB=0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C',
        market: '/trade/market/chain=0x5&tokenA=0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C&tokenB=0x0000000000000000000000000000000000000000',
        // market: '/trade/market/chain=0x5&tokenA=0x0000000000000000000000000000000000000000&tokenB=0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C',
        limit: '/trade/limit/chain=0x5&tokenA=0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C&tokenB=0x0000000000000000000000000000000000000000',
        range: '/trade/range/chain=0x5&tokenA=0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C&tokenB=0x0000000000000000000000000000000000000000',
    };

    return (
        <>
            <div className={containerStyle} data-theme={theme}>
                {isMobileSidebarOpen && <div className='blur_app' />}
                <AppOverlay
                    isAppOverlayActive={isAppOverlayActive}
                    setIsAppOverlayActive={setIsAppOverlayActive}
                />
                {/* {currentLocation == '/' && <PhishingWarning />} */}

                {currentLocation !== '/404' && <PageHeader {...headerProps} />}
                <section className={`${showSidebarOrNullStyle} ${swapBodyStyle}`}>
                    {!currentLocation.startsWith('/swap') && sidebarRender}
                    <Routes>
                        <Route
                            index
                            element={
                                <Home
                                    cachedQuerySpotPrice={cachedQuerySpotPrice}
                                    tokenMap={tokensOnActiveLists}
                                    lastBlockNumber={lastBlockNumber}
                                    crocEnv={crocEnv}
                                    chainId={chainData.chainId}
                                    isServerEnabled={isServerEnabled}
                                />
                            }
                        />
                        <Route
                            path='trade'
                            element={
                                <Trade
                                    pool={pool}
                                    // poolPriceTick={poolPriceTick}
                                    isUserLoggedIn={isUserLoggedIn}
                                    crocEnv={crocEnv}
                                    provider={provider}
                                    candleData={candleData}
                                    baseTokenAddress={baseTokenAddress}
                                    quoteTokenAddress={quoteTokenAddress}
                                    baseTokenBalance={baseTokenBalance}
                                    quoteTokenBalance={quoteTokenBalance}
                                    baseTokenDexBalance={baseTokenDexBalance}
                                    quoteTokenDexBalance={quoteTokenDexBalance}
                                    tokenPair={tokenPair}
                                    account={account ?? ''}
                                    lastBlockNumber={lastBlockNumber}
                                    isTokenABase={isTokenABase}
                                    poolPriceDisplay={poolPriceDisplay}
                                    chainId={chainData.chainId}
                                    chainData={chainData}
                                    currentTxActiveInTransactions={currentTxActiveInTransactions}
                                    setCurrentTxActiveInTransactions={
                                        setCurrentTxActiveInTransactions
                                    }
                                    isShowAllEnabled={isShowAllEnabled}
                                    setIsShowAllEnabled={setIsShowAllEnabled}
                                    expandTradeTable={expandTradeTable}
                                    setExpandTradeTable={setExpandTradeTable}
                                    tokenMap={tokensOnActiveLists}
                                    favePools={favePools}
                                    addPoolToFaves={addPoolToFaves}
                                    removePoolFromFaves={removePoolFromFaves}
                                    selectedOutsideTab={selectedOutsideTab}
                                    setSelectedOutsideTab={setSelectedOutsideTab}
                                    outsideControl={outsideControl}
                                    setOutsideControl={setOutsideControl}
                                    currentPositionActive={currentPositionActive}
                                    setCurrentPositionActive={setCurrentPositionActive}
                                    openGlobalModal={openGlobalModal}
                                    closeGlobalModal={closeGlobalModal}
                                    isInitialized={isInitialized}
                                    poolPriceNonDisplay={poolPriceNonDisplay}
                                    setLimitRate={function (): void {
                                        throw new Error('Function not implemented.');
                                    }}
                                    limitRate={''}
                                    importedTokens={searchableTokens}
                                    poolExists={poolExists}
                                    setTokenPairLocal={setTokenPairLocal}
                                    showSidebar={showSidebar}
                                    handlePulseAnimation={handlePulseAnimation}
                                    isCandleSelected={isCandleSelected}
                                    setIsCandleSelected={setIsCandleSelected}
                                    // handleTxCopiedClick={handleTxCopiedClick}
                                    // handleOrderCopiedClick={handleOrderCopiedClick}
                                    // handleRangeCopiedClick={handleRangeCopiedClick}

                                    fullScreenChart={fullScreenChart}
                                    setFullScreenChart={setFullScreenChart}
                                />
                            }
                        >
                            <Route path='' element={<Navigate to='/trade/market' replace />} />
                            <Route
                                path='market'
                                element={<Navigate to={defaultUrlParams.market} replace />}
                            />
                            <Route path='market/:params' element={<Swap {...swapPropsTrade} />} />

                            <Route
                                path='limit'
                                element={<Navigate to={defaultUrlParams.limit} replace />}
                            />
                            <Route path='limit/:params' element={<Limit {...limitPropsTrade} />} />

                            <Route
                                path='range'
                                element={<Navigate to={defaultUrlParams.range} replace />}
                            />
                            <Route path='range/:params' element={<Range {...rangeProps} />} />
                            <Route path='edit/:positionHash' element={<Edit />} />
                            <Route path='reposition' element={<Reposition />} />
                            <Route path='edit/' element={<Navigate to='/trade/market' replace />} />
                        </Route>
                        <Route path='analytics' element={<Analytics {...analyticsProps} />} />
                        <Route
                            path='analytics2'
                            element={
                                <Analytics2
                                    analyticsSearchInput={analyticsSearchInput}
                                    setAnalyticsSearchInput={setAnalyticsSearchInput}
                                />
                            }
                        >
                            <Route
                                path=''
                                element={<Navigate to='/analytics2/overview' replace />}
                            />

                            <Route
                                path='overview'
                                element={
                                    <AnalyticsOverview
                                        analyticsSearchInput={analyticsSearchInput}
                                        setAnalyticsSearchInput={setAnalyticsSearchInput}
                                    />
                                }
                            />
                            <Route
                                path='pools'
                                element={
                                    <TopPools
                                        analyticsSearchInput={analyticsSearchInput}
                                        setAnalyticsSearchInput={setAnalyticsSearchInput}
                                    />
                                }
                            />
                            <Route
                                path='trendingpools'
                                element={
                                    <TrendingPools
                                        analyticsSearchInput={analyticsSearchInput}
                                        setAnalyticsSearchInput={setAnalyticsSearchInput}
                                    />
                                }
                            />
                            <Route
                                path='ranges/top'
                                element={
                                    <TopRanges
                                        analyticsSearchInput={analyticsSearchInput}
                                        setAnalyticsSearchInput={setAnalyticsSearchInput}
                                    />
                                }
                            />
                            <Route
                                path='tokens'
                                element={
                                    <TopTokens
                                        analyticsSearchInput={analyticsSearchInput}
                                        setAnalyticsSearchInput={setAnalyticsSearchInput}
                                    />
                                }
                            />
                            <Route
                                path='transactions'
                                element={
                                    <AnalyticsTransactions
                                        analyticsSearchInput={analyticsSearchInput}
                                        setAnalyticsSearchInput={setAnalyticsSearchInput}
                                    />
                                }
                            />
                        </Route>
                        <Route
                            path='app/chat'
                            element={
                                <ChatPanel
                                    chatStatus={true}
                                    onClose={() => {
                                        console.error('Function not implemented.');
                                    }}
                                    favePools={favePools}
                                    currentPool={currentPoolInfo}
                                    setChatStatus={setChatStatus}
                                    isFullScreen={true}
                                />
                            }
                        />

                        <Route path='range2' element={<Range {...rangeProps} />} />
                        <Route
                            path='initpool/:params'
                            element={
                                <InitPool
                                    isUserLoggedIn={isUserLoggedIn}
                                    crocEnv={crocEnv}
                                    gasPriceInGwei={gasPriceInGwei}
                                    ethMainnetUsdPrice={ethMainnetUsdPrice}
                                    showSidebar={showSidebar}
                                    tokenPair={tokenPair}
                                    openModalWallet={openWagmiModalWallet}
                                    tokenAAllowance={tokenAAllowance}
                                    tokenBAllowance={tokenBAllowance}
                                    setRecheckTokenAApproval={setRecheckTokenAApproval}
                                    setRecheckTokenBApproval={setRecheckTokenBApproval}
                                />
                            }
                        />
                        <Route
                            path='account'
                            element={
                                <Portfolio
                                    crocEnv={crocEnv}
                                    addRecentToken={addRecentToken}
                                    getRecentTokens={getRecentTokens}
                                    getAmbientTokens={getAmbientTokens}
                                    getTokensByName={getTokensByName}
                                    verifyToken={verifyToken}
                                    getTokenByAddress={getTokenByAddress}
                                    isTokenABase={isTokenABase}
                                    provider={provider}
                                    cachedFetchErc20TokenBalances={cachedFetchErc20TokenBalances}
                                    cachedFetchNativeTokenBalance={cachedFetchNativeTokenBalance}
                                    cachedFetchTokenPrice={cachedFetchTokenPrice}
                                    ensName={ensName}
                                    lastBlockNumber={lastBlockNumber}
                                    connectedAccount={account ? account : ''}
                                    userImageData={imageData}
                                    chainId={chainData.chainId}
                                    tokensOnActiveLists={tokensOnActiveLists}
                                    selectedOutsideTab={selectedOutsideTab}
                                    setSelectedOutsideTab={setSelectedOutsideTab}
                                    outsideControl={outsideControl}
                                    setOutsideControl={setOutsideControl}
                                    userAccount={true}
                                    openGlobalModal={openGlobalModal}
                                    closeGlobalModal={closeGlobalModal}
                                    importedTokens={importedTokens}
                                    setImportedTokens={setImportedTokens}
                                    chainData={chainData}
                                    currentPositionActive={currentPositionActive}
                                    setCurrentPositionActive={setCurrentPositionActive}
                                    account={account ?? ''}
                                    showSidebar={showSidebar}
                                    isUserLoggedIn={isUserLoggedIn}
                                    baseTokenBalance={baseTokenBalance}
                                    quoteTokenBalance={quoteTokenBalance}
                                    baseTokenDexBalance={baseTokenDexBalance}
                                    quoteTokenDexBalance={quoteTokenDexBalance}
                                    currentTxActiveInTransactions={currentTxActiveInTransactions}
                                    setCurrentTxActiveInTransactions={
                                        setCurrentTxActiveInTransactions
                                    }
                                    handlePulseAnimation={handlePulseAnimation}
                                    gasPriceInGwei={gasPriceInGwei}
                                    acknowledgeToken={acknowledgeToken}
                                    outputTokens={outputTokens}
                                    validatedInput={validatedInput}
                                    setInput={setInput}
                                    searchType={searchType}
                                    openModalWallet={openWagmiModalWallet}
                                />
                            }
                        />
                        <Route
                            path='account/:address'
                            element={
                                <Portfolio
                                    crocEnv={crocEnv}
                                    addRecentToken={addRecentToken}
                                    getRecentTokens={getRecentTokens}
                                    getAmbientTokens={getAmbientTokens}
                                    getTokensByName={getTokensByName}
                                    verifyToken={verifyToken}
                                    getTokenByAddress={getTokenByAddress}
                                    isTokenABase={isTokenABase}
                                    provider={provider}
                                    cachedFetchErc20TokenBalances={cachedFetchErc20TokenBalances}
                                    cachedFetchNativeTokenBalance={cachedFetchNativeTokenBalance}
                                    cachedFetchTokenPrice={cachedFetchTokenPrice}
                                    ensName={ensName}
                                    lastBlockNumber={lastBlockNumber}
                                    connectedAccount={account ? account : ''}
                                    chainId={chainData.chainId}
                                    userImageData={imageData}
                                    tokensOnActiveLists={tokensOnActiveLists}
                                    selectedOutsideTab={selectedOutsideTab}
                                    setSelectedOutsideTab={setSelectedOutsideTab}
                                    outsideControl={outsideControl}
                                    setOutsideControl={setOutsideControl}
                                    userAccount={false}
                                    openGlobalModal={openGlobalModal}
                                    closeGlobalModal={closeGlobalModal}
                                    importedTokens={importedTokens}
                                    setImportedTokens={setImportedTokens}
                                    chainData={chainData}
                                    currentPositionActive={currentPositionActive}
                                    setCurrentPositionActive={setCurrentPositionActive}
                                    account={account ?? ''}
                                    showSidebar={showSidebar}
                                    isUserLoggedIn={isUserLoggedIn}
                                    baseTokenBalance={baseTokenBalance}
                                    quoteTokenBalance={quoteTokenBalance}
                                    baseTokenDexBalance={baseTokenDexBalance}
                                    quoteTokenDexBalance={quoteTokenDexBalance}
                                    currentTxActiveInTransactions={currentTxActiveInTransactions}
                                    setCurrentTxActiveInTransactions={
                                        setCurrentTxActiveInTransactions
                                    }
                                    handlePulseAnimation={handlePulseAnimation}
                                    gasPriceInGwei={gasPriceInGwei}
                                    acknowledgeToken={acknowledgeToken}
                                    outputTokens={outputTokens}
                                    validatedInput={validatedInput}
                                    setInput={setInput}
                                    searchType={searchType}
                                    openModalWallet={openWagmiModalWallet}
                                />
                            }
                        />

                        <Route
                            path='swap'
                            element={<Navigate replace to={defaultUrlParams.swap} />}
                        />
                        <Route path='swap/:params' element={<Swap {...swapProps} />} />
                        <Route path='tos' element={<TermsOfService />} />
                        <Route
                            path='testpage'
                            element={
                                <TestPage
                                    openGlobalModal={openGlobalModal}
                                    openSidebar={openSidebar}
                                    closeSidebar={closeSidebar}
                                    togggggggleSidebar={togggggggleSidebar}
                                />
                            }
                        />
                        <Route
                            path='/:address'
                            element={
                                <Portfolio
                                    crocEnv={crocEnv}
                                    addRecentToken={addRecentToken}
                                    getRecentTokens={getRecentTokens}
                                    getAmbientTokens={getAmbientTokens}
                                    getTokensByName={getTokensByName}
                                    verifyToken={verifyToken}
                                    getTokenByAddress={getTokenByAddress}
                                    isTokenABase={isTokenABase}
                                    provider={provider}
                                    cachedFetchErc20TokenBalances={cachedFetchErc20TokenBalances}
                                    cachedFetchNativeTokenBalance={cachedFetchNativeTokenBalance}
                                    cachedFetchTokenPrice={cachedFetchTokenPrice}
                                    ensName={ensName}
                                    lastBlockNumber={lastBlockNumber}
                                    connectedAccount={account ? account : ''}
                                    chainId={chainData.chainId}
                                    userImageData={imageData}
                                    tokensOnActiveLists={tokensOnActiveLists}
                                    selectedOutsideTab={selectedOutsideTab}
                                    setSelectedOutsideTab={setSelectedOutsideTab}
                                    outsideControl={outsideControl}
                                    setOutsideControl={setOutsideControl}
                                    userAccount={false}
                                    openGlobalModal={openGlobalModal}
                                    closeGlobalModal={closeGlobalModal}
                                    importedTokens={importedTokens}
                                    setImportedTokens={setImportedTokens}
                                    chainData={chainData}
                                    currentPositionActive={currentPositionActive}
                                    setCurrentPositionActive={setCurrentPositionActive}
                                    account={account ?? ''}
                                    showSidebar={showSidebar}
                                    isUserLoggedIn={isUserLoggedIn}
                                    baseTokenBalance={baseTokenBalance}
                                    quoteTokenBalance={quoteTokenBalance}
                                    baseTokenDexBalance={baseTokenDexBalance}
                                    quoteTokenDexBalance={quoteTokenDexBalance}
                                    currentTxActiveInTransactions={currentTxActiveInTransactions}
                                    setCurrentTxActiveInTransactions={
                                        setCurrentTxActiveInTransactions
                                    }
                                    handlePulseAnimation={handlePulseAnimation}
                                    gasPriceInGwei={gasPriceInGwei}
                                    acknowledgeToken={acknowledgeToken}
                                    outputTokens={outputTokens}
                                    validatedInput={validatedInput}
                                    setInput={setInput}
                                    searchType={searchType}
                                    openModalWallet={openWagmiModalWallet}
                                />
                            }
                        />
                        <Route path='/404' element={<NotFound />} />
                    </Routes>
                </section>
                {snackbarContent}
            </div>

            <div className='footer_container'>
                {currentLocation !== '/' && (
                    <PageFooter
                        isUserIdle={isUserIdle}
                        lastBlockNumber={lastBlockNumber}
                        userIsOnline={userIsOnline}
                        favePools={favePools}
                        currentPool={currentPoolInfo}
                        setChatStatus={setChatStatus}
                        chatStatus={chatStatus}
                    />
                )}
                {/* {currentLocation !== '/app/chat' && (
                    <Chat
                        ensName={ensName}
                        connectedAccount={account ? account : ''}
                        fullScreen={false}
                    />
                )}
                {currentLocation !== '/app/chat' && currentLocation !== '/' && (
                    <Chat
                        ensName={ensName}
                        connectedAccount={account ? account : ''}
                        fullScreen={false}
                    />
                )} */}

                {currentLocation !== '/' && currentLocation !== '/app/chat' && (
                    <ChatPanel
                        chatStatus={chatStatus}
                        onClose={() => {
                            console.error('Function not implemented.');
                        }}
                        favePools={favePools}
                        currentPool={currentPoolInfo}
                        setChatStatus={setChatStatus}
                        isFullScreen={false}
                    />
                )}
            </div>
            <SidebarFooter />
            <GlobalModal
                isGlobalModalOpen={isGlobalModalOpen}
                closeGlobalModal={closeGlobalModal}
                openGlobalModal={openGlobalModal}
                currentContent={currentContent}
                title={title}
            />

            {isWagmiModalOpenWallet && (
                <WalletModalWagmi
                    closeModalWallet={closeWagmiModalWallet}

                    // authError={authError}
                />
            )}
        </>
    );
}
