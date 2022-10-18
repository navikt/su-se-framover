import { Alert, Heading } from '@navikt/ds-react';
import React from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';

import { Person } from '~src/api/personApi';
import { AttesteringsForm } from '~src/components/attestering/AttesteringsForm';
import OppsummeringAvSøknadsbehandling from '~src/components/søknadsbehandlingoppsummering/OppsummeringAvSøknadsbehandling';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import * as SøknadsbehandlingActions from '~src/features/SøknadsbehandlingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { UnderkjennelseGrunn } from '~src/types/Behandling';
import { Sak } from '~src/types/Sak';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { erIverksatt, erTilAttestering } from '~src/utils/behandling/SøknadsbehandlingUtils';

import messages from './attesterSøknadsbehandling-nb';
import * as styles from './attesterSøknadsbehandling.module.less';

const AttesterSøknadsbehandling = () => {
    const props = useOutletContext<SaksoversiktContext>();
    const urlParams = Routes.useRouteParams<typeof Routes.attesterSøknadsbehandling>();
    const { formatMessage } = useI18n({ messages });

    const behandling = props.sak.behandlinger.find((x) => x.id === urlParams.behandlingId);

    if (!behandling) {
        return <Alert variant="error">{formatMessage('feil.fantIkkeBehandling')}</Alert>;
    }
    return <Attesteringsinnhold behandling={behandling} sak={props.sak} søker={props.søker} />;
};

const Attesteringsinnhold = ({ ...props }: { behandling: Søknadsbehandling; sak: Sak; søker: Person }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [iverksettStatus, attesteringIverksett] = useAsyncActionCreator(
        SøknadsbehandlingActions.attesteringIverksett
    );
    const [underkjennStatus, attesteringUnderkjent] = useAsyncActionCreator(
        SøknadsbehandlingActions.attesteringUnderkjenn
    );
    const [, fetchSak] = useAsyncActionCreator(sakSlice.fetchSak);
    const redirectTilSaksoversikt = (message: string) => {
        Routes.navigateToSakIntroWithMessage(navigate, message, props.sak.id);
    };

    const iverksettCallback = () =>
        attesteringIverksett({ sakId: props.sak.id, behandlingId: props.behandling.id }, (res) => {
            fetchSak({ sakId: res.sakId }, () => {
                redirectTilSaksoversikt(formatMessage('status.iverksatt'));
            });
        });

    const underkjennCallback = (grunn: UnderkjennelseGrunn, kommentar: string) =>
        attesteringUnderkjent(
            {
                sakId: props.sak.id,
                behandlingId: props.behandling.id,
                grunn: grunn,
                kommentar: kommentar,
            },
            () => {
                redirectTilSaksoversikt(formatMessage('status.sendtTilbake'));
            }
        );

    if (!erTilAttestering(props.behandling) && !erIverksatt(props.behandling)) {
        return (
            <div>
                <Alert variant="error">
                    <p>{formatMessage('feil.ikkeKlarForAttestering')}</p>
                    <Link to={Routes.saksoversiktIndex.createURL()}>{formatMessage('lenke.saksoversikt')}</Link>
                </Alert>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <Heading level="1" size="large" spacing>
                {formatMessage('page.tittel')}
            </Heading>
            <OppsummeringAvSøknadsbehandling behandling={props.behandling} medBrevutkast={{ sakId: props.sak.id }} />
            <AttesteringsForm
                sakId={props.sak.id}
                iverksett={{ fn: iverksettCallback, status: iverksettStatus }}
                underkjenn={{ fn: underkjennCallback, status: underkjennStatus }}
            />
        </div>
    );
};

export default AttesterSøknadsbehandling;
