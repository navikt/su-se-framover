import { useNavigate } from 'react-router-dom';
import * as reguleringApi from '~src/api/reguleringApi.ts';
import AttesteringsForm from '~src/components/forms/attesteringForm/AttesteringsForm.tsx';
import * as sakSlice from '~src/features/saksoversikt/sak.slice.ts';
import { useApiCall } from '~src/lib/hooks.ts';
import * as Routes from '~src/lib/routes.ts';
import styles from '~src/pages/saksbehandling/regulering/manuellRegulering.module.less';
import { useAppDispatch } from '~src/redux/Store.ts';
import { UnderkjennelseGrunnBehandling } from '~src/types/Behandling.ts';
import { Regulering, UnderkjennelseGrunnRegulering } from '~src/types/Regulering.ts';

interface Props {
    regulering: Regulering;
}

export const ReguleringAttestering = (props: Props) => {
    const { regulering } = props;
    const [godkjennAttesteringStatus, godkjennAttestering] = useApiCall(reguleringApi.godkjennAttestering);
    const [underkjennAttesteringStatus, underkjennAttestering] = useApiCall(reguleringApi.underkjennAttestering);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const submitGodkjennAttestering = () => {
        godkjennAttestering(
            {
                reguleringId: regulering.id,
            },
            () => {
                dispatch(sakSlice.fetchSakByIdEllerNummer({ sakId: regulering.sakId }));
                Routes.navigateToSakIntroWithMessage(navigate, 'Regulering iverksatt', regulering.sakId);
            },
        );
    };

    const submitUnderkjennAttestering = (_: string, kommentar: string) => {
        underkjennAttestering(
            {
                reguleringId: regulering.id,
                kommentar: kommentar,
            },
            () => {
                Routes.navigateToSakIntroWithMessage(navigate, 'Regulering underkjent', regulering.sakId);
            },
        );
    };

    return (
        <div className={styles.knapper}>
            <AttesteringsForm
                behandlingsId={regulering.id}
                redigerbartBrev={false}
                sakId={regulering.sakId}
                behandlingstype={'TILBAKEKREVING'}
                iverksett={{
                    fn: submitGodkjennAttestering,
                    status: godkjennAttesteringStatus,
                }}
                underkjenn={{
                    fn: submitUnderkjennAttestering,
                    status: underkjennAttesteringStatus,
                    underkjennelsesgrunner: [UnderkjennelseGrunnRegulering.REGULERING_ER_FEIL],
                }}
            />
        </div>
    );
};
