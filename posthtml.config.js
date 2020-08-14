// eslint-disable-next-line no-undef
module.exports = {
    plugins: {
        'posthtml-expressions': {
            locals:
                // eslint-disable-next-line no-undef
                process.env.NODE_ENV === 'production'
                    ? {
                          // Placeholder som blir replacet når appen starter opp.
                          // Se docker-entrypoint.sh
                          HODE_URL: '${HODE_URL}',
                      }
                    : {
                          HODE_URL: 'https://navikt.github.io/internarbeidsflatedecorator',
                      },
        },
    },
};
