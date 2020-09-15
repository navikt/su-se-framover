import { useFormik } from 'formik';
import { Radio, RadioGruppe, Input } from 'nav-frontend-skjema';
import { Normaltekst } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { UførhetStatus } from '~types/Behandlingsinformasjon';

import Faktablokk from './Faktablokk';
import { VilkårsvurderingBaseProps } from './types';
import styles from './Uførhet.module.less';
import { Vurdering, Vurderingknapper } from './Vurdering';

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
        <h3> {props.tittel} </h3>
        <span>
            <span className={styles.uføreInputContainer}>
                <Input
                    className={styles.uførehetInputFelt}
                    name={props.inputName}
                    defaultValue={props.defaultValues}
                    bredde={props.bredde}
                    onChange={props.onChange}
                />
                <Normaltekst>{props.inputTekst}</Normaltekst>
            </span>
            <Normaltekst className={styles.feilTekst}>{props.feil}</Normaltekst>
        </span>
    </div>
);

interface FormData {
    uførevedtak: Nullable<UførhetStatus>;
    uføregrad: Nullable<string>;
    forventetInntekt: Nullable<string>;
}

const schema = yup.object<FormData>({
    uførevedtak: yup
        .mixed()
        .defined()
        .oneOf([UførhetStatus.VilkårOppfylt, UførhetStatus.VilkårIkkeOppfylt, UførhetStatus.HarUføresakTilBehandling]),
    uføregrad: (yup
        .number()
        .nullable()
        .defined()
        .when('uførevedtak', {
            is: UførhetStatus.VilkårOppfylt,
            then: yup.number().positive().min(1).max(100).required().typeError('Feltet må være et tall'),
            otherwise: yup.number().nullable().defined(),
        }) as unknown) as yup.Schema<string>,
    forventetInntekt: (yup
        .number()
        .nullable()
        .defined()
        .when('uførevedtak', {
            is: UførhetStatus.VilkårOppfylt,
            then: yup.number().positive().integer().min(1).required().typeError('Feltet må være et tall'),
            otherwise: yup.number().nullable().defined(),
        }) as unknown) as yup.Schema<string>,
});

const Uførhet = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const formik = useFormik<FormData>({
        initialValues: {
            uførevedtak:
                props.behandling.behandlingsinformasjon.uførhet?.status ??
                (props.behandling.søknad.søknadInnhold.uførevedtak.harUførevedtak
                    ? UførhetStatus.VilkårOppfylt
                    : UførhetStatus.VilkårIkkeOppfylt),
            uføregrad: props.behandling.behandlingsinformasjon.uførhet?.uføregrad?.toString() ?? null,
            forventetInntekt: props.behandling.behandlingsinformasjon.uførhet?.forventetInntekt?.toString() ?? null,
        },
        onSubmit(values) {
            if (!values.uførevedtak) return;

            dispatch(
                lagreBehandlingsinformasjon({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                    behandlingsinformasjon: {
                        uførhet: {
                            status: values.uførevedtak,
                            uføregrad: values.uføregrad ? parseInt(values.uføregrad, 10) : null,
                            forventetInntekt: values.forventetInntekt ? parseInt(values.forventetInntekt, 10) : null,
                        },
                    },
                })
            );
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });
    const history = useHistory();

    return (
        <Vurdering tittel="Uførhet">
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
                            legend="Har søker fått vedtak om uføretrygd der vilkårene i §12-4 til §12-7 i folketrygdloven er oppfylt?"
                            feil={formik.errors.uførevedtak}
                        >
                            <Radio
                                label="Ja"
                                name="uførevedtak"
                                onChange={() =>
                                    formik.setValues({ ...formik.values, uførevedtak: UførhetStatus.VilkårOppfylt })
                                }
                                defaultChecked={formik.values.uførevedtak === UførhetStatus.VilkårOppfylt}
                            />
                            <Radio
                                label="Nei"
                                name="uførevedtak"
                                onChange={() =>
                                    formik.setValues({
                                        uførevedtak: UførhetStatus.VilkårIkkeOppfylt,
                                        uføregrad: null,
                                        forventetInntekt: null,
                                    })
                                }
                                defaultChecked={formik.values.uførevedtak === UførhetStatus.VilkårIkkeOppfylt}
                            />
                            <Radio
                                label="Har uføresak til behandling"
                                name="uførevedtak"
                                onChange={() =>
                                    formik.setValues({
                                        uførevedtak: UførhetStatus.HarUføresakTilBehandling,
                                        uføregrad: null,
                                        forventetInntekt: null,
                                    })
                                }
                                defaultChecked={formik.values.uførevedtak === UførhetStatus.HarUføresakTilBehandling}
                            />
                        </RadioGruppe>

                        {formik.values.uførevedtak === UførhetStatus.VilkårOppfylt && (
                            <div className={styles.formInputContainer}>
                                <UførhetInput
                                    tittel="Uføregrad"
                                    inputName="uføregrad"
                                    inputTekst="%"
                                    bredde="XS"
                                    defaultValues={formik.values.uføregrad ?? ''}
                                    onChange={formik.handleChange}
                                    feil={formik.errors.uføregrad}
                                />
                                <UførhetInput
                                    tittel="Forventet Inntekt"
                                    inputName="forventetInntekt"
                                    inputTekst=" NOK"
                                    bredde="L"
                                    defaultValues={formik.values.forventetInntekt ?? ''}
                                    onChange={formik.handleChange}
                                    feil={formik.errors.forventetInntekt}
                                />
                            </div>
                        )}
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                if (!formik.values.uførevedtak) return;

                                dispatch(
                                    lagreBehandlingsinformasjon({
                                        sakId: props.sakId,
                                        behandlingId: props.behandling.id,
                                        behandlingsinformasjon: {
                                            uførhet: {
                                                status: formik.values.uførevedtak,
                                                uføregrad: null,
                                                forventetInntekt: null,
                                            },
                                        },
                                    })
                                );
                            }}
                        />
                    </form>
                ),
                right: (
                    <Faktablokk
                        tittel="Fra søknad"
                        fakta={[
                            {
                                tittel: 'Har du fått vedtak om uføretrygd?',
                                verdi: props.behandling.søknad.søknadInnhold.uførevedtak.harUførevedtak ? 'Ja' : 'Nei',
                            },
                        ]}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default Uførhet;
