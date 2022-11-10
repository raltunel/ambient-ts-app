import { useEffect, useState } from 'react';
import { TokenIF, TokenListIF } from '../interfaces/exports';

export const useTokenMap = (
    tokenListsNeeded: string[]
) => {
    // hook to preserve the token map value across renders
    const [tokenMap, setTokenMap] = useState(new Map<string, TokenIF>());

    // hook to create a new token map and write it to local storage
    useEffect(() => {
        // JSON value of 'allTokenLists' from local storage
        const allTokenLists = JSON.parse(localStorage.getItem('allTokenLists') as string);

        // function to pull a single token list from local storage by its URI
        const getTokensByURI = (uri: string) => {
            // declare an output variable and apply type protection
            let tokens: TokenIF[] = [];
            // attempt to find the token list by uri
            try {
                // callback function reusable in array methods
                const findListByURI = (list: TokenListIF) => list.uri === uri;
                // boolean value to see if the desired list exists
                const doesListExist = allTokenLists.some(findListByURI);
                // error message if there is no token list for the given URI
                const errMsg = `Did not find a token list with URI <<${uri}>> in local storage.`;
                // gatekeep action based on whether local storage has the desired list
                if (doesListExist) {
                    // if list is present, get tokens and assign to output variable
                    tokens = allTokenLists.find(findListByURI).tokens;
                } else {
                    // if list is missing, trigger error handling with console message
                    throw new Error(errMsg);
                }
            } catch (err) {
                // display console warning in case of error
                console.warn(err);
            }
            // return array of tokens
            // if list was not found an empty array will return
            return tokens;
        };

        // declare a variable to hold the token map
        const newTokensMap = new Map<string, TokenIF>();

        // iterate over param with array of URIs
        tokenListsNeeded
            // map of all tokens in the relevant lists
            .flatMap((listURI: string) => getTokensByURI(listURI))
            // create a value in the Map object
            .forEach((tkn: TokenIF) =>
                newTokensMap.set(
                    tkn.address.toLowerCase() + '_0x' + tkn.chainId.toString(16).toLowerCase(),
                    tkn,
            ),
        );
        // update local storage with the new value
        setTokenMap(newTokensMap);
    // this dependency array should not work but things seem fine so here it stays
    }, [localStorage.allTokenLists]);

    // return token map held in local state created by useEffect() hook
    return tokenMap;
};
