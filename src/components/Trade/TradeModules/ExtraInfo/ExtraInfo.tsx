import { MouseEvent, useContext, useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { FlexContainer } from '../../../../styled/Common';
import {
    ExtraDetailsContainer,
    ExtraInfoContainer,
} from '../../../../styled/Components/TradeModules';

import TooltipComponent from '../../../Global/TooltipComponent/TooltipComponent';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';

interface PropsIF {
    extraInfo: {
        title: string;
        tooltipTitle: string;
        data: React.ReactNode;
    }[];
    conversionRate: string;
    gasPrice: string | undefined;
    showDropdown: boolean;
}

export const ExtraInfo = (props: PropsIF) => {
    const { extraInfo, showDropdown, conversionRate, gasPrice } = props;

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const { toggleDidUserFlipDenom } = useContext(TradeDataContext);

    const [showExtraInfo, setShowExtraInfo] = useState<boolean>(false);

    return (
        <>
            <ExtraInfoContainer
                role='button'
                justifyContent='space-between'
                alignItems='center'
                fullWidth
                color='text2'
                fontSize='body'
                padding='4px'
                active={showDropdown}
                onClick={
                    showDropdown
                        ? () => setShowExtraInfo(!showExtraInfo)
                        : () => setShowExtraInfo(false)
                }
                aria-label={`Gas cost is ${gasPrice}. Conversion rate is ${conversionRate}.`}
            >
                {chainId === '0x1' ? (
                    <FlexContainer
                        alignItems='center'
                        padding='0 0 0 4px'
                        gap={4}
                        style={{ pointerEvents: 'none' }}
                    >
                        <FaGasPump size={15} /> {gasPrice ?? '…'}
                    </FlexContainer>
                ) : (
                    <FlexContainer
                        alignItems='center'
                        padding='0 0 0 4px'
                        gap={4}
                        style={{ pointerEvents: 'none' }}
                    ></FlexContainer>
                )}
                <FlexContainer
                    alignItems='center'
                    onClick={(e: MouseEvent<HTMLDivElement>) => {
                        toggleDidUserFlipDenom();
                        e.stopPropagation();
                    }}
                >
                    {conversionRate}
                </FlexContainer>

                {showDropdown && !showExtraInfo && (
                    <RiArrowDownSLine size={22} />
                )}
                {showDropdown && showExtraInfo && <RiArrowUpSLine size={22} />}
            </ExtraInfoContainer>
            {showExtraInfo && showDropdown && (
                <ExtraDetailsContainer>
                    {extraInfo.map((item, idx) => (
                        <FlexContainer
                            key={idx}
                            justifyContent='space-between'
                            alignItems='center'
                            padding='4px 0'
                            tabIndex={0}
                            aria-label={`${item.title} is ${item.data}`}
                        >
                            <FlexContainer gap={4}>
                                <div>{item.title}</div>
                                <TooltipComponent title={item.tooltipTitle} />
                            </FlexContainer>
                            <div>{item.data}</div>
                        </FlexContainer>
                    ))}
                </ExtraDetailsContainer>
            )}
        </>
    );
};
