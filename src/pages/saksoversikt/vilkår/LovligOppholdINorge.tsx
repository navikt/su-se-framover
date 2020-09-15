import { useFormik } from 'formik';
import { Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { SøknadInnhold } from '~api/søknadApi';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { LovligOppholdStatus } from '~types/Behandlingsinformasjon';

import Faktablokk from './Faktablokk';
import styles from './LovligOppholdINorge.module.less';
import { VilkårsvurderingBaseProps } from './types';
import { Vurdering, Vurderingknapper } from './Vurdering';
interface FormData {
    status: Nullable<LovligOppholdStatus>;
    begrunnelse: Nullable<string>;
}

const schema = yup.object<FormData>({
    status: yup
        .mixed<LovligOppholdStatus>()
        .defined()
        .oneOf(
            [LovligOppholdStatus.Uavklart, LovligOppholdStatus.VilkårIkkeOppfylt, LovligOppholdStatus.VilkårOppfylt],
            'Vennligst velg et alternativ '
        ),
    begrunnelse: yup.string().nullable().defined().when('status', {
        is: LovligOppholdStatus.Uavklart,
        then: yup.string().required(),
        otherwise: yup.string(),
    }),
});

function createFaktaBlokkArray(søknadsInnhold: SøknadInnhold) {
    const arr = [
        createFaktaBlokkObject(søknadsInnhold.oppholdstillatelse.erNorskStatsborger, 'Er du norsk statsborger?'),
    ];

    if (!søknadsInnhold.oppholdstillatelse.erNorskStatsborger) {
        arr.push(
            createFaktaBlokkObject(
                søknadsInnhold.oppholdstillatelse.harOppholdstillatelse,
                'Har søker oppholdstillatelse i Norge?'
            )
        );
    }
    if (søknadsInnhold.oppholdstillatelse.harOppholdstillatelse) {
        arr.push(
            createFaktaBlokkObject(søknadsInnhold.oppholdstillatelse.typeOppholdstillatelse, 'Oppholdstillatelse?')
        );
    }

    if (søknadsInnhold.oppholdstillatelse.typeOppholdstillatelse === 'midlertidig') {
        arr.push(
            createFaktaBlokkObject(
                søknadsInnhold.oppholdstillatelse.oppholdstillatelseMindreEnnTreMåneder,
                'Oppholdstillatelse mindre enn tre måneder?'
            )
        );
    }

    if (søknadsInnhold.oppholdstillatelse.oppholdstillatelseMindreEnnTreMåneder) {
        arr.push(
            createFaktaBlokkObject(
                søknadsInnhold.oppholdstillatelse.oppholdstillatelseForlengelse,
                'Har søker søkt forlengelse?'
            )
        );
    }

    return arr;
}

function createFaktaBlokkObject(oppholdstillatelsePair: Nullable<boolean | string>, tittel: string) {
    if (typeof oppholdstillatelsePair === 'string') {
        return {
            tittel: tittel,
            verdi: oppholdstillatelsePair.valueOf(),
        };
    } else if (typeof oppholdstillatelsePair === 'boolean') {
        return {
            tittel: tittel,
            verdi: oppholdstillatelsePair.valueOf() ? 'Ja' : 'Nei',
        };
    } else {
        return {
            tittel: tittel,
            verdi: oppholdstillatelsePair ? 'Ja' : 'Nei',
        };
    }
}

const LovligOppholdINorge = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

    const formik = useFormik<FormData>({
        initialValues: {
            status:
                props.behandling.behandlingsinformasjon.lovligOpphold?.status ??
                (props.behandling.søknad.søknadInnhold.oppholdstillatelse.erNorskStatsborger ||
                props.behandling.søknad.søknadInnhold.oppholdstillatelse.harOppholdstillatelse
                    ? LovligOppholdStatus.VilkårOppfylt
                    : LovligOppholdStatus.VilkårIkkeOppfylt),
            begrunnelse: props.behandling.behandlingsinformasjon.lovligOpphold?.begrunnelse ?? null,
        },
        onSubmit(values) {
            if (!values.status) return;

            dispatch(
                lagreBehandlingsinformasjon({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                    behandlingsinformasjon: {
                        ...props.behandling.behandlingsinformasjon,
                        lovligOpphold: {
                            status: values.status,
                            begrunnelse: values.begrunnelse,
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

    createFaktaBlokkArray(props.behandling.søknad.søknadInnhold);

    return (
        <Vurdering tittel="Lovlig opphold i Norge">
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            setHasSubmitted(true);
                            formik.handleSubmit(e);
                        }}
                    >
                        <RadioGruppe legend="Har søker lovlig opphold i Norge?" feil={formik.errors.status}>
                            <Radio
                                label="Ja"
                                name="lovligOppholdINorge"
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        status: LovligOppholdStatus.VilkårOppfylt,
                                        begrunnelse: null,
                                    })
                                }
                                checked={formik.values.status === LovligOppholdStatus.VilkårOppfylt}
                            />
                            <Radio
                                label="Nei"
                                name="lovligOppholdINorge"
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        status: LovligOppholdStatus.VilkårIkkeOppfylt,
                                        begrunnelse: null,
                                    })
                                }
                                checked={formik.values.status === LovligOppholdStatus.VilkårIkkeOppfylt}
                            />
                            <Radio
                                label="Uavklart"
                                name="lovligOppholdINorge"
                                onChange={() =>
                                    formik.setValues({ ...formik.values, status: LovligOppholdStatus.Uavklart })
                                }
                                checked={formik.values.status === LovligOppholdStatus.Uavklart}
                            />
                        </RadioGruppe>
                        {formik.values.status === LovligOppholdStatus.Uavklart && (
                            <Textarea
                                label="Begrunnelse"
                                name="begrunnelse"
                                value={formik.values.begrunnelse || ''}
                                onChange={formik.handleChange}
                                feil={formik.errors.begrunnelse}
                            />
                        )}
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                if (!formik.values.status) return;

                                dispatch(
                                    lagreBehandlingsinformasjon({
                                        sakId: props.sakId,
                                        behandlingId: props.behandling.id,
                                        behandlingsinformasjon: {
                                            ...props.behandling.behandlingsinformasjon,
                                            lovligOpphold: {
                                                status: formik.values.status,
                                                begrunnelse: formik.values.begrunnelse,
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
                        containerClassName={styles.lovligOppholdFaktaBlokkContainer}
                        faktaBlokkerClassName={styles.lovligOppholdFaktaBlokk}
                        fakta={createFaktaBlokkArray(props.behandling.søknad.søknadInnhold)}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default LovligOppholdINorge;
