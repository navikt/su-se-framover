import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Radio, RadioGroup } from '@navikt/ds-react';
import { Eq, struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/string';
import React, { useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { PersonligOppmøteFaktablokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/PersonligOppmøteFaktablokk';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { eqNullable, Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { SøknadsbehandlingWrapper } from '~src/pages/saksbehandling/søknadsbehandling/SøknadsbehandlingWrapper';
import { Behandling, Behandlingsstatus } from '~src/types/Behandling';
import {
    Behandlingsinformasjon,
    PersonligOppmøte as PersonligOppmøteType,
    PersonligOppmøteStatus,
} from '~src/types/Behandlingsinformasjon';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Vilkårtype, VilkårVurderingStatus } from '~src/types/Vilkårsvurdering';
import { erVilkårsvurderingerVurdertAvslag } from '~src/utils/behandling/behandlingUtils';
import { mapToVilkårsinformasjon, Vilkårsinformasjon } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './personligOppmøte-nb';
import * as styles from './personligOppmøte.module.less';

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
}

const eqFormData = struct<FormData>({
    møttPersonlig: eqNullable(S.Eq),
    grunnForManglendePersonligOppmøte: eqNullable(S.Eq),
});

const eqPersonligOppmøte: Eq<Nullable<PersonligOppmøteType>> = {
    equals: (personligOppmøte1, personligOppmøte2) => personligOppmøte1?.status === personligOppmøte2?.status,
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
    })
    .required();

const getInitialFormValues = (personligOppmøteFraBehandlingsinformasjon: Nullable<PersonligOppmøteType>): FormData => {
    if (!personligOppmøteFraBehandlingsinformasjon) {
        return {
            møttPersonlig: null,
            grunnForManglendePersonligOppmøte: null,
        };
    }
    switch (personligOppmøteFraBehandlingsinformasjon.status) {
        case PersonligOppmøteStatus.MøttPersonlig:
            return {
                møttPersonlig: HarMøttPersonlig.Ja,
                grunnForManglendePersonligOppmøte: null,
            };

        case PersonligOppmøteStatus.IkkeMøttMenVerge:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.OppnevntVergeSøktPerPost,
            };

        case PersonligOppmøteStatus.IkkeMøttMenSykMedLegeerklæringOgFullmakt:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.SykMedLegeerklæringOgFullmakt,
            };

        case PersonligOppmøteStatus.IkkeMøttMenKortvarigSykMedLegeerklæring:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.KortvarigSykMedLegeerklæring,
            };

        case PersonligOppmøteStatus.IkkeMøttMenMidlertidigUnntakFraOppmøteplikt:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.MidlertidigUnntakFraOppmøteplikt,
            };

        case PersonligOppmøteStatus.IkkeMøttPersonlig:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.BrukerIkkeMøttOppfyllerIkkeVilkår,
            };

        case PersonligOppmøteStatus.Uavklart:
            return {
                møttPersonlig: HarMøttPersonlig.Uavklart,
                grunnForManglendePersonligOppmøte: null,
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
    behandlingsinformasjon: Behandlingsinformasjon,
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger
): Vilkårsinformasjon[] | 'personligOppmøteIkkeVurdert' => {
    const s = toPersonligOppmøteStatus(values);
    if (!s) {
        return 'personligOppmøteIkkeVurdert';
    }
    return mapToVilkårsinformasjon(
        {
            ...behandlingsinformasjon,
            personligOppmøte: {
                status: s,
            },
        },
        grunnlagsdataOgVilkårsvurderinger
    );
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
    const navigate = useNavigate();
    const advarselRef = useRef<HTMLDivElement>(null);
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [status, lagreBehandlingsinformasjon] = useAsyncActionCreator(sakSlice.lagreBehandlingsinformasjon);

    const initialValues = getInitialFormValues(props.behandling.behandlingsinformasjon.personligOppmøte);

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        Vilkårtype.PersonligOppmøte,
        (values) => eqFormData.equals(values, initialValues)
    );

    const form = useForm({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(schema),
    });

    useDraftFormSubscribe(form.watch);

    const watch = form.watch();

    const oppdatertVilkårsinformasjon = useMemo(
        () =>
            tilOppdatertVilkårsinformasjon(
                watch,
                props.behandling.behandlingsinformasjon,
                props.behandling.grunnlagsdataOgVilkårsvurderinger
            ),
        [watch, props.behandling.behandlingsinformasjon, props.behandling.grunnlagsdataOgVilkårsvurderinger]
    );

    const handleSave = async (values: FormData, onSuccess: (res: Behandling) => void) => {
        const personligOppmøteStatus = toPersonligOppmøteStatus(values);
        if (!personligOppmøteStatus) {
            return;
        }

        const vilkårsinformasjon = tilOppdatertVilkårsinformasjon(
            values,
            props.behandling.behandlingsinformasjon,
            props.behandling.grunnlagsdataOgVilkårsvurderinger
        );

        if (
            vilkårsinformasjon !== 'personligOppmøteIkkeVurdert' &&
            erVurdertUtenAvslagMenIkkeFerdigbehandlet(vilkårsinformasjon) &&
            advarselRef.current
        ) {
            advarselRef.current.focus();
            return;
        }

        if (
            eqPersonligOppmøte.equals(
                { status: personligOppmøteStatus },
                props.behandling.behandlingsinformasjon.personligOppmøte
            ) &&
            !erVilkårsvurderingerVurdertAvslag(props.behandling)
        ) {
            clearDraft();
            navigate(props.nesteUrl);
            return;
        }

        await lagreBehandlingsinformasjon(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    personligOppmøte: {
                        status: personligOppmøteStatus,
                    },
                },
            },
            (res) => {
                clearDraft();
                onSuccess(res);
            }
        );
    };

    const onSuccess = (res: Behandling) =>
        res.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG
            ? navigate(
                  Routes.saksbehandlingSendTilAttestering.createURL({
                      sakId: props.sakId,
                      behandlingId: props.behandling.id,
                  })
              )
            : navigate(props.nesteUrl);

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <SøknadsbehandlingWrapper
                        form={form}
                        save={handleSave}
                        savingState={status}
                        avsluttUrl={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
                        forrigeUrl={props.forrigeUrl}
                        nesteUrl={props.nesteUrl}
                        onSuccess={onSuccess}
                        nesteKnappTekst={
                            oppdatertVilkårsinformasjon !== 'personligOppmøteIkkeVurdert' &&
                            erFerdigbehandletMedAvslag(oppdatertVilkårsinformasjon)
                                ? formatMessage('button.tilVedtak.label')
                                : undefined
                        }
                    >
                        <>
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
                                            value={field.value ?? ''}
                                            onChange={(val) => {
                                                field.onChange(val);
                                                val !== HarMøttPersonlig.Nei &&
                                                    form.setValue('grunnForManglendePersonligOppmøte', null);
                                            }}
                                        >
                                            <Radio id={field.name} value={HarMøttPersonlig.Ja} ref={field.ref}>
                                                {formatMessage('radio.label.ja')}
                                            </Radio>
                                            <Radio value={HarMøttPersonlig.Nei}>
                                                {formatMessage('radio.label.nei')}
                                            </Radio>
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
                                                value={field.value ?? ''}
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
                        </>
                    </SøknadsbehandlingWrapper>
                ),
                right: <PersonligOppmøteFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default PersonligOppmøte;
