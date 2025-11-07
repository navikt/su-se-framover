import { yupResolver } from '@hookform/resolvers/yup';
import { UseFormReturn, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import StansGjenopptaForm from '~src/components/forms/stansGjentopptaForm/StansGjenopptaForm';
import {
    StansFormData,
    StansGjenopptaFormData,
    stansGjenopptaSchema,
} from '~src/components/forms/stansGjentopptaForm/StansGjenopptaFormUtils';
import * as revurderingActions from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';

import styles from './StansStyles.module.less';

const OpprettStansPage = (props: { sakId: string }) => {
    const navigate = useNavigate();
    const [opprettStatus, opprettStans] = useAsyncActionCreator(revurderingActions.opprettStans);

    const form = useForm<StansFormData>({
        defaultValues: {
            årsak: null,
            stansDato: null,
            begrunnelse: null,
        },
        resolver: yupResolver(stansGjenopptaSchema),
        context: { formType: 'stans' },
    });

    const handleSubmit = async (values: StansGjenopptaFormData) => {
        const castedStansValues = values as StansFormData;

        opprettStans(
            {
                sakId: props.sakId,
                fraOgMed: castedStansValues.stansDato!,
                årsak: castedStansValues.årsak!,
                begrunnelse: castedStansValues.begrunnelse!,
            },
            (stansAvYtelse) => {
                navigate(
                    Routes.stansOppsummeringRoute.createURL({
                        sakId: props.sakId,
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
                tilbakeUrl={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
                apiStatus={opprettStatus}
                handleSubmit={handleSubmit}
            />
        </div>
    );
};

export default OpprettStansPage;
