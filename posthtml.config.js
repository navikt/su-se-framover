const variables = {
    SU_SE_BAKOVER_URL: 'http://localhost:8080',
    AMPLITUDE_API_KEY: '',
    FEATURE_VILKAR_V2: false,
};

module.exports = {
    plugins: {
        'posthtml-expressions': {
            locals: Object.entries(variables).reduce(
                (acc, [key, val]) => ({
                    ...acc,
                    // eslint-disable-next-line no-undef
                    [key]: process.env.NODE_ENV === 'production' ? `$${key}` : val,
                }),
                {}
            ),
        },
    },
};
