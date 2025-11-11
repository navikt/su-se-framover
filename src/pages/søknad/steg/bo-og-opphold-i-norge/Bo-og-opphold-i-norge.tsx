import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Checkbox, Radio, RadioGroup } from '@navikt/ds-react';
import { useRef } from 'react';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import { DatePicker } from '~src/components/inputs/datePicker/DatePicker';
import Feiloppsummering from '~src/components/oppsummering/feiloppsummering/Feiloppsummering';
import søknadSlice from '~src/features/søknad/søknad.slice';
import SøknadSpørsmålsgruppe from '~src/features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { DelerBoligMed, EPSFormData } from '~src/features/søknad/types';
import { focusAfterTimeout } from '~src/lib/formUtils';
import { useI18n } from '~src/lib/i18n';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { FormData, schema } from '~src/pages/søknad/steg/bo-og-opphold-i-norge/validering';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import { Adresse, IngenAdresseGrunn } from '~src/types/Person';
import { toDateOrNull, toIsoDateOnlyString } from '~src/utils/date/dateUtils';
import { formatAdresse } from '~src/utils/format/formatUtils';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';
import styles from './bo-og-opphold-i-norge.module.less';
import messages from './bo-og-opphold-i-norge-nb';
import EktefellePartnerSamboer from './EktefellePartnerSamboer';

const BoOgOppholdINorge = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
    const { søker, soknad } = useAppSelector((s) => ({
        søker: s.personopplysninger.søker,
        soknad: s.soknad,
    }));

    const boOgOppholdFraStore = soknad.boOgOpphold;
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const save = (values: FormData) => dispatch(søknadSlice.actions.boOgOppholdUpdated(values));

    const form = useForm<FormData>({
        defaultValues: boOgOppholdFraStore,
        resolver: yupResolver(schema),
    });

    const setFieldsToNull = (keys: Array<keyof FormData>) => keys.map((key) => form.setValue(key, null));

    const feiloppsummeringref = useRef<HTMLDivElement>(null);
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    let adresser: Array<{ label: string; radioValue: Adresse }> = [];

    if (RemoteData.isSuccess(søker) && søker.value.adresse) {
        adresser = søker.value.adresse?.map((a) => ({
            label: formatAdresse(a),
            radioValue: a,
        }));
    }

    return (
        <form
            className={sharedStyles.container}
            onSubmit={form.handleSubmit((values) => {
                save(values);
                navigate(props.nesteUrl);
                focusAfterTimeout(feiloppsummeringref)();
            })}
        >
            <SøknadSpørsmålsgruppe legend={formatMessage('institusjonsopphold.legend')}>
                <Controller
                    control={form.control}
                    name={'innlagtPåInstitusjon'}
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={formatMessage('innlagtPåInstitusjon.label')}
                            error={fieldState.error?.message}
                            onChange={(val) => {
                                field.onChange(val);
                                setFieldsToNull(['datoForInnleggelse', 'datoForUtskrivelse', 'fortsattInnlagt']);
                            }}
                        />
                    )}
                />

                {form.watch('innlagtPåInstitusjon') && (
                    <div>
                        <div className={styles.datoForInnleggelseContainer}>
                            <Controller
                                control={form.control}
                                name={'datoForInnleggelse'}
                                render={({ field, fieldState }) => (
                                    <DatePicker
                                        {...field}
                                        onChange={(val) => field.onChange(val ? toIsoDateOnlyString(val) : null)}
                                        label={formatMessage('innlagtPåInstitusjon.datoForInnleggelse')}
                                        error={fieldState.error?.message}
                                        value={toDateOrNull(field.value)}
                                    />
                                )}
                            />
                        </div>
                        <div className={styles.datoForUtskrivelseContainer}>
                            <div className={styles.datoForUtskrivelse}>
                                <Controller
                                    control={form.control}
                                    name={'datoForUtskrivelse'}
                                    render={({ field, fieldState }) => (
                                        <DatePicker
                                            {...field}
                                            onChange={(val) => field.onChange(val ? toIsoDateOnlyString(val) : null)}
                                            label={formatMessage('innlagtPåInstitusjon.datoForUtskrivelse')}
                                            error={fieldState.error?.message}
                                            value={toDateOrNull(field.value)}
                                            fromDate={toDateOrNull(form.watch('datoForInnleggelse'))}
                                            disabled={form.watch('fortsattInnlagt') ?? false}
                                        />
                                    )}
                                />
                            </div>
                            <Controller
                                control={form.control}
                                name={'fortsattInnlagt'}
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        value={field.value ?? false}
                                        checked={field.value === true}
                                        onChange={() => {
                                            field.onChange(!field.value);
                                            setFieldsToNull(['datoForUtskrivelse']);
                                        }}
                                    >
                                        {formatMessage('innlagtPåInstitusjon.fortsattInnlagt')}
                                    </Checkbox>
                                )}
                            />
                        </div>
                    </div>
                )}
            </SøknadSpørsmålsgruppe>
            <SøknadSpørsmålsgruppe legend={formatMessage('bosituasjon.legend')}>
                <Controller
                    control={form.control}
                    name={'borOgOppholderSegINorge'}
                    render={({ field, fieldState }) => (
                        <>
                            <BooleanRadioGroup
                                {...field}
                                legend={formatMessage('borOgOppholderSegINorge.label')}
                                error={fieldState.error?.message}
                            />
                            {field.value === false && (
                                <Alert variant="warning">
                                    {formatMessage('borOgOppholderSegINorge.ikkeOppholdINorge')}
                                </Alert>
                            )}
                        </>
                    )}
                />

                <Controller
                    control={form.control}
                    name={'delerBoligMedPersonOver18'}
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={formatMessage('delerBoligMed.delerBoligMedPersonOver18')}
                            error={fieldState.error?.message}
                            onChange={(val) => {
                                field.onChange(val);
                                setFieldsToNull(['delerBoligMed', 'ektefellePartnerSamboer']);
                            }}
                        />
                    )}
                />
                {form.watch('delerBoligMedPersonOver18') && (
                    <Controller
                        control={form.control}
                        name={'delerBoligMed'}
                        render={({ field, fieldState }) => (
                            <RadioGroup
                                {...field}
                                error={fieldState.error?.message}
                                legend={formatMessage('delerBoligMed.delerMedHvem')}
                                defaultValue={field.value?.toString()}
                                onChange={(value: DelerBoligMed) => {
                                    field.onChange(value);
                                    form.setValue(
                                        'ektefellePartnerSamboer',
                                        value === DelerBoligMed.EKTEMAKE_SAMBOER
                                            ? {
                                                  fnr: null,
                                                  erUførFlyktning: null,
                                              }
                                            : null,
                                    );
                                }}
                            >
                                <Radio value={DelerBoligMed.EKTEMAKE_SAMBOER}>
                                    {formatMessage('delerBoligMed.eps')}
                                </Radio>
                                <Radio value={DelerBoligMed.VOKSNE_BARN}>
                                    {formatMessage('delerBoligMed.voksneBarn')}
                                </Radio>
                                <Radio value={DelerBoligMed.ANNEN_VOKSEN}>
                                    {formatMessage('delerBoligMed.andreVoksne')}
                                </Radio>
                            </RadioGroup>
                        )}
                    />
                )}

                {form.watch('delerBoligMed') === DelerBoligMed.EKTEMAKE_SAMBOER && (
                    <Controller
                        control={form.control}
                        name={'ektefellePartnerSamboer'}
                        render={({ field }) => (
                            <EktefellePartnerSamboer
                                id="ektefellePartnerSamboer"
                                {...field}
                                feil={form.formState.errors.ektefellePartnerSamboer as FieldErrors<EPSFormData>}
                            />
                        )}
                    />
                )}

                <Controller
                    control={form.control}
                    name={'borPåAdresse'}
                    render={({ field, fieldState }) => (
                        <>
                            <RadioGroup
                                legend={formatMessage('adresse.hvaErAdresse.tittel')}
                                error={fieldState.error?.message}
                                description={formatMessage('adresse.registrerteAdresser')}
                                value={
                                    form.getValues().borPåAdresse?.adresselinje ??
                                    form.getValues().ingenAdresseGrunn ??
                                    ''
                                }
                                onChange={(val) => {
                                    setFieldsToNull(['borPåAdresse', 'ingenAdresseGrunn']);

                                    if (
                                        val === IngenAdresseGrunn.BOR_PÅ_ANNEN_ADRESSE ||
                                        val === IngenAdresseGrunn.HAR_IKKE_FAST_BOSTED
                                    ) {
                                        form.setValue('ingenAdresseGrunn', val);
                                    } else {
                                        field.onChange(
                                            adresser.find((a) => a.radioValue.adresselinje === val)?.radioValue ?? null,
                                        );
                                    }
                                }}
                            >
                                {adresser.map((a) => (
                                    <Radio
                                        key={a.radioValue.adresselinje}
                                        value={a.radioValue.adresselinje}
                                        id={a.radioValue.adresselinje}
                                    >
                                        {a.label}
                                    </Radio>
                                ))}
                                <Radio value={IngenAdresseGrunn.HAR_IKKE_FAST_BOSTED}>
                                    {formatMessage('adresse.ingenAdresse.harIkkeFastBosted')}
                                </Radio>
                                <Radio value={IngenAdresseGrunn.BOR_PÅ_ANNEN_ADRESSE}>
                                    {formatMessage('adresse.ingenAdresse.borPåAnnenAdresse')}
                                </Radio>
                            </RadioGroup>
                            {form.watch('ingenAdresseGrunn') === IngenAdresseGrunn.BOR_PÅ_ANNEN_ADRESSE && (
                                <Alert variant="warning">
                                    {formatMessage('adresse.ingenAdresse.borPåAnnenAdresse.advarsel')}
                                </Alert>
                            )}
                        </>
                    )}
                />
            </SøknadSpørsmålsgruppe>
            <Feiloppsummering
                className={sharedStyles.marginBottom}
                tittel={formatMessage('feiloppsummering.title')}
                feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                ref={feiloppsummeringref}
            />
            <Bunnknapper
                previous={{
                    onClick: () => {
                        save(form.getValues());
                        navigate(props.forrigeUrl);
                    },
                }}
                avbryt={{
                    toRoute: props.avbrytUrl,
                }}
            />
        </form>
    );
};

export default BoOgOppholdINorge;
