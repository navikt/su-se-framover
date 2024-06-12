import { Request, Response, NextFunction } from 'express';

const redirectMiddleware = (request: Request, res: Response, next: NextFunction) => {
    const forwardedHostHeader: string | undefined = request.header('x-forwarded-host');
    if (forwardedHostHeader && forwardedHostHeader?.includes('dev.adeo.no')) {
        res.redirect('https://supplerendestonad.intern.dev.adeo.no');
    } else if (forwardedHostHeader && forwardedHostHeader?.includes('nais.adeo.no')) {
        res.redirect('https://supplerendestonad.intern.nav.no');
    } else {
        next();
    }
};

export default redirectMiddleware;
