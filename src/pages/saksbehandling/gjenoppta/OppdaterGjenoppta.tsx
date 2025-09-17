import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, UseFormReturn } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';

import StansGjenopptaForm from '~src/components/forms/stansGjentopptaForm/StansGjenopptaForm';
import {
    GjenopptaFormData,
    StansGjenopptaFormData,
    stansGjenopptaSchema,
} from '~src/components/forms/stansGjentopptaForm/StansGjenopptaFormUtils';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import * as revurderingActions from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';
import { OpprettetRevurderingÅrsak, Revurdering } from '~src/types/Revurdering';

import styles from './Gjenoppta.module.less';

const OppdaterGjenoppta = () => {
    const props = useOutletContext<SaksoversiktContext>();
    const urlParams = Routes.useRouteParams<typeof Routes.oppdaterGjenopptaRoute>();

    const navigate = useNavigate();

    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId)!;

    const [oppdaterStatus, oppdaterGjenopptak] = useAsyncActionCreator(revurderingActions.oppdaterGjenopptak);

    const form = useForm<GjenopptaFormData>({
        defaultValues: {
            begrunnelse: revurdering.begrunnelse,
            årsak: revurdering.årsak as OpprettetRevurderingÅrsak.MOTTATT_KONTROLLERKLÆRING,
        },
        resolver: yupResolver(stansGjenopptaSchema),
        context: { formType: 'gjenoppta' },
    });

    const handleSubmit = async (values: StansGjenopptaFormData) => {
        const revurderingId = urlParams.revurderingId;

        oppdaterGjenopptak(
            {
                sakId: urlParams.sakId ?? '',
                årsak: values.årsak!,
                begrunnelse: values.begrunnelse!,
                revurderingId: revurderingId!,
            },
            (arg: Revurdering) => {
                navigate(
                    Routes.gjenopptaOppsummeringRoute.createURL({
                        sakId: urlParams.sakId ?? '',
                        revurderingId: arg.id,
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

export default OppdaterGjenoppta;
