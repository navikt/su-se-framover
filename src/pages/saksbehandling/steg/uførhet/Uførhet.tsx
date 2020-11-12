import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Radio, RadioGruppe, Input, Label } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Normaltekst, Feilmelding } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { eqUførhet } from '~features/behandling/behandlingUtils';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Uførhet as UførhetType, UførhetStatus } from '~types/Behandlingsinformasjon';

import Faktablokk from '../Faktablokk';
import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import messages from './uførhet-nb';
import styles from './Uførhet.module.less';

const UførhetInput = (props: {
    tittel: string;
    inputName: string;
    inputTekst: string;
    defaultValues: string;
    bredde?: 'fullbredde' | 'XXL' | 'XL' | 'L' | 'M' | 'S' | 'XS' | 'XXS';
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    feil: string | undefined;
}) => (
    <div>
        <Label htmlFor={props.inputName}> {props.tittel} </Label>
        <span>
            <span className={styles.uføreInputContainer}>
                <Input
                    className={styles.uførehetInputFelt}
                    name={props.inputName}
                    defaultValue={props.defaultValues}
                    bredde={props.bredde}
                    onChange={props.onChange}
                    id={props.inputName}
                />
                <Normaltekst>{props.inputTekst}</Normaltekst>
            </span>
            {props.feil && <Feilmelding>{props.feil}</Feilmelding>}
        </span>
    </div>
);

interface FormData {
    status: Nullable<UførhetStatus>;
    uføregrad: Nullable<string>;
    forventetInntekt: Nullable<string>;
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
});

const Uførhet = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });
    const onSave = (values: FormData) => {
        if (!values.status) return;

        const uføreValues: UførhetType = {
            status: values.status,
            uføregrad: values.uføregrad ? parseInt(values.uføregrad, 10) : null,
            forventetInntekt: values.forventetInntekt ? parseInt(values.forventetInntekt, 10) : null,
        };

        if (eqUførhet.equals(uføreValues, props.behandling.behandlingsinformasjon.uførhet)) {
            history.push(props.nesteUrl);
            return;
        }

        return dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    uførhet: { ...uføreValues },
                },
            })
        );
    };

    const formik = useFormik<FormData>({
        initialValues: {
            status: props.behandling.behandlingsinformasjon.uførhet?.status ?? null,
            uføregrad: props.behandling.behandlingsinformasjon.uførhet?.uføregrad?.toString() ?? null,
            forventetInntekt: props.behandling.behandlingsinformasjon.uførhet?.forventetInntekt?.toString() ?? null,
        },
        async onSubmit(values) {
            const res = await onSave(values);
            if (!res) return;

            if (lagreBehandlingsinformasjon.fulfilled.match(res)) {
                history.push(props.nesteUrl);
            }
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });
    const history = useHistory();
    console.log(formik.values);
    return (
        <Vurdering tittel={intl.formatMessage({ id: 'page.tittel' })}>
            {{
                left: (
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
                                    formik.setValues({
                                        status: UførhetStatus.VilkårIkkeOppfylt,
                                        uføregrad: null,
                                        forventetInntekt: null,
                                    })
                                }
                                defaultChecked={formik.values.status === UførhetStatus.VilkårIkkeOppfylt}
                            />
                            <Radio
                                label={intl.formatMessage({ id: 'radio.label.uføresakTilBehandling' })}
                                name="status"
                                onChange={() =>
                                    formik.setValues({
                                        status: UførhetStatus.HarUføresakTilBehandling,
                                        uføregrad: null,
                                        forventetInntekt: null,
                                    })
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
                                    defaultValues={formik.values.uføregrad ?? ''}
                                    onChange={formik.handleChange}
                                    feil={formik.errors.uføregrad}
                                />
                                <UførhetInput
                                    tittel={intl.formatMessage({ id: 'input.label.forventetInntekt' })}
                                    inputName="forventetInntekt"
                                    inputTekst=" NOK"
                                    bredde="L"
                                    defaultValues={formik.values.forventetInntekt ?? ''}
                                    onChange={formik.handleChange}
                                    feil={formik.errors.forventetInntekt}
                                />
                            </div>
                        )}
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
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => onSave(formik.values)}
                        />
                    </form>
                ),
                right: (
                    <Faktablokk
                        tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
                        fakta={[
                            {
                                tittel: intl.formatMessage({ id: 'display.fraSøknad.vedtakOmUføretrygd' }),
                                verdi: props.behandling.søknad.søknadInnhold.uførevedtak.harUførevedtak
                                    ? intl.formatMessage({ id: 'display.fraSøknad.ja' })
                                    : intl.formatMessage({ id: 'display.fraSøknad.nei' }),
                            },
                        ]}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default Uførhet;
