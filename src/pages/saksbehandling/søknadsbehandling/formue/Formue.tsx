import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    Accordion,
    Alert,
    BodyLong,
    BodyShort,
    Button,
    Checkbox,
    Heading,
    Label,
    Loader,
    Modal,
    TextField,
} from '@navikt/ds-react';
import { startOfMonth } from 'date-fns/esm';
import React, { useEffect, useRef, useState } from 'react';
import { Control, Controller, useForm, UseFormTrigger } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ErrorCode } from '~src/api/apiClient';
import { FeatureToggle } from '~src/api/featureToggleApi';
import * as personApi from '~src/api/personApi';
import { hentSkattemelding } from '~src/api/sakApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import { FormueFaktablokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/FormueFaktablokk';
import { Personkort } from '~src/components/personkort/Personkort';
import Formuestatus from '~src/components/revurdering/formuestatus/Formuestatus';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import personSlice from '~src/features/person/person.slice';
import sakSliceActions, * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useFeatureToggle } from '~src/lib/featureToggles';
import { focusAfterTimeout } from '~src/lib/formUtils';
import { pipe } from '~src/lib/fp';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import yup, { hookFormErrorsTilFeiloppsummering, validateStringAsNonNegativeNumber } from '~src/lib/validering';
import { FormueSøknadsbehandlingForm } from '~src/pages/saksbehandling/revurdering/formue/formueUtils';
import { useAppDispatch } from '~src/redux/Store';
import { Behandling } from '~src/types/Behandling';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { removeSpaces } from '~src/utils/format/formatUtils';
import { showName } from '~src/utils/person/personUtils';
import {
    getSenesteHalvGVerdi,
    regnUtFormDataVerdier,
    VerdierFormData,
    verdierId,
} from '~src/utils/søknadsbehandlingOgRevurdering/formue/formueSøbOgRevUtils';
import sharedFormueMessages from '~src/utils/søknadsbehandlingOgRevurdering/formue/sharedFormueMessages-nb';

import sharedI18n from '../sharedI18n-nb';
import { Vurderingknapper } from '../vurderingknapper/Vurderingknapper';

import messages from './formue-nb';
import * as styles from './formue.module.less';
import { formDataVerdierTilFormueVerdier, FormueFormData, getFormueInitialValues } from './utils';

const VerdierSchema: yup.ObjectSchema<VerdierFormData | undefined> = yup.object<VerdierFormData>({
    verdiPåBolig: validateStringAsNonNegativeNumber('Verdi på boliger'),
    verdiPåEiendom: validateStringAsNonNegativeNumber('Verdi på eiendommene'),
    verdiPåKjøretøy: validateStringAsNonNegativeNumber('Kjøretøyenes verdi'),
    innskuddsbeløp: validateStringAsNonNegativeNumber('Innskudd på konto'),
    verdipapir: validateStringAsNonNegativeNumber('Verdipapirer og aksjefond'),
    stårNoenIGjeldTilDeg: validateStringAsNonNegativeNumber('Om noen skylder søker penger'),
    kontanterOver1000: validateStringAsNonNegativeNumber('Kontanter'),
    depositumskonto: validateStringAsNonNegativeNumber('Depositumskontoverdi').test(
        'depositumMindreEllerLikInnskudd',
        'Depositum kan ikke være større enn innskudd',
        function (depositum) {
            const { innskuddsbeløp } = this.parent;
            if (depositum == null) {
                return false;
            }
            return depositum <= innskuddsbeløp;
        }
    ),
});

const schema = yup
    .object<FormueFormData>({
        måInnhenteMerInformasjon: yup.boolean(),
        søkersFormue: VerdierSchema.required(),
        epsFormue: yup
            .object<VerdierFormData>()
            .when('borSøkerMedEPS', {
                is: true,
                then: VerdierSchema.required('Du må legge inn ektefelle/samboers formue'),
                otherwise: yup.object().nullable().defined(),
            })
            .defined(),
        borSøkerMedEPS: yup
            .boolean()
            .required('Du må velge om søker bor med en ektefelle eller samboer')
            .typeError('Feltet må fylles ut'),
        epsFnr: yup.mixed<string>().when('borSøkerMedEPS', {
            is: true,
            then: yup.string().typeError('Du må legge inn ektefelle/samboers fødselsnummer').length(11),
        }),
    })
    .required();

const Formue = (props: {
    behandling: Behandling;
    forrigeUrl: string;
    nesteUrl: string;
    sakId: string;
    søker: personApi.Person;
}) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [eps, fetchEps, resetEpsToInitial] = useApiCall(personApi.fetchPerson);
    const søknadInnhold = props.behandling.søknad.søknadInnhold;
    const [lagreBehandlingsinformasjonStatus, lagreBehandlingsinformasjon] = useAsyncActionCreator(
        sakSlice.lagreFormuegrunnlag
    );
    const [lagreEpsGrunnlagStatus, lagreEpsGrunnlag] = useAsyncActionCreator(sakSlice.lagreEpsGrunnlag);
    const [lagreEpsGrunnlagSkjermetStatus, lagreEpsGrunnlagSkjermet] = useAsyncActionCreator(
        sakSlice.lagreEpsGrunnlagSkjermet
    );
    const [skattemeldingBruker, hentSkattemeldingBruker] = useApiCall(hentSkattemelding);
    const [skattemeldingEPS, hentSkattemeldingEPS, resetSkattemeldingEPS] = useApiCall(hentSkattemelding);
    const skattemeldingToggle = useFeatureToggle(FeatureToggle.Skattemelding);

    const feiloppsummeringRef = useRef<HTMLDivElement>(null);

    const combinedLagringsstatus = RemoteData.combine(lagreBehandlingsinformasjonStatus, lagreEpsGrunnlagStatus);

    const senesteHalvG = getSenesteHalvGVerdi(
        props.behandling.stønadsperiode?.periode?.fraOgMed
            ? startOfMonth(new Date(props.behandling.stønadsperiode.periode.fraOgMed))
            : null,
        props.behandling.grunnlagsdataOgVilkårsvurderinger.formue.formuegrenser
    );

    const initialValues = getFormueInitialValues(søknadInnhold, props.behandling.grunnlagsdataOgVilkårsvurderinger);

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormueFormData>(
        Vilkårtype.Formue,
        () => props.behandling.grunnlagsdataOgVilkårsvurderinger.formue.resultat === null
    );

    const handleSave = (nesteUrl: string) => async (values: FormueFormData) => {
        if (RemoteData.isPending(eps) && values.epsFnr !== null) return;

        const formueValues: FormueSøknadsbehandlingForm = {
            periode: props.behandling.stønadsperiode!.periode,
            måInnhenteMerInformasjon: values.måInnhenteMerInformasjon,
            søkersFormue: formDataVerdierTilFormueVerdier(values.søkersFormue!),
            epsFormue: values.borSøkerMedEPS ? formDataVerdierTilFormueVerdier(values.epsFormue!) : null,
        };

        await lagreEpsGrunnlag(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                epsFnr: values.epsFnr,
            },
            () => {
                return lagreBehandlingsinformasjon(
                    {
                        sakId: props.sakId,
                        behandlingId: props.behandling.id,
                        vurderinger: [formueValues],
                    },
                    () => {
                        clearDraft();
                        navigate(nesteUrl);
                    }
                );
            }
        );
    };

    const {
        formState: { isValid, isSubmitted, errors, isDirty },
        ...form
    } = useForm<FormueFormData>({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(schema),
    });
    const watch = form.watch();

    useDraftFormSubscribe(form.watch);

    const søkersFormue = React.useMemo(() => {
        return regnUtFormDataVerdier(watch.søkersFormue);
    }, [watch]);

    const ektefellesFormue = React.useMemo(() => {
        return regnUtFormDataVerdier(watch.epsFormue);
    }, [watch]);

    const totalFormue = søkersFormue + (watch.borSøkerMedEPS ? ektefellesFormue : 0);

    useEffect(() => {
        form.trigger('søkersFormue.depositumskonto');
    }, [watch.søkersFormue?.innskuddsbeløp]);

    useEffect(() => {
        form.trigger('epsFormue.depositumskonto');
    }, [watch.epsFormue?.innskuddsbeløp]);

    useEffect(() => {
        hentSkattemeldingBruker({ fnr: props.søker.fnr });
    }, []);

    useEffect(() => {
        resetSkattemeldingEPS();
        if (watch.epsFnr && watch.epsFnr.length === 11) {
            fetchEps(watch.epsFnr, (res) => {
                if (skattemeldingToggle) {
                    hentSkattemeldingEPS({ fnr: res.fnr });
                }
            });
        } else {
            resetEpsToInitial();
        }
    }, [watch.epsFnr]);

    useEffect(() => {
        if (!isDirty) {
            return;
        }
        form.setValue('epsFnr', null);
        if (!watch.borSøkerMedEPS) {
            form.setValue('epsFormue', null);
        } else {
            form.setValue('epsFormue', {
                verdiPåBolig: '0',
                verdiPåEiendom: '0',
                verdiPåKjøretøy: '0',
                innskuddsbeløp: '0',
                verdipapir: '0',
                kontanterOver1000: '0',
                stårNoenIGjeldTilDeg: '0',
                depositumskonto: '0',
            });
        }
    }, [watch.borSøkerMedEPS]);

    const handleEpsSkjermingModalContinueClick = (epsFnr: string) => {
        lagreEpsGrunnlagSkjermet(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                epsFnr: epsFnr,
            },
            () => {
                dispatch(sakSliceActions.actions.resetSak());
                dispatch(personSlice.actions.resetSøker());
                navigate(Routes.home.createURL());
            }
        );
    };

    const erVilkårOppfylt = totalFormue <= senesteHalvG;

    const [søkersBekreftetFormue, setSøkersBekreftetFormue] = useState<number>(
        regnUtFormDataVerdier(watch.søkersFormue)
    );
    const [epsBekreftetFormue, setEPSBekreftetFormue] = useState<number>(regnUtFormDataVerdier(watch.epsFormue));

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <form
                        onSubmit={form.handleSubmit(handleSave(props.nesteUrl), focusAfterTimeout(feiloppsummeringRef))}
                    >
                        <div className={styles.ektefellePartnerSamboer}>
                            <Controller
                                control={form.control}
                                name="borSøkerMedEPS"
                                render={({ field, fieldState }) => (
                                    <BooleanRadioGroup
                                        legend={formatMessage('input.label.borSøkerMedEktefelle')}
                                        error={fieldState.error?.message}
                                        {...field}
                                    />
                                )}
                            />
                            {watch.borSøkerMedEPS && (
                                <>
                                    <div className={styles.fnrInputContainer}>
                                        <Controller
                                            control={form.control}
                                            name="epsFnr"
                                            render={({ field, fieldState }) => (
                                                <TextField
                                                    id={field.name}
                                                    label={formatMessage('input.label.ektefellesFødselsnummer')}
                                                    className={styles.fnrInput}
                                                    error={fieldState.error?.message}
                                                    size="small"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(removeSpaces(e.target.value))}
                                                />
                                            )}
                                        />
                                        <div className={styles.result}>
                                            {pipe(
                                                eps,
                                                RemoteData.fold(
                                                    () => null,
                                                    () => <Loader />,
                                                    (err) => (
                                                        <Alert variant="error">
                                                            {err?.statusCode === ErrorCode.Unauthorized ? (
                                                                <Modal
                                                                    open={true}
                                                                    onClose={() => {
                                                                        return;
                                                                    }}
                                                                >
                                                                    <Modal.Content>
                                                                        <div className={styles.modalInnhold}>
                                                                            <Heading level="2" size="small" spacing>
                                                                                {formatMessage(
                                                                                    'modal.skjerming.heading'
                                                                                )}
                                                                            </Heading>
                                                                            <BodyLong spacing>
                                                                                {formatMessage(
                                                                                    'modal.skjerming.innhold',
                                                                                    {
                                                                                        navn: showName(
                                                                                            props.søker.navn
                                                                                        ),
                                                                                        fnr: søknadInnhold
                                                                                            .personopplysninger.fnr,
                                                                                        b: (chunks) => <b>{chunks}</b>,
                                                                                        // eslint-disable-next-line react/display-name
                                                                                        br: () => <br />,
                                                                                    }
                                                                                )}
                                                                            </BodyLong>
                                                                            {RemoteData.isFailure(
                                                                                lagreEpsGrunnlagSkjermetStatus
                                                                            ) && (
                                                                                <ApiErrorAlert
                                                                                    error={
                                                                                        lagreEpsGrunnlagSkjermetStatus.error
                                                                                    }
                                                                                />
                                                                            )}
                                                                            <Button
                                                                                variant="secondary"
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    handleEpsSkjermingModalContinueClick(
                                                                                        form.getValues().epsFnr ?? ''
                                                                                    )
                                                                                }
                                                                            >
                                                                                OK
                                                                                {RemoteData.isPending(
                                                                                    lagreEpsGrunnlagSkjermetStatus
                                                                                ) && <Loader />}
                                                                            </Button>
                                                                        </div>
                                                                    </Modal.Content>
                                                                </Modal>
                                                            ) : err?.statusCode === ErrorCode.NotFound ? (
                                                                formatMessage('feilmelding.ikkeFunnet')
                                                            ) : (
                                                                formatMessage('feilmelding.ukjent')
                                                            )}
                                                        </Alert>
                                                    ),
                                                    (person) => <Personkort person={person} />
                                                )
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <Accordion className={styles.formuePanelerContainer}>
                            <FormuePanel
                                tilhører={'Søkers'}
                                sumFormue={søkersBekreftetFormue}
                                setBekreftetFormue={setSøkersBekreftetFormue}
                                watch={watch}
                                formController={form.control}
                                triggerValidation={form.trigger}
                            />
                            {watch.borSøkerMedEPS && (
                                <FormuePanel
                                    tilhører={'Ektefelle/Samboers'}
                                    sumFormue={epsBekreftetFormue}
                                    setBekreftetFormue={setEPSBekreftetFormue}
                                    watch={watch}
                                    formController={form.control}
                                    triggerValidation={form.trigger}
                                />
                            )}
                        </Accordion>

                        <Formuestatus bekreftetFormue={totalFormue} erVilkårOppfylt={erVilkårOppfylt} />

                        <Controller
                            control={form.control}
                            name="måInnhenteMerInformasjon"
                            render={({ field }) => (
                                <Checkbox className={styles.henteMerInfoCheckbox} {...field} checked={field.value}>
                                    {formatMessage('checkbox.henteMerInfo')}
                                </Checkbox>
                            )}
                        />

                        {RemoteData.isFailure(combinedLagringsstatus) && (
                            <ApiErrorAlert error={combinedLagringsstatus.error} />
                        )}
                        <Feiloppsummering
                            tittel={formatMessage('feiloppsummering.title')}
                            hidden={!isSubmitted || isValid}
                            feil={hookFormErrorsTilFeiloppsummering(errors)}
                            ref={feiloppsummeringRef}
                        />
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                navigate(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={form.handleSubmit(
                                handleSave(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })),
                                focusAfterTimeout(feiloppsummeringRef)
                            )}
                            loading={RemoteData.isPending(combinedLagringsstatus)}
                        />
                    </form>
                ),
                right: (
                    <FormueFaktablokk
                        søknadInnhold={props.behandling.søknad.søknadInnhold}
                        skattegrunnlag={{ bruker: skattemeldingBruker, eps: skattemeldingEPS }}
                    />
                ),
            }}
        </ToKolonner>
    );
};

export default Formue;

const FormuePanel = (props: {
    tilhører: 'Søkers' | 'Ektefelle/Samboers';
    sumFormue: number;
    setBekreftetFormue: (formue: number) => void;
    watch: FormueFormData;
    formController: Control<FormueFormData>;
    triggerValidation: UseFormTrigger<FormueFormData>;
}) => {
    const { intl } = useI18n({ messages: { ...sharedFormueMessages } });
    const [åpen, setÅpen] = useState<boolean>(false);
    const formueTilhører = props.tilhører === 'Søkers' ? 'søkersFormue' : 'epsFormue';
    const formueVerdier = props.watch[formueTilhører];

    let utregnetFormue = regnUtFormDataVerdier(formueVerdier);
    useEffect(() => {
        utregnetFormue = regnUtFormDataVerdier(formueVerdier);
    }, [formueVerdier]);

    const handlePanelKlikk = () => (åpen ? handleBekreftClick() : setÅpen(true));

    const handleBekreftClick = () => {
        props.triggerValidation(formueTilhører).then((isPanelValid) => {
            if (isPanelValid) {
                setÅpen(false);
                props.setBekreftetFormue(utregnetFormue);
            }
        });
    };

    return (
        <Accordion.Item open={åpen} className={åpen ? styles.formuePanel : undefined}>
            <Accordion.Header type="button" onClick={handlePanelKlikk}>
                <div>
                    <BodyShort>
                        {intl.formatMessage({
                            id: props.tilhører === 'Søkers' ? 'panel.formue.søkers' : 'panel.formue.eps',
                        })}
                    </BodyShort>
                    <p>
                        {props.sumFormue} {intl.formatMessage({ id: 'panel.kroner' })}
                    </p>
                </div>
            </Accordion.Header>
            <Accordion.Content>
                <ul className={styles.formueInputs}>
                    {verdierId.map((id) => {
                        return (
                            <li key={id}>
                                <Controller
                                    name={`${formueTilhører}.${id}`}
                                    control={props.formController}
                                    defaultValue={formueVerdier?.[id] ?? '0'}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            id={field.name}
                                            label={intl.formatMessage({ id: `formuepanel.${id}` })}
                                            {...field}
                                            error={fieldState?.error?.message}
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                        />
                                    )}
                                />
                            </li>
                        );
                    })}
                </ul>

                <div className={styles.nyBeregningContainer}>
                    <BodyShort>{intl.formatMessage({ id: 'formuepanel.nyBeregning' })}</BodyShort>
                    <Label>
                        {utregnetFormue} {intl.formatMessage({ id: 'panel.kroner' })}
                    </Label>
                </div>

                <Button variant="secondary" type="button" onClick={() => handleBekreftClick()}>
                    {intl.formatMessage({ id: 'knapp.bekreft' })}
                </Button>
            </Accordion.Content>
        </Accordion.Item>
    );
};
