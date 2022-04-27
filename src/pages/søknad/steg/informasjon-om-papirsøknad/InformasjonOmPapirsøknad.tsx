import { Datepicker } from '@navikt/ds-datepicker';
import { Label, RadioGroup, Radio, Textarea } from '@navikt/ds-react';
import { useFormik } from 'formik';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import SkjemaelementFeilmelding from '~src/components/formElements/SkjemaelementFeilmelding';
import TextProvider from '~src/components/TextProvider';
import søknadSlice, { ForVeilederPapirsøknad } from '~src/features/søknad/søknad.slice';
import { GrunnForPapirinnsending } from '~src/features/søknad/types';
import { useI18n, Languages } from '~src/lib/i18n';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~src/lib/validering';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import { Søknadstype } from '~src/types/Søknad';

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
            navigate(props.nesteUrl);
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
                        limitations={{
                            maxDate: new Date().toISOString(),
                        }}
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
                            navigate(props.forrigeUrl);
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
