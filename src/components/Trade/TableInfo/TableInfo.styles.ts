import styled from 'styled-components';
import backgroundImage from '../../../assets/images/backgrounds/tableInfoBg.png';

// can be extracted to common

interface GridContainerProps {
    numCols?: number;
    numRows?: number;
    gapSize?: number;
    fullHeight?: boolean;
}
const GridContainer = styled.div<GridContainerProps>`
    display: grid;
    grid-template-columns: ${({ numCols }) =>
        numCols ? `repeat(${numCols}, 1fr)` : 'auto'};
    grid-template-rows: ${({ numRows }) =>
        numRows ? `repeat(${numRows}, 1fr)` : 'auto'};
    gap: ${({ gapSize }) => (gapSize ? `${gapSize}px` : '0')};
    ${({ fullHeight }) => (fullHeight ? 'height: 100%;' : '')}
`;

const MainSection = styled.section`
    background: url(${backgroundImage}) no-repeat center center fixed;

    height: 100%;
    padding: 8px;
`;

const BoxContainer = styled.div`
    grid-column: span 1;
    background: rgba(23, 29, 39, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 0.25rem;
`;

const FeaturedBoxInnerContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
`;

const InfoHeader = styled.div`
    color: var(--text2);
    font-size: var(--body-size);
    line-height: var(--body-lh);
    font-weight: 400;
`;

const FlexCenter = styled.div`
    display: flex;
    align-items: center;
`;

const FeaturedBoxInfoContainer = styled.div`
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;
const TokenSymbol = styled.p`
    margin-left: 0.5rem;
    color: var(--header2-size);
    font-weight: 400;
`;

const TokenName = styled.p`
    margin-left: 0.5rem;
    font-size: var(--body-size);
    color: var(--text2);
    font-weight: 400;
`;

const BoxInfoText = styled.p`
    color: var(--header2-size);
    font-weight: 400;

    color: var(--text1);
`;

const LinkText = styled.a`
    margin-left: 0.5rem;
    font-size: var(--body-size);
    color: var(--accent1);
    font-weight: 400;
`;

const DetailedBoxContainer = styled.div`
    display: flex;
    padding: 1rem;
    margin-top: 0.5rem;
    flex-direction: column;
    gap: 0.5rem;
`;

const TabPlaceholder = styled.div`
    grid-column: span 1;
    background-color: var(--dark3);
    height: 100%;
    background: rgba(23, 29, 39, 0.4);
    backdrop-filter: blur(10px);
`;

export {
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
};
