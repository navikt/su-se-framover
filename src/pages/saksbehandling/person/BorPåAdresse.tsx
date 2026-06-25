import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { fetchBorPåAdresse } from '~src/api/personApi.ts';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext.ts';
import { useApiCall } from '~src/lib/hooks.ts';

const BorPåAdresse = () => {
    const sak = useOutletContext<SaksoversiktContext>().sak;
    const [_borPåAdresse, hentBorPåAdresse] = useApiCall(fetchBorPåAdresse);

    useEffect(() => {
        hentBorPåAdresse({ fnr: sak.fnr, sakstype: sak.sakstype });
    }, []);

    return <div>asdfasf</div>;
};

export default BorPåAdresse;
