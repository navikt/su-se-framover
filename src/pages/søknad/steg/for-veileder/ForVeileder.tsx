import { useFormik } from 'formik';
import AlertStripe, { AlertStripeInfo } from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
import { Feiloppsummering, RadioPanelGruppe } from 'nav-frontend-skjema';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { JaNeiSpørsmål } from '~/components/FormElements';
import søknadSlice, { ForVeilederDigitalSøknad } from '~/features/søknad/søknad.slice';
import { Person } from '~api/personApi';
import TextProvider, { Languages } from '~components/TextProvider';
import { Vergemål } from '~features/søknad/types';
import { useI18n } from '~lib/hooks';
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
    harSøkerMøttPersonlig: yup.boolean().nullable().required(),
    harFullmektigEllerVerge: yup.mixed<Nullable<Vergemål>>().nullable().defined().when('harSøkerMøttPersonlig', {
        is: false,
        then: yup.string().nullable().required(),
    }),
});

const ForVeileder = (props: { forrigeUrl: string; nesteUrl: string; søker: Person }) => {
    const history = useHistory();
    const forVeileder = useAppSelector((s) => s.soknad.forVeileder);
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);
    const telefonnummer = props.søker.telefonnummer
        ? `${props.søker.telefonnummer.landskode} ${props.søker.telefonnummer.nummer}`
        : 'Ikke registrert telefonnummer';

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

    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });
    return (
        <TextProvider messages={{ [Languages.nb]: messages }}>
            <div>
                <form
                    onSubmit={(e) => {
                        setHasSubmitted(true);
                        formik.handleSubmit(e);
                    }}
                >
                    <Panel border className={styles.panelMargin}>
                        <p className={styles.boldP}>{intl.formatMessage({ id: 'info.telefon.tittel' })}</p>
                        <p>{telefonnummer}</p>
                        <AlertStripeInfo className={styles.marginTopXSS}>
                            {intl.formatMessage({ id: 'info.telefon.body' })}
                        </AlertStripeInfo>
                    </Panel>

                    <Panel border className={styles.panelMargin}>
                        <p className={styles.boldP}>{intl.formatMessage({ id: 'info.kontaktform.tittel' })}</p>
                        <p>Digital</p>
                        <AlertStripeInfo className={styles.marginTopXSS}>
                            {intl.formatMessage({ id: 'info.kontaktform.body' })}
                        </AlertStripeInfo>
                    </Panel>

                    {formik.values.type === Søknadstype.DigitalSøknad ? (
                        <>
                            <JaNeiSpørsmål
                                id="harSøkerMøttPersonlig"
                                className={sharedStyles.sporsmal}
                                legend={<FormattedMessage id="input.harSøkerMøttPersonlig.label" />}
                                feil={formik.errors.harSøkerMøttPersonlig}
                                state={formik.values.harSøkerMøttPersonlig}
                                onChange={(val) => {
                                    formik.setValues((values) => ({
                                        ...values,
                                        harSøkerMøttPersonlig: val,
                                        harFullmektigEllerVerge: null,
                                    }));
                                }}
                            />

                            {formik.values.harSøkerMøttPersonlig === false && (
                                <RadioPanelGruppe
                                    className={sharedStyles.sporsmal}
                                    feil={null}
                                    legend={<FormattedMessage id={'input.fullmektigEllerVerge.label'} />}
                                    name="fullmektigEllerVerge"
                                    radios={[
                                        {
                                            label: (
                                                <FormattedMessage id={'input.fullmektigEllerVerge.fullmektig.label'} />
                                            ),
                                            value: 'fullmektig',
                                        },
                                        {
                                            label: <FormattedMessage id={'input.fullmektigEllerVerge.verge.label'} />,
                                            value: 'verge',
                                        },
                                    ]}
                                    onChange={(_, value) => {
                                        formik.setValues((values) => ({
                                            ...values,
                                            harFullmektigEllerVerge: value,
                                        }));
                                    }}
                                    checked={formik.values.harFullmektigEllerVerge?.toString()}
                                />
                            )}

                            {formik.values.harFullmektigEllerVerge === 'fullmektig' && (
                                <AlertStripe type="advarsel" className={sharedStyles.marginBottom}>
                                    Husk å legge ved legeattest/legeerklæring
                                </AlertStripe>
                            )}
                        </>
                    ) : null}
                    <Feiloppsummering
                        className={sharedStyles.marginBottom}
                        tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                        feil={formikErrorsTilFeiloppsummering(formik.errors)}
                        hidden={!formikErrorsHarFeil(formik.errors)}
                    />
                    <Bunnknapper
                        previous={{
                            onClick: () => {
                                history.push(props.forrigeUrl);
                            },
                        }}
                    />
                </form>
            </div>
        </TextProvider>
    );
};

export default ForVeileder;
