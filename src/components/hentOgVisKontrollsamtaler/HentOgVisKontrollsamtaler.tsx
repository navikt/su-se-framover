import * as RemoteData from '@devexperts/remote-data-ts';
import { Skeleton } from '@navikt/ds-react';
import { useEffect } from 'react';

import * as kontrollsamtaleApi from '~src/api/kontrollsamtaleApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import OppsummeringAvKontrollsamtaler from '~src/components/oppsummering/kontrollsamtale/kontrollsamtaler/OppsummeringAvKontrollsamtaler';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';

const HentOgVisKontrollsamtaler = (props: { sakId: string }) => {
    const [kontrollsamtaler, hentKontrollsamtaler] = useApiCall(kontrollsamtaleApi.hentKontrollsamtaler);

    useEffect(() => {
        hentKontrollsamtaler({ sakId: props.sakId });
    }, []);

    return (
        <Oppsummeringspanel
            ikon={Oppsummeringsikon.Liste}
            farge={Oppsummeringsfarge.Lilla}
            tittel="Registrerte kontrollsamtaler"
        >
            {pipe(
                kontrollsamtaler,
                RemoteData.fold(
                    () => null,
                    () => <Skeleton />,
                    (err) => <ApiErrorAlert error={err} />,
                    (kontrollsamtaler) => (
                        <OppsummeringAvKontrollsamtaler sakId={props.sakId} kontrollsamtaler={kontrollsamtaler} />
                    ),
                ),
            )}
        </Oppsummeringspanel>
    );
};

export default HentOgVisKontrollsamtaler;
