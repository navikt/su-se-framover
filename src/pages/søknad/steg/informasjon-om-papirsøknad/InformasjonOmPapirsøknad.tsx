import { yupResolver } from '@hookform/resolvers/yup';
import { Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { DatePicker } from '~src/components/inputs/datePicker/DatePicker';
import Feiloppsummering from '~src/components/oppsummering/feiloppsummering/Feiloppsummering';
import søknadSlice from '~src/features/søknad/søknad.slice';
import { GrunnForPapirinnsending } from '~src/features/søknad/types';
import { useI18n } from '~src/lib/i18n';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { FormData, schema } from '~src/pages/søknad/steg/informasjon-om-papirsøknad/validering';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import { Søknadstype } from '~src/types/Søknadinnhold';
import { toDateOrNull, toStringDateOrNull } from '~src/utils/date/dateUtils';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';
import styles from './informasjonOmPapirsøknad.module.less';
import messages from './informasjonOmPapirsøknad-nb';

const InformasjonOmPapirsøknad = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
    const navigate = useNavigate();
    const forVeileder = useAppSelector((s) => s.soknad.forVeileder);
    const dispatch = useAppDispatch();

    const save = (values: FormData) => dispatch(søknadSlice.actions.ForVeileder(values));

    const fraStore = forVeileder.type === Søknadstype.Papirsøknad;

    const form = useForm<FormData>({
        defaultValues: {
            type: Søknadstype.Papirsøknad,
            mottaksdatoForSøknad: fraStore ? forVeileder.mottaksdatoForSøknad : null,
            grunnForPapirinnsending: fraStore ? forVeileder.grunnForPapirinnsending : null,
            annenGrunn: fraStore ? forVeileder.annenGrunn : null,
        },
        resolver: yupResolver(schema),
    });

    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const setFieldsToNull = (keys: Array<keyof FormData>) => keys.map((key) => form.setValue(key, null));

    return (
        <form
            onSubmit={form.handleSubmit((values) => {
                save(values);
                navigate(props.nesteUrl);
            })}
        >
            <div className={styles.inputContainer}>
                <Controller
                    control={form.control}
                    name="mottaksdatoForSøknad"
                    render={({ field, fieldState }) => (
                        <DatePicker
                            label={formatMessage('input.mottaksdato.label')}
                            value={toDateOrNull(field.value)}
                            toDate={DateFns.endOfDay(new Date())}
                            onChange={(value) => field.onChange(toStringDateOrNull(value))}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            </div>
            <div className={styles.inputContainer}>
                <Controller
                    control={form.control}
                    name="grunnForPapirinnsending"
                    render={({ field, fieldState }) => (
                        <RadioGroup
                            {...field}
                            legend={formatMessage('input.grunn.label')}
                            error={fieldState.error?.message}
                            onChange={(value) => {
                                field.onChange(value);
                                setFieldsToNull(['annenGrunn']);
                            }}
                        >
                            <Radio id={field.name} value={GrunnForPapirinnsending.VergeHarSøktPåVegneAvBruker}>
                                {formatMessage('input.grunn.verge')}
                            </Radio>
                            <Radio value={GrunnForPapirinnsending.MidlertidigUnntakFraOppmøteplikt}>
                                {formatMessage('input.grunn.midlertidigUnntak')}
                            </Radio>
                            <Radio value={GrunnForPapirinnsending.Annet}>{formatMessage('input.grunn.annet')}</Radio>
                        </RadioGroup>
                    )}
                />
            </div>
            {form.watch('grunnForPapirinnsending') === GrunnForPapirinnsending.Annet && (
                <div className={styles.inputContainer}>
                    <Controller
                        control={form.control}
                        name="annenGrunn"
                        render={({ field, fieldState }) => (
                            <Textarea
                                {...field}
                                id={field.name}
                                value={field.value ?? ''}
                                label={formatMessage('input.annengrunn.label')}
                                error={fieldState.error?.message}
                            />
                        )}
                    />
                </div>
            )}
            <Feiloppsummering
                className={sharedStyles.marginBottom}
                tittel={formatMessage('feiloppsummering.title')}
                feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
            />
            <Bunnknapper
                previous={{ onClick: () => navigate(props.forrigeUrl) }}
                avbryt={{ toRoute: props.avbrytUrl }}
            />
        </form>
    );
};

export default InformasjonOmPapirsøknad;
