import { Heading } from '@navikt/ds-react';
import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Framdriftsindikator, { Linjestatus } from '~components/framdriftsindikator/Framdriftsindikator';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { KlageSteg } from '~pages/saksbehandling/types';
import { Sak } from '~types/Sak';

import messages from './klage-nb';
import styles from './klage.module.less';
import OppsummeringAvKlage from './oppsummeringAvKlage/OppsummeringAvKlage';
import VurderFormkrav from './VurderFormkrav';
import VurderingAvKlage from './vurderingAvKlage/VurderingAvKlage';

const Klage = (props: { sak: Sak }) => {
    const urlParams = Routes.useRouteParams<typeof Routes.klage>();
    const klage = props.sak.klager.find((klage) => klage.id === urlParams.klageId);
    const { formatMessage } = useI18n({ messages });

    if (!klage) {
        return <div>{formatMessage('feil.fantIkkeKlage')}</div>;
    }

    const linjer = Object.values(KlageSteg).map((verdi) => ({
        id: verdi,
        status: Linjestatus.Ingenting,
        label: formatMessage(`framdriftsindikator.${verdi}`),
        url: Routes.klage.createURL({ sakId: props.sak.id, klageId: klage.id, steg: verdi }),
        erKlikkbar: false,
    }));

    const pathsForFramdriftsindikator = linjer
        .filter(
            (l) =>
                l.url !==
                Routes.klage.createURL({
                    sakId: props.sak.id,
                    klageId: klage.id,
                    steg: KlageSteg.Oppsummering,
                })
        )
        .map((l) => l.url);

    return (
        <div className={styles.pageContainer}>
            <Switch>
                <>
                    <Heading level="1" size="xlarge" className={styles.pageTittel}>
                        {formatMessage('page.tittel')}
                    </Heading>
                    <div className={styles.klageContainerMedFramdriftsindikator}>
                        <Route path={pathsForFramdriftsindikator}>
                            <Framdriftsindikator aktivId={urlParams.steg} elementer={linjer} />
                        </Route>

                        <Route
                            path={Routes.klage.createURL({
                                sakId: props.sak.id,
                                klageId: klage.id,
                                steg: KlageSteg.Formkrav,
                            })}
                        >
                            <VurderFormkrav sakId={props.sak.id} vedtaker={props.sak.vedtak} klage={klage} />
                        </Route>
                        <Route
                            path={Routes.klage.createURL({
                                sakId: props.sak.id,
                                klageId: klage.id,
                                steg: KlageSteg.Vurdering,
                            })}
                        >
                            <VurderingAvKlage sakId={props.sak.id} klage={klage} />
                        </Route>
                    </div>

                    <Route
                        path={Routes.klage.createURL({
                            sakId: props.sak.id,
                            klageId: klage.id,
                            steg: KlageSteg.Oppsummering,
                        })}
                    >
                        <OppsummeringAvKlage sakId={props.sak.id} klage={klage} vedtaker={props.sak.vedtak} />
                    </Route>
                </>
            </Switch>
        </div>
    );
};

export default Klage;
