import * as React from 'react';
import sharedStyles from '../../steg-shared.module.less';
import { JaNeiSpørsmål } from '~/components/FormElements';
import { FormattedMessage } from 'react-intl';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { Nullable } from '~lib/types';
import { Feiloppsummering, RadioPanelGruppe, Input } from 'nav-frontend-skjema';
import { useFormik } from 'formik';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import messages from './kontakt-nb';
import TextProvider, { Languages } from '~components/TextProvider';
import { useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknad.slice';
import { Vergemål } from '~features/søknad/types';
import AlertStripe from 'nav-frontend-alertstriper';
import sharedI18n from '../steg-shared-i18n';
import { useI18n } from '../../../../lib/hooks';
interface FormData {
    erTelefonnummerKorrekt: Nullable<boolean>;
    nyttTelefonnummer: Nullable<string>;
    harSøkerMøttPersonlig: Nullable<boolean>;
    harFullmektigEllerVerge: Nullable<Vergemål>;
    erPassSjekket: Nullable<boolean>;
}

const schema = yup.object<FormData>({
    erTelefonnummerKorrekt: yup.boolean().nullable().required(),
    nyttTelefonnummer: yup.string().nullable().defined().when('erTelefonnummerKorrekt', {
        is: false,
        then: yup.string().nullable().required(),
    }),
    harSøkerMøttPersonlig: yup.boolean().nullable().required(),
    harFullmektigEllerVerge: yup.mixed<Nullable<Vergemål>>().nullable().defined().when('harSøkerMøttPersonlig', {
        is: false,
        then: yup.string().nullable().required(),
    }),

    erPassSjekket: yup.boolean().nullable().required(),
});

const Kontakt = (props: { forrigeUrl: string; nesteUrl: string }) => {
    const history = useHistory();
    const kontaktOgForNavFraStore = useAppSelector((s) => s.soknad.kontaktOgForNav);
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);
    const save = (values: FormData) =>
        dispatch(
            søknadSlice.actions.kontaktOgForNav({
                erTelefonnummerKorrekt: values.erTelefonnummerKorrekt,
                nyttTelefonnummer: values.nyttTelefonnummer,
                harSøkerMøttPersonlig: values.harSøkerMøttPersonlig,
                harFullmektigEllerVerge: values.harFullmektigEllerVerge,
                erPassSjekket: values.erPassSjekket,
            })
        );

    const formik = useFormik<FormData>({
        initialValues: {
            erTelefonnummerKorrekt: kontaktOgForNavFraStore.erTelefonnummerKorrekt,
            nyttTelefonnummer: kontaktOgForNavFraStore.nyttTelefonnummer,
            harSøkerMøttPersonlig: kontaktOgForNavFraStore.harSøkerMøttPersonlig,
            harFullmektigEllerVerge: kontaktOgForNavFraStore.harFullmektigEllerVerge,
            erPassSjekket: kontaktOgForNavFraStore.erPassSjekket,
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
                    <p>12345678</p>
                    <JaNeiSpørsmål
                        id="erTelefonnummerKorrekt"
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="input.erTelefonnummerKorrekt.label" />}
                        feil={null}
                        state={formik.values.erTelefonnummerKorrekt}
                        onChange={(val) => {
                            formik.setValues({
                                ...formik.values,
                                erTelefonnummerKorrekt: val,
                            });
                        }}
                    />

                    {formik.values.erTelefonnummerKorrekt === false && (
                        <Input
                            id="nyttTelefonnummer"
                            name="nyttTelefonnummer"
                            className={sharedStyles.inputFelt}
                            label={<FormattedMessage id="input.nyttTelefonnummer.label" />}
                            value={formik.values.nyttTelefonnummer || ''}
                            onChange={formik.handleChange}
                        />
                    )}

                    <p>______________________</p>
                    <h1>Søker er digital</h1>
                    <p>----------------------</p>

                    <JaNeiSpørsmål
                        id="harSøkerMøttPersonlig"
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="input.harSøkerMøttPersonlig.label" />}
                        feil={null}
                        state={formik.values.harSøkerMøttPersonlig}
                        onChange={(val) => {
                            formik.setValues({
                                ...formik.values,
                                harSøkerMøttPersonlig: val,
                            });
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
                                    label: <FormattedMessage id={'input.fullmektigEllerVerge.fullmektig.label'} />,
                                    value: 'fullmektig',
                                },
                                {
                                    label: <FormattedMessage id={'input.fullmektigEllerVerge.verge.label'} />,
                                    value: 'verge',
                                },
                            ]}
                            onChange={(_, value) => {
                                formik.setValues({
                                    ...formik.values,
                                    harFullmektigEllerVerge: value,
                                });
                            }}
                            checked={formik.values.harFullmektigEllerVerge?.toString()}
                        />
                    )}

                    {formik.values.harFullmektigEllerVerge === 'fullmektig' && (
                        <AlertStripe type="advarsel">Husk å legge ved legeattest/legeerklæring</AlertStripe>
                    )}

                    <JaNeiSpørsmål
                        id="erPassSjekket"
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="input.erPassSjekket.label" />}
                        feil={null}
                        state={formik.values.erPassSjekket}
                        onChange={(val) => {
                            formik.setValues({
                                ...formik.values,
                                erPassSjekket: val,
                            });
                        }}
                    />

                    <Feiloppsummering
                        className={sharedStyles.feiloppsummering}
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

export default Kontakt;
