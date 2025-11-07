import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, BodyShort, Label, Radio, RadioGroup } from '@navikt/ds-react';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import Feiloppsummering from '~src/components/oppsummering/feiloppsummering/Feiloppsummering';
import søknadSlice from '~src/features/søknad/søknad.slice';
import SøknadSpørsmålsgruppe from '~src/features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { Vergemål } from '~src/features/søknad/types';
import { useI18n } from '~src/lib/i18n';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { FormData, schema } from '~src/pages/søknad/steg/for-veileder/validering';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import { Person } from '~src/types/Person';
import { Søknadstype } from '~src/types/Søknadinnhold';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';
import styles from './forVeileder.module.less';
import messages from './forVeileder-nb';

const ForVeileder = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string; søker: Person }) => {
    const navigate = useNavigate();
    const forVeileder = useAppSelector((s) => s.soknad.forVeileder);
    const dispatch = useAppDispatch();
    const feiloppsummeringref = useRef<HTMLDivElement>(null);
    const søker: Person = props.søker;
    const telefonnummerPdl = søker.telefonnummer
        ? `${søker.telefonnummer.landskode} ${søker.telefonnummer.nummer}`
        : 'Ikke registrert telefonnummer';

    const kontaktinfo = søker.kontaktinfo;
    const telefonnummerKrr = kontaktinfo?.mobiltelefonnummer;
    const epostKrr = kontaktinfo?.epostadresse;

    const save = (values: FormData) => dispatch(søknadSlice.actions.ForVeileder(values));

    const form = useForm<FormData>({
        defaultValues: {
            type: Søknadstype.DigitalSøknad,
            harSøkerMøttPersonlig:
                forVeileder.type === Søknadstype.DigitalSøknad ? forVeileder.harSøkerMøttPersonlig : null,
            harFullmektigEllerVerge:
                forVeileder.type === Søknadstype.DigitalSøknad ? forVeileder.harFullmektigEllerVerge : null,
        },
        resolver: yupResolver(schema),
    });

    const setFieldsToNull = (keys: Array<keyof FormData>) => keys.map((key) => form.setValue(key, null));

    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    return (
        <form
            className={sharedStyles.container}
            onSubmit={form.handleSubmit((values) => {
                save(values);
                navigate(props.nesteUrl);
            })}
        >
            <div className={sharedStyles.marginBottom}>
                <div className={styles.infoboks}>
                    <Label spacing>{formatMessage('info.kontaktinfo.tittel')}</Label>
                    {kontaktinfo ? (
                        <div>
                            <BodyShort>{telefonnummerKrr}</BodyShort>
                            <BodyShort>{epostKrr}</BodyShort>
                        </div>
                    ) : (
                        <BodyShort>{formatMessage('info.kontaktinfo.mangler')}</BodyShort>
                    )}
                </div>
                <div className={styles.infoboks}>
                    <Label spacing>{formatMessage('info.telefon.tittel')}</Label>
                    <BodyShort>{telefonnummerPdl}</BodyShort>
                </div>
                <Alert variant="info" className={styles.marginTopXSS}>
                    {formatMessage('info.telefon.body')}
                </Alert>
            </div>

            <div className={sharedStyles.marginBottom}>
                <div className={styles.infoboks}>
                    <Label spacing>{formatMessage('info.kontaktform.tittel')}</Label>
                    {kontaktinfo ? (
                        <BodyShort>
                            {kontaktinfo.kanKontaktesDigitalt ? 'Digital' : 'Kan ikke kontaktes digitalt'}
                        </BodyShort>
                    ) : (
                        <BodyShort>{formatMessage('info.kontaktinfo.mangler')}</BodyShort>
                    )}
                </div>
                <Alert variant="info" className={styles.marginTopXSS}>
                    {formatMessage('info.kontaktform.body')}
                </Alert>
            </div>

            <SøknadSpørsmålsgruppe withoutLegend>
                <Controller
                    control={form.control}
                    name="harSøkerMøttPersonlig"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={formatMessage('input.harSøkerMøttPersonlig.label')}
                            error={fieldState.error?.message}
                            onChange={(val) => {
                                field.onChange(val);
                                setFieldsToNull(['harFullmektigEllerVerge']);
                            }}
                        />
                    )}
                />

                {form.watch('harSøkerMøttPersonlig') === false && (
                    <Controller
                        control={form.control}
                        name="harFullmektigEllerVerge"
                        render={({ field, fieldState }) => (
                            <RadioGroup
                                {...field}
                                error={fieldState.error?.message}
                                legend={formatMessage('input.fullmektigEllerVerge.label')}
                                value={field.value?.toString() ?? ''}
                            >
                                <Radio id={field.name} value={Vergemål.Fullmektig}>
                                    {formatMessage('input.fullmektigEllerVerge.fullmektig.label')}
                                </Radio>
                                <Radio value={Vergemål.Verge}>
                                    {formatMessage('input.fullmektigEllerVerge.verge.label')}
                                </Radio>
                            </RadioGroup>
                        )}
                    />
                )}

                {form.watch('harFullmektigEllerVerge') === Vergemål.Fullmektig && (
                    <Alert variant="warning">{formatMessage('alert.leggVedDokumentForFritak')}</Alert>
                )}
            </SøknadSpørsmålsgruppe>
            <Feiloppsummering
                className={sharedStyles.marginBottom}
                tittel={formatMessage('feiloppsummering.title')}
                feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                ref={feiloppsummeringref}
            />
            <Bunnknapper
                previous={{ onClick: () => navigate(props.forrigeUrl) }}
                avbryt={{ toRoute: props.avbrytUrl }}
            />
        </form>
    );
};

export default ForVeileder;
