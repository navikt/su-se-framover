import { Heading } from '@navikt/ds-react';
import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Framdriftsindikator, { Linjestatus } from '~components/framdriftsindikator/Framdriftsindikator';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { KlageSteg } from '~pages/saksbehandling/types';
import { Sak } from '~types/Sak';
import {
    erKlageVilkårsvurdertUtfyltEllerSenere,
    filtrerKlageStegSomIkkeBlirBehandlet,
    getPartialFramdriftsindikatorLinjeInfo,
} from '~utils/klage/klageUtils';

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
            const stegUnderBehandling = filtrerKlageStegSomIkkeBlirBehandlet(klage);
            return stegUnderBehandling.map((verdi) => {
                const partialLinjeInfo = getPartialFramdriftsindikatorLinjeInfo(verdi, klage);
                return {
                    id: verdi,
                    status: partialLinjeInfo.status,
                    label: formatMessage(`framdriftsindikator.${verdi}`),
                    url: Routes.klage.createURL({ sakId: props.sak.id, klageId: klage.id, steg: verdi }),
                    erKlikkbar: partialLinjeInfo.erKlikkbar,
                };
            });
        }

        const formkravLinkeInfo = getPartialFramdriftsindikatorLinjeInfo(KlageSteg.Formkrav, klage);
        return [
            {
                id: KlageSteg.Formkrav,
                status: formkravLinkeInfo.status,
                label: formatMessage(`framdriftsindikator.${KlageSteg.Formkrav}`),
                url: Routes.klage.createURL({ sakId: props.sak.id, klageId: klage.id, steg: KlageSteg.Formkrav }),
                erKlikkbar: formkravLinkeInfo.erKlikkbar,
            },
            {
                id: 'vurderingOgAvvisning',
                status: Linjestatus.Ingenting,
                label: formatMessage(`framdriftsindikator.vurderingOgAvvisning`),
                url: '',
                erKlikkbar: false,
            },
            {
                id: KlageSteg.Oppsummering,
                status: Linjestatus.Ingenting,
                label: formatMessage(`framdriftsindikator.${KlageSteg.Oppsummering}`),
                url: Routes.klage.createURL({ sakId: props.sak.id, klageId: klage.id, steg: KlageSteg.Oppsummering }),
                erKlikkbar: false,
            },
        ];
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
                    <Heading level="1" size="xlarge" className={styles.pageTittel}>
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
