import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { LovligOppholdStatus } from '~types/Behandlingsinformasjon';
import { SøknadInnhold } from '~types/Søknad';

import Faktablokk from '../Faktablokk';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import styles from './LovligOppholdINorge.module.less';

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
    begrunnelse: yup.string().defined(),
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
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);

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
        async onSubmit(values) {
            if (!values.status) return;

            const res = await dispatch(
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

            if (lagreBehandlingsinformasjon.fulfilled.match(res)) {
                history.push(props.nesteUrl);
            }
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
                        <Textarea
                            label="Begrunnelse"
                            name="begrunnelse"
                            value={formik.values.begrunnelse || ''}
                            onChange={(e) => {
                                formik.setValues({
                                    ...formik.values,
                                    begrunnelse: e.target.value ? e.target.value : null,
                                });
                            }}
                            feil={formik.errors.begrunnelse}
                        />
                        {pipe(
                            lagreBehandlingsinformasjonStatus,
                            RemoteData.fold(
                                () => null,
                                () => <NavFrontendSpinner>Lagrer...</NavFrontendSpinner>,
                                () => <AlertStripe type="feil">En feil skjedde under lagring</AlertStripe>,
                                () => null
                            )
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
