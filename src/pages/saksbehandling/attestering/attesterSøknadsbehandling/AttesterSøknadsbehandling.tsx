import { Alert } from '@navikt/ds-react';
import { Link, useNavigate } from 'react-router-dom';

import { AttesteringsForm } from '~src/components/forms/attesteringForm/AttesteringsForm';
import OppsummeringAvSøknadsbehandling from '~src/components/oppsummering/søknadsbehandlingoppsummering/OppsummeringAvSøknadsbehandling';
import * as SøknadsbehandlingActions from '~src/features/SøknadsbehandlingActions';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { UnderkjennelseGrunn, UnderkjennelseGrunnBehandling } from '~src/types/Behandling';
import { Sak } from '~src/types/Sak';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { erIverksatt, erTilAttestering } from '~src/utils/SøknadsbehandlingUtils';
import styles from './attesterSøknadsbehandling.module.less';
import messages from './attesterSøknadsbehandling-nb';

const AttesterSøknadsbehandling = (props: { sak: Sak; søknadsbehandling: Søknadsbehandling }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [iverksettStatus, attesteringIverksett] = useAsyncActionCreator(
        SøknadsbehandlingActions.attesteringIverksett,
    );
    const [underkjennStatus, attesteringUnderkjent] = useAsyncActionCreator(
        SøknadsbehandlingActions.attesteringUnderkjenn,
    );

    const [, fetchSak] = useAsyncActionCreator(sakSlice.fetchSakByIdEllerNummer);
    const redirectTilSaksoversikt = (message: string) => {
        Routes.navigateToSakIntroWithMessage(navigate, message, props.sak.id);
    };

    const iverksettCallback = () => {
        attesteringIverksett({ sakId: props.sak.id, behandlingId: props.søknadsbehandling.id }, (res) => {
            fetchSak({ sakId: res.sakId }, () => {
                redirectTilSaksoversikt(formatMessage('status.iverksatt'));
            });
        });
    };
    const underkjennCallback = (grunn: UnderkjennelseGrunn, kommentar: string) =>
        attesteringUnderkjent(
            {
                sakId: props.sak.id,
                behandlingId: props.søknadsbehandling.id,
                grunn: grunn as UnderkjennelseGrunnBehandling,
                kommentar: kommentar,
            },
            () => {
                redirectTilSaksoversikt(formatMessage('status.underkjent'));
            },
        );

    if (!erTilAttestering(props.søknadsbehandling) && !erIverksatt(props.søknadsbehandling)) {
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
        <div className={styles.mainContentContainer}>
            <AttesteringsForm
                behandlingsId={props.søknadsbehandling.id}
                redigerbartBrev={true}
                sakId={props.sak.id}
                iverksett={{ fn: iverksettCallback, status: iverksettStatus }}
                underkjenn={{
                    fn: underkjennCallback,
                    status: underkjennStatus,
                    underkjennelsesgrunner: Object.values(UnderkjennelseGrunnBehandling),
                }}
            />
            <OppsummeringAvSøknadsbehandling behandling={props.søknadsbehandling} />
        </div>
    );
};

export default AttesterSøknadsbehandling;
