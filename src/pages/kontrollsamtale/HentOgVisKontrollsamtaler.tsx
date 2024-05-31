import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Skeleton } from '@navikt/ds-react';
import { useEffect } from 'react';

import * as kontrollsamtaleApi from '~src/api/kontrollsamtaleApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';

import styles from './HentOgVisKontrollsamtaler.module.less';
import OppsummeringAvKontrollsamtale from './OppsummeringAvKontrollsamtale';

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
                    (kontrollsamtaler) =>
                        kontrollsamtaler.length === 0 ? (
                            <BodyShort>Ingen kontrollsamtaler registrert</BodyShort>
                        ) : (
                            <ul className={styles.kontrollsamtalerContainer}>
                                {kontrollsamtaler.map((k) => (
                                    <li key={k.id}>
                                        <OppsummeringAvKontrollsamtale
                                            sakId={props.sakId}
                                            kontrollsamtale={k}
                                            medEdit
                                        />
                                    </li>
                                ))}
                            </ul>
                        ),
                ),
            )}
        </Oppsummeringspanel>
    );
};

export default HentOgVisKontrollsamtaler;
