// import { PositionPoolIF } from './PositionPoolIF';
export interface PositionIF {
    chainId: string;
    positionId: string;
    askTick: number;
    bidTick: number;
    isBid: boolean;
    poolIdx: number;
    base: string;
    quote: string;
    baseDecimals: number;
    quoteDecimals: number;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    user: string;
    ensResolution: string;
    baseSymbol: string;
    quoteSymbol: string;
    poolPriceInTicks: number;
    isPositionInRange: boolean;
    lowRangeDisplayInBase: string;
    lowRangeShortDisplayInBase: string;
    highRangeDisplayInBase: string;
    highRangeShortDisplayInBase: string;
    lowRangeShortDisplayInQuote: string;
    lowRangeDisplayInQuote: string;
    highRangeDisplayInQuote: string;
    highRangeShortDisplayInQuote: string;
    positionType: string;
    positionLiq: number;
    positionLiqBase: number;
    positionLiqBaseDecimalCorrected: number;
    positionLiqBaseTruncated: string;
    positionLiqQuoteTruncated: string;
    positionLiqQuoteDecimalCorrected: number;
    positionLiqQuote: number;
    feesLiq?: number;
    feesLiqBase?: number;
    feesLiqQuote?: number;
    feesLiqBaseDecimalCorrected?: number;
    feesLiqQuoteDecimalCorrected?: number;
    apy: number;
    timeFirstMint: number;
    latestUpdateTime: number;
    positionLiqTotalUSD: number;
    totalValueUSD: number;
    bidTickPriceDecimalCorrected: number;
    bidTickInvPriceDecimalCorrected: number;
    askTickPriceDecimalCorrected: number;
    askTickInvPriceDecimalCorrected: number;
    source: string;
    lastMintTx: string;
    firstMintTx: string;
}

export interface PositionServerIF {
    chainId: string;
    positionId: string;
    askTick: number;
    bidTick: number;
    isBid: boolean;
    poolIdx: number;
    base: string;
    quote: string;
    user: string;
    ambientSeeds: number;
    concLiq: number;
    rewardLiq: number;
    positionType: string;
    timeFirstMint: number;
    lastMintTx: string;
    firstMintTx: string;
}
