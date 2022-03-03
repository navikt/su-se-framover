import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Loader, RadioGroup, Radio, Textarea, Button } from '@navikt/ds-react';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';
import React, { useEffect, useMemo, useRef } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import * as DateFns from 'date-fns';
import { v4 as uuid } from 'uuid';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import { UførhetFaktablokk } from '~components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/UførhetFaktablokk';
import ToKolonner from '~components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~context/søknadsbehandlingDraftContext';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { focusAfterTimeout } from '~lib/formUtils';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { eqNullable, Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering, validateStringAsNonNegativeNumber } from '~lib/validering';
import { Uføreperiodevurdering, vurderingsperiodeTilFormData } from '~pages/saksbehandling/revurdering/uførhet/Uførhet';
import * as DateUtils from '~utils/date/dateUtils';

import { UførhetInput } from '~pages/saksbehandling/søknadsbehandling/uførhet/UføreInput';
import { UføreResultat } from '~types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Vilkårtype } from '~types/Vilkårsvurdering';

import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../Vurdering';

import messages from './uførhet-nb';
import styles from './Uførhet.module.less';
import { erGregulering } from '~utils/revurdering/revurderingUtils';

interface UføregrunnlagFormData {
    id: string;
    fraOgMed: Nullable<Date>;
    tilOgMed: Nullable<Date>;
    uføregrad: string;
    forventetInntekt: string;
    oppfylt: Nullable<boolean>;
}

interface FormData {
    grunnlag: UføregrunnlagFormData[];
}

const uføregrunnlagFormDataSchema = (erGRegulering: boolean) =>
    yup.object<UføregrunnlagFormData>({
        id: yup.string(),
        fraOgMed: yup.date().required().defined(),
        tilOgMed: yup
            .date()
            .required()
            .defined()
            .test('etterFom', 'Til-og-med kan ikke være før fra-og-med', function (value) {
                const fom = this.parent.fraOgMed as Nullable<Date>;
                if (value && fom) {
                    return !DateFns.isBefore(value, fom);
                }
                return true;
            }),
        oppfylt: erGRegulering
            ? yup.mixed<boolean>().equals([true], 'Vilkår må være oppfylt ved g-regulering')
            : yup.bool().required().defined(),
        uføregrad: yup.mixed<string>().when('oppfylt', {
            is: true,
            then: yup
                .number()
                .required('Feltet må fylles ut')
                .min(1, 'Feltet må være større eller lik 1')
                .typeError('Feltet må være et tall')
                .max(100, 'Uføregrad må være mellom 0 og 100'),
            otherwise: yup.string().notRequired(),
        }),
        forventetInntekt: yup.mixed<string>().when('oppfylt', {
            is: true,
            then: validateStringAsNonNegativeNumber(),
            otherwise: yup.string().notRequired(),
        }),
    });

const schema = (erGRegulering: boolean) =>
    yup
        .object<FormData>({
            grunnlag: yup
                .array(uføregrunnlagFormDataSchema(erGRegulering).required())
                .required('Du må legge inn minst én periode')
                .test(
                    'Har ikke overlappende perioder',
                    'To eller flere av periodene overlapper. Du må rette opp i det før du kan gå videre.',
                    function (uføregrunnlager) {
                        if (!uføregrunnlager) {
                            return false;
                        }
                        const harOverlapp = uføregrunnlager.some(
                            (v1) =>
                                DateUtils.isValidInterval(v1.fraOgMed, v1.tilOgMed) &&
                                uføregrunnlager.some(
                                    (v2) =>
                                        v1.id !== v2.id &&
                                        DateUtils.isValidInterval(v2.fraOgMed, v2.tilOgMed) &&
                                        DateFns.areIntervalsOverlapping(
                                            {
                                                start: v1.fraOgMed ?? DateFns.minTime,
                                                end: v1.tilOgMed ?? DateFns.maxTime,
                                            },
                                            {
                                                start: v2.fraOgMed ?? DateFns.minTime,
                                                end: v2.tilOgMed ?? DateFns.maxTime,
                                            },
                                            { inclusive: true }
                                        )
                                )
                        );
                        return !harOverlapp;
                    }
                ),
        })
        .required();

const UførhetForm = (props: VilkårsvurderingBaseProps) => {
    const [lagreBehandlingsinformasjonStatus, lagreUføregrunnlag] = useAsyncActionCreator(sakSlice.lagreUføregrunnlag);
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const history = useHistory();

    const { uføre } = props.behandling.grunnlagsdataOgVilkårsvurderinger;

    const feiloppsummeringRef = React.useRef<HTMLDivElement>(null);

    const {
        formState: { errors, isSubmitted },
        ...form
    } = useForm<FormData>({
        defaultValues: {
            grunnlag: uføre?.vurderinger.map((u) => vurderingsperiodeTilFormData(u)) ?? [],
        },
        resolver: yupResolver(schema(false)),
    });

    const grunnlagValues = useFieldArray({
        control: form.control,
        name: 'grunnlag',
    });

    const handleSave = (nesteUrl: string) => async (values: FormData) => {
        await lagreUføregrunnlag(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                vurderinger: values.grunnlag.map((g) => ({
                    periode: {
                        /* eslint-disable @typescript-eslint/no-non-null-assertion */
                        fraOgMed: DateUtils.toIsoDateOnlyString(g.fraOgMed!),
                        tilOgMed: DateUtils.toIsoDateOnlyString(g.tilOgMed!),
                        /* eslint-enable @typescript-eslint/no-non-null-assertion */
                    },
                    forventetInntekt: g.oppfylt ? Number.parseInt(g.forventetInntekt, 10) : null,
                    uføregrad: g.oppfylt ? Number.parseInt(g.uføregrad, 10) : null,
                    begrunnelse: null,
                    resultat: g.oppfylt ? UføreResultat.VilkårOppfylt : UføreResultat.VilkårIkkeOppfylt,
                })),
            },
            () => {
                history.push(nesteUrl);
            }
        );
    };

    // Trigger validering når elementer legges til i lista
    React.useEffect(() => {
        if (isSubmitted) {
            form.trigger();
        }
    }, [grunnlagValues.fields]);

    const valdieringsFeil = hookFormErrorsTilFeiloppsummering(errors);

    return (
        <>
            <form onSubmit={form.handleSubmit(handleSave(props.nesteUrl), focusAfterTimeout(feiloppsummeringRef))}>
                <ul className={styles.periodeliste}>
                    {grunnlagValues.fields.map((item, idx) => (
                        <Uføreperiodevurdering
                            key={item.id}
                            item={item}
                            index={idx}
                            control={form.control}
                            minDate={DateUtils.parseIsoDateOnly(props.behandling.stønadsperiode!.periode!.fraOgMed!)}
                            maxDate={DateUtils.parseIsoDateOnly(props.behandling.stønadsperiode!.periode!.tilOgMed!)}
                            trigger={(path) => {
                                if (isSubmitted) {
                                    form.trigger(path);
                                }
                            }}
                            resetUføregradEllerForventetInntekt={(
                                index: number,
                                field: 'uføregrad' | 'forventetInntekt'
                            ) => {
                                form.setValue(`grunnlag.${index}.${field}`, '');
                            }}
                            onRemoveClick={() => {
                                grunnlagValues.remove(idx);
                            }}
                        />
                    ))}
                </ul>
                <div className={styles.nyperiodeContainer}>
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={() => {
                            grunnlagValues.append(
                                {
                                    id: uuid(),
                                    fraOgMed: null,
                                    tilOgMed: null,
                                    forventetInntekt: '',
                                    oppfylt: null,
                                    uføregrad: '',
                                },
                                { shouldFocus: true }
                            );
                        }}
                    >
                        {formatMessage('button.nyPeriode.label')}
                    </Button>
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
                <Feiloppsummering
                    tittel={formatMessage('feiloppsummering.title')}
                    hidden={valdieringsFeil.length === 0 || !isSubmitted}
                    feil={valdieringsFeil}
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
        </>
    );
};

const Uførhet = (props: VilkårsvurderingBaseProps) => {
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: <UførhetForm {...props} />,
                right: <UførhetFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Uførhet;
