import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Delete } from '@navikt/ds-icons';
import classNames from 'classnames';
import * as DateFns from 'date-fns';
import { Knapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';
import { Feiloppsummering, Input } from 'nav-frontend-skjema';
import { Element, Normaltekst, Systemtittel } from 'nav-frontend-typografi';
import * as React from 'react';
import { Control, Controller, FieldArrayWithId, FieldPath, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useHistory } from 'react-router';
import { v4 as uuid } from 'uuid';

import { ApiError } from '~api/apiClient';
import DatePicker from '~components/datePicker/DatePicker';
import { JaNeiSpørsmål } from '~components/formElements/FormElements';
import RevurderingskallFeilet from '~components/revurdering/revurderingskallFeilet/RevurderingskallFeilet';
import ToKolonner from '~components/toKolonner/ToKolonner';
import * as revurderingActions from '~features/revurdering/revurderingActions';
import { focusAfterTimeout } from '~lib/formUtils';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering, validateStringAsNonNegativeNumber } from '~lib/validering';
import sharedMessages from '~pages/saksbehandling/søknadsbehandling/sharedI18n-nb';
import { useAppDispatch } from '~redux/Store';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { UføreResultat, VurderingsperiodeUføre } from '~types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Revurdering } from '~types/Revurdering';
import * as DateUtils from '~utils/date/dateUtils';
import * as FormatUtils from '~utils/format/formatUtils';
import { erGregulering } from '~utils/revurdering/revurderingUtils';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';

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
                .min(0, 'Feltet må være større eller lik 0')
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
    yup.object<FormData>({
        grunnlag: yup
            .array(uføregrunnlagFormDataSchema(erGRegulering).required())
            .required('Du må legge inn minst én periode'),
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
    const { intl } = useI18n({ messages });
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
        <li>
            <Panel className={styles.periodeContainer} border>
                <div className={styles.horizontal}>
                    <div className={classNames(styles.horizontal, styles.periodeInputContainer)}>
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
                    <Knapp
                        className={styles.slettknapp}
                        onClick={() => {
                            props.onRemoveClick();
                        }}
                        kompakt
                        aria-label={intl.formatMessage({ id: 'input.fjernPeriode.label' })}
                    >
                        <Delete />
                    </Knapp>
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
            </Panel>
        </li>
    );
};

const UførhetForm = (props: { sakId: string; revurdering: Revurdering; forrigeUrl: string; nesteUrl: string }) => {
    const { intl } = useI18n({ messages: { ...sharedMessages, ...messages } });
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
                props.revurdering.grunnlagsdataOgVilkårsvurderinger.uføre?.vurderinger.map((u) =>
                    vurderingsperiodeTilFormData(u)
                ) ?? [],
        },
        resolver: yupResolver(schema(erGregulering(props.revurdering.årsak))),
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
                    forventetInntekt: Number.parseInt(g.forventetInntekt, 10),
                    uføregrad: Number.parseInt(g.uføregrad, 10),
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
        <form onSubmit={form.handleSubmit(handleSubmit, focusAfterTimeout(feiloppsummeringRef))}>
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

const GjeldendeGrunnlagsdata = (props: { vilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger }) => {
    const { intl } = useI18n({ messages: { ...sharedMessages, ...messages } });
    return (
        <div>
            <Systemtittel className={styles.grunnlagsdataHeading}>
                {intl.formatMessage({ id: 'heading.gjeldendeGrunnlag' })}
            </Systemtittel>
            <ul className={styles.grunnlagsliste}>
                {props.vilkårsvurderinger.uføre?.vurderinger.map((item) => (
                    <li key={item.periode.fraOgMed + item.periode.tilOgMed}>
                        <Element>
                            {DateUtils.formatMonthYear(item.periode.fraOgMed)}
                            {' – '}
                            {DateUtils.formatMonthYear(item.periode.tilOgMed)}
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
                                    {item.grunnlag ? FormatUtils.formatCurrency(item.grunnlag.forventetInntekt) : '—'}
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

const Uførhet = (props: {
    sakId: string;
    revurdering: Revurdering;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    forrigeUrl: string;
    nesteUrl: string;
}) => {
    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <UførhetForm
                        sakId={props.sakId}
                        revurdering={props.revurdering}
                        forrigeUrl={props.forrigeUrl}
                        nesteUrl={props.nesteUrl}
                    />
                ),
                right: <GjeldendeGrunnlagsdata vilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger} />,
            }}
        </ToKolonner>
    );
};

export default Uførhet;
