declare module '*.module.less' {
    const styles: Record<string, string>;
    export default styles;
}

export declare global {
    interface Window {
        BASE_URL?: string
    }
}