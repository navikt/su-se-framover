import { Heading } from '@navikt/ds-react';
import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Framdriftsindikator from '~components/framdriftsindikator/Framdriftsindikator';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { KlageSteg } from '~pages/saksbehandling/types';
import { Sak } from '~types/Sak';
import {
    erKlageVilkårsvurdertUtfyltEllerSenere,
    getDefaultFramdriftsindikatorLinjer,
    getFramdriftsindikatorLinjer,
    getPartialFramdriftsindikatorLinjeInfo,
} from '~utils/klage/klageUtils';

import AvvistKlage from './fritekstForAvvistKlage/AvvistKlage';
import messages from './klage-nb';
import styles from './klage.module.less';
import SendKlageTilAttestering from './sendKlageTilAttestering/SendKlageTilAttestering';
import VurderFormkrav from './vurderFormkrav/VurderFormkrav';
import VurderingAvKlage from './vurderingAvKlage/VurderingAvKlage';

const Klage = (props: { sak: Sak }) => {
    const urlParams = Routes.useRouteParams<typeof Routes.klage>();
    const klage = props.sak.klager.find((k) => k.id === urlParams.klageId);
    const { formatMessage } = useI18n({ messages });

    if (!klage) {
        return <div>{formatMessage('feil.fantIkkeKlage')}</div>;
    }

    const lagFramdriftsindikatorLinjer = () => {
        if (erKlageVilkårsvurdertUtfyltEllerSenere(klage)) {
            return getFramdriftsindikatorLinjer({
                sakId: props.sak.id,
                klage: klage,
                formatMessage: formatMessage,
            });
        }

        const formkravLinjeInfo = getPartialFramdriftsindikatorLinjeInfo(KlageSteg.Formkrav, klage);
        return getDefaultFramdriftsindikatorLinjer({
            sakId: props.sak.id,
            klageId: klage.id,
            formkravLinjeInfo: { status: formkravLinjeInfo.status, erKlikkbar: formkravLinjeInfo.erKlikkbar },
            formatMessage: formatMessage,
        });
    };

    const pathsForFramdriftsindikator = lagFramdriftsindikatorLinjer()
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
                    <Heading level="1" size="large" className={styles.pageTittel}>
                        {formatMessage('page.tittel')}
                    </Heading>
                    <div className={styles.klageContainerMedFramdriftsindikator}>
                        <Route path={pathsForFramdriftsindikator}>
                            <Framdriftsindikator aktivId={urlParams.steg} elementer={lagFramdriftsindikatorLinjer()} />
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
                        <Route
                            path={Routes.klage.createURL({
                                sakId: props.sak.id,
                                klageId: klage.id,
                                steg: KlageSteg.Avvisning,
                            })}
                        >
                            <AvvistKlage sakId={props.sak.id} klage={klage} />
                        </Route>
                    </div>

                    <Route
                        path={Routes.klage.createURL({
                            sakId: props.sak.id,
                            klageId: klage.id,
                            steg: KlageSteg.Oppsummering,
                        })}
                    >
                        <SendKlageTilAttestering sakId={props.sak.id} klage={klage} vedtaker={props.sak.vedtak} />
                    </Route>
                </>
            </Switch>
        </div>
    );
};

export default Klage;
