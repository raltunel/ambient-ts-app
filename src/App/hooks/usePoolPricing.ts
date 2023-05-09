import { ChainSpec, CrocEnv, toDisplayPrice } from '@crocswap-libs/sdk';
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { receiptData } from '../../utils/state/receiptDataSlice';
import {
    setDidUserFlipDenom,
    setLimitTick,
    setPoolPriceNonDisplay,
    setPrimaryQuantityRange,
} from '../../utils/state/tradeDataSlice';
import { get24hChange } from '../functions/getPoolStats';
import {
    memoizeQuerySpotPrice,
    SpotPriceFn,
} from '../functions/querySpotPrice';

interface PoolPricingPropsIF {
    crocEnv?: CrocEnv;
    pathname: string;
    baseTokenAddress: string;
    quoteTokenAddress: string;
    baseTokenDecimals: number;
    quoteTokenDecimals: number;
    searchableTokens: TokenIF[];
    chainData: ChainSpec;
    receiptCount: number;
    isUserLoggedIn: boolean;
    isUserIdle: boolean;
    lastBlockNumber: number;
    isServerEnabled: boolean;
    cachedQuerySpotPrice: SpotPriceFn;
}

export function usePoolPricing(props: PoolPricingPropsIF) {
    const dispatch = useAppDispatch();
    const tradeData = useAppSelector((state) => state.tradeData);

    // value for whether a pool exists on current chain and token pair
    // ... true => pool exists
    // ... false => pool does not exist
    // ... null => no crocEnv to check if pool exists
    const [poolExists, setPoolExists] = useState<boolean | undefined>();

    const [poolPriceDisplay, setPoolPriceDisplay] = useState<
        number | undefined
    >();

    const [poolPriceChangePercent, setPoolPriceChangePercent] = useState<
        string | undefined
    >();
    const [isPoolPriceChangePositive, setIsPoolPriceChangePositive] =
        useState<boolean>(true);

    const getDisplayPrice = (spotPrice: number) => {
        return toDisplayPrice(
            spotPrice,
            props.baseTokenDecimals,
            props.quoteTokenDecimals,
        );
    };

    const getSpotPrice = async (
        baseTokenAddress: string,
        quoteTokenAddress: string,
    ) => {
        if (!props.crocEnv) {
            return;
        }
        return await props.cachedQuerySpotPrice(
            props.crocEnv,
            baseTokenAddress,
            quoteTokenAddress,
            props.chainData.chainId,
            props.lastBlockNumber,
        );
    };

    useEffect(() => {
        setPoolPriceDisplay(0);
    }, [props.baseTokenAddress, props.quoteTokenAddress]);

    // hook to update `poolExists` when crocEnv changes
    useEffect(() => {
        if (
            props.crocEnv &&
            props.baseTokenAddress &&
            props.quoteTokenAddress
        ) {
            if (
                props.baseTokenAddress.toLowerCase() ===
                props.quoteTokenAddress.toLowerCase()
            )
                return;
            // token pair has an initialized pool on-chain
            // returns a promise object
            const doesPoolExist = props.crocEnv
                // TODO: make this function pill addresses directly from URL params
                .pool(props.baseTokenAddress, props.quoteTokenAddress)
                .isInit();
            // resolve the promise object to see if pool exists
            Promise.resolve(doesPoolExist)
                // track whether pool exists on state (can be undefined)
                .then((res) => setPoolExists(res));
        }
        // run every time crocEnv updates
        // this indirectly tracks a new chain being used
    }, [
        props.crocEnv,
        props.baseTokenAddress,
        props.quoteTokenAddress,
        props.chainData.chainId,
        props.receiptCount,
    ]);

    // useEffect to get spot price when tokens change and block updates
    useEffect(() => {
        if (
            !props.isUserIdle &&
            props.crocEnv &&
            props.baseTokenAddress &&
            props.quoteTokenAddress &&
            props.lastBlockNumber !== 0
        ) {
            (async () => {
                const spotPrice = await getSpotPrice(
                    props.baseTokenAddress,
                    props.quoteTokenAddress,
                );
                if (spotPrice) {
                    const newDisplayPrice = getDisplayPrice(spotPrice);
                    if (newDisplayPrice !== poolPriceDisplay) {
                        console.log('Set pool price display');
                        setPoolPriceDisplay(newDisplayPrice);
                    }
                }
                if (spotPrice && spotPrice !== tradeData.poolPriceNonDisplay) {
                    dispatch(setPoolPriceNonDisplay(spotPrice));
                }
            })();
        }
    }, [
        props.isUserIdle,
        props.lastBlockNumber,
        props.baseTokenAddress,
        props.quoteTokenAddress,
        !!props.crocEnv,
        tradeData.poolPriceNonDisplay === 0,
        props.isUserLoggedIn,
    ]);

    useEffect(() => {
        (async () => {
            if (
                props.isServerEnabled &&
                props.baseTokenAddress &&
                props.quoteTokenAddress
            ) {
                try {
                    const priceChangeResult = await get24hChange(
                        props.chainData.chainId,
                        props.baseTokenAddress,
                        props.quoteTokenAddress,
                        props.chainData.poolIndex,
                        tradeData.isDenomBase,
                    );

                    if (priceChangeResult > -0.01 && priceChangeResult < 0.01) {
                        setPoolPriceChangePercent('No Change');
                        setIsPoolPriceChangePositive(true);
                    } else if (priceChangeResult) {
                        priceChangeResult > 0
                            ? setIsPoolPriceChangePositive(true)
                            : setIsPoolPriceChangePositive(false);

                        const priceChangeString =
                            priceChangeResult > 0
                                ? '+' +
                                  priceChangeResult.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  }) +
                                  '%'
                                : priceChangeResult.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  }) + '%';
                        setPoolPriceChangePercent(priceChangeString);
                    } else {
                        setPoolPriceChangePercent(undefined);
                    }
                } catch (error) {
                    setPoolPriceChangePercent(undefined);
                }
            }
        })();
    }, [
        props.isServerEnabled,
        tradeData.isDenomBase,
        props.baseTokenAddress,
        props.quoteTokenAddress,
        props.lastBlockNumber,
    ]);

    useEffect(() => {
        if (!props.pathname.includes('limitTick')) {
            dispatch(setLimitTick(undefined));
        }
        dispatch(setPrimaryQuantityRange(''));
        setPoolPriceDisplay(undefined);
        dispatch(setDidUserFlipDenom(false)); // reset so a new token pair is re-evaluated for price > 1
        setPoolPriceChangePercent(undefined);
    }, [props.baseTokenAddress, props.quoteTokenAddress]);

    return {
        poolPriceDisplay,
        poolExists,
        poolPriceChangePercent,
        isPoolPriceChangePositive,
    };
}
