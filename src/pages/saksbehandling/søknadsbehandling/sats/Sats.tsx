import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Label, Loader } from '@navikt/ds-react';
import * as B from 'fp-ts/boolean';
import { struct } from 'fp-ts/lib/Eq';
import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { fetchPerson, Person } from '~src/api/personApi';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import SkjemaelementFeilmelding from '~src/components/formElements/SkjemaelementFeilmelding';
import OppsummeringAvBoforhold from '~src/components/oppsummeringAvSøknadinnhold/OppsummeringAvBoforhold';
import { Personkort } from '~src/components/personkort/Personkort';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import { lagreFullstendigBosituasjon } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { pipe } from '~src/lib/fp';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { MessageFormatter, useI18n } from '~src/lib/i18n';
import { eqNullable, Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { Bosituasjon } from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { Sats as FaktiskSats } from '~src/types/Sats';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { hentBosituasjongrunnlag } from '~src/utils/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './sats-nb';
import * as styles from './sats.module.less';

enum BosituasjonsValg {
    DELER_BOLIG_MED_VOKSNE = 'DELER_BOLIG_MED_VOKSNE',
    BOR_ALENE = 'BOR_ALENE',
    EPS_UFØR_FLYKTNING = 'EPS_UFØR_FLYKTNING',
    EPS_IKKE_UFØR_FLYKTNING = 'EPS_IKKE_UFØR_FLYKTNING',
    EPS_67_ELLER_OVER = 'EPS_67_ELLER_OVER',
}

interface FormData {
    delerSøkerBolig: Nullable<boolean>;
    mottarEktemakeEllerSamboerSU: Nullable<boolean>;
}

const eqFormData = struct<FormData>({
    delerSøkerBolig: eqNullable(B.Eq),
    mottarEktemakeEllerSamboerSU: eqNullable(B.Eq),
});

interface SatsProps extends VilkårsvurderingBaseProps {
    behandlingId: string;
    eps: Nullable<Person>;
    bosituasjon: Nullable<Bosituasjon>;
    formatMessage: MessageFormatter<typeof sharedI18n & typeof messages>;
}

const tilBosituasjonsValg = (values: FormData, eps: Nullable<Person>): Nullable<BosituasjonsValg> => {
    if (eps && eps.alder) {
        if (eps.alder >= 67) {
            return BosituasjonsValg.EPS_67_ELLER_OVER;
        }

        if (values.mottarEktemakeEllerSamboerSU === null) return null;
        return values.mottarEktemakeEllerSamboerSU
            ? BosituasjonsValg.EPS_UFØR_FLYKTNING
            : BosituasjonsValg.EPS_IKKE_UFØR_FLYKTNING;
    }

    if (values.delerSøkerBolig === null) return null;
    return values.delerSøkerBolig ? BosituasjonsValg.DELER_BOLIG_MED_VOKSNE : BosituasjonsValg.BOR_ALENE;
};

const utledSats = (values: FormData, harEPS: boolean, epsAlder?: Nullable<number>) => {
    if (!values.delerSøkerBolig && values.delerSøkerBolig !== null) {
        return FaktiskSats.Høy;
    }

    if (harEPS && !epsAlder) {
        return 'Feil skjedde under utleding av sats';
    }

    if (values.delerSøkerBolig && !harEPS) {
        return FaktiskSats.Ordinær;
    }

    if (harEPS) {
        if (epsAlder && epsAlder < 67) {
            switch (values.mottarEktemakeEllerSamboerSU) {
                case null:
                    return null;
                case false:
                    return FaktiskSats.Høy;
                case true:
                    return FaktiskSats.Ordinær;
            }
        } else {
            return FaktiskSats.Ordinær;
        }
    }
    return null;
};

const getValidationSchema = (eps: Nullable<Person>) => {
    return yup
        .object<FormData>({
            delerSøkerBolig: yup
                .boolean()
                .defined()
                .test('deler søker bolig', 'Du må velge om søker deler bolig', function (delerSøkerBolig) {
                    if (!eps) {
                        return delerSøkerBolig !== null;
                    }
                    return true;
                }),
            mottarEktemakeEllerSamboerSU: yup
                .boolean()
                .defined()
                .test(
                    'eps mottar SU',
                    'Du må velge om ektefelle/samboer mottar supplerende stønad',
                    function (mottarSu) {
                        if (eps && eps.alder && eps.alder < 67) {
                            return mottarSu !== null;
                        }

                        return true;
                    }
                ),
        })
        .required();
};

const Sats = (props: VilkårsvurderingBaseProps) => {
    const [epsStatus, fetchEps] = useApiCall(fetchPerson);
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const navigate = useNavigate();
    const epsFnr = hentBosituasjongrunnlag(props.behandling.grunnlagsdataOgVilkårsvurderinger)?.fnr;

    useEffect(() => {
        if (epsFnr) {
            fetchEps(epsFnr);
        }
    }, []);

    if (!epsFnr) {
        return (
            <SatsForm
                behandlingId={props.behandling.id}
                eps={null}
                bosituasjon={hentBosituasjongrunnlag(props.behandling.grunnlagsdataOgVilkårsvurderinger) ?? null}
                formatMessage={formatMessage}
                {...props}
            />
        );
    }
    return pipe(
        epsStatus,
        RemoteData.fold(
            () => <Loader />,
            () => <Loader />,
            () => (
                <div className={styles.epsFeilContainer}>
                    <SkjemaelementFeilmelding>{formatMessage('feilmelding.pdlFeil')}</SkjemaelementFeilmelding>
                    <Button
                        onClick={() => {
                            navigate(props.forrigeUrl);
                        }}
                    >
                        {formatMessage('knapp.tilbake')}
                    </Button>
                </div>
            ),
            (eps) => (
                <SatsForm
                    behandlingId={props.behandling.id}
                    eps={eps}
                    bosituasjon={hentBosituasjongrunnlag(props.behandling.grunnlagsdataOgVilkårsvurderinger) ?? null}
                    formatMessage={formatMessage}
                    {...props}
                />
            )
        )
    );
};

function mottarEktemakeEllerSamboerSUInitialValue(eps: Nullable<Person>, bosituasjon: Nullable<Bosituasjon>) {
    return eps && eps.alder && eps.alder >= 67 ? null : bosituasjon?.ektemakeEllerSamboerUførFlyktning ?? null;
}

function getInitialValues(eps: Nullable<Person>, bosituasjon: Nullable<Bosituasjon>) {
    return {
        delerSøkerBolig: eps ? null : bosituasjon?.delerBolig ?? null,
        mottarEktemakeEllerSamboerSU: mottarEktemakeEllerSamboerSUInitialValue(eps, bosituasjon),
    };
}

const SatsForm = (props: SatsProps) => {
    const [status, lagreBosituasjon] = useAsyncActionCreator(lagreFullstendigBosituasjon);

    const eps = props.eps;

    const initialValues = getInitialValues(eps, props.bosituasjon);

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        Vilkårtype.Sats,
        (values) => eqFormData.equals(values, initialValues)
    );

    const form = useForm({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(getValidationSchema(eps)),
    });

    useDraftFormSubscribe(form.watch);

    const watch = form.watch();

    const sats = useMemo(() => utledSats(watch, Boolean(eps), eps?.alder), [eps, watch]);

    const handleSave = async (values: FormData, onSuccess: () => void) => {
        const bosituasjonsvalg = tilBosituasjonsValg(values, eps);
        if (!bosituasjonsvalg) {
            return;
        }

        await lagreBosituasjon(
            {
                sakId: props.sakId,
                behandlingId: props.behandlingId,
                bosituasjon: bosituasjonsvalg,
            },
            () => {
                clearDraft();
                onSuccess();
            }
        );
    };

    return (
        <ToKolonner tittel={props.formatMessage('page.tittel')}>
            {{
                left: (
                    <FormWrapper
                        form={form}
                        neste={{
                            onClick: handleSave,
                            url: props.nesteUrl,
                            savingState: status,
                        }}
                        tilbake={{
                            url: props.forrigeUrl,
                        }}
                        fortsettSenere={{
                            url: props.avsluttUrl,
                        }}
                    >
                        <>
                            {eps && (
                                <div>
                                    <Label spacing>{props.formatMessage('display.eps.label')}</Label>
                                    <Personkort person={eps} />
                                </div>
                            )}
                            {!eps && (
                                <Controller
                                    control={form.control}
                                    name="delerSøkerBolig"
                                    render={({ field, fieldState }) => (
                                        <BooleanRadioGroup
                                            legend={props.formatMessage('radio.delerSøkerBoligOver18.legend')}
                                            error={fieldState.error?.message}
                                            {...field}
                                        />
                                    )}
                                />
                            )}
                            {eps?.alder && eps.alder < 67 && (
                                <Controller
                                    control={form.control}
                                    name="mottarEktemakeEllerSamboerSU"
                                    render={({ field, fieldState }) => (
                                        <BooleanRadioGroup
                                            legend={props.formatMessage(
                                                'radio.ektemakeEllerSamboerUførFlyktning.legend'
                                            )}
                                            error={fieldState.error?.message}
                                            {...field}
                                        />
                                    )}
                                />
                            )}
                            {sats && (
                                <Label className={styles.sats}>{`${props.formatMessage(
                                    'display.sats'
                                )} ${sats}`}</Label>
                            )}
                        </>
                    </FormWrapper>
                ),
                right: <OppsummeringAvBoforhold boforhold={props.behandling.søknad.søknadInnhold.boforhold} />,
            }}
        </ToKolonner>
    );
};

export default Sats;
