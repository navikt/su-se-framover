import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Loader, Textarea } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import * as D from 'fp-ts/lib/Date';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';
import * as React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useHistory } from 'react-router';

import { ApiError, ErrorCode } from '~api/apiClient';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import DatePicker from '~components/datePicker/DatePicker';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import Faktablokk from '~components/oppsummering/vilkårsOppsummering/faktablokk/Faktablokk';
import ToKolonner from '~components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~context/søknadsbehandlingDraftContext';
import * as SakSlice from '~features/saksoversikt/sak.slice';
import { nullableMap, pipe } from '~lib/fp';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { eqNullable, Nullable } from '~lib/types';
import yup, { getDateErrorMessage, hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Vilkårtype } from '~types/Vilkårsvurdering';
import * as DateUtils from '~utils/date/dateUtils';
import { formatDate } from '~utils/date/dateUtils';
import { er67EllerEldre } from '~utils/person/personUtils';

import sharedMessages from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../Vurdering';

import messages from './virkningstidspunkt-nb';
import styles from './virkningstidspunkt.module.less';

interface FormData {
    fraOgMed: Nullable<Date>;
    tilOgMed: Nullable<Date>;
    begrunnelse: string;
}

const TIDLIGST_MULIG_START_DATO = new Date(2021, 0, 1);
const eqBehandlingsperiode = struct<FormData>({
    fraOgMed: eqNullable(D.Eq),
    tilOgMed: eqNullable(D.Eq),
    begrunnelse: S.Eq,
});

const schema = yup
    .object<FormData>({
        fraOgMed: yup
            .date()
            .nullable()
            .required('Du må velge virkningstidspunkt for supplerende stønad')
            .min(TIDLIGST_MULIG_START_DATO),
        tilOgMed: yup
            .date()
            .nullable()
            .required('Du må velge til-og-med-dato')
            .test(
                'maks12MndStønadsperiode',
                'Stønadsperioden kan ikke være lenger enn 12 måneder',
                function (tilOgMed) {
                    const { fraOgMed } = this.parent;
                    if (!tilOgMed || !fraOgMed) {
                        return false;
                    }
                    if (DateFns.differenceInYears(tilOgMed, fraOgMed) >= 1) {
                        return false;
                    }
                    return true;
                }
            )
            .test('isAfterFom', 'Sluttdato må være etter startdato', function (tilOgMed) {
                const { fraOgMed } = this.parent;
                if (!tilOgMed || !fraOgMed) {
                    return false;
                }

                return fraOgMed <= tilOgMed;
            }),
        begrunnelse: yup.string(),
    })
    .required();

const Virkningstidspunkt = (props: VilkårsvurderingBaseProps) => {
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...messages } });

    const history = useHistory();
    const [savingState, setSavingState] = React.useState<RemoteData.RemoteData<ApiError, null>>(RemoteData.initial);
    const dispatch = useAppDispatch();
    const søker = useAppSelector((state) => state.søker.søker);
    const initialValues = {
        fraOgMed: nullableMap(props.behandling.stønadsperiode?.periode.fraOgMed ?? null, DateUtils.parseIsoDateOnly),
        tilOgMed: nullableMap(props.behandling.stønadsperiode?.periode.tilOgMed ?? null, DateUtils.parseIsoDateOnly),
        begrunnelse: props.behandling.stønadsperiode?.begrunnelse ?? '',
    };
    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        Vilkårtype.Virkningstidspunkt,
        (values) => eqBehandlingsperiode.equals(values, initialValues)
    );

    const {
        formState: { isValid, isSubmitted, errors },
        ...form
    } = useForm<FormData>({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(schema),
    });
    useDraftFormSubscribe(form.watch);

    React.useEffect(() => {
        const sub = form.watch((values, { name }) => {
            if (name === 'fraOgMed' && values.fraOgMed && values.tilOgMed === null) {
                form.setValue('tilOgMed', DateFns.endOfMonth(DateFns.addMonths(values.fraOgMed, 11)), {
                    shouldValidate: true,
                });
            }
        });
        return () => sub.unsubscribe();
    }, [form]);

    const save = async (data: FormData) => {
        const res = await dispatch(
            SakSlice.lagreVirkningstidspunkt({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                fraOgMed: DateFns.formatISO(data.fraOgMed!, { representation: 'date' }),
                tilOgMed: DateFns.formatISO(DateFns.endOfMonth(data.tilOgMed!), { representation: 'date' }),
                /* eslint-enable @typescript-eslint/no-non-null-assertion */
                begrunnelse: data.begrunnelse,
            })
        );

        if (SakSlice.lagreVirkningstidspunkt.fulfilled.match(res)) {
            clearDraft();
            return RemoteData.success(null);
        } else if (SakSlice.lagreVirkningstidspunkt.rejected.match(res)) {
            return RemoteData.failure(
                res.payload ?? {
                    statusCode: ErrorCode.Unknown,
                    correlationId: '',
                    body: null,
                }
            );
        } else {
            return RemoteData.pending;
        }
    };

    const handleSubmit: SubmitHandler<FormData> = async (x) => {
        if (eqBehandlingsperiode.equals(form.getValues(), initialValues)) {
            clearDraft();
            return history.push(props.nesteUrl);
        }

        setSavingState(RemoteData.pending);

        const res = await save(x);
        if (RemoteData.isSuccess(res)) {
            history.push(props.nesteUrl);
        } else {
            setSavingState(res);
        }
    };
    const handleLagreOgFortsettSenereClick: SubmitHandler<FormData> = async (x) => {
        setSavingState(RemoteData.pending);

        const res = await save(x);
        if (RemoteData.isSuccess(res)) {
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
        } else {
            setSavingState(res);
        }
    };

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <>
                        {RemoteData.isSuccess(søker) && er67EllerEldre(søker.value.alder) && (
                            <Alert className={styles.alert} variant="warning">
                                {formatMessage('advarsel.alder')}
                            </Alert>
                        )}
                        <form onSubmit={form.handleSubmit(handleSubmit)} className={styles.container}>
                            <Controller
                                control={form.control}
                                name="fraOgMed"
                                render={({ field, fieldState }) => (
                                    <DatePicker
                                        {...field}
                                        className={styles.dato}
                                        id="fraOgMed"
                                        label={formatMessage('datovelger.fom.label')}
                                        dateFormat="MM/yyyy"
                                        showMonthYearPicker
                                        isClearable
                                        selectsEnd
                                        autoComplete="off"
                                        minDate={TIDLIGST_MULIG_START_DATO}
                                        feil={getDateErrorMessage(fieldState.error)}
                                    />
                                )}
                            />
                            <Controller
                                control={form.control}
                                name="tilOgMed"
                                render={({ field, fieldState }) => (
                                    <DatePicker
                                        {...field}
                                        className={styles.dato}
                                        id="tilOgMed"
                                        label={formatMessage('datovelger.tom.label')}
                                        dateFormat="MM/yyyy"
                                        showMonthYearPicker
                                        isClearable
                                        selectsEnd
                                        autoComplete="off"
                                        feil={getDateErrorMessage(fieldState.error)}
                                    />
                                )}
                            />
                            <Controller
                                name="begrunnelse"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Textarea
                                        {...field}
                                        label={formatMessage('begrunnelse.label')}
                                        error={fieldState.error?.message}
                                        description={formatMessage('input.begrunnelse.description')}
                                    />
                                )}
                            />
                            {pipe(
                                savingState,
                                RemoteData.fold(
                                    () => null,
                                    () => <Loader title={formatMessage('state.lagrer')} />,
                                    (err) => <ApiErrorAlert error={err} />,
                                    () => null
                                )
                            )}
                            <Feiloppsummering
                                tittel={formatMessage('feiloppsummering.title')}
                                hidden={!isSubmitted || isValid}
                                feil={hookFormErrorsTilFeiloppsummering(errors)}
                            />
                            <Vurderingknapper
                                onTilbakeClick={() => {
                                    history.push(props.forrigeUrl);
                                }}
                                onLagreOgFortsettSenereClick={form.handleSubmit(handleLagreOgFortsettSenereClick)}
                            />
                        </form>
                    </>
                ),
                right: RemoteData.isSuccess(søker) ? (
                    <Faktablokk
                        tittel={formatMessage('søker.personalia')}
                        fakta={[
                            {
                                tittel: formatMessage('søker.fødselsdato'),
                                verdi: søker.value.fødselsdato ? formatDate(søker.value.fødselsdato) : '',
                            },
                        ]}
                    />
                ) : (
                    <></>
                ),
            }}
        </ToKolonner>
    );
};

export default Virkningstidspunkt;
