import { Alert } from '@navikt/ds-react';
import React from 'react';
import { IntlShape } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import { Person } from '~api/personApi';
import { AttesteringsForm } from '~components/attestering/AttesteringsForm';
import Søknadsbehandlingoppsummering from '~components/søknadsbehandlingoppsummering/Søknadsbehandlingoppsummering';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Behandling, UnderkjennelseGrunn } from '~types/Behandling';
import { Sak } from '~types/Sak';
import { erIverksatt, erTilAttestering } from '~utils/behandling/behandlingUtils';

import messages from './attesterSøknadsbehandling-nb';
import styles from './attesterSøknadsbehandling.module.less';

const Attesteringsinnhold = ({
    intl,
    ...props
}: {
    behandling: Behandling;
    sak: Sak;
    søker: Person;
    intl: IntlShape;
}) => {
    const history = useHistory();
    const [iverksettStatus, attesteringIverksett] = useAsyncActionCreator(sakSlice.attesteringIverksett);
    const [underkjennStatus, attesteringUnderkjent] = useAsyncActionCreator(sakSlice.attesteringUnderkjenn);
    const [, fetchSak] = useAsyncActionCreator(sakSlice.fetchSak);
    const redirectTilSaksoversikt = (message: string) => {
        history.push(Routes.createSakIntroLocation(message, props.sak.id));
    };

    const iverksettCallback = () =>
        attesteringIverksett(
            {
                sakId: props.sak.id,
                behandlingId: props.behandling.id,
            },
            (res) => {
                fetchSak({ sakId: res.sakId }, () => {
                    redirectTilSaksoversikt(intl.formatMessage({ id: 'status.iverksatt' }));
                });
            }
        );

    const underkjennCallback = (grunn: UnderkjennelseGrunn, kommentar: string) =>
        attesteringUnderkjent(
            {
                sakId: props.sak.id,
                behandlingId: props.behandling.id,
                grunn: grunn,
                kommentar: kommentar,
            },
            () => {
                redirectTilSaksoversikt(intl.formatMessage({ id: 'status.sendtTilbake' }));
            }
        );

    if (!erTilAttestering(props.behandling) && !erIverksatt(props.behandling)) {
        return (
            <div>
                <Alert variant="error">
                    <p>{intl.formatMessage({ id: 'feil.ikkeKlarForAttestering' })}</p>
                    <Link to={Routes.saksoversiktIndex.createURL()}>
                        {intl.formatMessage({ id: 'lenke.saksoversikt' })}
                    </Link>
                </Alert>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <Søknadsbehandlingoppsummering
                sak={props.sak}
                behandling={props.behandling}
                medBrevutkastknapp
                tittel={intl.formatMessage({ id: 'page.tittel' })}
            />
            <AttesteringsForm
                sakId={props.sak.id}
                iverksett={{
                    fn: iverksettCallback,
                    status: iverksettStatus,
                }}
                underkjenn={{
                    fn: underkjennCallback,
                    status: underkjennStatus,
                }}
            />
        </div>
    );
};

const AttesterSøknadsbehandling = (props: { sak: Sak; søker: Person }) => {
    const urlParams = Routes.useRouteParams<typeof Routes.attesterSøknadsbehandling>();
    const { intl } = useI18n({ messages });

    const behandling = props.sak.behandlinger.find((x) => x.id === urlParams.behandlingId);

    if (!behandling) {
        return <Alert variant="error">{intl.formatMessage({ id: 'feil.fantIkkeBehandling' })}</Alert>;
    }
    return <Attesteringsinnhold behandling={behandling} sak={props.sak} søker={props.søker} intl={intl} />;
};

export default AttesterSøknadsbehandling;
