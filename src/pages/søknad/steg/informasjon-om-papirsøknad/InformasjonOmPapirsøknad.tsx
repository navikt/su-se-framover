import { useFormik } from 'formik';
import { Datepicker } from 'nav-datovelger';
import { Feiloppsummering, Label, RadioPanelGruppe, SkjemaelementFeilmelding, Textarea } from 'nav-frontend-skjema';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import søknadSlice, { ForVeilederPapirsøknad } from '~/features/søknad/søknad.slice';
import TextProvider, { Languages } from '~components/TextProvider';
import { GrunnForPapirinnsending } from '~features/søknad/types';
import { useI18n } from '~lib/hooks';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Søknadstype } from '~types/Søknad';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './informasjonOmPapirsøknad-nb';
import styles from './informasjonOmPapirsøknad.module.less';

type FormData = ForVeilederPapirsøknad;

const schema = yup.object<FormData>({
    type: yup.string().required() as yup.Schema<Søknadstype.Papirsøknad>,
    mottaksdatoForSøknad: (yup.date().nullable().required() as unknown) as yup.Schema<string>,
    grunnForPapirinnsending: yup.mixed<GrunnForPapirinnsending>().oneOf(Object.values(GrunnForPapirinnsending)),
    annenGrunn: yup.string().nullable().defined().when('grunnForPapirinnsending', {
        is: GrunnForPapirinnsending.Annet,
        then: yup.string().required(),
        otherwise: yup.string().nullable().defined(),
    }),
});

const InformasjonOmPapirsøknad = (props: { forrigeUrl: string; nesteUrl: string }) => {
    const history = useHistory();
    const forVeileder = useAppSelector((s) => s.soknad.forVeileder);
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    const save = (values: FormData) => dispatch(søknadSlice.actions.ForVeileder(values));

    const formik = useFormik<FormData>({
        initialValues:
            forVeileder.type === Søknadstype.Papirsøknad
                ? {
                      type: Søknadstype.Papirsøknad,
                      mottaksdatoForSøknad: forVeileder.mottaksdatoForSøknad,
                      grunnForPapirinnsending: forVeileder.grunnForPapirinnsending,
                      annenGrunn: forVeileder.annenGrunn,
                  }
                : {
                      type: Søknadstype.Papirsøknad,
                      mottaksdatoForSøknad: null,
                      grunnForPapirinnsending: null,
                      annenGrunn: null,
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
            <form
                onSubmit={(e) => {
                    setHasSubmitted(true);
                    formik.handleSubmit(e);
                }}
                className={styles.foo}
            >
                <div className={styles.inputContainer}>
                    <Label htmlFor="mottaksdato">
                        <FormattedMessage id="input.mottaksdato.label" />
                    </Label>
                    <Datepicker
                        inputProps={{
                            name: 'utreisedato',
                            placeholder: 'dd.mm.åååå',
                        }}
                        value={formik.values.mottaksdatoForSøknad ?? undefined}
                        inputId="mottaksdato"
                        onChange={(value) => {
                            formik.setValues((v) => ({ ...v, mottaksdatoForSøknad: value ?? null }));
                        }}
                    />
                    {formik.errors.mottaksdatoForSøknad && (
                        <SkjemaelementFeilmelding>{formik.errors.mottaksdatoForSøknad}</SkjemaelementFeilmelding>
                    )}
                </div>
                <div className={styles.inputContainer}>
                    <RadioPanelGruppe
                        name={intl.formatMessage({ id: 'input.grunn.label' })}
                        legend={intl.formatMessage({ id: 'input.grunn.label' })}
                        radios={[
                            {
                                label: intl.formatMessage({ id: 'input.grunn.verge' }),
                                value: GrunnForPapirinnsending.VergeHarSøktPåVegneAvBruker,
                            },
                            {
                                label: intl.formatMessage({ id: 'input.grunn.midlertidigUnntak' }),
                                value: GrunnForPapirinnsending.MidlertidigUnntakFraOppmøteplikt,
                            },
                            {
                                label: intl.formatMessage({ id: 'input.grunn.annet' }),
                                value: GrunnForPapirinnsending.Annet,
                            },
                        ]}
                        checked={formik.values.grunnForPapirinnsending ?? undefined}
                        onChange={(_, value) => {
                            formik.setValues((v) => ({
                                ...v,
                                grunnForPapirinnsending: value ?? null,
                                annenGrunn: null,
                            }));
                        }}
                        feil={formik.errors.grunnForPapirinnsending}
                    />
                </div>
                {formik.values.grunnForPapirinnsending === GrunnForPapirinnsending.Annet && (
                    <div className={styles.inputContainer}>
                        <Textarea
                            label={intl.formatMessage({ id: 'input.annengrunn.label' })}
                            name="beskrivelse"
                            feil={formik.errors.annenGrunn}
                            value={formik.values.annenGrunn ?? ''}
                            onChange={(e) => {
                                formik.setValues((v) => ({
                                    ...v,
                                    annenGrunn: e.target.value ?? null,
                                }));
                            }}
                        />
                    </div>
                )}
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
        </TextProvider>
    );
};

export default InformasjonOmPapirsøknad;
