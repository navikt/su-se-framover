import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Loader, Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import { Eq, struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/string';
import React, { useEffect, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import { PersonligOppmøteFaktablokk } from '~components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/PersonligOppmøteFaktablokk';
import ToKolonner from '~components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~context/søknadsbehandlingDraftContext';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { focusAfterTimeout } from '~lib/formUtils';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { eqNullable, Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { Behandlingsstatus } from '~types/Behandling';
import {
    PersonligOppmøteStatus,
    PersonligOppmøte as PersonligOppmøteType,
    Behandlingsinformasjon,
} from '~types/Behandlingsinformasjon';
import { Vilkårtype, VilkårVurderingStatus } from '~types/Vilkårsvurdering';
import { erUnderkjent, erVilkårsvurderingerVurdertAvslag } from '~utils/behandling/behandlingUtils';
import { Vilkårsinformasjon, mapToVilkårsinformasjon } from '~utils/søknadsbehandling/vilkår/vilkårUtils';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../Vurdering';

import messages from './personligOppmøte-nb';
import styles from './personligOppmøte.module.less';

enum GrunnForManglendePersonligOppmøte {
    SykMedLegeerklæringOgFullmakt = 'SykMedLegeerklæringOgFullmakt',
    OppnevntVergeSøktPerPost = 'OppnevntVergeSøktPerPost',
    KortvarigSykMedLegeerklæring = 'KortvarigSykdomMedLegeerklæring',
    MidlertidigUnntakFraOppmøteplikt = 'MidlertidigUnntakFraOppmøteplikt',
    BrukerIkkeMøttOppfyllerIkkeVilkår = 'BrukerIkkeMøttOppfyllerIkkeVilkår',
}

enum HarMøttPersonlig {
    Ja = 'Ja',
    Nei = 'Nei',
    Uavklart = 'Uavklart',
}

interface FormData {
    møttPersonlig: Nullable<HarMøttPersonlig>;
    grunnForManglendePersonligOppmøte: Nullable<GrunnForManglendePersonligOppmøte>;
    begrunnelse: Nullable<string>;
}

const eqFormData = struct<FormData>({
    møttPersonlig: eqNullable(S.Eq),
    grunnForManglendePersonligOppmøte: eqNullable(S.Eq),
    begrunnelse: eqNullable(S.Eq),
});

const eqPersonligOppmøte: Eq<Nullable<PersonligOppmøteType>> = {
    equals: (personligOppmøte1, personligOppmøte2) =>
        personligOppmøte1?.status === personligOppmøte2?.status &&
        personligOppmøte1?.begrunnelse === personligOppmøte2?.begrunnelse,
};

const schema = yup
    .object<FormData>({
        møttPersonlig: yup
            .mixed<HarMøttPersonlig>()
            .oneOf(Object.values(HarMøttPersonlig), 'Du må velge om bruker har møtt personlig')
            .required()
            .typeError('Du må svare for å gå videre til neste steg.'),
        grunnForManglendePersonligOppmøte: yup
            .mixed<Nullable<GrunnForManglendePersonligOppmøte>>()
            .nullable()
            .defined()
            .when('møttPersonlig', {
                is: HarMøttPersonlig.Nei,
                then: yup
                    .mixed()
                    .oneOf(
                        Object.values(GrunnForManglendePersonligOppmøte),
                        'Du må velge hvorfor bruker ikke har møtt personlig'
                    )
                    .required(),
                otherwise: yup.mixed().nullable().defined(),
            }),
        begrunnelse: yup.string().nullable().defined(),
    })
    .required();

const getInitialFormValues = (personligOppmøteFraBehandlingsinformasjon: Nullable<PersonligOppmøteType>): FormData => {
    if (!personligOppmøteFraBehandlingsinformasjon) {
        return {
            møttPersonlig: null,
            grunnForManglendePersonligOppmøte: null,
            begrunnelse: null,
        };
    }
    switch (personligOppmøteFraBehandlingsinformasjon.status) {
        case PersonligOppmøteStatus.MøttPersonlig:
            return {
                møttPersonlig: HarMøttPersonlig.Ja,
                grunnForManglendePersonligOppmøte: null,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.IkkeMøttMenVerge:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.OppnevntVergeSøktPerPost,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.IkkeMøttMenSykMedLegeerklæringOgFullmakt:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.SykMedLegeerklæringOgFullmakt,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.IkkeMøttMenKortvarigSykMedLegeerklæring:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.KortvarigSykMedLegeerklæring,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.IkkeMøttMenMidlertidigUnntakFraOppmøteplikt:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.MidlertidigUnntakFraOppmøteplikt,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.IkkeMøttPersonlig:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.BrukerIkkeMøttOppfyllerIkkeVilkår,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.Uavklart:
            return {
                møttPersonlig: HarMøttPersonlig.Uavklart,
                grunnForManglendePersonligOppmøte: null,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };
    }
};

const toPersonligOppmøteStatus = (formData: FormData): Nullable<PersonligOppmøteStatus> => {
    if (formData.møttPersonlig === HarMøttPersonlig.Ja) {
        return PersonligOppmøteStatus.MøttPersonlig;
    }

    if (formData.møttPersonlig === HarMøttPersonlig.Uavklart) {
        return PersonligOppmøteStatus.Uavklart;
    }

    switch (formData.grunnForManglendePersonligOppmøte) {
        case GrunnForManglendePersonligOppmøte.OppnevntVergeSøktPerPost:
            return PersonligOppmøteStatus.IkkeMøttMenVerge;
        case GrunnForManglendePersonligOppmøte.SykMedLegeerklæringOgFullmakt:
            return PersonligOppmøteStatus.IkkeMøttMenSykMedLegeerklæringOgFullmakt;
        case GrunnForManglendePersonligOppmøte.KortvarigSykMedLegeerklæring:
            return PersonligOppmøteStatus.IkkeMøttMenKortvarigSykMedLegeerklæring;
        case GrunnForManglendePersonligOppmøte.MidlertidigUnntakFraOppmøteplikt:
            return PersonligOppmøteStatus.IkkeMøttMenMidlertidigUnntakFraOppmøteplikt;
        case GrunnForManglendePersonligOppmøte.BrukerIkkeMøttOppfyllerIkkeVilkår:
            return PersonligOppmøteStatus.IkkeMøttPersonlig;
        case null:
            return null;
    }
};

const tilOppdatertVilkårsinformasjon = (
    values: FormData,
    behandlingsinformasjon: Behandlingsinformasjon
): Vilkårsinformasjon[] | 'personligOppmøteIkkeVurdert' => {
    const s = toPersonligOppmøteStatus(values);
    if (!s) {
        return 'personligOppmøteIkkeVurdert';
    }
    return mapToVilkårsinformasjon({
        ...behandlingsinformasjon,
        personligOppmøte: {
            status: s,
            begrunnelse: values.begrunnelse,
        },
    });
};

const erAlleVilkårVurdert = (vilkårsinformasjon: Vilkårsinformasjon[]): boolean =>
    vilkårsinformasjon.every((x) => x.status !== VilkårVurderingStatus.IkkeVurdert);

const erVurdertUtenAvslagMenIkkeFerdigbehandlet = (vilkårsinformasjon: Vilkårsinformasjon[]): boolean => {
    return (
        erAlleVilkårVurdert(vilkårsinformasjon) &&
        vilkårsinformasjon.every((x) => x.status !== VilkårVurderingStatus.IkkeOk) &&
        vilkårsinformasjon.some((x) => x.status === VilkårVurderingStatus.Uavklart)
    );
};

const erFerdigbehandletMedAvslag = (vilkårsinformasjon: Vilkårsinformasjon[]): boolean => {
    return (
        erAlleVilkårVurdert(vilkårsinformasjon) &&
        vilkårsinformasjon.some((x) => x.status === VilkårVurderingStatus.IkkeOk)
    );
};

const PersonligOppmøte = (props: VilkårsvurderingBaseProps) => {
    const [lagreBehandlingsinformasjonStatus, lagreBehandlingsinformasjon] = useAsyncActionCreator(
        sakSlice.lagreBehandlingsinformasjon
    );
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const feiloppsummeringRef = useRef<HTMLDivElement>(null);
    const advarselRef = useRef<HTMLDivElement>(null);
    const history = useHistory();

    const initialValues = getInitialFormValues(props.behandling.behandlingsinformasjon.personligOppmøte);

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        Vilkårtype.PersonligOppmøte,
        (values) => eqFormData.equals(values, initialValues)
    );

    const {
        formState: { isSubmitted, isValid, errors },
        ...form
    } = useForm({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(schema),
    });

    useDraftFormSubscribe(form.watch);

    const watch = form.watch();

    const oppdatertVilkårsinformasjon = useMemo(
        () => tilOppdatertVilkårsinformasjon(watch, props.behandling.behandlingsinformasjon),
        [watch, props.behandling.behandlingsinformasjon]
    );

    useEffect(() => {
        if (watch.møttPersonlig !== HarMøttPersonlig.Nei && watch.grunnForManglendePersonligOppmøte !== null) {
            form.setValue('grunnForManglendePersonligOppmøte', null);
        }
        // Av en eller annen grunn blir ikke validering trigget riktig av seg selv, så vi gjør det manuelt
        if (isSubmitted) {
            form.trigger('grunnForManglendePersonligOppmøte');
        }
    }, [watch.møttPersonlig]);

    const handleLagreOgFortsettSenere = async (values: FormData) => {
        const personligOppmøteStatus = toPersonligOppmøteStatus(values);
        if (!personligOppmøteStatus) {
            return;
        }

        if (
            eqPersonligOppmøte.equals(
                { status: personligOppmøteStatus, begrunnelse: values.begrunnelse },
                props.behandling.behandlingsinformasjon.personligOppmøte
            )
        ) {
            clearDraft();
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
            return;
        }

        await lagreBehandlingsinformasjon(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    personligOppmøte: {
                        status: personligOppmøteStatus,
                        begrunnelse: values.begrunnelse,
                    },
                },
            },
            () => {
                clearDraft();
                history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
            }
        );
    };

    const handleSave = async (values: FormData) => {
        const personligOppmøteStatus = toPersonligOppmøteStatus(values);
        if (!personligOppmøteStatus) {
            return;
        }

        const vilkårsinformasjon = tilOppdatertVilkårsinformasjon(values, props.behandling.behandlingsinformasjon);

        if (
            vilkårsinformasjon !== 'personligOppmøteIkkeVurdert' &&
            erVurdertUtenAvslagMenIkkeFerdigbehandlet(vilkårsinformasjon) &&
            advarselRef.current
        ) {
            advarselRef.current.focus();
            return;
        }

        if (erUnderkjent(props.behandling) && erVilkårsvurderingerVurdertAvslag(props.behandling)) {
            clearDraft();
            return history.push(
                Routes.saksbehandlingSendTilAttestering.createURL({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                })
            );
        }

        if (
            eqPersonligOppmøte.equals(
                { status: personligOppmøteStatus, begrunnelse: values.begrunnelse },
                props.behandling.behandlingsinformasjon.personligOppmøte
            ) &&
            !erVilkårsvurderingerVurdertAvslag(props.behandling)
        ) {
            clearDraft();
            history.push(props.nesteUrl);
            return;
        }

        await lagreBehandlingsinformasjon(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    personligOppmøte: {
                        status: personligOppmøteStatus,
                        begrunnelse: values.begrunnelse,
                    },
                },
            },
            (res) => {
                clearDraft();
                if (res.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG) {
                    history.push(
                        Routes.saksbehandlingSendTilAttestering.createURL({
                            sakId: props.sakId,
                            behandlingId: props.behandling.id,
                        })
                    );
                } else {
                    history.push(props.nesteUrl);
                }
            }
        );
    };

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <form onSubmit={form.handleSubmit(handleSave, focusAfterTimeout(feiloppsummeringRef))}>
                        <div className={styles.formElement}>
                            <Controller
                                control={form.control}
                                name="møttPersonlig"
                                render={({ field, fieldState }) => (
                                    <RadioGroup
                                        legend={formatMessage('radio.personligOppmøte.legend')}
                                        error={fieldState.error?.message}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        value={field.value ?? undefined}
                                        onChange={field.onChange}
                                    >
                                        <Radio id={field.name} value={HarMøttPersonlig.Ja} ref={field.ref}>
                                            {formatMessage('radio.label.ja')}
                                        </Radio>
                                        <Radio value={HarMøttPersonlig.Nei}>{formatMessage('radio.label.nei')}</Radio>
                                        <Radio value={HarMøttPersonlig.Uavklart}>
                                            {formatMessage('radio.label.uavklart')}
                                        </Radio>
                                    </RadioGroup>
                                )}
                            />
                        </div>
                        {watch.møttPersonlig === HarMøttPersonlig.Nei && (
                            <div className={styles.formElement}>
                                <Controller
                                    control={form.control}
                                    name="grunnForManglendePersonligOppmøte"
                                    render={({ field, fieldState }) => (
                                        <RadioGroup
                                            legend={formatMessage('radio.personligOppmøte.grunn.legend')}
                                            error={fieldState.error?.message}
                                            onBlur={field.onBlur}
                                            name={field.name}
                                            value={field.value ?? undefined}
                                            onChange={field.onChange}
                                        >
                                            {[
                                                {
                                                    label: formatMessage(
                                                        'radio.personligOppmøte.grunn.sykMedLegeerklæringOgFullmakt'
                                                    ),
                                                    radioValue:
                                                        GrunnForManglendePersonligOppmøte.SykMedLegeerklæringOgFullmakt,
                                                },
                                                {
                                                    label: formatMessage(
                                                        'radio.personligOppmøte.grunn.oppnevntVergeSøktPerPost'
                                                    ),
                                                    radioValue:
                                                        GrunnForManglendePersonligOppmøte.OppnevntVergeSøktPerPost,
                                                },
                                                {
                                                    label: formatMessage(
                                                        'radio.personligOppmøte.grunn.kortvarigSykMedLegeerklæring'
                                                    ),
                                                    radioValue:
                                                        GrunnForManglendePersonligOppmøte.KortvarigSykMedLegeerklæring,
                                                },
                                                {
                                                    label: formatMessage(
                                                        'radio.personligOppmøte.grunn.midlertidigUnntakFraOppmøteplikt'
                                                    ),
                                                    radioValue:
                                                        GrunnForManglendePersonligOppmøte.MidlertidigUnntakFraOppmøteplikt,
                                                },
                                                {
                                                    label: formatMessage(
                                                        'radio.personligOppmøte.grunn.brukerIkkeMøttOppfyllerIkkeVilkår'
                                                    ),
                                                    radioValue:
                                                        GrunnForManglendePersonligOppmøte.BrukerIkkeMøttOppfyllerIkkeVilkår,
                                                },
                                            ].map(({ label, radioValue }, idx) => (
                                                <Radio
                                                    id={idx === 0 ? field.name : undefined}
                                                    ref={idx === 0 ? field.ref : undefined}
                                                    key={radioValue}
                                                    value={radioValue}
                                                >
                                                    {label}
                                                </Radio>
                                            ))}
                                        </RadioGroup>
                                    )}
                                />
                            </div>
                        )}
                        <div className={styles.formElement}>
                            <Controller
                                control={form.control}
                                name="begrunnelse"
                                render={({ field, fieldState }) => (
                                    <Textarea
                                        label={formatMessage('input.label.begrunnelse')}
                                        {...field}
                                        error={fieldState.error?.message}
                                        value={field.value ?? ''}
                                    />
                                )}
                            />
                        </div>
                        {pipe(
                            lagreBehandlingsinformasjonStatus,
                            RemoteData.fold(
                                () => null,
                                () => <Loader title={formatMessage('display.lagre.lagrer')} />,
                                (err) => <ApiErrorAlert error={err} />,
                                () => null
                            )
                        )}

                        <div
                            ref={advarselRef}
                            tabIndex={-1}
                            aria-live="polite"
                            aria-atomic="true"
                            className={styles.alertstripe}
                        >
                            {oppdatertVilkårsinformasjon !== 'personligOppmøteIkkeVurdert' &&
                                erVurdertUtenAvslagMenIkkeFerdigbehandlet(oppdatertVilkårsinformasjon) && (
                                    <Alert variant="warning">{formatMessage('alert.ikkeFerdigbehandlet')}</Alert>
                                )}
                        </div>

                        <Feiloppsummering
                            tittel={formatMessage('feiloppsummering.title')}
                            hidden={!isSubmitted || isValid}
                            feil={hookFormErrorsTilFeiloppsummering(errors)}
                            ref={feiloppsummeringRef}
                        />
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={form.handleSubmit(
                                handleLagreOgFortsettSenere,
                                focusAfterTimeout(feiloppsummeringRef)
                            )}
                            nesteKnappTekst={
                                oppdatertVilkårsinformasjon !== 'personligOppmøteIkkeVurdert' &&
                                erFerdigbehandletMedAvslag(oppdatertVilkårsinformasjon)
                                    ? formatMessage('button.tilVedtak.label')
                                    : undefined
                            }
                        />
                    </form>
                ),
                right: <PersonligOppmøteFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default PersonligOppmøte;
