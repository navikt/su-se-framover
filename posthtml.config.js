// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const Config = require('./server/config');

// eslint-disable-next-line
module.exports = {
    plugins: {
        'posthtml-expressions': {
            locals:
                // eslint-disable-next-line no-undef
                process.env.NODE_ENV !== 'production'
                    ? {
                          CONFIG: JSON.stringify(Config.client),
                      }
                    : {},
        },
    },
};
