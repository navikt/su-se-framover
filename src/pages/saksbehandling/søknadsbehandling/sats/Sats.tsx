import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Loader, Label } from '@navikt/ds-react';
import * as B from 'fp-ts/boolean';
import { Eq, struct } from 'fp-ts/lib/Eq';
import React, { useEffect, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Person, fetchPerson } from '~src/api/personApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import SkjemaelementFeilmelding from '~src/components/formElements/SkjemaelementFeilmelding';
import { SatsFaktablokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/SatsFaktablokk';
import { Personkort } from '~src/components/personkort/Personkort';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import { lagreBosituasjonGrunnlag } from '~src/features/saksoversikt/sak.slice';
import { focusAfterTimeout } from '~src/lib/formUtils';
import { pipe } from '~src/lib/fp';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { MessageFormatter, useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { eqNullable, Nullable } from '~src/lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { Bosituasjon } from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { Sats as FaktiskSats } from '~src/types/Sats';
import { SøknadInnhold, SøknadInnholdAlder, SøknadInnholdUføre } from '~src/types/Søknad';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { hentBosituasjongrunnlag } from '~src/utils/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../vurderingknapper/Vurderingknapper';

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

interface SatsProps {
    behandlingId: string;
    eps: Nullable<Person>;
    bosituasjon: Nullable<Bosituasjon>;
    søknadInnhold: SøknadInnhold<SøknadInnholdUføre | SøknadInnholdAlder>;
    forrigeUrl: string;
    nesteUrl: string;
    sakId: string;
    formatMessage: MessageFormatter<typeof sharedI18n & typeof messages>;
}

const eqBosituasjon: Eq<
    Nullable<{
        delerBolig: Nullable<boolean>;
        ektemakeEllerSamboerUførFlyktning: Nullable<boolean>;
    }>
> = eqNullable({
    equals: (sats1, sats2) =>
        sats1.delerBolig === sats2.delerBolig &&
        sats1.ektemakeEllerSamboerUførFlyktning === sats2.ektemakeEllerSamboerUførFlyktning,
});

const tilBosituasjonsgrunnlag = (values: FormData, eps: Nullable<Person>) => {
    return {
        fnr: eps?.fnr ?? null,
        delerBolig: values.delerSøkerBolig,
        ektemakeEllerSamboerUførFlyktning: values.mottarEktemakeEllerSamboerSU,
    };
};

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
                søknadInnhold={props.behandling.søknad.søknadInnhold}
                forrigeUrl={props.forrigeUrl}
                nesteUrl={props.nesteUrl}
                sakId={props.sakId}
                formatMessage={formatMessage}
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
                    søknadInnhold={props.behandling.søknad.søknadInnhold}
                    forrigeUrl={props.forrigeUrl}
                    nesteUrl={props.nesteUrl}
                    sakId={props.sakId}
                    formatMessage={formatMessage}
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
    const navigate = useNavigate();
    const feiloppsummeringRef = useRef<HTMLDivElement>(null);
    const [status, lagreBosituasjon] = useAsyncActionCreator(lagreBosituasjonGrunnlag);

    const eps = props.eps;

    const initialValues = getInitialValues(eps, props.bosituasjon);

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        Vilkårtype.Sats,
        (values) => eqFormData.equals(values, initialValues)
    );

    const {
        formState: { isSubmitted, isValid, errors },
        ...form
    } = useForm({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(getValidationSchema(eps)),
    });

    useDraftFormSubscribe(form.watch);

    const watch = form.watch();

    const sats = useMemo(() => utledSats(watch, Boolean(eps), eps?.alder), [eps, watch]);

    const handleSave = (nesteUrl: string) => async (values: FormData) => {
        const bosituasjonsvalg = tilBosituasjonsValg(values, eps);
        if (!bosituasjonsvalg) {
            return;
        }

        const bosituasjonsgrunnlag = tilBosituasjonsgrunnlag(values, eps);

        if (eqBosituasjon.equals(bosituasjonsgrunnlag, props.bosituasjon)) {
            clearDraft();
            navigate(nesteUrl);
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
                navigate(nesteUrl);
            }
        );
    };

    return (
        <ToKolonner tittel={props.formatMessage('page.tittel')}>
            {{
                left: (
                    <form
                        onSubmit={form.handleSubmit(handleSave(props.nesteUrl), focusAfterTimeout(feiloppsummeringRef))}
                        className={styles.formContainer}
                    >
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
                                        legend={props.formatMessage('radio.ektemakeEllerSamboerUførFlyktning.legend')}
                                        error={fieldState.error?.message}
                                        {...field}
                                    />
                                )}
                            />
                        )}
                        {sats && (
                            <Label className={styles.sats}>{`${props.formatMessage('display.sats')} ${sats}`}</Label>
                        )}
                        {RemoteData.isFailure(status) && <ApiErrorAlert error={status.error} />}
                        <Feiloppsummering
                            tittel={props.formatMessage('feiloppsummering.title')}
                            hidden={!isSubmitted || isValid}
                            feil={hookFormErrorsTilFeiloppsummering(errors)}
                            ref={feiloppsummeringRef}
                        />
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                navigate(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={form.handleSubmit(
                                handleSave(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })),
                                focusAfterTimeout(feiloppsummeringRef)
                            )}
                            loading={RemoteData.isPending(status)}
                        />
                    </form>
                ),
                right: <SatsFaktablokk søknadInnhold={props.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Sats;
