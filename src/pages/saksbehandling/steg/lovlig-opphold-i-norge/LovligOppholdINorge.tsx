import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Feiloppsummering, Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useState } from 'react';
import { IntlShape } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { eqLovligOppholdINorge } from '~features/behandling/behandlingUtils';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { LovligOpphold, LovligOppholdStatus } from '~types/Behandlingsinformasjon';
import { SøknadInnhold } from '~types/Søknad';

import Faktablokk from '../faktablokk/Faktablokk';
import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import messages from './lovligOppholdINorge-nb';
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

function createFaktaBlokkArray(intl: IntlShape, søknadsInnhold: SøknadInnhold) {
    const arr = [
        createFaktaBlokkObject(
            søknadsInnhold.oppholdstillatelse.erNorskStatsborger,
            intl.formatMessage({ id: 'display.fraSøknad.erNorskStatsborger' }),
            intl
        ),
    ];

    if (!søknadsInnhold.oppholdstillatelse.erNorskStatsborger) {
        arr.push(
            createFaktaBlokkObject(
                søknadsInnhold.oppholdstillatelse.harOppholdstillatelse,
                intl.formatMessage({ id: 'display.fraSøknad.harOppholdstillatelse' }),
                intl
            )
        );
    }
    if (søknadsInnhold.oppholdstillatelse.harOppholdstillatelse) {
        arr.push(
            createFaktaBlokkObject(
                søknadsInnhold.oppholdstillatelse.typeOppholdstillatelse,
                intl.formatMessage({ id: 'display.fraSøknad.typeOppholdstillatelse' }),
                intl
            )
        );
    }

    if (søknadsInnhold.oppholdstillatelse.statsborgerskapAndreLand) {
        arr.push(
            createFaktaBlokkObject(
                søknadsInnhold.oppholdstillatelse.statsborgerskapAndreLandFritekst,
                intl.formatMessage({ id: 'display.fraSøknad.statsborgerskapAndreLand' }),
                intl
            )
        );
    }

    return arr;
}

function createFaktaBlokkObject(oppholdstillatelsePair: Nullable<boolean | string>, tittel: string, intl: IntlShape) {
    if (typeof oppholdstillatelsePair === 'string') {
        return {
            tittel: tittel,
            verdi: oppholdstillatelsePair.valueOf(),
        };
    } else if (typeof oppholdstillatelsePair === 'boolean') {
        return {
            tittel: tittel,
            verdi: oppholdstillatelsePair.valueOf()
                ? intl.formatMessage({ id: 'display.fraSøknad.ja' })
                : intl.formatMessage({ id: 'display.fraSøknad.nei' }),
        };
    } else {
        return {
            tittel: tittel,
            verdi: oppholdstillatelsePair
                ? intl.formatMessage({ id: 'display.fraSøknad.ja' })
                : intl.formatMessage({ id: 'display.fraSøknad.nei' }),
        };
    }
}

const LovligOppholdINorge = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    const formik = useFormik<FormData>({
        initialValues: {
            status: props.behandling.behandlingsinformasjon.lovligOpphold?.status ?? null,
            begrunnelse: props.behandling.behandlingsinformasjon.lovligOpphold?.begrunnelse ?? null,
        },
        async onSubmit(values) {
            if (!values.status) return;

            const lovligOppholdValues: LovligOpphold = {
                status: values.status,
                begrunnelse: values.begrunnelse,
            };

            if (
                eqLovligOppholdINorge.equals(lovligOppholdValues, props.behandling.behandlingsinformasjon.lovligOpphold)
            ) {
                history.push(props.nesteUrl);
                return;
            }

            const res = await dispatch(
                lagreBehandlingsinformasjon({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                    behandlingsinformasjon: {
                        ...props.behandling.behandlingsinformasjon,
                        lovligOpphold: { ...lovligOppholdValues },
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

    createFaktaBlokkArray(intl, props.behandling.søknad.søknadInnhold);

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
                            legend={intl.formatMessage({ id: 'radio.lovligOpphold.legend' })}
                            feil={formik.errors.status}
                        >
                            <Radio
                                label={intl.formatMessage({ id: 'radio.label.ja' })}
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
                                label={intl.formatMessage({ id: 'radio.label.nei' })}
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
                                label={intl.formatMessage({ id: 'radio.label.uavklart' })}
                                name="lovligOppholdINorge"
                                onChange={() =>
                                    formik.setValues({ ...formik.values, status: LovligOppholdStatus.Uavklart })
                                }
                                checked={formik.values.status === LovligOppholdStatus.Uavklart}
                            />
                        </RadioGruppe>
                        <div className={sharedStyles.textareaContainer}>
                            <Textarea
                                label={intl.formatMessage({ id: 'input.label.begrunnelse' })}
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
                        tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
                        containerClassName={styles.lovligOppholdFaktaBlokkContainer}
                        faktaBlokkerClassName={styles.lovligOppholdFaktaBlokk}
                        fakta={createFaktaBlokkArray(intl, props.behandling.søknad.søknadInnhold)}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default LovligOppholdINorge;
