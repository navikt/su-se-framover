const variables = {
    SU_SE_BAKOVER_URL: 'http://localhost:8080',
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
