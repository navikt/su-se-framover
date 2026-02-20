import { NextFunction, Request, Response } from 'express';

//TODO: er vel feil nå
const redirectMiddleware = (request: Request, res: Response, next: NextFunction) => {
    const forwardedHostHeader: string | undefined = request.header('x-forwarded-host');
    if (forwardedHostHeader && forwardedHostHeader?.includes('dev.adeo.no')) {
        res.redirect('https://supplerendestonad.intern.dev.nav.no');
    } else if (forwardedHostHeader && forwardedHostHeader?.includes('nais.adeo.no')) {
        res.redirect('https://supplerendestonad.intern.nav.no');
    } else {
        next();
    }
};

export default redirectMiddleware;
