import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Heading, Loader } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import * as D from 'fp-ts/lib/Date';
import { struct } from 'fp-ts/lib/Eq';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import DatePicker from '~src/components/datePicker/DatePicker';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as SøknadsbehandlingActions from '~src/features/SøknadsbehandlingActions';
import { nullableMap, pipe } from '~src/lib/fp';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { eqNullable, Nullable } from '~src/lib/types';
import yup, { getDateErrorMessage } from '~src/lib/validering';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { useAppSelector } from '~src/redux/Store';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import * as DateUtils from '~src/utils/date/dateUtils';
import { formatDate } from '~src/utils/date/dateUtils';
import { er67EllerEldre } from '~src/utils/person/personUtils';

import sharedMessages from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './virkningstidspunkt-nb';
import * as styles from './virkningstidspunkt.module.less';

interface FormData {
    fraOgMed: Nullable<Date>;
    tilOgMed: Nullable<Date>;
}

const TIDLIGST_MULIG_START_DATO = new Date(2021, 0, 1);
const eqBehandlingsperiode = struct<FormData>({
    fraOgMed: eqNullable(D.Eq),
    tilOgMed: eqNullable(D.Eq),
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
    })
    .required();

const Virkningstidspunkt = (props: VilkårsvurderingBaseProps) => {
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...messages } });

    const [status, lagreVirkningstidspunkt] = useAsyncActionCreator(SøknadsbehandlingActions.lagreVirkningstidspunkt);
    const søkerState = useAppSelector((state) => state.søker.søker);
    const initialValues = {
        fraOgMed: nullableMap(props.behandling.stønadsperiode?.periode.fraOgMed ?? null, DateUtils.parseIsoDateOnly),
        tilOgMed: nullableMap(props.behandling.stønadsperiode?.periode.tilOgMed ?? null, DateUtils.parseIsoDateOnly),
    };
    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        Vilkårtype.Virkningstidspunkt,
        (values) => eqBehandlingsperiode.equals(values, initialValues)
    );

    const form = useForm<FormData>({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(schema),
    });
    useDraftFormSubscribe(form.watch);

    const save = (data: FormData, onSuccess: () => void) =>
        lagreVirkningstidspunkt(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                fraOgMed: DateFns.formatISO(data.fraOgMed!, { representation: 'date' }),
                tilOgMed: DateFns.formatISO(DateFns.endOfMonth(data.tilOgMed!), { representation: 'date' }),
            },
            () => {
                clearDraft();
                onSuccess();
            }
        );

    return (
        <>
            {pipe(
                søkerState,
                RemoteData.fold(
                    () => <Loader />,
                    () => <Loader />,
                    () => <></>,
                    (søker) => (
                        <ToKolonner tittel={formatMessage('page.tittel')}>
                            {{
                                left: (
                                    <FormWrapper
                                        form={form}
                                        neste={{
                                            onClick: save,
                                            url: props.nesteUrl,
                                            savingState: status,
                                        }}
                                        tilbake={{
                                            url: props.forrigeUrl,
                                        }}
                                        lagreOgfortsettSenere={{
                                            url: props.avsluttUrl,
                                        }}
                                    >
                                        <>
                                            {er67EllerEldre(søker.alder) && (
                                                <Alert className={styles.alert} variant="warning">
                                                    {formatMessage('advarsel.alder')}
                                                </Alert>
                                            )}
                                            <Controller
                                                control={form.control}
                                                name="fraOgMed"
                                                render={({ field, fieldState }) => (
                                                    <DatePicker
                                                        name={field.name}
                                                        value={field.value}
                                                        onChange={(date) => {
                                                            field.onChange(date);
                                                            if (form.watch('tilOgMed') === null && date !== null) {
                                                                form.setValue(
                                                                    'tilOgMed',
                                                                    DateFns.endOfMonth(DateFns.addMonths(date, 11))
                                                                );
                                                            }
                                                        }}
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
                                                        name={field.name}
                                                        onChange={field.onChange}
                                                        value={field.value}
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
                                        </>
                                    </FormWrapper>
                                ),
                                right: (
                                    <div className={styles.høyresideContainer}>
                                        <Heading size="small">{formatMessage('søker.personalia')}</Heading>
                                        <OppsummeringPar
                                            label={formatMessage('søker.fødselsdato')}
                                            verdi={formatDate(søker.fødselsdato ?? 'feil.fantIkkeFnr')}
                                        />
                                    </div>
                                ),
                            }}
                        </ToKolonner>
                    )
                )
            )}
        </>
    );
};

export default Virkningstidspunkt;
