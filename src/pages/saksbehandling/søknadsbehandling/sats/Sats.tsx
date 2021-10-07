import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Textarea, Label } from '@navikt/ds-react';
import * as B from 'fp-ts/boolean';
import { Eq, struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/string';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Element, Feilmelding } from 'nav-frontend-typografi';
import React, { useEffect, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { Sats as FaktiskSats } from '~/types/Sats';
import { Person, fetchPerson } from '~api/personApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import { BooleanRadioGroup } from '~components/formElements/FormElements';
import { SatsFaktablokk } from '~components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/SatsFaktablokk';
import { Personkort } from '~components/personkort/Personkort';
import ToKolonner from '~components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~context/søknadsbehandlingDraftContext';
import { lagreBosituasjonGrunnlag } from '~features/saksoversikt/sak.slice';
import { focusAfterTimeout } from '~lib/formUtils';
import { pipe } from '~lib/fp';
import { useApiCall, useAsyncActionCreator } from '~lib/hooks';
import { MessageFormatter, useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { eqNullable, Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { Bosituasjon } from '~types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { SøknadInnhold } from '~types/Søknad';
import { Vilkårtype } from '~types/Vilkårsvurdering';
import { hentBosituasjongrunnlag } from '~utils/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../Vurdering';

import messages from './sats-nb';
import styles from './sats.module.less';

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
    begrunnelse: Nullable<string>;
}

const eqFormData = struct<FormData>({
    delerSøkerBolig: eqNullable(B.Eq),
    mottarEktemakeEllerSamboerSU: eqNullable(B.Eq),
    begrunnelse: eqNullable(S.Eq),
});

interface SatsProps {
    behandlingId: string;
    eps: Nullable<Person>;
    bosituasjon: Nullable<Bosituasjon>;
    søknadInnhold: SøknadInnhold;
    forrigeUrl: string;
    nesteUrl: string;
    sakId: string;
    formatMessage: MessageFormatter<typeof sharedI18n & typeof messages>;
}

const eqBosituasjon: Eq<
    Nullable<{
        delerBolig: Nullable<boolean>;
        ektemakeEllerSamboerUførFlyktning: Nullable<boolean>;
        begrunnelse: Nullable<string>;
    }>
> = eqNullable({
    equals: (sats1, sats2) =>
        sats1.delerBolig === sats2.delerBolig &&
        sats1.ektemakeEllerSamboerUførFlyktning === sats2.ektemakeEllerSamboerUførFlyktning &&
        sats1.begrunnelse === sats2.begrunnelse,
});

const tilBosituasjonsgrunnlag = (values: FormData, eps: Nullable<Person>) => {
    return {
        fnr: eps?.fnr ?? null,
        delerBolig: values.delerSøkerBolig,
        ektemakeEllerSamboerUførFlyktning: values.mottarEktemakeEllerSamboerSU,
        begrunnelse: values.begrunnelse,
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
            begrunnelse: yup.string().defined(),
        })
        .required();
};

const Sats = (props: VilkårsvurderingBaseProps) => {
    const [epsStatus, fetchEps] = useApiCall(fetchPerson);
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const history = useHistory();
    const epsFnr = hentBosituasjongrunnlag(props.behandling.grunnlagsdataOgVilkårsvurderinger).fnr;

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
            () => <NavFrontendSpinner />,
            () => <NavFrontendSpinner />,
            () => (
                <div className={styles.epsFeilContainer}>
                    <Feilmelding>{formatMessage('feilmelding.pdlFeil')}</Feilmelding>
                    <Button
                        onClick={() => {
                            history.push(props.forrigeUrl);
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
        begrunnelse: bosituasjon?.begrunnelse ?? null,
    };
}

const SatsForm = (props: SatsProps) => {
    const history = useHistory();
    const feiloppsummeringRef = useRef<HTMLDivElement>(null);
    const [lagreBosituasjonStatus, lagreBosituasjon] = useAsyncActionCreator(lagreBosituasjonGrunnlag);

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
            history.push(nesteUrl);
            return;
        }

        await lagreBosituasjon(
            {
                sakId: props.sakId,
                behandlingId: props.behandlingId,
                bosituasjon: bosituasjonsvalg,
                begrunnelse: values.begrunnelse,
            },
            () => {
                clearDraft();
                history.push(nesteUrl);
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
                            <div className={styles.personkortContainer}>
                                <Element className={styles.personkortTittel}>
                                    {props.formatMessage('display.eps.label')}
                                </Element>
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
                        <div>
                            <Controller
                                control={form.control}
                                name="begrunnelse"
                                render={({ field, fieldState }) => (
                                    <Textarea
                                        label={props.formatMessage('input.label.begrunnelse')}
                                        {...field}
                                        value={field.value ?? ''}
                                        error={fieldState.error?.message}
                                    />
                                )}
                            />
                        </div>
                        {pipe(
                            lagreBosituasjonStatus,
                            RemoteData.fold(
                                () => null,
                                () => (
                                    <NavFrontendSpinner>
                                        {props.formatMessage('display.lagre.lagrer')}
                                    </NavFrontendSpinner>
                                ),
                                (err) => <ApiErrorAlert error={err} />,
                                () => null
                            )
                        )}
                        <Feiloppsummering
                            tittel={props.formatMessage('feiloppsummering.title')}
                            hidden={!isSubmitted || isValid}
                            feil={hookFormErrorsTilFeiloppsummering(errors)}
                            ref={feiloppsummeringRef}
                        />
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={form.handleSubmit(
                                handleSave(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })),
                                focusAfterTimeout(feiloppsummeringRef)
                            )}
                        />
                    </form>
                ),
                right: <SatsFaktablokk søknadInnhold={props.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Sats;
