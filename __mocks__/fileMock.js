const styles = new Proxy(
    {},
    {
        get: (_, property) => property,
    },
);

module.exports = {
    __esModule: true,
    default: styles,
};
