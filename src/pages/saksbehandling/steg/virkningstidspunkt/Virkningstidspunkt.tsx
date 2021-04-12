import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import * as DateFns from 'date-fns';
import AlertStripe from 'nav-frontend-alertstriper';
import { Feiloppsummering, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import * as React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useHistory } from 'react-router';

import { ApiError, ErrorCode } from '~api/apiClient';
import DatePicker from '~components/datePicker/DatePicker';
import * as SakSlice from '~features/saksoversikt/sak.slice';
import * as DateUtils from '~lib/dateUtils';
import { nullableMap, pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch } from '~redux/Store';

import sharedMessages from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import messages from './virkningstidspunkt-nb';
import styles from './virkningstidspunkt.module.less';

interface FormData {
    fraOgMed: Nullable<Date>;
    tilOgMed: Nullable<Date>;
    begrunnelse: string;
}

const schema = yup.object<FormData>({
    fraOgMed: yup.date().nullable().required(),
    tilOgMed: yup
        .date()
        .nullable()
        .required()
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
    const intl = useI18n({ messages: { ...sharedMessages, ...messages } });
    const history = useHistory();
    const [savingState, setSavingState] = React.useState<RemoteData.RemoteData<ApiError, null>>(RemoteData.initial);
    const dispatch = useAppDispatch();

    const form = useForm<FormData>({
        defaultValues: {
            fraOgMed: nullableMap(
                props.behandling.behandlingsperiode?.periode.fraOgMed ?? null,
                DateUtils.parseIsoDateOnly
            ),
            tilOgMed: nullableMap(
                props.behandling.behandlingsperiode?.periode.tilOgMed ?? null,
                DateUtils.parseIsoDateOnly
            ),
            begrunnelse: props.behandling.behandlingsperiode?.begrunnelse ?? '',
        },
        resolver: yupResolver(schema),
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
        <Vurdering tittel={intl.formatMessage({ id: 'page.tittel' })}>
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
                                    label={intl.formatMessage({ id: 'datovelger.fom.label' })}
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
                            control={form.control}
                            name="tilOgMed"
                            render={({ field, fieldState }) => (
                                <DatePicker
                                    {...field}
                                    id="tilOgMed"
                                    label={intl.formatMessage({ id: 'datovelger.tom.label' })}
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
                                    label={intl.formatMessage({ id: 'begrunnelse.label' })}
                                    feil={fieldState.error?.message}
                                />
                            )}
                        />
                        {pipe(
                            savingState,
                            RemoteData.fold(
                                () => null,
                                () => (
                                    <NavFrontendSpinner>
                                        {intl.formatMessage({ id: 'state.lagrer' })}
                                    </NavFrontendSpinner>
                                ),
                                () => (
                                    <AlertStripe type="feil">
                                        {intl.formatMessage({ id: 'state.lagringFeilet' })}
                                    </AlertStripe>
                                ),
                                () => null
                            )
                        )}
                        <Feiloppsummering
                            tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                            hidden={!form.formState.isSubmitted || form.formState.isValid}
                            feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
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
        </Vurdering>
    );
};

export default Virkningstidspunkt;
