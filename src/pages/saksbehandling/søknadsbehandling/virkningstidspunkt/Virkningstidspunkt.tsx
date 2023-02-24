import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, ConfirmationPanel, Heading, Loader } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ApiErrorCode } from '~src/components/apiErrorAlert/apiErrorCode';
import DatePicker from '~src/components/datePicker/DatePicker';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as SøknadsbehandlingActions from '~src/features/SøknadsbehandlingActions';
import { nullableMap, pipe } from '~src/lib/fp';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { getDateErrorMessage } from '~src/lib/validering';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { useAppSelector } from '~src/redux/Store';
import { Fødsel } from '~src/types/Person';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import * as DateUtils from '~src/utils/date/dateUtils';
import { formatDate } from '~src/utils/date/dateUtils';
import { alderSomPersonFyllerIÅr } from '~src/utils/person/personUtils';

import sharedMessages from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './virkningstidspunkt-nb';
import * as styles from './virkningstidspunkt.module.less';
import {
    eqBehandlingsperiode,
    er67PlusOgStønadsperiodeTilOgMedErLengerEnnFødselsmåned,
    erAldersvurderingAvgjortOgHarEndretPåStønadsperioden,
    fyller67PlusVedStønadsperiodeTilOgMed,
    TIDLIGST_MULIG_START_DATO,
    VirkningstidspunktFormData,
    virkningstidspunktSchema,
} from './VirkningstidspunktUtils';

//TODO: warning hvis fødselsår i fødselsnummeret er ulik fødseslåret

const Virkningstidspunkt = (props: VilkårsvurderingBaseProps) => {
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...messages } });

    const [status, lagreVirkningstidspunkt] = useAsyncActionCreator(SøknadsbehandlingActions.lagreVirkningstidspunkt);
    const søkerState = useAppSelector((state) => state.søker.søker);
    const initialValues = {
        fraOgMed: nullableMap(props.behandling.stønadsperiode?.periode.fraOgMed ?? null, DateUtils.parseIsoDateOnly),
        tilOgMed: nullableMap(props.behandling.stønadsperiode?.periode.tilOgMed ?? null, DateUtils.parseIsoDateOnly),
        harSaksbehandlerAvgjort: !!props.behandling.aldersvurdering?.harSaksbehandlerAvgjort,
    };

    const { draft, clearDraft, useDraftFormSubscribe } =
        useSøknadsbehandlingDraftContextFor<VirkningstidspunktFormData>(Vilkårtype.Virkningstidspunkt, (values) =>
            eqBehandlingsperiode.equals(values, initialValues)
        );

    const form = useForm<VirkningstidspunktFormData>({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(virkningstidspunktSchema),
        context: { søknadsbehandling: props.behandling },
    });
    useDraftFormSubscribe(form.watch);

    const save = (data: VirkningstidspunktFormData, onSuccess: () => void) => {
        const fraOgMed = DateFns.formatISO(data.fraOgMed!, { representation: 'date' });
        const tilOgMed = DateFns.formatISO(data.tilOgMed!, { representation: 'date' });
        return lagreVirkningstidspunkt(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                fraOgMed: fraOgMed,
                tilOgMed: tilOgMed,
                harSaksbehandlerAvgjort: data.harSaksbehandlerAvgjort,
            },
            () => {
                clearDraft();
                onSuccess();
            }
        );
    };

    React.useEffect(() => {
        if (
            erAldersvurderingAvgjortOgHarEndretPåStønadsperioden({
                s: props.behandling,
                angittPeriode: {
                    fraOgMed: form.watch('fraOgMed')
                        ? DateFns.formatISO(form.watch('fraOgMed')!, { representation: 'date' })
                        : null,
                    tilOgMed: form.watch('tilOgMed')
                        ? DateFns.formatISO(form.watch('tilOgMed')!, { representation: 'date' })
                        : null,
                },
            })
        ) {
            form.setValue('harSaksbehandlerAvgjort', false);
        }
    }, [props.behandling, form.watch('fraOgMed'), form.watch('tilOgMed')]);

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
                                            <SaksbehandlerMåKontrollereStønadsperioden
                                                stønadsperiodeTilOgMed={form.watch('tilOgMed')}
                                                søkersFødselsinformasjon={søker.fødsel}
                                            />

                                            {((RemoteData.isFailure(status) &&
                                                status.error?.body?.code ===
                                                    ApiErrorCode.ALDERSVURDERING_GIR_IKKE_RETT_PÅ_UFØRE) ||
                                                !erAldersvurderingAvgjortOgHarEndretPåStønadsperioden({
                                                    s: props.behandling,
                                                    angittPeriode: {
                                                        fraOgMed: form.watch('fraOgMed')
                                                            ? DateFns.formatISO(form.watch('fraOgMed')!, {
                                                                  representation: 'date',
                                                              })
                                                            : null,
                                                        tilOgMed: form.watch('tilOgMed')
                                                            ? DateFns.formatISO(form.watch('tilOgMed')!, {
                                                                  representation: 'date',
                                                              })
                                                            : null,
                                                    },
                                                })) && (
                                                <Controller
                                                    control={form.control}
                                                    name="harSaksbehandlerAvgjort"
                                                    render={({ field }) => (
                                                        <ConfirmationPanel
                                                            className={styles.confirmationPanel}
                                                            checked={field.value}
                                                            label={formatMessage(
                                                                'stønadsperiode.advarsel.checkbox.måBekreftes'
                                                            )}
                                                            onChange={() => field.onChange(!field.value)}
                                                        >
                                                            {formatMessage('stønadsperiode.advarsel.tekst')}
                                                        </ConfirmationPanel>
                                                    )}
                                                />
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
                                                        onChange={(date) =>
                                                            date
                                                                ? field.onChange(DateFns.endOfMonth(date))
                                                                : field.onChange(date)
                                                        }
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
                                            verdi={
                                                søker.fødsel?.dato
                                                    ? formatDate(søker.fødsel?.dato)
                                                    : formatMessage('feil.harIkkeFødselsdato')
                                            }
                                        />
                                        <OppsummeringPar
                                            label={formatMessage('søker.fødselsår')}
                                            verdi={
                                                søker.fødsel?.år
                                                    ? søker.fødsel.år
                                                    : formatMessage('feil.harIkkeFødselsår')
                                            }
                                        />
                                        {søker.fødsel?.alder ? (
                                            <OppsummeringPar
                                                label={formatMessage('søker.alder')}
                                                verdi={søker.fødsel.alder}
                                            />
                                        ) : (
                                            <OppsummeringPar
                                                label={formatMessage('søker.alder')}
                                                verdi={
                                                    søker.fødsel?.år
                                                        ? formatMessage('søker.årSøkerFyller', {
                                                              år: alderSomPersonFyllerIÅr(søker.fødsel.år),
                                                              detteÅret: new Date().getFullYear(),
                                                          })
                                                        : formatMessage('feil.kunneIkkeAvgjøreAlder')
                                                }
                                            />
                                        )}
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

const SaksbehandlerMåKontrollereStønadsperioden = (props: {
    stønadsperiodeTilOgMed: Nullable<Date>;
    søkersFødselsinformasjon: Nullable<Fødsel>;
}) => {
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...messages } });

    if (!props.søkersFødselsinformasjon) {
        return <FødselsinfoAdvarsel message={formatMessage('person.harIkkeFødselsinformasjon')} />;
    } else if (!props.stønadsperiodeTilOgMed) {
        return <div></div>;
    }

    if (props.søkersFødselsinformasjon.dato) {
        return (
            <FødselsdatoHandler
                periodeTilOgMed={props.stønadsperiodeTilOgMed}
                fødselsdato={props.søkersFødselsinformasjon.dato}
            />
        );
    }
    if (fyller67PlusVedStønadsperiodeTilOgMed(props.stønadsperiodeTilOgMed, props.søkersFødselsinformasjon.år)) {
        return (
            <FødselsinfoAdvarsel message={formatMessage('person.utenFødselsdato.fyller67VedAngittStønadsperiode')} />
        );
    }

    return <div></div>;
};

const FødselsdatoHandler = (props: { periodeTilOgMed: Date; fødselsdato: string }) => {
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...messages } });
    if (er67PlusOgStønadsperiodeTilOgMedErLengerEnnFødselsmåned(props.periodeTilOgMed, new Date(props.fødselsdato))) {
        return <FødselsinfoAdvarsel message={formatMessage('person.medFødselsdato.fyller67VedAngittStønadsperiode')} />;
    }
    return <div></div>;
};

const FødselsinfoAdvarsel = (props: { message: string }) => {
    return (
        <Alert className={styles.alert} variant="warning">
            {props.message}
        </Alert>
    );
};

export default Virkningstidspunkt;
