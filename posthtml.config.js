// eslint-disable-next-line no-undef
module.exports = {
    plugins: {
        'posthtml-expressions': {
            locals: {
                // eslint-disable-next-line no-undef
                HODE_URL: process.env.HODE_URL,
            },
        },
    },
};
