import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import * as DateFns from 'date-fns';
import { Knapp } from 'nav-frontend-knapper';
import { Feiloppsummering, Input } from 'nav-frontend-skjema';
import { Element, Innholdstittel, Normaltekst, Undertittel } from 'nav-frontend-typografi';
import * as React from 'react';
import { Control, Controller, FieldArrayWithId, FieldPath, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useHistory } from 'react-router';
import { v4 as uuid } from 'uuid';

import { ApiError } from '~api/apiClient';
import { TrashBin } from '~assets/Icons';
import DatePicker from '~components/datePicker/DatePicker';
import { JaNeiSpørsmål } from '~components/FormElements';
import ToKolonner from '~components/toKolonner/ToKolonner';
import * as revurderingActions from '~features/revurdering/revurderingActions';
import * as DateUtils from '~lib/dateUtils';
import * as FormatUtils from '~lib/formatUtils';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering, validateNonNegativeNumber } from '~lib/validering';
import sharedMessages from '~pages/saksbehandling/steg/sharedI18n-nb';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Revurdering } from '~types/Revurdering';
import { UføreResultat, Vilkårsvurderinger, VurderingsperiodeUføre } from '~types/Vilkår';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import RevurderingskallFeilet from '../revurderingskallFeilet/RevurderingskallFeilet';

import messages from './uførhet-nb';
import styles from './uførhet.module.less';

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

const uføregrunnlagFormDataSchema = yup.object<UføregrunnlagFormData>({
    id: yup.string(),
    fraOgMed: yup.date().required().defined(),
    tilOgMed: yup
        .date()
        .required()
        .defined()
        .test('etterFom', 'Til-og-med kan ikke være før fra-og-med', function (value) {
            const fom = this.parent.fraOgMed as Nullable<Date>;
            if (value && fom) {
                return DateFns.isAfter(value, fom);
            }
            return true;
        }),
    oppfylt: yup.bool().required().defined(),
    uføregrad: yup.mixed<string>().when('oppfylt', {
        is: true,
        then: validateNonNegativeNumber,
        otherwise: yup.string().notRequired(),
    }),
    forventetInntekt: yup.mixed<string>().when('oppfylt', {
        is: true,
        then: validateNonNegativeNumber,
        otherwise: yup.string().notRequired(),
    }),
});

const schema = yup.object<FormData>({
    grunnlag: yup.array(uføregrunnlagFormDataSchema.required()).required('Du må legge inn minst én periode'),
});

const vurderingsperiodeTilFormData = (u: VurderingsperiodeUføre): UføregrunnlagFormData => ({
    id: uuid(),
    fraOgMed: DateUtils.parseIsoDateOnly(u.periode.fraOgMed),
    tilOgMed: DateUtils.parseIsoDateOnly(u.periode.tilOgMed),
    uføregrad: u.grunnlag?.uføregrad.toString() ?? '',
    forventetInntekt: u.grunnlag?.forventetInntekt.toString() ?? '',
    oppfylt:
        u.resultat === UføreResultat.VilkårOppfylt
            ? true
            : u.resultat === UføreResultat.VilkårIkkeOppfylt
            ? false
            : null,
});

const Uføreperiodevurdering = (props: {
    item: FieldArrayWithId<FormData, 'grunnlag', 'id'>;
    index: number;
    control: Control<FormData>;
    trigger(path: FieldPath<FormData> | Array<FieldPath<FormData>>): void;
    minDate: Date;
    maxDate: Date;
    onRemoveClick(): void;
}) => {
    const intl = useI18n({ messages });
    const value = useWatch({ control: props.control, name: `grunnlag.${props.index}` as `grunnlag.0` });

    React.useEffect(() => {
        props.trigger([
            `grunnlag.${props.index}.uføregrad` as const,
            `grunnlag.${props.index}.forventetInntekt` as const,
        ]);
    }, [value.oppfylt]);
    React.useEffect(() => {
        props.trigger(`grunnlag.${props.index}.tilOgMed` as const);
    }, [value.fraOgMed]);

    return (
        <li className={styles.periodeContainer}>
            <Knapp
                className={styles.slettknapp}
                onClick={() => {
                    props.onRemoveClick();
                }}
                kompakt
                aria-label={intl.formatMessage({ id: 'input.fjernPeriode.label' })}
            >
                <TrashBin width="24px" height="24px" />
            </Knapp>
            <div className={styles.horizontal}>
                <Controller
                    name={`grunnlag.${props.index}.fraOgMed` as const}
                    control={props.control}
                    defaultValue={props.item.fraOgMed}
                    render={({ field, fieldState }) => (
                        <DatePicker
                            id={field.name}
                            label={intl.formatMessage({ id: 'input.fom.label' })}
                            feil={fieldState.error?.message}
                            {...field}
                            onChange={field.onChange}
                            dateFormat="MM/yyyy"
                            showMonthYearPicker
                            isClearable
                            autoComplete="off"
                            minDate={props.minDate}
                            maxDate={props.maxDate}
                        />
                    )}
                />
                <Controller
                    name={`grunnlag.${props.index}.tilOgMed` as const}
                    control={props.control}
                    defaultValue={props.item.tilOgMed}
                    render={({ field, fieldState }) => (
                        <DatePicker
                            label={intl.formatMessage({ id: 'input.tom.label' })}
                            id={field.name}
                            feil={fieldState.error?.message}
                            {...field}
                            dateFormat="MM/yyyy"
                            showMonthYearPicker
                            isClearable
                            autoComplete="off"
                            minDate={props.minDate}
                            maxDate={props.maxDate}
                        />
                    )}
                />
            </div>
            <Controller
                control={props.control}
                name={`grunnlag.${props.index}.oppfylt` as const}
                defaultValue={props.item.oppfylt}
                render={({ field, fieldState }) => (
                    <JaNeiSpørsmål
                        id={field.name}
                        legend={intl.formatMessage({ id: 'input.erVilkårOppfylt.label' })}
                        state={field.value}
                        onChange={field.onChange}
                        feil={fieldState.error?.message}
                    />
                )}
            />
            {value.oppfylt && (
                <div className={styles.horizontal}>
                    <Controller
                        control={props.control}
                        name={`grunnlag.${props.index}.uføregrad` as const}
                        defaultValue={props.item.uføregrad ?? ''}
                        render={({ field, fieldState }) => (
                            <Input
                                id={field.name}
                                label={intl.formatMessage({ id: 'input.uføregrad.label' })}
                                feil={fieldState.error?.message}
                                {...field}
                            />
                        )}
                    />
                    <Controller
                        control={props.control}
                        name={`grunnlag.${props.index}.forventetInntekt` as const}
                        defaultValue={props.item.forventetInntekt ?? ''}
                        render={({ field, fieldState }) => (
                            <Input
                                id={field.name}
                                label={intl.formatMessage({ id: 'input.forventetInntekt.label' })}
                                feil={fieldState.error?.message}
                                {...field}
                            />
                        )}
                    />
                </div>
            )}
        </li>
    );
};

const UførhetForm = (props: { sakId: string; revurdering: Revurdering; forrigeUrl: string; nesteUrl: string }) => {
    const intl = useI18n({ messages: { ...sharedMessages, ...messages } });
    const dispatch = useAppDispatch();
    const history = useHistory();

    const [pressedButton, setPressedButton] = React.useState<'ingen' | 'neste' | 'lagre'>('ingen');
    const [savingState, setSavingState] = React.useState<RemoteData.RemoteData<ApiError, null>>(RemoteData.initial);
    const feiloppsummeringRef = React.useRef<HTMLDivElement>(null);

    const {
        formState: { errors, isValid, isSubmitted },
        ...form
    } = useForm<FormData>({
        defaultValues: {
            grunnlag:
                props.revurdering.vilkårsvurderinger.uføre?.vurderinger.map((u) => vurderingsperiodeTilFormData(u)) ??
                [],
        },
        resolver: yupResolver(schema),
    });

    const grunnlagValues = useFieldArray({
        control: form.control,
        name: 'grunnlag',
    });

    const save = async (values: FormData) => {
        if (RemoteData.isPending(savingState)) {
            return false;
        }
        setSavingState(RemoteData.pending);

        const res = await dispatch(
            revurderingActions.lagreUføregrunnlag({
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                vurderinger: values.grunnlag.map((g) => ({
                    periode: {
                        /* eslint-disable @typescript-eslint/no-non-null-assertion */
                        fraOgMed: DateUtils.toIsoDateOnlyString(g.fraOgMed!),
                        tilOgMed: DateUtils.toIsoDateOnlyString(DateUtils.sluttenAvMåneden(g.tilOgMed!)),
                        /* eslint-enable @typescript-eslint/no-non-null-assertion */
                    },
                    forventetInntekt: g.forventetInntekt ? Number.parseInt(g.forventetInntekt, 10) : null,
                    uføregrad: g.uføregrad ? Number.parseInt(g.uføregrad, 10) : null,
                    begrunnelse: null,
                    resultat: g.oppfylt ? UføreResultat.VilkårOppfylt : UføreResultat.VilkårIkkeOppfylt,
                })),
            })
        );

        if (revurderingActions.lagreUføregrunnlag.fulfilled.match(res)) {
            setSavingState(RemoteData.success(null));
            return true;
        } else if (revurderingActions.lagreUføregrunnlag.rejected.match(res)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            setSavingState(RemoteData.failure(res.payload!));
        }
        return false;
    };

    const handleSubmit = async (values: FormData) => {
        setPressedButton('neste');
        const res = await save(values);
        setPressedButton('ingen');
        if (res) {
            history.push(props.nesteUrl);
        }
    };

    const handleLagreOgFortsettSenereClick = async (values: FormData) => {
        setPressedButton('lagre');
        const res = await save(values);
        setPressedButton('ingen');
        if (res) {
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
        }
    };

    // Trigger validering når elementer legges til i lista
    React.useEffect(() => {
        if (isSubmitted) {
            form.trigger();
        }
    }, [grunnlagValues.fields]);

    return (
        <form
            onSubmit={form.handleSubmit(handleSubmit, () => {
                setTimeout(() => {
                    if (feiloppsummeringRef.current) {
                        return feiloppsummeringRef.current.focus();
                    }
                }, 0);
            })}
        >
            <ul className={styles.periodeliste}>
                {grunnlagValues.fields.map((item, idx) => (
                    <Uføreperiodevurdering
                        key={item.id}
                        item={item}
                        index={idx}
                        control={form.control}
                        minDate={DateUtils.parseIsoDateOnly(props.revurdering.periode.fraOgMed)}
                        maxDate={DateUtils.parseIsoDateOnly(props.revurdering.periode.tilOgMed)}
                        trigger={(path) => {
                            if (isSubmitted) {
                                form.trigger(path);
                            }
                        }}
                        onRemoveClick={() => {
                            grunnlagValues.remove(idx);
                        }}
                    />
                ))}
            </ul>
            <div className={styles.nyperiodeContainer}>
                <Knapp
                    htmlType="button"
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
                    {intl.formatMessage({ id: 'button.nyPeriode.label' })}
                </Knapp>
            </div>
            <Feiloppsummering
                tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                className={styles.feiloppsummering}
                feil={hookFormErrorsTilFeiloppsummering(errors)}
                hidden={isValid || !isSubmitted}
                innerRef={feiloppsummeringRef}
            />
            {RemoteData.isFailure(savingState) && <RevurderingskallFeilet error={savingState.error} />}
            <RevurderingBunnknapper
                onNesteClick="submit"
                tilbakeUrl={props.forrigeUrl}
                onLagreOgFortsettSenereClick={form.handleSubmit(handleLagreOgFortsettSenereClick)}
                onNesteClickSpinner={pressedButton === 'neste' && RemoteData.isPending(savingState)}
                onLagreOgFortsettSenereClickSpinner={pressedButton === 'lagre' && RemoteData.isPending(savingState)}
            />
        </form>
    );
};

const GjeldendeGrunnlagsdata = (props: { vilkårsvurderinger: Vilkårsvurderinger }) => {
    const intl = useI18n({ messages: { ...sharedMessages, ...messages } });
    return (
        <div>
            <Innholdstittel>{intl.formatMessage({ id: 'heading.gjeldendeGrunnlag' })}</Innholdstittel>
            <ul className={styles.grunnlagsliste}>
                {props.vilkårsvurderinger.uføre?.vurderinger.map((item) => (
                    <li key={item.periode.fraOgMed + item.periode.tilOgMed}>
                        <Element>
                            {DateUtils.formatMonthYear(item.periode.fraOgMed, intl)}
                            {' – '}
                            {DateUtils.formatMonthYear(item.periode.tilOgMed, intl)}
                        </Element>
                        <div>
                            <Normaltekst>{intl.formatMessage({ id: 'gjeldende.vilkårOppfylt' })}</Normaltekst>
                            <Element>
                                {intl.formatMessage({
                                    id:
                                        item.resultat === UføreResultat.VilkårOppfylt
                                            ? 'radio.label.ja'
                                            : 'radio.label.nei',
                                })}
                            </Element>
                        </div>
                        <>
                            <div>
                                <Normaltekst>{intl.formatMessage({ id: 'gjeldende.uføregrad' })}</Normaltekst>
                                <Element>{item.grunnlag ? `${item.grunnlag.uføregrad}%` : '—'}</Element>
                            </div>
                            <div>
                                <Normaltekst>{intl.formatMessage({ id: 'gjeldende.inntektEtterUførhet' })}</Normaltekst>
                                <Element>
                                    {item.grunnlag
                                        ? FormatUtils.formatCurrency(intl, item.grunnlag.forventetInntekt)
                                        : '—'}
                                </Element>
                            </div>
                            {item.begrunnelse && (
                                <div>
                                    <Normaltekst>{intl.formatMessage({ id: 'gjeldende.begrunnelse' })}</Normaltekst>
                                    <Element>{item.begrunnelse}</Element>
                                </div>
                            )}
                        </>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const Uførhet = (props: { sakId: string; revurdering: Revurdering; forrigeUrl: string; nesteUrl: string }) => {
    const intl = useI18n({ messages });
    const dispatch = useAppDispatch();
    const grunnlag = useAppSelector(
        (s) => s.sak.revurderingGrunnlagSimulering[props.revurdering.id] ?? RemoteData.initial
    );

    React.useEffect(() => {
        if (RemoteData.isInitial(grunnlag)) {
            dispatch(revurderingActions.hentUføregrunnlag({ sakId: props.sakId, revurderingId: props.revurdering.id }));
        }
    }, [grunnlag._tag]);

    return (
        <ToKolonner tittel={intl.formatMessage({ id: 'heading.valgtPeriode' })}>
            {{
                left: (
                    <div>
                        <Undertittel className={styles.periodeoverskrift}>
                            {DateUtils.formatMonthYear(props.revurdering.periode.fraOgMed, intl)}
                            {' – '}
                            {DateUtils.formatMonthYear(props.revurdering.periode.tilOgMed, intl)}
                        </Undertittel>
                        <UførhetForm
                            sakId={props.sakId}
                            revurdering={props.revurdering}
                            forrigeUrl={props.forrigeUrl}
                            nesteUrl={props.nesteUrl}
                        />
                    </div>
                ),
                right: pipe(
                    grunnlag,
                    RemoteData.fold(
                        () => <div />,
                        () => <div />,
                        () => <div />,
                        (v) => <GjeldendeGrunnlagsdata vilkårsvurderinger={v} />
                    )
                ),
            }}
        </ToKolonner>
    );
};

export default Uførhet;
