import { yupResolver } from '@hookform/resolvers/yup';
import { UseFormReturn, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import StansGjenopptaForm from '~src/components/forms/stansGjentopptaForm/StansGjenopptaForm';
import {
    GjenopptaFormData,
    StansGjenopptaFormData,
    stansGjenopptaSchema,
} from '~src/components/forms/stansGjentopptaForm/StansGjenopptaFormUtils';
import * as revurderingActions from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';
import { Revurdering } from '~src/types/Revurdering';

import styles from './Gjenoppta.module.less';

const OpprettGjenoppta = (props: { sakId: string }) => {
    const navigate = useNavigate();
    const [gjenopptaStatus, gjenoppta] = useAsyncActionCreator(revurderingActions.gjenoppta);

    const form = useForm<GjenopptaFormData>({
        defaultValues: {
            begrunnelse: '',
            årsak: null,
        },
        resolver: yupResolver(stansGjenopptaSchema),
        context: { formType: 'gjenoppta' },
    });

    const handleSubmit = async (values: StansGjenopptaFormData) => {
        gjenoppta(
            {
                sakId: props.sakId,
                årsak: values.årsak!,
                begrunnelse: values.begrunnelse!,
            },
            (arg: Revurdering) => {
                navigate(
                    Routes.gjenopptaOppsummeringRoute.createURL({
                        sakId: props.sakId,
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
                tilbakeUrl={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
                apiStatus={gjenopptaStatus}
                handleSubmit={handleSubmit}
            />
        </div>
    );
};

export default OpprettGjenoppta;
