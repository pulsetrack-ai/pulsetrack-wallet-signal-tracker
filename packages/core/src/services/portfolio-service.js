// Example function to calculate portfolio value
export function calculatePortfolioValue(tokens) {
    return tokens.reduce((total, token) => {
        return total + (token.amount * token.priceUsd);
    }, 0);
}

