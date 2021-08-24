import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Eq } from 'fp-ts/lib/Eq';
import AlertStripe from 'nav-frontend-alertstriper';
import { Feiloppsummering, Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useEffect, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { PersonligOppmøteFaktablokk } from '~components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/PersonligOppmøteFaktablokk';
import ToKolonner from '~components/toKolonner/ToKolonner';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { focusAfterTimeout } from '~lib/formUtils';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator, useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { Behandlingsstatus } from '~types/Behandling';
import {
    PersonligOppmøteStatus,
    PersonligOppmøte as PersonligOppmøteType,
    Behandlingsinformasjon,
} from '~types/Behandlingsinformasjon';
import { VilkårVurderingStatus } from '~types/Vilkårsvurdering';
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

const eqPersonligOppmøte: Eq<Nullable<PersonligOppmøteType>> = {
    equals: (personligOppmøte1, personligOppmøte2) =>
        personligOppmøte1?.status === personligOppmøte2?.status &&
        personligOppmøte1?.begrunnelse === personligOppmøte2?.begrunnelse,
};

const schema = yup.object<FormData>({
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
});

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

    const {
        formState: { isSubmitted, isValid, errors },
        ...form
    } = useForm({
        defaultValues: getInitialFormValues(props.behandling.behandlingsinformasjon.personligOppmøte),
        resolver: yupResolver(schema),
    });

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

    const handleLagreOgFortsettSenere = (values: FormData) => {
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
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
            return;
        }

        lagreBehandlingsinformasjon(
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
                history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
            }
        );
    };

    const handleSave = (values: FormData) => {
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
            history.push(props.nesteUrl);
            return;
        }

        lagreBehandlingsinformasjon(
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
                                    <RadioGruppe
                                        legend={formatMessage('radio.personligOppmøte.legend')}
                                        feil={fieldState.error?.message}
                                        onBlur={field.onBlur}
                                    >
                                        <Radio
                                            id={field.name}
                                            label={formatMessage('radio.label.ja')}
                                            name={field.name}
                                            checked={field.value === HarMøttPersonlig.Ja}
                                            onChange={() => {
                                                field.onChange(HarMøttPersonlig.Ja);
                                            }}
                                            radioRef={field.ref}
                                        />
                                        <Radio
                                            label={formatMessage('radio.label.nei')}
                                            name={field.name}
                                            checked={field.value === HarMøttPersonlig.Nei}
                                            onChange={() => {
                                                field.onChange(HarMøttPersonlig.Nei);
                                            }}
                                        />
                                        <Radio
                                            label={formatMessage('radio.label.uavklart')}
                                            name={field.name}
                                            checked={field.value === HarMøttPersonlig.Uavklart}
                                            onChange={() => {
                                                field.onChange(HarMøttPersonlig.Uavklart);
                                            }}
                                        />
                                    </RadioGruppe>
                                )}
                            />
                        </div>
                        {watch.møttPersonlig === HarMøttPersonlig.Nei && (
                            <div className={styles.formElement}>
                                <Controller
                                    control={form.control}
                                    name="grunnForManglendePersonligOppmøte"
                                    render={({ field, fieldState }) => (
                                        <RadioGruppe
                                            legend={formatMessage('radio.personligOppmøte.grunn.legend')}
                                            feil={fieldState.error?.message}
                                            onBlur={field.onBlur}
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
                                                    radioRef={idx === 0 ? field.ref : undefined}
                                                    key={radioValue}
                                                    label={label}
                                                    name={field.name}
                                                    checked={field.value === radioValue}
                                                    onChange={() => {
                                                        field.onChange(radioValue);
                                                    }}
                                                />
                                            ))}
                                        </RadioGruppe>
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
                                        feil={fieldState.error?.message}
                                        value={field.value ?? ''}
                                    />
                                )}
                            />
                        </div>
                        {pipe(
                            lagreBehandlingsinformasjonStatus,
                            RemoteData.fold(
                                () => null,
                                () => <NavFrontendSpinner>{formatMessage('display.lagre.lagrer')}</NavFrontendSpinner>,
                                () => (
                                    <AlertStripe type="feil">
                                        {formatMessage('display.lagre.lagringFeilet')}
                                    </AlertStripe>
                                ),
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
                                    <AlertStripe type="advarsel">
                                        {formatMessage('alert.ikkeFerdigbehandlet')}
                                    </AlertStripe>
                                )}
                        </div>

                        <Feiloppsummering
                            tittel={formatMessage('feiloppsummering.title')}
                            hidden={!isSubmitted || isValid}
                            feil={hookFormErrorsTilFeiloppsummering(errors)}
                            innerRef={feiloppsummeringRef}
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
