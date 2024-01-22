import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, ConfirmationPanel, Heading, Loader } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ApiErrorCode } from '~src/components/apiErrorAlert/apiErrorCode';
import { RangePickerMonth } from '~src/components/inputs/datePicker/DatePicker';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as SøknadsbehandlingActions from '~src/features/SøknadsbehandlingActions';
import { nullableMap, pipe } from '~src/lib/fp';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
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
import styles from './virkningstidspunkt.module.less';
import {
    eqBehandlingsperiode,
    er67PlusOgStønadsperiodeTilOgMedErLengerEnnFødselsmåned,
    erAldersvurderingAvgjortOgHarEndretPåStønadsperioden,
    fyller67PlusVedStønadsperiodeTilOgMed,
    skalViseBekreftelsesPanel,
    TIDLIGST_MULIG_START_DATO,
    VirkningstidspunktFormData,
    virkningstidspunktSchema,
} from './VirkningstidspunktUtils';

//TODO: warning hvis fødselsår i fødselsnummeret er ulik fødseslåret

const Virkningstidspunkt = (props: VilkårsvurderingBaseProps) => {
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...messages } });
    const navigate = useNavigate();

    const [status, lagreVirkningstidspunkt] = useAsyncActionCreator(SøknadsbehandlingActions.lagreVirkningstidspunkt);
    const søkerState = useAppSelector((state) => state.personopplysninger.søker);
    const initialValues: VirkningstidspunktFormData = {
        periode: {
            fraOgMed: nullableMap(
                props.behandling.stønadsperiode?.periode.fraOgMed ?? null,
                DateUtils.parseIsoDateOnly,
            ),
            tilOgMed: nullableMap(
                props.behandling.stønadsperiode?.periode.tilOgMed ?? null,
                DateUtils.parseIsoDateOnly,
            ),
        },
        harSaksbehandlerAvgjort: !!props.behandling.aldersvurdering?.harSaksbehandlerAvgjort,
    };

    const { draft, clearDraft, useDraftFormSubscribe } =
        useSøknadsbehandlingDraftContextFor<VirkningstidspunktFormData>(Vilkårtype.Virkningstidspunkt, (values) =>
            eqBehandlingsperiode.equals(values, initialValues),
        );

    const form = useForm<VirkningstidspunktFormData>({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(virkningstidspunktSchema),
        context: { søknadsbehandling: props.behandling },
    });
    useDraftFormSubscribe(form.watch);

    const save = (data: VirkningstidspunktFormData, onSuccess: () => void) => {
        const fraOgMed = DateFns.formatISO(data.periode.fraOgMed!, { representation: 'date' });
        const tilOgMed = DateFns.formatISO(data.periode.tilOgMed!, { representation: 'date' });
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
            },
        );
    };

    const handleNesteClick = (data: VirkningstidspunktFormData, onSuccess: () => void) => {
        if (eqBehandlingsperiode.equals(initialValues, data)) {
            navigate(props.nesteUrl);
            return;
        }
        return save(data, onSuccess);
    };

    const handleLagreOgFortsettSenereClick = (data: VirkningstidspunktFormData, onSuccess: () => void) => {
        if (eqBehandlingsperiode.equals(initialValues, data)) {
            navigate(props.avsluttUrl);
            return;
        }

        return save(data, onSuccess);
    };

    useEffect(() => {
        if (
            erAldersvurderingAvgjortOgHarEndretPåStønadsperioden({
                s: props.behandling,
                angittPeriode: {
                    fraOgMed: form.watch('periode.fraOgMed')
                        ? DateFns.formatISO(form.watch('periode.fraOgMed')!, { representation: 'date' })
                        : null,
                    tilOgMed: form.watch('periode.tilOgMed')
                        ? DateFns.formatISO(form.watch('periode.tilOgMed')!, { representation: 'date' })
                        : null,
                },
            })
        ) {
            form.setValue('harSaksbehandlerAvgjort', false);
        }
    }, [props.behandling, form.watch('periode.fraOgMed'), form.watch('periode.tilOgMed')]);

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
                                            onClick: handleNesteClick,
                                            url: props.nesteUrl,
                                            savingState: status,
                                        }}
                                        tilbake={{
                                            url: props.forrigeUrl,
                                        }}
                                        lagreOgfortsettSenere={{
                                            onClick: handleLagreOgFortsettSenereClick,
                                            url: props.avsluttUrl,
                                        }}
                                    >
                                        <>
                                            <SaksbehandlerMåKontrollereStønadsperioden
                                                stønadsperiodeTilOgMed={form.watch('periode.tilOgMed')}
                                                søkersFødselsinformasjon={søker.fødsel}
                                            />

                                            {((RemoteData.isFailure(status) &&
                                                status.error?.body?.code ===
                                                    ApiErrorCode.ALDERSVURDERING_GIR_IKKE_RETT_PÅ_UFØRE) ||
                                                skalViseBekreftelsesPanel({
                                                    s: props.behandling,
                                                    angittPeriode: {
                                                        fraOgMed: form.watch('periode.fraOgMed')
                                                            ? DateFns.formatISO(form.watch('periode.fraOgMed')!, {
                                                                  representation: 'date',
                                                              })
                                                            : null,
                                                        tilOgMed: form.watch('periode.tilOgMed')
                                                            ? DateFns.formatISO(form.watch('periode.tilOgMed')!, {
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
                                                                'stønadsperiode.advarsel.checkbox.måBekreftes',
                                                            )}
                                                            onChange={() => field.onChange(!field.value)}
                                                        >
                                                            {formatMessage('stønadsperiode.advarsel.tekst')}
                                                        </ConfirmationPanel>
                                                    )}
                                                />
                                            )}

                                            <Controller
                                                name={`periode`}
                                                control={form.control}
                                                render={({ field }) => (
                                                    <RangePickerMonth
                                                        name={'periode'}
                                                        label={{
                                                            fraOgMed: formatMessage('datovelger.fom.label'),
                                                        }}
                                                        value={field.value}
                                                        onChange={(dato) => {
                                                            field.onChange({
                                                                fraOgMed: dato.fraOgMed,
                                                                tilOgMed:
                                                                    dato.fraOgMed && !dato.tilOgMed
                                                                        ? DateFns.endOfMonth(
                                                                              DateFns.addMonths(dato.fraOgMed, 11),
                                                                          )
                                                                        : dato.tilOgMed,
                                                            });
                                                        }}
                                                        fromDate={TIDLIGST_MULIG_START_DATO}
                                                        error={{
                                                            fraOgMed: form.formState.errors.periode?.fraOgMed?.message,
                                                            tilOgMed: form.formState.errors.periode?.tilOgMed?.message,
                                                        }}
                                                    />
                                                )}
                                            />
                                        </>
                                    </FormWrapper>
                                ),
                                right: (
                                    <div>
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
                    ),
                ),
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
