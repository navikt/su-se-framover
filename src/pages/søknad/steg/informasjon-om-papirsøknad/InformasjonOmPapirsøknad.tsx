import { yupResolver } from '@hookform/resolvers/yup';
import { Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Controller } from '~node_modules/react-hook-form';
import DatePicker from '~src/components/datePicker/DatePicker';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import søknadSlice, { ForVeilederPapirsøknad } from '~src/features/søknad/søknad.slice';
import { GrunnForPapirinnsending } from '~src/features/søknad/types';
import { useI18n } from '~src/lib/i18n';
import yup, { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import { Søknadstype } from '~src/types/Søknad';
import { toDateOrNull, toStringDateOrNull } from '~src/utils/date/dateUtils';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import * as sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './informasjonOmPapirsøknad-nb';
import * as styles from './informasjonOmPapirsøknad.module.less';

type FormData = ForVeilederPapirsøknad;

const schema = yup.object<FormData>({
    type: yup.string().required() as yup.Schema<Søknadstype.Papirsøknad>,
    mottaksdatoForSøknad: yup
        .date()
        .max(new Date(), 'Mottaksdato kan ikke være i fremtiden')
        .nullable()
        .required('Fyll ut mottaksdatoen for søknaden') as unknown as yup.Schema<string>,
    grunnForPapirinnsending: yup
        .mixed<GrunnForPapirinnsending>()
        .oneOf(Object.values(GrunnForPapirinnsending), 'Velg hvorfor søknaden var sendt inn uten personlig oppmøte'),
    annenGrunn: yup
        .string()
        .nullable()
        .defined()
        .when('grunnForPapirinnsending', {
            is: GrunnForPapirinnsending.Annet,
            then: yup.string().required('Fyll ut begrunnelse for hvorfor søker ikke møtte opp personlig'),
            otherwise: yup.string().nullable().defined(),
        }),
});

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
                            {...field}
                            id={field.name}
                            value={toDateOrNull(field.value)}
                            dateFormat="dd/MM/yyyy"
                            label={formatMessage('input.mottaksdato.label')}
                            feil={fieldState.error?.message}
                            maxDate={DateFns.endOfDay(new Date())}
                            onChange={(value) => field.onChange(toStringDateOrNull(value))}
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
