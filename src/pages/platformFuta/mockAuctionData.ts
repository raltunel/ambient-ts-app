import { AuctionDataIF } from '../../contexts/AuctionsContext';

export const mockAuctionData: AuctionDataIF[] = [
    {
        ticker: 'DOGE',
        marketCap: 20.52,
        createdAt: 1718054594,
    },
    {
        ticker: 'MOG',
        marketCap: 0.59,
        createdAt: 1718054594,
    },
    {
        ticker: 'PEPE',
        marketCap: 15.23,
        createdAt: 1718125986,
    },
    {
        ticker: 'BODEN',
        marketCap: 25.59,
        createdAt: 1718148398,
    },
    {
        ticker: 'APU',
        marketCap: 12.11,
        createdAt: 1718195814,
    },
    {
        ticker: 'BOME',
        marketCap: 1.343,
        createdAt: 1718210226,
    },
    {
        ticker: 'USA',
        marketCap: 50.25,
        createdAt: 1718224639,
    },
    {
        ticker: 'BITCOIN',
        marketCap: 32.11,
        createdAt: 1718275051,
    },
    {
        ticker: 'WIF',
        marketCap: 0.399,
        createdAt: 1718293065,
    },
    {
        ticker: 'TRUMP',
        marketCap: 0.45,
        createdAt: 1718307476,
    },
    {
        ticker: 'EMILY',
        marketCap: 0.3927,
        createdAt: 1718311100,
    },
    {
        ticker: 'DEGEN',
        marketCap: 16.23,
        createdAt: 1718361510,
    },
    {
        ticker: 'LOCKIN',
        marketCap: 24.129,
        createdAt: 1718447920,
    },
];

export const mockAccountData: AuctionDataIF[] = [
    {
        ticker: 'DOGE',
        marketCap: 20.55,
        createdAt: 1718054594,
        unclaimedAllocation: 100000,
    },
    {
        ticker: 'MOG',
        marketCap: 0.59,
        createdAt: 1718054594,
        unclaimedAllocation: 168200,
    },
    {
        ticker: 'BODEN',
        marketCap: 25.59,
        createdAt: 1718148398,
    },
    {
        ticker: 'APU',
        marketCap: 12.11,
        createdAt: 1718195814,
    },
];

export const mockFdvData1 = [
    { value: 0.219 },
    { value: 0.271 },
    { value: 0.338 },
    { value: 0.423 },
    { value: 0.529 },
];

export const mockFdvData2 = [
    { value: 0.419 },
    { value: 0.471 },
    { value: 0.538 },
    { value: 0.623 },
    { value: 0.729 },
];
