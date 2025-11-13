import { yupResolver } from '@hookform/resolvers/yup';
import { UseFormReturn, useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';

import StansGjenopptaForm from '~src/components/forms/stansGjentopptaForm/StansGjenopptaForm';
import {
    StansFormData,
    StansGjenopptaFormData,
    stansGjenopptaSchema,
} from '~src/components/forms/stansGjentopptaForm/StansGjenopptaFormUtils';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import * as revurderingActions from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';
import { OpprettetRevurderingÅrsak } from '~src/types/Revurdering';

import styles from './StansStyles.module.less';

const OppdaterStans = () => {
    const props = useOutletContext<SaksoversiktContext>();
    const navigate = useNavigate();
    const urlParams = Routes.useRouteParams<typeof Routes.oppdaterStansRoute>();
    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId)!;

    const [oppdaterStatus, oppdaterStans] = useAsyncActionCreator(revurderingActions.oppdaterStans);

    const form = useForm<StansFormData>({
        defaultValues: {
            stansDato: new Date(revurdering.periode.fraOgMed),
            begrunnelse: revurdering.begrunnelse ?? '',
            årsak: revurdering.årsak as OpprettetRevurderingÅrsak.MANGLENDE_KONTROLLERKLÆRING,
        },
        resolver: yupResolver(stansGjenopptaSchema),
        context: { formType: 'stans' },
    });

    const handleSubmit = async (values: StansGjenopptaFormData) => {
        const castedStansValues = values as StansFormData;

        const revurderingId = urlParams.revurderingId;

        oppdaterStans(
            {
                sakId: urlParams.sakId!,
                fraOgMed: castedStansValues.stansDato!,
                årsak: castedStansValues.årsak!,
                begrunnelse: castedStansValues.begrunnelse!,
                revurderingId: revurderingId!,
            },
            (stansAvYtelse) => {
                navigate(
                    Routes.stansOppsummeringRoute.createURL({
                        sakId: urlParams.sakId!,
                        revurderingId: stansAvYtelse.id,
                    }),
                );
            },
        );
    };

    return (
        <div className={styles.opprettOppdaterContainer}>
            <StansGjenopptaForm
                form={form as UseFormReturn<StansGjenopptaFormData>}
                tilbakeUrl={Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })}
                apiStatus={oppdaterStatus}
                handleSubmit={handleSubmit}
            />
        </div>
    );
};

export default OppdaterStans;
