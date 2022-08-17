import styles from './TradeCharts.module.css';

// icons
import {
    AiOutlineCamera,
    AiOutlineFullscreen,
    // AiOutlineSetting,
    AiOutlineDownload,
    AiOutlineCopy,
    AiOutlineLink,
    AiOutlineTwitter,
} from 'react-icons/ai';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { DefaultTooltip } from '../../../components/Global/StyledTooltip/StyledTooltip';
import { motion } from 'framer-motion';
import printDomToImage from '../../../utils/functions/printDomToImage';
// end of icons
import {
    // eslint-disable-next-line
    tradeData as TradeDataIF,
    toggleDidUserFlipDenom,
    setActiveChartPeriod,
} from '../../../utils/state/tradeDataSlice';
import { useAppSelector, useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { Dispatch, SetStateAction, useState, useEffect, useMemo, useRef } from 'react';
// import truncateDecimals from '../../../utils/data/truncateDecimals';
import TradeCandleStickChart from './TradeCandleStickChart';
interface TradeChartsProps {
    // denomInTokenA: boolean;
    // tokenASymbol: string;
    // tokenBSymbol: string;
    lastBlockNumber: number;
    poolPriceDisplay: number;
    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    isTokenABase: boolean;
    fullScreenChart: boolean;
    setFullScreenChart: Dispatch<SetStateAction<boolean>>;
    changeState: (isOpen: boolean | undefined, candleData: CandleData | undefined) => void;
    candleData: CandlesByPoolAndDuration | undefined;
}

// trade charts
import { usePoolChartData } from '../../../state/pools/hooks';
import getUnicodeCharacter from '../../../utils/functions/getUnicodeCharacter';
import { CandleData, CandlesByPoolAndDuration } from '../../../utils/state/graphDataSlice';
import { get24hChange } from '../../../App/functions/getPoolStats';

//
export default function TradeCharts(props: TradeChartsProps) {
    const { fullScreenChart, setFullScreenChart, lastBlockNumber } = props;
    const { poolPriceDisplay } = props;

    const dispatch = useAppDispatch();

    // ---------------------TRADE DATA CALCULATIONS------------------------

    const tradeData = useAppSelector((state) => state.tradeData);

    // const graphData = useAppSelector((state) => state.graphData);

    // const mainnetCandlePoolDefinition = JSON.stringify({
    //     baseAddress: '0x0000000000000000000000000000000000000000',
    //     quoteAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
    //     poolIdx: 36000,
    //     network: '0x1',
    // }).toLowerCase();

    // const indexOfMainnetCandlePool = graphData.candlesForAllPools.pools
    //     .map((item) => JSON.stringify(item.pool).toLowerCase())
    //     .findIndex((pool) => pool === mainnetCandlePoolDefinition);

    // const mainnetCandleData = graphData.candlesForAllPools.pools[indexOfMainnetCandlePool];

    // useEffect(() => {
    //     console.log({ mainnetCandleData });
    // }, [mainnetCandleData]);

    const isTokenABase = props.isTokenABase;
    const setActivePeriod = (period: number) => {
        dispatch(setActiveChartPeriod(period));
    };
    const denomInBase = tradeData.isDenomBase;
    const denomInTokenA = (denomInBase && isTokenABase) || (!denomInBase && !isTokenABase);
    const tokenASymbol = tradeData.tokenA.symbol;
    const tokenBSymbol = tradeData.tokenB.symbol;
    const tokenAAddress = tradeData.tokenA.address;
    const tokenBAddress = tradeData.tokenB.address;

    const truncatedPoolPrice =
        poolPriceDisplay === Infinity || poolPriceDisplay === 0
            ? '...'
            : poolPriceDisplay < 2
            ? poolPriceDisplay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : poolPriceDisplay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    // const truncatedPoolPrice =
    //     poolPriceDisplay < 2
    //         ? truncateDecimals(poolPriceDisplay, 4)
    //         : truncateDecimals(poolPriceDisplay, 2);
    // ---------------------END OF TRADE DATA CALCULATIONS------------------------

    // GRAPH SETTINGS CONTENT------------------------------------------------------
    const canvasRef = useRef(null);
    const downloadAsImage = () => {
        if (canvasRef.current) {
            printDomToImage(canvasRef.current);
        }
    };
    const saveImageContent = (
        <div className={styles.save_image_container}>
            <div className={styles.save_image_content} onClick={downloadAsImage}>
                <AiOutlineDownload />
                Save Chart Image
            </div>
            <div className={styles.save_image_content}>
                <AiOutlineCopy />
                Copy Chart Image
            </div>
            <div className={styles.save_image_content}>
                <AiOutlineLink />
                Copy link to the chart image
            </div>
            <div className={styles.save_image_content}>
                <HiOutlineExternalLink />
                Open image in new tab
            </div>
            <div className={styles.save_image_content}>
                <AiOutlineTwitter />
                Tweet chart image
            </div>
        </div>
    );
    // CHART SETTINGS------------------------------------------------------------
    // const [openSettingsTooltip, setOpenSettingsTooltip] = useState(false);
    const [showTvl, setShowTvl] = useState(false);
    const [showFeeRate, setShowFeeRate] = useState(false);
    const [showVolume, setShowVolume] = useState(false);

    const chartItemStates = { showFeeRate, showTvl, showVolume };

    // END OF CHART SETTINGS------------------------------------------------------------

    // eslint-disable-next-line
    function closeOnEscapeKeyDown(e: any) {
        if ((e.charCode || e.keyCode) === 27) setFullScreenChart(false);
    }

    useEffect(() => {
        document.body.addEventListener('keydown', closeOnEscapeKeyDown);
        return function cleanUp() {
            document.body.removeEventListener('keydown', closeOnEscapeKeyDown);
        };
    });
    const graphSettingsContent = (
        <div className={styles.graph_settings_container}>
            {/* <DefaultTooltip
                interactive
                title={'nothing yet'}
                open={openSettingsTooltip}
                onOpen={() => setOpenSettingsTooltip(true)}
                onClose={() => setOpenSettingsTooltip(false)}
            >
                <div />
            </DefaultTooltip>
            <div onClick={() => setOpenSettingsTooltip(!openSettingsTooltip)}>
                <AiOutlineSetting size={20} />
            </div> */}
            <div onClick={() => setFullScreenChart(!fullScreenChart)}>
                <AiOutlineFullscreen size={20} />
            </div>
            <DefaultTooltip interactive title={saveImageContent}>
                <div>
                    <AiOutlineCamera size={20} />
                </div>
            </DefaultTooltip>
        </div>
    );

    // END OF GRAPH SETTINGS CONTENT------------------------------------------------------

    const [poolPriceChangePercent, setPoolPriceChangePercent] = useState<string | undefined>(
        undefined,
    );

    useEffect(() => {
        (async () => {
            if (tokenAAddress && tokenBAddress) {
                try {
                    const priceChangeResult = await get24hChange(
                        '0x5',
                        isTokenABase ? tokenAAddress : tokenBAddress,
                        isTokenABase ? tokenBAddress : tokenAAddress,
                        36000,
                        denomInBase,
                    );

                    if (priceChangeResult) {
                        console.log({ priceChangeResult });
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
    }, [denomInBase, tokenAAddress, tokenBAddress, lastBlockNumber]);

    // ---------------------------ACTIVE OVERLAY BUTTON FUNCTIONALITY-------------------------------

    // this could be simplify into 1 reusable function but I figured we might have to do some other calculations for each of these so I am sepearing it for now. -Jr
    const handleVolumeToggle = () => setShowVolume(!showVolume);
    const handleTvlToggle = () => setShowTvl(!showTvl);
    const handleFeeRateToggle = () => setShowFeeRate(!showFeeRate);

    const chartOverlayButtonData = [
        { name: 'Volume', selected: showVolume, action: handleVolumeToggle },
        { name: 'TVL', selected: showTvl, action: handleTvlToggle },
        { name: 'Fee Rate', selected: showFeeRate, action: handleFeeRateToggle },
        // { name: 'Heatmap', function: () => console.log('heatmap') },
        // { name: 'Liquidity Profile', function: () => console.log('heatmap')  },
        // { name: 'Curve', function: () => console.log('Curve')  },
        // { name: 'Depth', function: () => console.log('Depth')  },
    ];

    const chartOverlayButtons = chartOverlayButtonData.map((button, idx) => (
        <div className={styles.settings_container} key={idx}>
            <button
                onClick={button.action}
                className={
                    button.selected
                        ? styles.active_selected_button
                        : styles.non_active_selected_button
                }
            >
                {button.name}
            </button>
        </div>
    ));
    // --------------------------- END OF ACTIVE OVERLAY BUTTON FUNCTIONALITY-------------------------------

    // --------------------------- TIME FRAME BUTTON FUNCTIONALITY-------------------------------

    const activeTimeFrameData = [
        { label: '1m', activePeriod: 60 },
        { label: '5m', activePeriod: 300 },
        { label: '15m', activePeriod: 900 },
        { label: '1h', activePeriod: 3600 },
        { label: '4h', activePeriod: 14400 },
        { label: '1d', activePeriod: 86400 },
    ];
    const [activeTimeFrame, setActiveTimeFrame] = useState('5m');

    function handleTimeFrameButtonClick(label: string, time: number) {
        setActiveTimeFrame(label);
        setActivePeriod(time);
    }

    const activeTimeFrameDisplay = activeTimeFrameData.map((time, idx) => (
        <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.settings_container}
            key={idx}
        >
            <button
                onClick={() => handleTimeFrameButtonClick(time.label, time.activePeriod)}
                className={
                    time.label === activeTimeFrame
                        ? styles.active_button2
                        : styles.non_active_button2
                }
            >
                {time.label}

                {time.label === activeTimeFrame && (
                    <motion.div
                        layoutId='outline2'
                        className={styles.outline2}
                        initial={false}
                        // animate={{ borderColor: 'red' }}
                        transition={spring}
                    />
                )}
            </button>
        </motion.div>
    ));

    // --------------------------- END OF TIME FRAME BUTTON FUNCTIONALITY-------------------------------

    // TOKEN INFO----------------------------------------------------------------
    const tokenInfo = (
        <div className={styles.token_info_container}>
            <div className={styles.tokens_info} onClick={() => dispatch(toggleDidUserFlipDenom())}>
                <div className={styles.tokens_images}>
                    <img
                        src={denomInTokenA ? tradeData.tokenA.logoURI : tradeData.tokenB.logoURI}
                        // src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                        alt='token'
                        width='30px'
                    />
                    <img
                        src={denomInTokenA ? tradeData.tokenB.logoURI : tradeData.tokenA.logoURI}
                        // src='https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
                        alt='token'
                        width='30px'
                    />
                </div>
                <span className={styles.tokens_name}>
                    {denomInTokenA ? tokenASymbol : tokenBSymbol} /{' '}
                    {denomInTokenA ? tokenBSymbol : tokenASymbol}
                </span>
            </div>
            <div className={styles.chart_overlay_container}>{chartOverlayButtons}</div>
        </div>
    );
    // END OF TOKEN INFO----------------------------------------------------------------

    // TIME FRAME CONTENT--------------------------------------------------------------

    const currencyCharacter = denomInTokenA
        ? // denom in a, return token b character
          getUnicodeCharacter(tradeData.tokenB.symbol)
        : // denom in b, return token a character
          getUnicodeCharacter(tradeData.tokenA.symbol);

    const timeFrameContent = (
        <div className={styles.time_frame_container}>
            <div className={styles.left_side}>
                <span
                    className={styles.amount}
                    // onClick={() => dispatch(toggleDidUserFlipDenom())}
                >
                    {poolPriceDisplay === Infinity
                        ? '...'
                        : `${currencyCharacter}${truncatedPoolPrice}`}
                </span>
                <span className={styles.change}>
                    {poolPriceChangePercent === undefined
                        ? '...'
                        : poolPriceChangePercent + ' | 24h'}
                </span>
            </div>
            <div className={styles.right_side}>
                <span>Timeframe</span>
                {activeTimeFrameDisplay}
            </div>
        </div>
    );

    // END OF TIME FRAME CONTENT--------------------------------------------------------------

    // CANDLE STICK DATA---------------------------------------------------
    const chartData = usePoolChartData('0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8'); // ETH/USDC pool address

    const formattedTvlData = useMemo(() => {
        if (chartData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return chartData.map((day: any) => {
                return {
                    time: new Date(day.date * 1000),
                    value: day.totalValueLockedUSD,
                };
            });
        } else {
            return [];
        }
    }, [chartData]);

    const formattedVolumeData = useMemo(() => {
        if (chartData) {
            return chartData.map((day) => {
                return {
                    time: new Date(day.date * 1000),
                    value: day.volumeUSD,
                };
            });
        } else {
            return [];
        }
    }, [chartData]);

    const formattedFeesUSD = useMemo(() => {
        if (chartData) {
            return chartData.map((day) => {
                return {
                    time: new Date(day.date * 1000),
                    value: day.feesUSD,
                };
            });
        } else {
            return [];
        }
    }, [chartData]);
    // END OF CANDLE STICK DATA---------------------------------------------------

    const expandGraphStyle = props.expandTradeTable ? styles.hide_graph : '';

    return (
        <>
            <div className={`${styles.graph_style} ${expandGraphStyle}`}>
                {graphSettingsContent}
                {tokenInfo}
                {timeFrameContent}
            </div>
            <div style={{ width: '100%', height: '100%' }} ref={canvasRef}>
                <TradeCandleStickChart
                    tvlData={formattedTvlData}
                    volumeData={formattedVolumeData}
                    feeData={formattedFeesUSD}
                    priceData={props.candleData}
                    changeState={props.changeState}
                    chartItemStates={chartItemStates}
                />
            </div>
        </>
    );
}

const spring = {
    type: 'spring',
    stiffness: 500,
    damping: 30,
};
