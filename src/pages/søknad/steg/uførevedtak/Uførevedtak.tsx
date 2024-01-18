import { yupResolver } from '@hookform/resolvers/yup';
import { Alert } from '@navikt/ds-react';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import Feiloppsummering from '~src/components/oppsummering/feiloppsummering/Feiloppsummering';
import søknadSlice from '~src/features/søknad/søknad.slice';
import SøknadSpørsmålsgruppe from '~src/features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { focusAfterTimeout } from '~src/lib/formUtils';
import { useI18n } from '~src/lib/i18n';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { FormData, schema } from '~src/pages/søknad/steg/uførevedtak/validering';
import { useAppSelector, useAppDispatch } from '~src/redux/Store';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import * as sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './uførevedtak-nb';

const Uførevedtak = (props: { nesteUrl: string; forrigeUrl: string; avbrytUrl: string }) => {
    const harVedtakFraStore = useAppSelector((s) => s.soknad.harUførevedtak);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const form = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            harUførevedtak: harVedtakFraStore,
        },
    });
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });

    const feiloppsummeringref = useRef<HTMLDivElement>(null);

    return (
        <form
            onSubmit={form.handleSubmit((values) => {
                dispatch(søknadSlice.actions.harUførevedtakUpdated(values.harUførevedtak));
                navigate(props.nesteUrl);
                focusAfterTimeout(feiloppsummeringref)();
            })}
            className={sharedStyles.container}
        >
            <SøknadSpørsmålsgruppe withoutLegend>
                <Controller
                    control={form.control}
                    name="harUførevedtak"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={formatMessage('uførevedtak.label')}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            </SøknadSpørsmålsgruppe>
            {form.watch('harUførevedtak') === false && (
                <Alert variant="warning" className={sharedStyles.marginBottom}>
                    {formatMessage('uførevedtak.måSøkeUføretrygd.info')}
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
                        dispatch(søknadSlice.actions.harUførevedtakUpdated(form.getValues().harUførevedtak));
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

export default Uførevedtak;
