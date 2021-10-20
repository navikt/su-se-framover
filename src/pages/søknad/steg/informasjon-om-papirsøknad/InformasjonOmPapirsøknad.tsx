import { Datepicker } from '@navikt/ds-datepicker';
import { Label, RadioGroup, Radio, Textarea } from '@navikt/ds-react';
import { useFormik } from 'formik';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import søknadSlice, { ForVeilederPapirsøknad } from '~/features/søknad/søknad.slice';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import SkjemaelementFeilmelding from '~components/formElements/SkjemaelementFeilmelding';
import TextProvider from '~components/TextProvider';
import { GrunnForPapirinnsending } from '~features/søknad/types';
import { useI18n, Languages } from '~lib/i18n';
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
    mottaksdatoForSøknad: yup
        .date()
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

    const { intl } = useI18n({ messages: { ...sharedI18n, ...messages } });
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
                    <Label as="label" htmlFor="mottaksdato">
                        <FormattedMessage id="input.mottaksdato.label" />
                    </Label>
                    <Datepicker
                        inputProps={{
                            name: 'utreisedato',
                            'aria-invalid': formik.errors.mottaksdatoForSøknad ? true : false,
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
                    <RadioGroup
                        name={intl.formatMessage({ id: 'input.grunn.label' })}
                        legend={intl.formatMessage({ id: 'input.grunn.label' })}
                        value={formik.values.grunnForPapirinnsending?.toString()}
                        onChange={(value) => {
                            formik.setValues((v) => ({
                                ...v,
                                grunnForPapirinnsending: value as GrunnForPapirinnsending,
                                annenGrunn: null,
                            }));
                        }}
                        error={formik.errors.grunnForPapirinnsending}
                    >
                        <Radio value={GrunnForPapirinnsending.VergeHarSøktPåVegneAvBruker} id="grunnForPapirinnsending">
                            {intl.formatMessage({ id: 'input.grunn.verge' })}
                        </Radio>
                        <Radio value={GrunnForPapirinnsending.MidlertidigUnntakFraOppmøteplikt}>
                            {intl.formatMessage({ id: 'input.grunn.midlertidigUnntak' })}
                        </Radio>
                        <Radio value={GrunnForPapirinnsending.Annet}>
                            {intl.formatMessage({ id: 'input.grunn.annet' })}
                        </Radio>
                    </RadioGroup>
                </div>
                {formik.values.grunnForPapirinnsending === GrunnForPapirinnsending.Annet && (
                    <div className={styles.inputContainer}>
                        <Textarea
                            label={intl.formatMessage({ id: 'input.annengrunn.label' })}
                            name="beskrivelse"
                            error={formik.errors.annenGrunn}
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
                    avbryt={{
                        toRoute: props.avbrytUrl,
                    }}
                />
            </form>
        </TextProvider>
    );
};

export default InformasjonOmPapirsøknad;
