import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Radio, RadioGruppe, Feiloppsummering, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { eqUførhet } from '~features/behandling/behandlingUtils';
import { lagreBehandlingsinformasjon, lagreUføregrunnlag } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import UføregrunnlagInputFelter from '~pages/saksbehandling/steg/uførhet/UføregrunnlagInputFelter';
import { UførhetInput } from '~pages/saksbehandling/steg/uførhet/UføreInput';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Uførhet as UførhetType, UførhetStatus } from '~types/Behandlingsinformasjon';

import { UførhetFaktablokk } from '../faktablokk/faktablokker/UførhetFaktablokk';
import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import messages from './uførhet-nb';
import styles from './Uførhet.module.less';

interface FormData {
    status: Nullable<UførhetStatus>;
    uføregrad: Nullable<string>;
    forventetInntekt: Nullable<string>;
    begrunnelse: Nullable<string>;
}

const schema = yup.object<FormData>({
    status: yup
        .mixed()
        .defined()
        .oneOf([UførhetStatus.VilkårOppfylt, UførhetStatus.VilkårIkkeOppfylt, UførhetStatus.HarUføresakTilBehandling]),
    uføregrad: (yup
        .number()
        .nullable()
        .defined()
        .when('status', {
            is: UførhetStatus.VilkårOppfylt,
            then: yup.number().positive().min(1).max(100).required().typeError('Feltet må være et tall'),
            otherwise: yup.number().nullable().defined(),
        }) as unknown) as yup.Schema<string>,
    forventetInntekt: (yup
        .number()
        .nullable()
        .defined()
        .when('status', {
            is: UførhetStatus.VilkårOppfylt,
            then: yup.number().positive().integer().min(0).required().typeError('Feltet må være et tall'),
            otherwise: yup.number().nullable().defined(),
        }) as unknown) as yup.Schema<string>,
    begrunnelse: yup.string().nullable().defined(),
});

const Uførhet = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    const handleSave = async (values: FormData, nesteUrl: string) => {
        if (!values.status) return;

        const uføreValues: UførhetType = {
            status: values.status,
            uføregrad: values.uføregrad ? parseInt(values.uføregrad, 10) : null,
            forventetInntekt: values.forventetInntekt ? parseInt(values.forventetInntekt, 10) : null,
            begrunnelse: values.begrunnelse,
        };

        if (eqUførhet.equals(uføreValues, props.behandling.behandlingsinformasjon.uførhet)) {
            history.push(nesteUrl);
            return;
        }

        const res = await dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    uførhet: uføreValues,
                },
            })
        );

        if (!res) return;

        if (lagreBehandlingsinformasjon.fulfilled.match(res)) {
            history.push(nesteUrl);
        }
    };

    const formik = useFormik<FormData>({
        initialValues: {
            status: props.behandling.behandlingsinformasjon.uførhet?.status ?? null,
            uføregrad: props.behandling.behandlingsinformasjon.uførhet?.uføregrad?.toString() ?? null,
            forventetInntekt: props.behandling.behandlingsinformasjon.uførhet?.forventetInntekt?.toString() ?? null,
            begrunnelse: props.behandling.behandlingsinformasjon.uførhet?.begrunnelse ?? null,
        },
        async onSubmit(values) {
            handleSave(values, props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });
    const history = useHistory();

    return (
        <Vurdering tittel={intl.formatMessage({ id: 'page.tittel' })}>
            {{
                left: (
                    <>
                        <UføregrunnlagInputFelter
                            grunnlag={props.behandling.grunnlag}
                            lagre={(uføregrunnlag) =>
                                dispatch(
                                    lagreUføregrunnlag({
                                        sakId: props.sakId,
                                        behandlingId: props.behandling.id,
                                        uføregrunnlag,
                                    })
                                )
                            }
                        />
                        ------------------------------------------------------------------------------------------------------------------------------
                        <form
                            onSubmit={(e) => {
                                setHasSubmitted(true);
                                formik.handleSubmit(e);
                            }}
                        >
                            <RadioGruppe
                                className={styles.radioGruppe}
                                legend={intl.formatMessage({ id: 'radio.uførhet.legend' })}
                                feil={formik.errors.status}
                            >
                                <Radio
                                    label={intl.formatMessage({ id: 'radio.label.ja' })}
                                    name="status"
                                    onChange={() =>
                                        formik.setValues({ ...formik.values, status: UførhetStatus.VilkårOppfylt })
                                    }
                                    defaultChecked={formik.values.status === UførhetStatus.VilkårOppfylt}
                                />
                                <Radio
                                    label={intl.formatMessage({ id: 'radio.label.nei' })}
                                    name="status"
                                    onChange={() =>
                                        formik.setValues((v) => ({
                                            status: UførhetStatus.VilkårIkkeOppfylt,
                                            uføregrad: null,
                                            forventetInntekt: null,
                                            begrunnelse: v.begrunnelse,
                                        }))
                                    }
                                    defaultChecked={formik.values.status === UførhetStatus.VilkårIkkeOppfylt}
                                />
                                <Radio
                                    label={intl.formatMessage({ id: 'radio.label.uføresakTilBehandling' })}
                                    name="status"
                                    onChange={() =>
                                        formik.setValues((v) => ({
                                            status: UførhetStatus.HarUføresakTilBehandling,
                                            uføregrad: null,
                                            forventetInntekt: null,
                                            begrunnelse: v.begrunnelse,
                                        }))
                                    }
                                    defaultChecked={formik.values.status === UførhetStatus.HarUføresakTilBehandling}
                                />
                            </RadioGruppe>
                            {formik.values.status === UførhetStatus.VilkårOppfylt && (
                                <div className={styles.formInputContainer}>
                                    <UførhetInput
                                        tittel={intl.formatMessage({ id: 'input.label.uføregrad' })}
                                        inputName="uføregrad"
                                        inputTekst="%"
                                        bredde="XS"
                                        value={formik.values.uføregrad ?? ''}
                                        onChange={formik.handleChange}
                                        feil={formik.errors.uføregrad}
                                    />
                                    <UførhetInput
                                        tittel={intl.formatMessage({ id: 'input.label.forventetInntekt' })}
                                        inputName="forventetInntekt"
                                        inputTekst=" NOK"
                                        bredde="L"
                                        value={formik.values.forventetInntekt ?? ''}
                                        onChange={formik.handleChange}
                                        feil={formik.errors.forventetInntekt}
                                    />
                                </div>
                            )}

                            <div className={sharedStyles.textareaContainer}>
                                <Textarea
                                    label={intl.formatMessage({ id: 'input.label.begrunnelse' })}
                                    name="begrunnelse"
                                    onChange={formik.handleChange}
                                    value={formik.values.begrunnelse ?? ''}
                                    feil={formik.errors.begrunnelse}
                                />
                            </div>

                            {pipe(
                                lagreBehandlingsinformasjonStatus,
                                RemoteData.fold(
                                    () => null,
                                    () => (
                                        <NavFrontendSpinner>
                                            {intl.formatMessage({ id: 'display.lagre.lagrer' })}
                                        </NavFrontendSpinner>
                                    ),
                                    () => (
                                        <AlertStripe type="feil">
                                            {intl.formatMessage({ id: 'display.lagre.lagringFeilet' })}
                                        </AlertStripe>
                                    ),
                                    () => null
                                )
                            )}
                            <Feiloppsummering
                                tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                                feil={formikErrorsTilFeiloppsummering(formik.errors)}
                                hidden={!formikErrorsHarFeil(formik.errors)}
                            />
                            <Vurderingknapper
                                onTilbakeClick={() => {
                                    history.push(props.forrigeUrl);
                                }}
                                onLagreOgFortsettSenereClick={() => {
                                    setHasSubmitted(true);
                                    formik.validateForm().then((res) => {
                                        if (Object.keys(res).length === 0) {
                                            handleSave(
                                                formik.values,
                                                Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })
                                            );
                                        }
                                    });
                                }}
                            />
                        </form>
                    </>
                ),
                right: <UførhetFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </Vurdering>
    );
};

export default Uførhet;
