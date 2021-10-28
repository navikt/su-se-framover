import { Alert, RadioGroup, Radio, Label, BodyShort } from '@navikt/ds-react';
import { useFormik } from 'formik';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { BooleanRadioGroup } from '~/components/formElements/FormElements';
import søknadSlice, { ForVeilederDigitalSøknad } from '~/features/søknad/søknad.slice';
import { Person } from '~api/personApi';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import TextProvider from '~components/TextProvider';
import SøknadSpørsmålsgruppe from '~features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { Vergemål } from '~features/søknad/types';
import { focusAfterTimeout } from '~lib/formUtils';
import { useI18n, Languages } from '~lib/i18n';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Søknadstype } from '~types/Søknad';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './forVeileder-nb';
import styles from './forVeileder.module.less';

type FormData = ForVeilederDigitalSøknad;

const schema = yup.object<FormData>({
    type: yup.string().required() as yup.Schema<Søknadstype.DigitalSøknad>,
    harSøkerMøttPersonlig: yup.boolean().nullable().required('Velg om søker har møtt personlig'),
    harFullmektigEllerVerge: yup
        .mixed<Nullable<Vergemål>>()
        .nullable()
        .defined()
        .when('harSøkerMøttPersonlig', {
            is: false,
            then: yup.string().nullable().required('Velg om søker har fullmektig eller verge'),
        }),
});

const ForVeileder = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string; søker: Person }) => {
    const history = useHistory();
    const forVeileder = useAppSelector((s) => s.soknad.forVeileder);
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);
    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);
    const søker: Person = props.søker;
    const telefonnummerPdl = søker.telefonnummer
        ? `${søker.telefonnummer.landskode} ${søker.telefonnummer.nummer}`
        : 'Ikke registrert telefonnummer';

    const kontaktinfo = søker.kontaktinfo;
    const telefonnummerKrr = kontaktinfo?.mobiltelefonnummer;
    const epostKrr = kontaktinfo?.epostadresse;
    const digitalBruker: boolean = kontaktinfo != null && !kontaktinfo?.reservert && kontaktinfo?.kanVarsles;

    const save = (values: FormData) => dispatch(søknadSlice.actions.ForVeileder(values));

    const formik = useFormik<FormData>({
        initialValues: {
            type: Søknadstype.DigitalSøknad,
            harSøkerMøttPersonlig:
                forVeileder.type === Søknadstype.DigitalSøknad ? forVeileder.harSøkerMøttPersonlig : null,
            harFullmektigEllerVerge:
                forVeileder.type === Søknadstype.DigitalSøknad ? forVeileder.harFullmektigEllerVerge : null,
        },
        onSubmit: (values) => {
            save(values);
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const { intl } = useI18n({ messages: { ...sharedI18n, ...messages } });
    return (
        <TextProvider messages={{ [Languages.nb]: messages }}>
            <form
                className={sharedStyles.container}
                onSubmit={(e) => {
                    setHasSubmitted(true);
                    formik.handleSubmit(e);
                    focusAfterTimeout(feiloppsummeringref)();
                }}
            >
                <div className={sharedStyles.marginBottom}>
                    <div className={styles.infoboks}>
                        <Label spacing>{intl.formatMessage({ id: 'info.kontaktinfo.tittel' })}</Label>
                        {kontaktinfo ? (
                            <div>
                                <BodyShort>{telefonnummerKrr}</BodyShort>
                                <BodyShort>{epostKrr}</BodyShort>
                            </div>
                        ) : (
                            <BodyShort>{intl.formatMessage({ id: 'info.kontaktinfo.mangler' })}</BodyShort>
                        )}
                    </div>
                    <div className={styles.infoboks}>
                        <Label spacing>{intl.formatMessage({ id: 'info.telefon.tittel' })}</Label>
                        <BodyShort>{telefonnummerPdl}</BodyShort>
                    </div>
                    <Alert variant="info" className={styles.marginTopXSS}>
                        {intl.formatMessage({ id: 'info.telefon.body' })}
                    </Alert>
                </div>

                <div className={sharedStyles.marginBottom}>
                    <div className={styles.infoboks}>
                        <Label spacing>{intl.formatMessage({ id: 'info.kontaktform.tittel' })}</Label>
                        {kontaktinfo ? (
                            <BodyShort>{digitalBruker ? 'Digital' : 'Reservert mot digital kommunikasjon'}</BodyShort>
                        ) : (
                            <BodyShort>{intl.formatMessage({ id: 'info.kontaktinfo.mangler' })}</BodyShort>
                        )}
                    </div>
                    <Alert variant="info" className={styles.marginTopXSS}>
                        {intl.formatMessage({ id: 'info.kontaktform.body' })}
                    </Alert>
                </div>

                <SøknadSpørsmålsgruppe withoutLegend>
                    <BooleanRadioGroup
                        name="harSøkerMøttPersonlig"
                        legend={<FormattedMessage id="input.harSøkerMøttPersonlig.label" />}
                        error={formik.errors.harSøkerMøttPersonlig}
                        value={formik.values.harSøkerMøttPersonlig}
                        onChange={(val) => {
                            formik.setValues((values) => ({
                                ...values,
                                harSøkerMøttPersonlig: val,
                                harFullmektigEllerVerge: null,
                            }));
                        }}
                    />

                    {formik.values.harSøkerMøttPersonlig === false && (
                        <RadioGroup
                            error={formik.errors.harFullmektigEllerVerge}
                            legend={<FormattedMessage id={'input.fullmektigEllerVerge.label'} />}
                            name="harFullmektigEllerVerge"
                            onChange={(value) => {
                                formik.setValues((values) => ({
                                    ...values,
                                    harFullmektigEllerVerge: value as Vergemål,
                                }));
                            }}
                            value={formik.values.harFullmektigEllerVerge?.toString()}
                        >
                            <Radio id="harFullmektigEllerVerge" value={Vergemål.Fullmektig}>
                                <FormattedMessage id={'input.fullmektigEllerVerge.fullmektig.label'} />
                            </Radio>
                            <Radio value={Vergemål.Verge}>
                                <FormattedMessage id={'input.fullmektigEllerVerge.verge.label'} />
                            </Radio>
                        </RadioGroup>
                    )}

                    {formik.values.harFullmektigEllerVerge === 'fullmektig' && (
                        <Alert variant="warning">Husk å legge ved legeattest/legeerklæring</Alert>
                    )}
                </SøknadSpørsmålsgruppe>
                <Feiloppsummering
                    className={sharedStyles.marginBottom}
                    tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                    feil={formikErrorsTilFeiloppsummering(formik.errors)}
                    hidden={!formikErrorsHarFeil(formik.errors)}
                    ref={feiloppsummeringref}
                />
                <Bunnknapper
                    previous={{
                        onClick: () => {
                            history.push(props.forrigeUrl);
                        },
                    }}
                    avbryt={{
                        toRoute: props.avbrytUrl,
                    }}
                />
            </form>
        </TextProvider>
    );
};

export default ForVeileder;
