import { Alert } from '@navikt/ds-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { yupResolver } from '~node_modules/@hookform/resolvers/yup';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import søknadSlice, { SøknadState } from '~src/features/søknad/søknad.slice';
import SøknadSpørsmålsgruppe from '~src/features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { focusAfterTimeout } from '~src/lib/formUtils';
import { useI18n } from '~src/lib/i18n';
import yup, { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import * as sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './alderspensjon-nb';

type FormData = {
    harSøktAlderspensjon: SøknadState['harSøktAlderspensjon'];
};

const schema = yup.object<FormData>({
    harSøktAlderspensjon: yup
        .boolean()
        .nullable()
        .required('Fyll ut om du har fått har søkt og fått svar på alderspensjon-søknaden'),
});

const Alderspensjon = (props: { nesteUrl: string; forrigeUrl: string; avbrytUrl: string }) => {
    const harVedtakFraStore = useAppSelector((s) => s.soknad.harSøktAlderspensjon);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const form = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            harSøktAlderspensjon: harVedtakFraStore,
        },
    });

    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });

    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

    return (
        <form
            onSubmit={form.handleSubmit((values) => {
                dispatch(søknadSlice.actions.harSøktAlderspensjonUpdated(values.harSøktAlderspensjon));
                navigate(props.nesteUrl);
                focusAfterTimeout(feiloppsummeringref)();
            })}
            className={sharedStyles.container}
        >
            <SøknadSpørsmålsgruppe withoutLegend>
                <Controller
                    control={form.control}
                    name="harSøktAlderspensjon"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={formatMessage('alderspensjon.label')}
                            error={fieldState.error?.message}
                            value={field.value}
                        />
                    )}
                />
            </SøknadSpørsmålsgruppe>
            {form.watch('harSøktAlderspensjon') === false && (
                <Alert variant="warning" className={sharedStyles.marginBottom}>
                    {formatMessage('alderspensjon.måSøkeAlderspensjon.info')}
                </Alert>
            )}
            <div>
                <Feiloppsummering
                    className={sharedStyles.marginBottom}
                    tittel={formatMessage('feiloppsummering.title')}
                    feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                    hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                    ref={feiloppsummeringref}
                />
            </div>

            <Bunnknapper
                previous={{
                    onClick: () => {
                        dispatch(
                            søknadSlice.actions.harSøktAlderspensjonUpdated(form.getValues().harSøktAlderspensjon)
                        );
                        navigate(props.forrigeUrl);
                    },
                    handleClickAsAvbryt: true,
                }}
                avbryt={{
                    toRoute: props.avbrytUrl,
                }}
            />
        </form>
    );
};

export default Alderspensjon;
