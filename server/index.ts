async function setupEnv(): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
        console.log('Detected development environment, loading .env file');
        const dotenv = await import('dotenv');
        dotenv.config();
    }
}

setupEnv().then(async () => {
    const server: { readonly default: () => Promise<void> } = await import('./express.js');
    await server.default();
});
