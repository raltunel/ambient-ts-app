import {
    GridContainer,
    MainSection,
    BoxContainer,
    FeaturedBoxInfoContainer,
    InfoHeader,
    FeaturedBoxInnerContainer,
    FlexCenter,
    TokenName,
    TokenSymbol,
    BoxInfoText,
    LinkText,
    TabPlaceholder,
    DetailedBoxContainer,
} from './TableInfo.styles';
interface FeaturedBoxPropsIF {
    tokenLogo: string;
    tokenSymbol: string;
    tokenName: string;
    tokenAddress: string;
    balance: string;
    value: string;
}
interface DetailedBoxPropsIF {
    label: string;
    value: string;
}

export default function TableInfo() {
    const detailedData = [
        { label: 'Market Cap:', value: '$69m' },
        { label: 'FDV:', value: '$690m' },
        { label: '24h Swap Volume:', value: '$6.93k' },
        { label: 'Total Fees:', value: '$6.93k' },
        { label: 'TVL:', value: '$2.27m' },
        { label: 'Tixk Liquidity:', value: '$500k' },
        { label: 'Out of Range Liq:', value: '20%' },
        { label: 'Pool Created:', value: '15/07/2022' },
    ];
    const featuredData = [
        {
            tokenLogo: 'https://via.placeholder.com/30',
            tokenSymbol: 'ETH',
            tokenName: 'Ethereum',
            tokenAddress: 'ffhei23ifvhdfd',
            balance: '169.00',
            value: '420,000',
        },
        {
            tokenLogo: 'https://via.placeholder.com/30',
            tokenSymbol: 'USDC',
            tokenName: 'Usd coin',
            tokenAddress: 'ffhei23ifvhdfd',
            balance: '420,000.00',
            value: '420,000',
        },
    ];
    function FeaturedBox(props: FeaturedBoxPropsIF) {
        const {
            tokenLogo,
            tokenSymbol,
            tokenName,
            tokenAddress,
            balance,
            value,
        } = props;
        return (
            <BoxContainer>
                <FeaturedBoxInnerContainer>
                    <FlexCenter>
                        <img
                            src={tokenLogo}
                            alt='Logo'
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50px',
                            }}
                        />
                        <TokenSymbol>{tokenSymbol}</TokenSymbol>
                        <TokenName>{tokenName}</TokenName>
                    </FlexCenter>
                    <FlexCenter>
                        <InfoHeader>{tokenAddress}</InfoHeader>
                        <LinkText>Link</LinkText>
                    </FlexCenter>
                    <FeaturedBoxInfoContainer>
                        <InfoHeader>Balance</InfoHeader>
                        <BoxInfoText>{balance}</BoxInfoText>
                    </FeaturedBoxInfoContainer>
                    <FeaturedBoxInfoContainer>
                        <InfoHeader>Value</InfoHeader>
                        <BoxInfoText>${value}</BoxInfoText>
                    </FeaturedBoxInfoContainer>
                </FeaturedBoxInnerContainer>
            </BoxContainer>
        );
    }
    function DetailedBox(props: DetailedBoxPropsIF) {
        const { label, value } = props;
        return (
            <BoxContainer>
                <DetailedBoxContainer>
                    <InfoHeader>{label}</InfoHeader>
                    <BoxInfoText>{value}</BoxInfoText>
                </DetailedBoxContainer>
            </BoxContainer>
        );
    }
    return (
        <MainSection>
            <GridContainer numCols={2} gapSize={8} fullHeight>
                <GridContainer numCols={2} gapSize={8}>
                    {featuredData.map((data, idx) => (
                        <FeaturedBox
                            key={idx}
                            tokenLogo={data.tokenLogo}
                            tokenSymbol={data.tokenSymbol}
                            tokenName={data.tokenName}
                            tokenAddress={data.tokenAddress}
                            balance={data.balance}
                            value={data.value}
                        />
                    ))}
                </GridContainer>

                <GridContainer numRows={3} gapSize={8}>
                    <GridContainer numCols={4} gapSize={8}>
                        {detailedData.slice(0, 4).map((data, idx) => (
                            <DetailedBox
                                label={data.label}
                                value={data.value}
                                key={idx}
                            />
                        ))}
                    </GridContainer>
                    <GridContainer numCols={4} gapSize={8}>
                        {detailedData
                            .slice(4, detailedData.length)
                            .map((data, idx) => (
                                <DetailedBox
                                    label={data.label}
                                    value={data.value}
                                    key={idx}
                                />
                            ))}
                    </GridContainer>
                    <div>
                        <TabPlaceholder>
                            This is where the tabs go
                        </TabPlaceholder>
                    </div>
                </GridContainer>
            </GridContainer>
        </MainSection>
    );
}
