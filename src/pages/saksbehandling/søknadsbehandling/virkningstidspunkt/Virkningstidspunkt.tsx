import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import * as DateFns from 'date-fns';
import * as D from 'fp-ts/lib/Date';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';
import { Feiloppsummering, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import * as React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useHistory } from 'react-router';

import { ApiError, ErrorCode } from '~api/apiClient';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import DatePicker from '~components/datePicker/DatePicker';
import ToKolonner from '~components/toKolonner/ToKolonner';
import * as SakSlice from '~features/saksoversikt/sak.slice';
import { nullableMap, pipe } from '~lib/fp';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { eqNullable, Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import * as DateUtils from '~utils/date/dateUtils';

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

const schema = yup.object<FormData>({
    fraOgMed: yup
        .date()
        .nullable()
        .required('Du må velge virkningstidspunkt for supplerende stønad')
        .min(TIDLIGST_MULIG_START_DATO),
    tilOgMed: yup
        .date()
        .nullable()
        .required('Du må velge til-og-med-dato')
        .test('maks12MndStønadsperiode', 'Stønadsperioden kan ikke være lenger enn 12 måneder', function (tilOgMed) {
            const { fraOgMed } = this.parent;
            if (!tilOgMed || !fraOgMed) {
                return false;
            }
            if (DateFns.differenceInYears(tilOgMed, fraOgMed) >= 1) {
                return false;
            }
            return true;
        })
        .test('isAfterFom', 'Sluttdato må være etter startdato', function (tilOgMed) {
            const { fraOgMed } = this.parent;
            if (!tilOgMed || !fraOgMed) {
                return false;
            }

            return fraOgMed <= tilOgMed;
        }),
    begrunnelse: yup.string(),
});

const Virkningstidspunkt = (props: VilkårsvurderingBaseProps) => {
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...messages } });
    const history = useHistory();
    const [savingState, setSavingState] = React.useState<RemoteData.RemoteData<ApiError, null>>(RemoteData.initial);
    const dispatch = useAppDispatch();
    const initialValues = {
        fraOgMed: nullableMap(props.behandling.stønadsperiode?.periode.fraOgMed ?? null, DateUtils.parseIsoDateOnly),
        tilOgMed: nullableMap(props.behandling.stønadsperiode?.periode.tilOgMed ?? null, DateUtils.parseIsoDateOnly),
        begrunnelse: props.behandling.stønadsperiode?.begrunnelse ?? '',
    };

    const {
        formState: { isValid, isSubmitted, errors },
        ...form
    } = useForm<FormData>({
        defaultValues: initialValues,
        resolver: yupResolver(schema),
    });

    form.watch((values) => {
        if (values.fraOgMed !== null && values.tilOgMed === null) {
            form.setValue('tilOgMed', DateFns.endOfMonth(DateFns.addMonths(values.fraOgMed, 11)), {
                shouldValidate: true,
            });
        }
    });

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
                    <form onSubmit={form.handleSubmit(handleSubmit)} className={styles.container}>
                        <Controller
                            control={form.control}
                            name="fraOgMed"
                            render={({ field, fieldState }) => (
                                <DatePicker
                                    {...field}
                                    id="fraOgMed"
                                    label={formatMessage('datovelger.fom.label')}
                                    dateFormat="MM/yyyy"
                                    showMonthYearPicker
                                    isClearable
                                    selectsEnd
                                    autoComplete="off"
                                    minDate={TIDLIGST_MULIG_START_DATO}
                                    feil={fieldState.error?.message}
                                />
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="tilOgMed"
                            render={({ field, fieldState }) => (
                                <DatePicker
                                    {...field}
                                    id="tilOgMed"
                                    label={formatMessage('datovelger.tom.label')}
                                    dateFormat="MM/yyyy"
                                    showMonthYearPicker
                                    isClearable
                                    selectsEnd
                                    autoComplete="off"
                                    feil={fieldState.error?.message}
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
                                    feil={fieldState.error?.message}
                                />
                            )}
                        />
                        {pipe(
                            savingState,
                            RemoteData.fold(
                                () => null,
                                () => <NavFrontendSpinner>{formatMessage('state.lagrer')}</NavFrontendSpinner>,
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
                ),
                right: <div />,
            }}
        </ToKolonner>
    );
};

export default Virkningstidspunkt;
