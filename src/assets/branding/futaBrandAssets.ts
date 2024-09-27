import { brandIF } from './types';
import large from '../images/logos/large.svg';

export const futaBrandAssets: brandIF = {
    networks: {
        // ethereum sepolia
        '0xaa36a7': {
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            hero: [{ content: 'futa', processAs: 'text' }],
        },
    },
    platformName: 'futa',
    fontSet: 'futa',
    showPoints: false,
    showDexStats: false,
    headerImage: large as string,
    includeCanto: false,
};
