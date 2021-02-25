/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
    interface Window {
        hj: {
            q: any[];
        };
        _hjSettings: any;
    }
}

const enableHotjar = (): void => {
    if (!location.hostname.includes('.adeo.no')) {
        console.log(`Hotjar not enabled for ${location.hostname}`);
        return;
    }

    document.querySelector('body')?.setAttribute('data-hj-masked', '');
    document.querySelector('html')?.setAttribute('data-hj-suppress', '');

    (function (h, o, t, j, a?: HTMLHeadElement, r?: HTMLScriptElement) {
        h.hj =
            h.hj ||
            function (...args: any[]) {
                (h.hj.q = h.hj.q || []).push(args);
            };
        h._hjSettings = { hjid: 148751, hjsv: 6 };
        a = o.getElementsByTagName('head')[0];
        r = o.createElement('script');
        r.async = true;
        r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
        a.appendChild(r);
    })(window, document, '//static.hotjar.com/c/hotjar-', '.js?sv=');
};

export default enableHotjar;
