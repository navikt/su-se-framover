import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Heading, Loader, Textarea } from '@navikt/ds-react';
import { useEffect } from 'react';

import { hentKontrollsamtaleoversikt } from '~src/api/kontrollsamtalerOversiktApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import styles from './kontrollsamtaleDriftOversikt.module.less';

const KontrollsamtaleDriftOversikt = () => {
    const [hentKontrollsamtaleoversiktStatus, hentKontrollsamtaleoversiktRequest] =
        useApiCall(hentKontrollsamtaleoversikt);

    useEffect(() => {
        hentKontrollsamtaleoversiktRequest({});
    }, []);

    return pipe(
        hentKontrollsamtaleoversiktStatus,
        RemoteData.fold(
            () => <Loader />,
            () => <Loader />,
            (error) => <ApiErrorAlert error={error} />,
            (kontrollSamtaleoversikt) => (
                <div className={styles.oversikt}>
                    <div className={styles.element}>
                        <Heading size="xsmall">Antall innkallinger denne måned</Heading>
                        <BodyShort>{kontrollSamtaleoversikt.inneværendeMåned.antallInnkallinger}</BodyShort>
                    </div>
                    <div className={styles.element}>
                        <Heading size="xsmall">Antall innkallinger måned som var</Heading>
                        <BodyShort>{kontrollSamtaleoversikt.utgåttMåned.antallInnkallinger}</BodyShort>
                    </div>
                    <div className={styles.element}>
                        <Heading size="xsmall">Antall som har ført til stans</Heading>
                        <BodyShort>{kontrollSamtaleoversikt.utgåttMåned.sakerMedStans.length}</BodyShort>
                    </div>
                    <div className={styles.element}>
                        <Heading size="xsmall">Saker</Heading>
                        {kontrollSamtaleoversikt.utgåttMåned.sakerMedStans.length > 0 ? (
                            <Textarea resize readOnly label="Saker med stans">
                                {kontrollSamtaleoversikt.utgåttMåned.sakerMedStans.join(',\n')}
                            </Textarea>
                        ) : (
                            <BodyShort>Ingen saker med stans</BodyShort>
                        )}
                    </div>
                </div>
            ),
        ),
    );
};

export default KontrollsamtaleDriftOversikt;
