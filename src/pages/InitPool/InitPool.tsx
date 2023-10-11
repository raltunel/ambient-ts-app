// START: Import React and Dongles
import { useContext, useEffect, useMemo, useState } from 'react';

// START: Import JSX Components
import InitPoolExtraInfo from '../../components/InitPool/InitPoolExtraInfo/InitPoolExtraInfo';
import Button from '../../components/Form/Button';

// START: Import Local Files
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';

import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../constants';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { AppStateContext } from '../../contexts/AppStateContext';
import { useAccount } from 'wagmi';
import { useLinkGen, linkGenMethodsIF } from '../../utils/hooks/useLinkGen';
import { getFormattedNumber } from '../../App/functions/getFormattedNumber';
import { exponentialNumRegEx } from '../../utils/regex/exports';

import { CachedDataContext } from '../../contexts/CachedDataContext';
import InitPoolTokenSelect from '../../components/Global/InitPoolTokenSelect/InitPoolTokenSelect';

import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
import { PoolContext } from '../../contexts/PoolContext';
import RangeBounds from '../../components/Global/RangeBounds/RangeBounds';
// import { toggleAdvancedMode } from '../../utils/state/tradeDataSlice';
import { LuEdit2 } from 'react-icons/lu';
import { FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import { FlexContainer, Text } from '../../styled/Common';
import Toggle from '../../components/Form/Toggle';
import { TextOnlyTooltip } from '../../components/Global/StyledTooltip/StyledTooltip';
import { TokenContext } from '../../contexts/TokenContext';
import { useUrlParams } from '../../utils/hooks/useUrlParams';

import { useTokenBalancesAndAllowances } from '../../App/hooks/useTokenBalancesAndAllowances';
import { UserPreferenceContext } from '../../contexts/UserPreferenceContext';
import Spinner from '../../components/Global/Spinner/Spinner';
import AdvancedModeToggle from '../../components/Trade/Range/AdvancedModeToggle/AdvancedModeToggle';
import { getMoneynessRank } from '../../utils/functions/getMoneynessRank';
import { WarningBox } from '../../components/RangeActionModal/WarningBox/WarningBox';
import { ethereumMainnet } from '../../utils/networks/ethereumMainnet';
import InitSkeleton from './InitSkeleton';
import InitConfirmation from './InitConfirmation';
import MultiContentComponent from '../../components/Global/MultiStepTransaction/MultiContentComponent';

import { useApprove } from '../../App/functions/approve';
import { useMediaQuery } from '@material-ui/core';
import { CurrencyQuantityInput } from '../../styled/Components/TradeModules';
import RangeTokenInput from '../../components/Trade/Range/RangeTokenInput/RangeTokenInput';
import { useCreateRangePosition } from '../../App/hooks/useCreateRangePosition';
import {
    getPinnedPriceValuesFromDisplayPrices,
    getPinnedPriceValuesFromTicks,
    roundDownTick,
    roundUpTick,
} from '../Trade/Range/rangeFunctions';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    DEFAULT_MAX_PRICE_DIFF_PERCENTAGE,
    DEFAULT_MIN_PRICE_DIFF_PERCENTAGE,
} from '../Trade/Range/Range';
import {
    setAdvancedLowTick,
    setAdvancedHighTick,
} from '../../utils/state/tradeDataSlice';
import { concDepositSkew, fromDisplayPrice } from '@crocswap-libs/sdk';
import truncateDecimals from '../../utils/data/truncateDecimals';
import {
    addPendingTx,
    addReceipt,
    addTransactionByType,
    removePendingTx,
    updateTransactionHash,
} from '../../utils/state/receiptDataSlice';
import {
    TransactionError,
    isTransactionFailedError,
    isTransactionReplacedError,
} from '../../utils/TransactionError';
import { useHandleRangeButtonMessage } from '../../App/hooks/useHandleRangeButtonMessage';
import { TradeTokenContext } from '../../contexts/TradeTokenContext';
import { useRangeInputDisable } from '../Trade/Range/useRangeInputDisable';
import TooltipComponent from '../../components/Global/TooltipComponent/TooltipComponent';
// react functional component
export default function InitPool() {
    const {
        wagmiModal: { open: openWagmiModalWallet },
    } = useContext(AppStateContext);
    const {
        crocEnv,
        provider,
        ethMainnetUsdPrice,
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);
    const { dexBalRange } = useContext(UserPreferenceContext);
    const { gasPriceInGwei } = useContext(ChainDataContext);
    const { poolPriceDisplay } = useContext(PoolContext);

    const { tokens } = useContext(TokenContext);
    const {
        // Question: should these come from useTokenBalancesAndAllowances
        // tokenAAllowance,
        // tokenBAllowance,
        // isTokenABase,

        tokenABalance,
        tokenBBalance,
        tokenADexBalance,
        tokenBDexBalance,
    } = useContext(TradeTokenContext);

    const { sessionReceipts } = useAppSelector((state) => state.receiptData);
    const {
        tradeData: {
            tokenA,
            tokenB,
            baseToken,
            quoteToken,
            advancedMode,
            advancedHighTick,
            advancedLowTick,
        },
    } = useAppSelector((state) => state);

    useEffect(() => {
        setIsWithdrawTokenAFromDexChecked(parseFloat(tokenADexBalance) > 0);
    }, [tokenADexBalance]);

    useEffect(() => {
        setIsWithdrawTokenBFromDexChecked(parseFloat(tokenBDexBalance) > 0);
    }, [tokenBDexBalance]);

    const { urlParamMap } = useUrlParams(tokens, chainId, provider);

    const tknA: string = urlParamMap.get('tokenA') as string;
    const tknB: string = urlParamMap.get('tokenB') as string;

    const tradeDataMatchesURLParams =
        tknA.toLowerCase() === tokenA.address.toLowerCase() &&
        tknB.toLowerCase() === tokenB.address.toLowerCase();

    const { isConnected } = useAccount();

    const { approve, isApprovalPending } = useApprove();

    const {
        baseTokenDexBalance,
        quoteTokenDexBalance,
        tokenAAllowance,
        tokenBAllowance,

        isTokenABase,
    } = useTokenBalancesAndAllowances(baseToken, quoteToken);

    const isBaseTokenMoneynessGreaterOrEqual =
        baseToken.symbol && quoteToken.symbol
            ? getMoneynessRank(baseToken.symbol) -
                  getMoneynessRank(quoteToken.symbol) >=
              0
            : false;

    const [isDenomBase, setIsDenomBase] = useState(false);
    // DO NOT combine these hooks with useMemo()
    // the useMemo() hook does NOT respect asynchronicity
    const [poolExists, setPoolExists] = useState<boolean | null>(null);

    const [activeContent, setActiveContent] = useState<string>('main');
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [isMintLiqEnabled, setIsMintLiqEnabled] = useState(true);
    // TODO: this could probably be refacted into a useMemo
    const [isWithdrawTokenAFromDexChecked, setIsWithdrawTokenAFromDexChecked] =
        useState<boolean>(dexBalRange.drawFromDexBal.isEnabled);
    const [isWithdrawTokenBFromDexChecked, setIsWithdrawTokenBFromDexChecked] =
        useState<boolean>(dexBalRange.drawFromDexBal.isEnabled);

    const [initialPriceDisplay, setInitialPriceDisplay] = useState<string>('');

    const [initialPriceInBaseDenom, setInitialPriceInBaseDenom] = useState<
        number | undefined
    >();

    const [estimatedInitialPriceDisplay, setEstimatedInitialPriceDisplay] =
        useState<string>('0');

    const [isAmbient, setIsAmbient] = useState(false);

    const [rangeLowBoundNonDisplayPrice, setRangeLowBoundNonDisplayPrice] =
        useState(0);
    const [rangeHighBoundNonDisplayPrice, setRangeHighBoundNonDisplayPrice] =
        useState(0);
    const [connectButtonDelayElapsed, setConnectButtonDelayElapsed] =
        useState(false);
    const [initGasPriceinDollars, setInitGasPriceinDollars] = useState<
        string | undefined
    >();

    // eslint-disable-next-line
    const [tokenModalOpen, setTokenModalOpen] = useState(false);
    // eslint-disable-next-line
    const [tokenACollateral, setTokenACollateral] = useState<string>('');
    // eslint-disable-next-line
    const [tokenBCollateral, setTokenBCollateral] = useState<string>('');

    // See Range.tsx line 81
    const [rangeWidthPercentage, setRangeWidthPercentage] =
        useState<number>(10);
    const [
        // eslint-disable-next-line
        rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider,
    ] = useState(false);

    // eslint-disable-next-line
    const [pinnedDisplayPrices, setPinnedDisplayPrices] = useState<
        | {
              pinnedMinPriceDisplay: string;
              pinnedMaxPriceDisplay: string;
              pinnedMinPriceDisplayTruncated: string;
              pinnedMaxPriceDisplayTruncated: string;
              pinnedMinPriceDisplayTruncatedWithCommas: string;
              pinnedMaxPriceDisplayTruncatedWithCommas: string;
              pinnedLowTick: number;
              pinnedHighTick: number;
              pinnedMinPriceNonDisplay: number;
              pinnedMaxPriceNonDisplay: number;
          }
        | undefined
    >();
    // eslint-disable-next-line
    // eslint-disable-next-line
    const [pinnedMinPriceDisplayTruncated, setPinnedMinPriceDisplayTruncated] =
        useState('');
    // eslint-disable-next-line
    const [pinnedMaxPriceDisplayTruncated, setPinnedMaxPriceDisplayTruncated] =
        useState('');

    // Min Max Price
    const [minPriceInputString, setMinPriceInputString] = useState<string>('');
    const [maxPriceInputString, setMaxPriceInputString] = useState<string>('');
    // eslint-disable-next-line
    const [minPriceDifferencePercentage, setMinPriceDifferencePercentage] =
        useState(-10);
    // eslint-disable-next-line
    const [maxPriceDifferencePercentage, setMaxPriceDifferencePercentage] =
        useState(10);
    // eslint-disable-next-line
    const [rangeLowBoundFieldBlurred, setRangeLowBoundFieldBlurred] =
        useState(false);
    // eslint-disable-next-line
    const [rangeHighBoundFieldBlurred, setRangeHighBoundFieldBlurred] =
        useState(false);
    const [minPrice, setMinPrice] = useState(10);
    const [maxPrice, setMaxPrice] = useState(100);

    const [isLoading, setIsLoading] = useState(false);
    const [isEditEnabled, setIsEditEnabled] = useState(false);

    const gridSize = lookupChain(chainId).gridSize;

    useEffect(() => {
        setIsDenomBase(!isBaseTokenMoneynessGreaterOrEqual);
    }, [isBaseTokenMoneynessGreaterOrEqual, tokenA.address + tokenB.address]);

    const isTokenPairDefault =
        baseToken.address === ZERO_ADDRESS && quoteToken.symbol === 'USDC';

    useEffect(() => {
        // make sure crocEnv exists (needs a moment to spin up)
        if (crocEnv) {
            // check if pool exists for token addresses from URL params
            const doesPoolExist = crocEnv
                .pool(baseToken.address, quoteToken.address)
                .isInit();
            // resolve the promise
            Promise.resolve(doesPoolExist)
                // update value of poolExists, use `null` for `undefined`
                .then((res) => setPoolExists(res ?? null));
        } else {
            // set value of poolExists as null if there is no crocEnv
            // this is handled as a pre-initialization condition, not a false
            setPoolExists(null);
        }
        // re-run hook if a new crocEnv is created
        // this will happen if the user switches chains
    }, [crocEnv, sessionReceipts.length, baseToken, quoteToken]);

    useEffect(() => {
        if (rangeHighBoundFieldBlurred) {
            const rangeHighBoundDisplayField = document.getElementById(
                'max-price-input-quantity',
            ) as HTMLInputElement;

            const targetMaxValue = maxPrice;
            const targetMinValue = minPrice;

            const pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                isDenomBase,
                baseToken.decimals,
                quoteToken.decimals,
                targetMinValue?.toString() ?? '0',
                targetMaxValue?.toString() ?? '0',
                gridSize,
            );

            isDenomBase
                ? setRangeLowBoundNonDisplayPrice(
                      pinnedDisplayPrices.pinnedMinPriceNonDisplay,
                  )
                : setRangeHighBoundNonDisplayPrice(
                      pinnedDisplayPrices.pinnedMaxPriceNonDisplay,
                  );

            isDenomBase
                ? setMinPrice(
                      parseFloat(
                          pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                      ),
                  )
                : setMaxPrice(
                      parseFloat(
                          pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                      ),
                  );

            isDenomBase
                ? dispatch(
                      setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick),
                  )
                : dispatch(
                      setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick),
                  );

            const highGeometricDifferencePercentage = parseFloat(
                truncateDecimals(
                    (pinnedDisplayPrices.pinnedHighTick -
                        selectedPoolPriceTick) /
                        100,
                    0,
                ),
            );
            const lowGeometricDifferencePercentage = parseFloat(
                truncateDecimals(
                    (pinnedDisplayPrices.pinnedLowTick -
                        selectedPoolPriceTick) /
                        100,
                    0,
                ),
            );
            isDenomBase
                ? setMaxPriceDifferencePercentage(
                      -lowGeometricDifferencePercentage,
                  )
                : setMaxPriceDifferencePercentage(
                      highGeometricDifferencePercentage,
                  );

            setPinnedMaxPriceDisplayTruncated(
                pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
            );

            if (rangeHighBoundDisplayField) {
                rangeHighBoundDisplayField.value =
                    pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated;
            } else {
                IS_LOCAL_ENV && console.debug('high bound field not found');
            }

            setRangeHighBoundFieldBlurred(false);
        }
    }, [rangeHighBoundFieldBlurred]);

    useEffect(() => {
        if (rangeLowBoundFieldBlurred) {
            const rangeLowBoundDisplayField = document.getElementById(
                'min-price-input-quantity',
            ) as HTMLInputElement;

            const targetMinValue = minPrice;
            const targetMaxValue = maxPrice;

            const pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                isDenomBase,
                baseToken.decimals,
                quoteToken.decimals,
                targetMinValue?.toString() ?? '0',
                targetMaxValue?.toString() ?? '0',
                gridSize,
            );

            !isDenomBase
                ? setRangeLowBoundNonDisplayPrice(
                      pinnedDisplayPrices.pinnedMinPriceNonDisplay,
                  )
                : setRangeHighBoundNonDisplayPrice(
                      pinnedDisplayPrices.pinnedMaxPriceNonDisplay,
                  );

            !isDenomBase
                ? dispatch(
                      setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick),
                  )
                : dispatch(
                      setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick),
                  );

            !isDenomBase
                ? setMinPrice(
                      parseFloat(
                          pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
                      ),
                  )
                : setMaxPrice(
                      parseFloat(
                          pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
                      ),
                  );

            const highGeometricDifferencePercentage = parseFloat(
                truncateDecimals(
                    (pinnedDisplayPrices.pinnedHighTick -
                        selectedPoolPriceTick) /
                        100,
                    0,
                ),
            );
            const lowGeometricDifferencePercentage = parseFloat(
                truncateDecimals(
                    (pinnedDisplayPrices.pinnedLowTick -
                        selectedPoolPriceTick) /
                        100,
                    0,
                ),
            );
            isDenomBase
                ? setMinPriceDifferencePercentage(
                      -highGeometricDifferencePercentage,
                  )
                : setMinPriceDifferencePercentage(
                      lowGeometricDifferencePercentage,
                  );

            setPinnedMinPriceDisplayTruncated(
                pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
            );

            if (rangeLowBoundDisplayField) {
                rangeLowBoundDisplayField.value =
                    pinnedDisplayPrices.pinnedMinPriceDisplayTruncated;
            } else {
                IS_LOCAL_ENV && console.debug('low bound field not found');
            }

            setRangeLowBoundFieldBlurred(false);
        }
    }, [rangeLowBoundFieldBlurred]);

    const erc20TokenWithDexBalance = useMemo(() => {
        if (baseToken?.address !== ZERO_ADDRESS) {
            if (baseTokenDexBalance && baseTokenDexBalance !== '0.0') {
                return baseToken;
            }
        }
        if (quoteTokenDexBalance && quoteTokenDexBalance !== '0.0') {
            return quoteToken;
        }
        return undefined;
    }, [baseToken, quoteToken, baseTokenDexBalance, quoteTokenDexBalance]);

    const [isReferencePriceAvailable, setIsReferencePriceAvailable] =
        useState(false);

    const refreshReferencePrice = async () => {
        if (tradeDataMatchesURLParams) {
            const mainnetBase =
                baseToken.address === ZERO_ADDRESS
                    ? ethereumMainnet.tokens['WETH']
                    : ethereumMainnet.tokens[
                          baseToken?.symbol as keyof typeof ethereumMainnet.tokens
                      ];
            const mainnetQuote =
                ethereumMainnet.tokens[
                    quoteToken?.symbol as keyof typeof ethereumMainnet.tokens
                ];
            const basePricePromise = cachedFetchTokenPrice(
                mainnetBase,
                ethereumMainnet.chainId,
            );
            const quotePricePromise = cachedFetchTokenPrice(
                mainnetQuote,
                ethereumMainnet.chainId,
            );

            const basePrice = await basePricePromise;
            const quotePrice = await quotePricePromise;

            const isReferencePriceFound =
                basePrice !== undefined && quotePrice !== undefined;

            setIsReferencePriceAvailable(isReferencePriceFound);

            const baseUsdPrice = basePrice?.usdPrice || 2000;
            const quoteUsdPrice = quotePrice?.usdPrice || 1;

            const defaultPriceNumInBase = baseUsdPrice / quoteUsdPrice;

            const defaultPriceTruncated =
                defaultPriceNumInBase < 0.0001
                    ? defaultPriceNumInBase.toExponential(2)
                    : defaultPriceNumInBase < 2
                    ? defaultPriceNumInBase.toPrecision(3)
                    : defaultPriceNumInBase.toFixed(2);

            if (
                isReferencePriceFound &&
                useReferencePrice &&
                initialPriceDisplay === ''
            ) {
                setInitialPriceInBaseDenom(defaultPriceNumInBase);
            }
            if (isDenomBase) {
                setEstimatedInitialPriceDisplay(defaultPriceTruncated);
                isReferencePriceFound &&
                initialPriceDisplay === '' &&
                useReferencePrice &&
                !isTokenPairDefault
                    ? setInitialPriceDisplay(defaultPriceTruncated)
                    : !initialPriceInBaseDenom
                    ? setInitialPriceDisplay('')
                    : undefined;
            } else {
                const invertedPriceNum = 1 / defaultPriceNumInBase;

                const invertedPriceTruncated =
                    invertedPriceNum < 0.0001
                        ? invertedPriceNum.toExponential(2)
                        : invertedPriceNum < 2
                        ? invertedPriceNum.toPrecision(3)
                        : invertedPriceNum.toFixed(2);
                setEstimatedInitialPriceDisplay(invertedPriceTruncated);

                isReferencePriceFound &&
                initialPriceDisplay === '' &&
                useReferencePrice &&
                !isTokenPairDefault
                    ? setInitialPriceDisplay(invertedPriceTruncated)
                    : !initialPriceInBaseDenom
                    ? setInitialPriceDisplay('')
                    : undefined;
            }
        }
    };

    useEffect(() => {
        refreshReferencePrice();
    }, [
        baseToken,
        quoteToken,
        isDenomBase,
        isTokenPairDefault,
        tradeDataMatchesURLParams,
        initialPriceDisplay === '',
    ]);

    useEffect(() => {
        handleDisplayUpdate();
    }, [isDenomBase]);

    const selectedPoolNonDisplayPrice = useMemo(() => {
        const selectedPriceInBaseDenom = isDenomBase
            ? 1 / parseFloat(initialPriceDisplay)
            : parseFloat(initialPriceDisplay);
        const priceNonDisplayNum = fromDisplayPrice(
            selectedPriceInBaseDenom,
            baseToken.decimals,
            quoteToken.decimals,
        );
        return priceNonDisplayNum;
    }, [isDenomBase, baseToken, quoteToken, initialPriceDisplay]);

    const selectedPoolPriceTick =
        Math.log(selectedPoolNonDisplayPrice) / Math.log(1.0001);

    const shouldResetAdvancedLowTick =
        advancedLowTick === 0 ||
        advancedHighTick > selectedPoolPriceTick + 100000 ||
        advancedLowTick < selectedPoolPriceTick - 100000;
    const shouldResetAdvancedHighTick =
        advancedHighTick === 0 ||
        advancedHighTick > selectedPoolPriceTick + 100000 ||
        advancedLowTick < selectedPoolPriceTick - 100000;

    const defaultLowTick = useMemo<number>(() => {
        const value: number =
            shouldResetAdvancedLowTick || advancedLowTick === 0
                ? roundDownTick(
                      selectedPoolPriceTick +
                          DEFAULT_MIN_PRICE_DIFF_PERCENTAGE * 100,
                      gridSize,
                  )
                : advancedLowTick;
        return value;
    }, [advancedLowTick, selectedPoolPriceTick, shouldResetAdvancedLowTick]);

    // default high tick to seed in the DOM (range upper value)
    const defaultHighTick = useMemo<number>(() => {
        const value: number =
            shouldResetAdvancedHighTick || advancedHighTick === 0
                ? roundUpTick(
                      selectedPoolPriceTick +
                          DEFAULT_MAX_PRICE_DIFF_PERCENTAGE * 100,
                      gridSize,
                  )
                : advancedHighTick;
        return value;
    }, [advancedHighTick, selectedPoolPriceTick, shouldResetAdvancedHighTick]);

    const pinnedMinPriceDisplayTruncatedInBase = useMemo(
        () =>
            getPinnedPriceValuesFromTicks(
                true,
                baseToken.decimals,
                quoteToken.decimals,
                defaultLowTick,
                defaultHighTick,
                gridSize,
            ).pinnedMinPriceDisplayTruncatedWithCommas,
        [
            baseToken.decimals,
            quoteToken.decimals,
            defaultLowTick,
            defaultHighTick,
        ],
    );
    const pinnedMinPriceDisplayTruncatedInQuote = useMemo(
        () =>
            getPinnedPriceValuesFromTicks(
                false,
                baseToken.decimals,
                quoteToken.decimals,
                defaultLowTick,
                defaultHighTick,
                gridSize,
            ).pinnedMinPriceDisplayTruncatedWithCommas,
        [
            baseToken.decimals,
            quoteToken.decimals,
            defaultLowTick,
            defaultHighTick,
        ],
    );
    const pinnedMaxPriceDisplayTruncatedInBase = useMemo(
        () =>
            getPinnedPriceValuesFromTicks(
                true,
                baseToken.decimals,
                quoteToken.decimals,
                defaultLowTick,
                defaultHighTick,
                gridSize,
            ).pinnedMaxPriceDisplayTruncatedWithCommas,
        [
            baseToken.decimals,
            quoteToken.decimals,
            defaultLowTick,
            defaultHighTick,
        ],
    );
    const pinnedMaxPriceDisplayTruncatedInQuote = useMemo(
        () =>
            getPinnedPriceValuesFromTicks(
                false,
                baseToken.decimals,
                quoteToken.decimals,
                defaultLowTick,
                defaultHighTick,
                gridSize,
            ).pinnedMaxPriceDisplayTruncatedWithCommas,
        [
            baseToken.decimals,
            quoteToken.decimals,
            defaultLowTick,
            defaultHighTick,
        ],
    );

    useEffect(() => {
        if (advancedMode) {
            const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                isDenomBase,
                baseToken.decimals,
                quoteToken.decimals,
                defaultLowTick,
                defaultHighTick,
                gridSize,
            );
            setRangeLowBoundNonDisplayPrice(
                pinnedDisplayPrices.pinnedMinPriceNonDisplay,
            );
            setRangeHighBoundNonDisplayPrice(
                pinnedDisplayPrices.pinnedMaxPriceNonDisplay,
            );

            setPinnedMinPriceDisplayTruncated(
                pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
            );
            setPinnedMaxPriceDisplayTruncated(
                pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
            );

            dispatch(setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick));
            dispatch(setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick));

            const highTickDiff =
                pinnedDisplayPrices.pinnedHighTick - selectedPoolPriceTick;
            const lowTickDiff =
                pinnedDisplayPrices.pinnedLowTick - selectedPoolPriceTick;

            const highGeometricDifferencePercentage =
                Math.abs(highTickDiff) < 200
                    ? parseFloat(truncateDecimals(highTickDiff / 100, 2))
                    : parseFloat(truncateDecimals(highTickDiff / 100, 0));
            const lowGeometricDifferencePercentage =
                Math.abs(lowTickDiff) < 200
                    ? parseFloat(truncateDecimals(lowTickDiff / 100, 2))
                    : parseFloat(truncateDecimals(lowTickDiff / 100, 0));
            isDenomBase
                ? setMaxPriceDifferencePercentage(
                      -lowGeometricDifferencePercentage,
                  )
                : setMaxPriceDifferencePercentage(
                      highGeometricDifferencePercentage,
                  );

            isDenomBase
                ? setMinPriceDifferencePercentage(
                      -highGeometricDifferencePercentage,
                  )
                : setMinPriceDifferencePercentage(
                      lowGeometricDifferencePercentage,
                  );

            const rangeLowBoundDisplayField = document.getElementById(
                'min-price-input-quantity',
            ) as HTMLInputElement;

            if (rangeLowBoundDisplayField) {
                rangeLowBoundDisplayField.value =
                    pinnedDisplayPrices.pinnedMinPriceDisplayTruncated;
                const rangeHighBoundDisplayField = document.getElementById(
                    'max-price-input-quantity',
                ) as HTMLInputElement;

                if (rangeHighBoundDisplayField) {
                    rangeHighBoundDisplayField.value =
                        pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated;
                }
            }

            setMaxPrice(
                parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated),
            );
            setMinPrice(
                parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated),
            );
        }
    }, [
        selectedPoolPriceTick,
        defaultLowTick,
        defaultHighTick,
        isDenomBase,
        baseToken.decimals,
        quoteToken.decimals,
        advancedMode,
    ]);

    const handleDisplayUpdate = () => {
        if (initialPriceDisplay) {
            if (isDenomBase) {
                setInitialPriceDisplay(
                    initialPriceInBaseDenom?.toString() ?? '',
                );
            } else {
                const invertedPriceNum = 1 / (initialPriceInBaseDenom ?? 1);

                const invertedPriceTruncated =
                    invertedPriceNum < 0.0001
                        ? invertedPriceNum.toExponential(2)
                        : invertedPriceNum < 2
                        ? invertedPriceNum.toPrecision(3)
                        : invertedPriceNum.toFixed(2);
                setInitialPriceDisplay(invertedPriceTruncated);
            }
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setConnectButtonDelayElapsed(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // calculate price of gas for pool init
    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const averageInitCostInGasDrops = 157922;
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageInitCostInGasDrops *
                1e-9 *
                ethMainnetUsdPrice;

            setInitGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum,
                    isUSD: true,
                }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

    const isTokenAAllowanceSufficient = parseFloat(tokenAAllowance) > 0;
    const isTokenBAllowanceSufficient = parseFloat(tokenBAllowance) > 0;

    const focusInput = () => {
        const inputField = document.getElementById(
            'initial-pool-price-quantity',
        ) as HTMLInputElement;

        const timer = setTimeout(() => {
            inputField.focus();
            inputField.setSelectionRange(
                inputField.value.length,
                inputField.value.length,
            );
        }, 500);
        return () => clearTimeout(timer);
    };

    // hooks to generate navigation actions with pre-loaded paths
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');
    const linkGenInit: linkGenMethodsIF = useLinkGen('initpool');

    const handleNavigation = () =>
        linkGenPool.navigate({
            chain: chainId,
            tokenA: tokenA.address,
            tokenB: tokenB.address,
        });

    const placeholderText = `e.g. ${estimatedInitialPriceDisplay} (${
        isDenomBase ? baseToken.symbol : quoteToken.symbol
    }/${isDenomBase ? quoteToken.symbol : baseToken.symbol})`;

    const handleInitialPriceInputChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const isValid =
            event.target.value === '' ||
            event.target.value === '.' ||
            exponentialNumRegEx.test(event.target.value);
        const targetValue = event.target.value.replaceAll(',', '');
        const input = targetValue.startsWith('.')
            ? '0' + targetValue
            : targetValue;
        const targetValueNum = parseFloat(input);
        isValid && setInitialPriceDisplay(input);

        if (
            isValid &&
            ((!isNaN(targetValueNum) && targetValueNum !== 0) ||
                event.target.value === '')
        ) {
            if (event.target.value === '') {
                setInitialPriceInBaseDenom(undefined);
            } else {
                if (isDenomBase) {
                    setInitialPriceInBaseDenom(targetValueNum);
                } else {
                    setInitialPriceInBaseDenom(1 / targetValueNum);
                }
            }
        }
    };

    // Begin Range Logic
    const { createRangePosition } = useCreateRangePosition();

    // const slippageTolerancePercentage = isStablePair(
    //     tokenA.address,
    //     tokenB.address,
    //     chainId,
    // )
    //     ? mintSlippage.stable
    //     : mintSlippage.volatile;

    const depositSkew = useMemo(
        () =>
            concDepositSkew(
                selectedPoolNonDisplayPrice ?? 0,
                rangeLowBoundNonDisplayPrice,
                rangeHighBoundNonDisplayPrice,
            ),
        [
            selectedPoolNonDisplayPrice,
            rangeLowBoundNonDisplayPrice,
            rangeHighBoundNonDisplayPrice,
        ],
    );

    // Tick functions modified from normal range
    // default low tick to seed in the DOM (range lower value)
    // initialPriceInBaseDenom

    const [newInitTransactionHash, setNewInitTransactionHash] = useState<
        undefined | string
    >('');
    const [newRangeTransactionHash, setNewRangeTransactionHash] = useState<
        undefined | string
    >('');
    const [txErrorCode, setTxErrorCode] = useState('');
    const [isInitPending, setIsInitPending] = useState(false);
    const [isTxCompletedInit, setIsTxCompletedInit] = useState(false);
    const [isTxCompletedRange, setIsTxCompletedRange] = useState(false);

    const transactionApprovedInit = newInitTransactionHash !== '';
    const transactionApprovedRange = newRangeTransactionHash !== '';
    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode !== '' && !isTransactionDenied;

    const [activeConfirmationStep, setActiveConfirmationStep] = useState(0);

    const resetConfirmation = () => {
        setTxErrorCode('');
        setNewRangeTransactionHash('');
        setNewInitTransactionHash('');
        setIsTxCompletedInit(false);
        setIsTxCompletedRange(false);
    };

    useEffect(() => {
        resetConfirmation();
        setInitialPriceDisplay('');
    }, [baseToken.address + quoteToken.address]);

    useEffect(() => {
        if (activeContent !== 'main') {
            setTokenACollateral('');
            setTokenBCollateral('');
            setActiveContent('main');
        }
    }, [tokenA.address + tokenB.address]);

    async function sendInit(
        initialPriceInBaseDenom: number | undefined,
        cb?: () => void,
    ) {
        resetConfirmation();

        if (initialPriceInBaseDenom) {
            let tx;
            try {
                setIsInitPending(true);
                tx = await crocEnv
                    ?.pool(baseToken.address, quoteToken.address)
                    .initPool(initialPriceInBaseDenom);

                setNewInitTransactionHash(tx?.hash);
                if (tx) dispatch(addPendingTx(tx?.hash));
                if (tx?.hash)
                    dispatch(
                        addTransactionByType({
                            txHash: tx.hash,
                            txType: 'Init',
                            txDescription: `Pool Initialization of ${quoteToken.symbol} / ${baseToken.symbol}`,
                        }),
                    );
                let receipt;
                try {
                    if (tx) receipt = await tx.wait();
                } catch (e) {
                    const error = e as TransactionError;
                    console.error({ error });
                    if (isTransactionReplacedError(error)) {
                        IS_LOCAL_ENV && console.debug('repriced');
                        dispatch(removePendingTx(error.hash));

                        const newTransactionHash = error.replacement.hash;
                        dispatch(addPendingTx(newTransactionHash));

                        dispatch(
                            updateTransactionHash({
                                oldHash: error.hash,
                                newHash: error.replacement.hash,
                            }),
                        );
                        setNewInitTransactionHash(newTransactionHash);

                        IS_LOCAL_ENV && console.debug({ newTransactionHash });
                        receipt = error.receipt;
                    } else if (isTransactionFailedError(error)) {
                        receipt = error.receipt;
                    }
                }
                if (receipt) {
                    dispatch(addReceipt(JSON.stringify(receipt)));
                    dispatch(removePendingTx(receipt.transactionHash));
                    if (cb) cb();
                    setIsTxCompletedInit(true);
                }
            } catch (error) {
                if (
                    error.reason === 'sending a transaction requires a signer'
                ) {
                    location.reload();
                }
                console.error({ error });
                setTxErrorCode(error?.code);
            } finally {
                setIsInitPending(false);
            }
        }
    }

    const { isTokenAInputDisabled, isTokenBInputDisabled } =
        useRangeInputDisable(
            isAmbient,
            isTokenABase,
            selectedPoolPriceTick, // Took place of: selectedPoolPriceTick,
            defaultLowTick,
            defaultHighTick,
            isDenomBase,
        );

    const {
        tokenAllowed: tokenAAllowed,
        rangeButtonErrorMessage: rangeButtonErrorMessageTokenA,
    } = useHandleRangeButtonMessage(
        tokenA,
        tokenACollateral,
        tokenABalance,
        tokenADexBalance,
        isTokenAInputDisabled,
        isWithdrawTokenAFromDexChecked,
        true, // hardcode pool initialized since we will be initializing it on confirm
        isMintLiqEnabled,
    );
    const {
        tokenAllowed: tokenBAllowed,
        rangeButtonErrorMessage: rangeButtonErrorMessageTokenB,
    } = useHandleRangeButtonMessage(
        tokenB,
        tokenBCollateral,
        tokenBBalance,
        tokenBDexBalance,
        isTokenBInputDisabled,
        isWithdrawTokenBFromDexChecked,
        true, // hardcode pool initialized since we will be initializing it on confirm
        isMintLiqEnabled,
    );

    // Next step - understand how sider affects these params
    const sendRangePosition = async () => {
        const params = {
            slippageTolerancePercentage: 3,
            isAmbient,
            tokenAInputQty: isTokenAInputDisabled
                ? 0
                : parseFloat(tokenACollateral),
            tokenBInputQty: isTokenBInputDisabled
                ? 0
                : parseFloat(tokenBCollateral),
            isWithdrawTokenAFromDexChecked,
            isWithdrawTokenBFromDexChecked,
            defaultLowTick,
            defaultHighTick,
            isAdd: false, // Always false for init
            setNewRangeTransactionHash,
            setTxErrorCode,
            resetConfirmation,
            poolPrice: selectedPoolNonDisplayPrice,
            setIsTxCompletedRange: setIsTxCompletedRange,
        };
        console.log('Debug, calling createRangePosition', params);
        createRangePosition(params);
    };

    const sendTransaction = isMintLiqEnabled
        ? async () => {
              console.log('initializing and minting');
              sendInit(initialPriceInBaseDenom, sendRangePosition);
          }
        : () => {
              console.log('initializing');
              sendInit(initialPriceInBaseDenom);
          };

    const ButtonToRender = () => {
        let buttonContent;

        switch (true) {
            case poolExists:
                // Display button for an already initialized pool
                buttonContent = (
                    <Button
                        title='Pool Already Initialized'
                        disabled={true}
                        action={() => {
                            IS_LOCAL_ENV && console.debug('clicked');
                        }}
                        flat={true}
                    />
                );
                break;

            case isConnected || !connectButtonDelayElapsed:
                // Display different buttons based on various conditions
                if (!isTokenAAllowanceSufficient) {
                    // Display token A approval button
                    buttonContent = tokenAApprovalButton;
                } else if (!isTokenBAllowanceSufficient) {
                    // Display token B approval button
                    buttonContent = tokenBApprovalButton;
                } else if (
                    initialPriceDisplay === '' ||
                    parseFloat(initialPriceDisplay.replaceAll(',', '')) <= 0
                ) {
                    // Display button to enter an initial price
                    buttonContent = (
                        <Button
                            title='Enter an Initial Price'
                            disabled={true}
                            action={() => {
                                IS_LOCAL_ENV && console.debug('clicked');
                            }}
                            flat={true}
                        />
                    );
                } else if (isInitPending === true) {
                    // Display button for pending initialization
                    buttonContent = (
                        <Button
                            title='Initialization Pending'
                            disabled={true}
                            action={() => {
                                IS_LOCAL_ENV && console.debug('clicked');
                            }}
                            flat={true}
                        />
                    );
                } else if (advancedHighTick <= advancedLowTick) {
                    buttonContent = (
                        <Button
                            title='Invalid range'
                            disabled={true}
                            action={() => {
                                IS_LOCAL_ENV && console.debug('clicked');
                            }}
                            flat={true}
                        />
                    );
                } else {
                    buttonContent = confirmButton;
                    // Display confirm button for final step
                }
                break;

            default:
                // Display button to connect wallet if no conditions match
                buttonContent = (
                    <Button
                        title='Connect Wallet'
                        action={openWagmiModalWallet}
                        flat={true}
                    />
                );
                break;
        }

        return buttonContent;
    };
    const confirmButton = useMemo(() => {
        const tokenInputValid = tokenAAllowed && tokenBAllowed;

        const disabled =
            erc20TokenWithDexBalance !== undefined || !tokenInputValid;
        const title = !tokenInputValid
            ? rangeButtonErrorMessageTokenA || rangeButtonErrorMessageTokenB
            : 'Confirm';
        return (
            <Button
                title={title}
                disabled={disabled}
                action={() => setActiveContent('confirmation')}
                flat={true}
            />
        );
    }, [
        tokenAAllowed,
        tokenBAllowed,
        erc20TokenWithDexBalance,
        rangeButtonErrorMessageTokenA,
        rangeButtonErrorMessageTokenB,
        initialPriceInBaseDenom,
        isMintLiqEnabled,
        sendRangePosition,
        sendInit,
    ]);
    const tokenAApprovalButton = (
        <Button
            title={
                !isApprovalPending
                    ? `Approve ${tokenA.symbol}`
                    : `${tokenA.symbol} Approval Pending`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approve(tokenA.address, tokenA.symbol);
            }}
            flat={true}
        />
    );

    const tokenBApprovalButton = (
        <Button
            title={
                !isApprovalPending
                    ? `Approve ${tokenB.symbol}`
                    : `${tokenB.symbol} Approval Pending`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approve(tokenB.address, tokenB.symbol);
            }}
            flat={true}
        />
    );

    const minPriceDisplay = isAmbient ? '0' : pinnedMinPriceDisplayTruncated;
    const maxPriceDisplay = isAmbient
        ? 'Infinity'
        : pinnedMaxPriceDisplayTruncated;

    const displayPriceWithDenom =
        isDenomBase && poolPriceDisplay
            ? 1 / poolPriceDisplay
            : poolPriceDisplay ?? 0;
    const poolPriceCharacter = isDenomBase
        ? isTokenABase
            ? getUnicodeCharacter(tokenB.symbol)
            : getUnicodeCharacter(tokenA.symbol)
        : !isTokenABase
        ? getUnicodeCharacter(tokenB.symbol)
        : getUnicodeCharacter(tokenA.symbol);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (rangeWidthPercentage === 100 && !advancedMode) {
            setIsAmbient(true);
            setRangeLowBoundNonDisplayPrice(0);
            setRangeHighBoundNonDisplayPrice(Infinity);
        } else if (advancedMode) {
            setIsAmbient(false);
        } else {
            setIsAmbient(false);
            if (
                Math.abs(selectedPoolPriceTick) === Infinity ||
                Math.abs(selectedPoolPriceTick) === 0
            )
                return;
            const lowTick = selectedPoolPriceTick - rangeWidthPercentage * 100;
            const highTick = selectedPoolPriceTick + rangeWidthPercentage * 100;

            const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                isDenomBase,
                baseToken.decimals,
                quoteToken.decimals,
                lowTick,
                highTick,
                gridSize,
            );

            setPinnedDisplayPrices(pinnedDisplayPrices);

            setRangeLowBoundNonDisplayPrice(
                pinnedDisplayPrices.pinnedMinPriceNonDisplay,
            );
            setRangeHighBoundNonDisplayPrice(
                pinnedDisplayPrices.pinnedMaxPriceNonDisplay,
            );

            setPinnedMinPriceDisplayTruncated(
                pinnedDisplayPrices.pinnedMinPriceDisplayTruncated,
            );
            setPinnedMaxPriceDisplayTruncated(
                pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated,
            );

            dispatch(setAdvancedLowTick(pinnedDisplayPrices.pinnedLowTick));
            dispatch(setAdvancedHighTick(pinnedDisplayPrices.pinnedHighTick));

            setMaxPrice(
                parseFloat(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated),
            );
            setMinPrice(
                parseFloat(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated),
            );
        }
    }, [
        rangeWidthPercentage,
        advancedMode,
        isDenomBase,
        selectedPoolPriceTick,
        baseToken.address + quoteToken.address,
        baseToken.decimals,
        quoteToken.decimals,
    ]);

    const rangeWidthProps = {
        rangeWidthPercentage: rangeWidthPercentage,
        setRangeWidthPercentage: setRangeWidthPercentage,
        setRescaleRangeBoundariesWithSlider:
            setRescaleRangeBoundariesWithSlider,
        inputId: 'input-slider-range',
    };

    const rangePriceInfoProps = {
        pinnedDisplayPrices: pinnedDisplayPrices,
        spotPriceDisplay: getFormattedNumber({
            value: displayPriceWithDenom,
        }),
        maxPriceDisplay: maxPriceDisplay,
        minPriceDisplay: minPriceDisplay,
        aprPercentage: 10,
        daysInRange: 10,
        isTokenABase: false,
        poolPriceCharacter: poolPriceCharacter,
        isAmbient: isAmbient,
    };

    const minMaxPriceProps = {
        minPricePercentage: minPriceDifferencePercentage,
        maxPricePercentage: maxPriceDifferencePercentage,
        minPriceInputString: minPriceInputString,
        maxPriceInputString: maxPriceInputString,
        setMinPriceInputString: setMinPriceInputString,
        setMaxPriceInputString: setMaxPriceInputString,
        isDenomBase: isDenomBase,
        highBoundOnBlur: () => setRangeHighBoundFieldBlurred(true),
        lowBoundOnBlur: () => setRangeLowBoundFieldBlurred(true),
        rangeLowTick: defaultLowTick,
        rangeHighTick: defaultHighTick,
        disable: false,
        maxPrice: maxPrice,
        minPrice: minPrice,
        setMaxPrice: setMaxPrice,
        setMinPrice: setMinPrice,
    };

    function goToNewUrlParams(
        chain: string,
        addrTokenA: string,
        addrTokenB: string,
    ): void {
        linkGenPool.navigate({
            chain: chain,
            tokenA: addrTokenA,
            tokenB: addrTokenB,
        });
    }

    const newUrlTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <Text
                    fontSize='body'
                    color='accent1'
                    align='left'
                    cursor='pointer'
                    onClick={() =>
                        goToNewUrlParams(
                            chainId,
                            tokenA.address,
                            tokenB.address,
                        )
                    }
                >
                    {` Trade ${tokenA.symbol} / ${tokenB.symbol}`}{' '}
                    <FiExternalLink color='var(--accent6)' />
                </Text>
            }
            placement={'right'}
            enterDelay={750}
            leaveDelay={0}
        >
            <Text fontSize='body' color='text2' style={{ width: '80px' }}>
                Select Tokens
            </Text>
        </TextOnlyTooltip>
    );

    function reverseTokens() {
        setTokenACollateral('');
        setTokenBCollateral('');
        linkGenInit.navigate({
            chain: chainId,
            tokenA: tokenB.address,
            tokenB: tokenA.address,
        });
    }

    const simpleTokenSelect = (
        <FlexContainer flexDirection='column' gap={8}>
            {newUrlTooltip}
            <InitPoolTokenSelect
                tokenAorB={'A'}
                token={tokenA}
                setTokenModalOpen={setTokenModalOpen}
                reverseTokens={reverseTokens}
            />
            <InitPoolTokenSelect
                tokenAorB={'B'}
                token={tokenB}
                setTokenModalOpen={setTokenModalOpen}
                reverseTokens={reverseTokens}
            />
        </FlexContainer>
    );

    const handleRefresh = () => {
        setIsLoading(true);
        (async () => {
            await refreshReferencePrice();
        })();

        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    const [useReferencePrice, setUseReferencePrice] = useState(true);

    const openEditMode = () => {
        setIsEditEnabled(true);
        if (
            initialPriceDisplay === '' &&
            (!isReferencePriceAvailable ||
                (isReferencePriceAvailable && useReferencePrice))
        ) {
            setInitialPriceDisplay(estimatedInitialPriceDisplay);
            const targetValue = estimatedInitialPriceDisplay.replaceAll(
                ',',
                '',
            );

            const targetValueNum = parseFloat(targetValue);

            if (targetValue === '') {
                setInitialPriceInBaseDenom(undefined);
            } else {
                if (isDenomBase) {
                    setInitialPriceInBaseDenom(targetValueNum);
                } else {
                    setInitialPriceInBaseDenom(1 / targetValueNum);
                }
            }
        }
        focusInput();
        isReferencePriceAvailable && setUseReferencePrice(false);
    };

    function handleRefPriceToggle() {
        setUseReferencePrice(!useReferencePrice);
        if (estimatedInitialPriceDisplay !== undefined) {
            setInitialPriceDisplay(estimatedInitialPriceDisplay);
        } else setInitialPriceDisplay('');
    }

    useEffect(() => {
        if (!useReferencePrice) openEditMode();
    }, [useReferencePrice]);

    // toggle to use reference price
    const refPriceToggle = (
        <FlexContainer flexDirection='row' alignItems='center' gap={8}>
            <Text fontSize='body' color='text2'>
                Use reference price
            </Text>
            {isReferencePriceAvailable && (
                <TooltipComponent title='Suggested initial pool prices are based on other decentralized exchanges.' />
            )}
            <Toggle
                id='toggle_ref_price'
                isOn={useReferencePrice}
                disabled={!isReferencePriceAvailable}
                handleToggle={handleRefPriceToggle}
            />
        </FlexContainer>
    );

    // pencil icon and refresh icon
    const initPriceEdit = (
        <FlexContainer gap={8}>
            {initialPriceDisplay === '' || !isReferencePriceAvailable ? (
                ''
            ) : (
                <FiRefreshCw size={20} onClick={handleRefresh} />
            )}
            <LuEdit2 size={20} onClick={() => openEditMode()} />
        </FlexContainer>
    );

    const initPriceContainer = (
        <FlexContainer
            flexDirection='column'
            gap={10}
            justifyContent='center'
            blur={!!poolExists}
        >
            <FlexContainer flexDirection='row' justifyContent='space-between'>
                <FlexContainer flexDirection='row' gap={8} alignItems='center'>
                    <Text fontSize='body' color='text2'>
                        Initial Pool Price
                    </Text>
                </FlexContainer>
                {isReferencePriceAvailable ? refPriceToggle : initPriceEdit}
            </FlexContainer>
            <section
                style={{ width: '100%' }}
                onDoubleClick={() => openEditMode()}
            >
                {isLoading ? (
                    <FlexContainer
                        height='31px'
                        background='dark2'
                        alignItems='center'
                        padding='0 16px'
                    >
                        {' '}
                        <Spinner size={24} bg='var(--dark2)' weight={2} />
                    </FlexContainer>
                ) : (
                    <CurrencyQuantityInput
                        disabled={!isEditEnabled}
                        id='initial-pool-price-quantity'
                        placeholder={placeholderText}
                        type='string'
                        onChange={handleInitialPriceInputChange}
                        onBlur={() => setIsEditEnabled(false)}
                        value={initialPriceDisplay}
                        inputMode='decimal'
                        autoComplete='off'
                        autoCorrect='off'
                        min='0'
                        minLength={1}
                    />
                )}
            </section>
        </FlexContainer>
    );

    const toggleDexSelection = (tokenAorB: 'A' | 'B') => {
        if (tokenAorB === 'A') {
            setIsWithdrawTokenAFromDexChecked(!isWithdrawTokenAFromDexChecked);
            console.log('toggled');
        } else {
            setIsWithdrawTokenBFromDexChecked(!isWithdrawTokenBFromDexChecked);
        }
    };
    const showMobileVersion = useMediaQuery('(max-width: 768px)');

    const isRangeBoundsAndCollateralDisabled =
        poolExists || !isMintLiqEnabled || !selectedPoolNonDisplayPrice;

    const collateralContent = (
        <FlexContainer
            flexDirection='column'
            justifyContent='center'
            gap={10}
            blur={isRangeBoundsAndCollateralDisabled}
        >
            <FlexContainer flexDirection='row' justifyContent='space-between'>
                <Text fontSize='body' color='text2'>
                    Collateral
                </Text>
            </FlexContainer>

            <RangeTokenInput
                hidePlus
                isAmbient={isAmbient}
                depositSkew={depositSkew}
                poolPriceNonDisplay={selectedPoolNonDisplayPrice}
                isWithdrawFromDexChecked={{
                    tokenA: isWithdrawTokenAFromDexChecked,
                    tokenB: isWithdrawTokenBFromDexChecked,
                }}
                isOutOfRange={false}
                tokenAInputQty={{
                    value: tokenACollateral,
                    set: setTokenACollateral,
                }}
                tokenBInputQty={{
                    value: tokenBCollateral,
                    set: setTokenBCollateral,
                }}
                toggleDexSelection={toggleDexSelection}
                isInputDisabled={{
                    tokenA: isTokenAInputDisabled,
                    tokenB: isTokenBInputDisabled,
                }}
                reverseTokens={reverseTokens}
                isInitPage
            />
        </FlexContainer>
    );

    const mintInitialLiquidity = (
        <FlexContainer
            flexDirection='row'
            justifyContent='space-between'
            blur={!!poolExists || initialPriceDisplay === ''}
        >
            <Text fontSize='body' color='text2'>
                Mint Initial Liquidity
            </Text>
            <Toggle
                id='init_mint_liq'
                isOn={isMintLiqEnabled}
                disabled={poolExists === true}
                handleToggle={() => setIsMintLiqEnabled(!isMintLiqEnabled)}
            />
        </FlexContainer>
    );

    useEffect(() => {
        if (!isMintLiqEnabled) {
            setTokenACollateral('');
            setTokenBCollateral('');
        }
    }, [isMintLiqEnabled]);

    useEffect(() => {
        if (poolExists) {
            setShowErrorMessage(false);
        } else if (erc20TokenWithDexBalance) {
            setShowErrorMessage(true);
        } else {
            setShowErrorMessage(false);
        }
    }, [erc20TokenWithDexBalance, poolExists]);

    const handleSetActiveContent = (newActiveContent: string) => {
        setActiveContent(newActiveContent);
    };

    const [userClickedSendToMetamask, setUserClickedSendToMetamask] =
        useState(false);

    const handleGoBack = () => {
        if (activeContent === 'confirmation') {
            if (userClickedSendToMetamask) {
                setUserClickedSendToMetamask(false);
            } else {
                setActiveContent('main');
            }

            if (activeConfirmationStep === 4) {
                setActiveContent('main');
            }
        } else {
            handleNavigation();
        }
        resetConfirmation();
    };

    const hideContentOnMobile = !isMintLiqEnabled && showMobileVersion;

    const warningAndExtraInfo = showErrorMessage ? (
        <div
            style={{
                padding: hideContentOnMobile ? '20px 40px' : '0 40px',
            }}
        >
            <WarningBox
                details={`Due to a known issue, you currently need to completely withdraw your ${erc20TokenWithDexBalance?.symbol} exchange balance before proceeding with pool initialization.`}
            />
        </div>
    ) : (
        <FlexContainer blur={!!poolExists} justifyContent='center'>
            <InitPoolExtraInfo
                initialPrice={parseFloat(
                    initialPriceDisplay.replaceAll(',', ''),
                )}
                isDenomBase={isDenomBase}
                initGasPriceinDollars={initGasPriceinDollars}
                baseToken={baseToken}
                quoteToken={quoteToken}
                setIsDenomBase={setIsDenomBase}
            />
        </FlexContainer>
    );

    const mainContent = (
        <InitSkeleton
            isTokenModalOpen={tokenModalOpen}
            handleGoBack={handleGoBack}
            isConfirmation={false}
            activeContent={activeContent}
            setActiveContent={setActiveContent}
            title='Initialize Pool'
        >
            {/* Left */}
            <FlexContainer
                padding='0 8px'
                flexDirection='column'
                gap={8}
                justifyContent='space-between'
            >
                {simpleTokenSelect}
                {initPriceContainer}
                {showMobileVersion && mintInitialLiquidity}
                {collateralContent}
            </FlexContainer>

            <FlexContainer
                padding='0 8px'
                flexDirection='column'
                justifyContent='space-between'
            >
                <FlexContainer flexDirection='column' gap={8}>
                    {!showMobileVersion && mintInitialLiquidity}
                    <FlexContainer blur={isRangeBoundsAndCollateralDisabled}>
                        <AdvancedModeToggle advancedMode={advancedMode} />
                    </FlexContainer>

                    {!hideContentOnMobile && (
                        <RangeBounds
                            isRangeBoundsDisabled={
                                isRangeBoundsAndCollateralDisabled
                            }
                            {...rangeWidthProps}
                            {...rangePriceInfoProps}
                            {...minMaxPriceProps}
                            customSwitch={true}
                        />
                    )}
                </FlexContainer>

                <FlexContainer flexDirection='column' gap={8}>
                    {warningAndExtraInfo}
                    <ButtonToRender />
                </FlexContainer>
            </FlexContainer>
        </InitSkeleton>
    );

    const initialPriceLocaleString = getFormattedNumber({
        value: parseFloat(initialPriceDisplay.replaceAll(',', '')),
    });

    const priceDisplayString = isDenomBase
        ? `1 ${baseToken.symbol} = ${initialPriceLocaleString} ${quoteToken.symbol}`
        : `1 ${quoteToken.symbol} = ${initialPriceLocaleString} ${baseToken.symbol}`;

    const priceDisplayDiv = (
        <div
            onClick={() => {
                setIsDenomBase(!isDenomBase);
            }}
            style={{ cursor: 'pointer' }}
        >
            {priceDisplayString}
        </div>
    );

    const initConfirmationProps = {
        activeContent,
        setActiveContent,
        sendTx: sendTransaction,
        transactionApprovedInit,
        transactionApprovedRange,
        isTransactionDenied,
        isTransactionException,
        tokenA,
        tokenB,
        isAmbient,
        isTokenABase,
        errorCode: txErrorCode,
        isTxCompletedInit,
        isTxCompletedRange,
        handleNavigation,
        pinnedMinPriceDisplayTruncatedInBase,
        pinnedMinPriceDisplayTruncatedInQuote,
        pinnedMaxPriceDisplayTruncatedInBase,
        pinnedMaxPriceDisplayTruncatedInQuote,
        tokenACollateral,
        tokenBCollateral,
        isDenomBase,
        setIsDenomBase,
        activeStep: activeConfirmationStep,
        setActiveStep: setActiveConfirmationStep,
        isConfirmed: userClickedSendToMetamask,
        setIsConfirmed: setUserClickedSendToMetamask,
        isMintLiqEnabled,

        initialPriceDisplay,
        priceDisplayString,
        priceDisplayDiv,
        initialPriceInBaseDenom,
    };

    const confirmationContent = (
        <InitSkeleton
            isTokenModalOpen={tokenModalOpen}
            handleGoBack={handleGoBack}
            isConfirmation={true}
            activeContent={activeContent}
            setActiveContent={setActiveContent}
            title='Initialize Pool'
        >
            <InitConfirmation {...initConfirmationProps} />
        </InitSkeleton>
    );

    const settingsContent = (
        <InitSkeleton
            isTokenModalOpen={tokenModalOpen}
            handleGoBack={handleGoBack}
            isConfirmation={true}
            activeContent={activeContent}
            setActiveContent={setActiveContent}
            title='Settings'
        >
            <InitConfirmation {...initConfirmationProps} />
        </InitSkeleton>
    );

    return (
        <>
            <MultiContentComponent
                mainContent={mainContent}
                settingsContent={settingsContent}
                confirmationContent={confirmationContent}
                activeContent={activeContent}
                setActiveContent={handleSetActiveContent}
            />
        </>
    );
}
