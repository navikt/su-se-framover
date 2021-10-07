import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Checkbox, Alert, Button, Fieldset, Modal, Radio, RadioGroup, Textarea, TextField } from '@navikt/ds-react';
import fnrValidator from '@navikt/fnrvalidator';
import { startOfMonth } from 'date-fns/esm';
import NavFrontendSpinner from 'nav-frontend-spinner';
import Tekstomrade, { BoldRule, HighlightRule, LinebreakRule } from 'nav-frontend-tekstomrade';
import { Feilmelding, Undertittel } from 'nav-frontend-typografi';
import React, { useState, useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { ErrorCode } from '~api/apiClient';
import * as personApi from '~api/personApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import { FormueFaktablokk } from '~components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/FormueFaktablokk';
import { Personkort } from '~components/personkort/Personkort';
import ToKolonner from '~components/toKolonner/ToKolonner';
import VilkårvurderingStatusIcon from '~components/VilkårvurderingStatusIcon';
import { useSøknadsbehandlingDraftContextFor } from '~context/søknadsbehandlingDraftContext';
import personSlice from '~features/person/person.slice';
import sakSliceActions, * as sakSlice from '~features/saksoversikt/sak.slice';
import { focusAfterTimeout } from '~lib/formUtils';
import { pipe } from '~lib/fp';
import { useApiCall, useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering, validateStringAsNonNegativeNumber } from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { Behandling } from '~types/Behandling';
import { FormueStatus, Formue as FormueType } from '~types/Behandlingsinformasjon';
import { VilkårVurderingStatus, Vilkårtype } from '~types/Vilkårsvurdering';
import { removeSpaces } from '~utils/format/formatUtils';
import { showName } from '~utils/person/personUtils';
import { hentBosituasjongrunnlag } from '~utils/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';
import {
    getSenesteHalvGVerdi,
    regnUtFormDataVerdier,
    VerdierFormData,
    verdierId,
} from '~utils/søknadsbehandlingOgRevurdering/formue/formueSøbOgRevUtils';

import sharedI18n from '../sharedI18n-nb';
import { Vurderingknapper } from '../Vurdering';

import messages from './formue-nb';
import styles from './formue.module.less';
import { FormueInput, ShowSum } from './FormueComponents';
import {
    FormueFormData,
    getFormueInitialValues,
    formDataVerdierTilFormueVerdier,
    eqFormue,
    eqEktefelle,
    eqFormueFormData,
} from './utils';

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
        status: yup
            .mixed()
            .required()
            .oneOf([FormueStatus.VilkårOppfylt, FormueStatus.MåInnhenteMerInformasjon, FormueStatus.VilkårIkkeOppfylt]),
        verdier: VerdierSchema.required(),
        epsVerdier: yup
            .object<VerdierFormData>()
            .when('borSøkerMedEPS', {
                is: true,
                then: VerdierSchema.required('Du må legge inn ektefelle/samboers formue'),
                otherwise: yup.object().nullable().defined(),
            })
            .defined(),
        begrunnelse: yup.string().defined(),
        borSøkerMedEPS: yup
            .boolean()
            .required('Du må velge om søker bor med en ektefelle eller samboer')
            .typeError('Feltet må fylles ut'),
        epsFnr: yup.mixed<string>().when('borSøkerMedEPS', {
            is: true,
            then: yup
                .mixed<string>()
                .required('Du må legge inn ektefelle/samboers fødselsnummer')
                .test('erGyldigFnr', 'Du må legge inn et gyldig fødselsnummer', (fnr) => {
                    return fnr && fnrValidator.fnr(fnr).status === 'valid';
                }),
        }),
    })
    .required();

enum Hvem {
    Søker = 'søker',
    Ektefelle = 'ektefelle',
}

const Formue = (props: {
    behandling: Behandling;
    forrigeUrl: string;
    nesteUrl: string;
    sakId: string;
    søker: personApi.Person;
}) => {
    const history = useHistory();
    const dispatch = useAppDispatch();
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [eps, fetchEps, resetEpsToInitial] = useApiCall(personApi.fetchPerson);
    const [åpnerNyFormueBlokkMenViserEnBlokk, setÅpnerNyFormueBlokkMenViserEnBlokk] = useState<boolean>(false);
    const søknadInnhold = props.behandling.søknad.søknadInnhold;
    const [lagreBehandlingsinformasjonStatus, lagreBehandlingsinformasjon] = useAsyncActionCreator(
        sakSlice.lagreBehandlingsinformasjon
    );
    const [lagreEpsGrunnlagStatus, lagreEpsGrunnlag] = useAsyncActionCreator(sakSlice.lagreEpsGrunnlag);
    const feiloppsummeringRef = useRef<HTMLDivElement>(null);

    const senesteHalvG = getSenesteHalvGVerdi(
        props.behandling.stønadsperiode?.periode?.fraOgMed
            ? startOfMonth(new Date(props.behandling.stønadsperiode.periode.fraOgMed))
            : null,
        props.behandling.grunnlagsdataOgVilkårsvurderinger.formue.formuegrenser
    );

    const initialValues = getFormueInitialValues(
        props.behandling.behandlingsinformasjon,
        søknadInnhold,
        props.behandling.grunnlagsdataOgVilkårsvurderinger
    );

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormueFormData>(
        Vilkårtype.Formue,
        (values) => eqFormueFormData.equals(values, initialValues)
    );

    const handleSave = (nesteUrl: string) => async (values: FormueFormData) => {
        if (RemoteData.isPending(eps) && values.epsFnr !== null) return;

        const status =
            values.status === FormueStatus.MåInnhenteMerInformasjon
                ? FormueStatus.MåInnhenteMerInformasjon
                : totalFormue <= senesteHalvG
                ? FormueStatus.VilkårOppfylt
                : FormueStatus.VilkårIkkeOppfylt;

        const formueValues: FormueType = {
            status,
            //Validering fanger denne
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            verdier: formDataVerdierTilFormueVerdier(values.verdier!),
            borSøkerMedEPS: values.borSøkerMedEPS,
            //Validering fanger denne
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            epsVerdier: values.borSøkerMedEPS ? formDataVerdierTilFormueVerdier(values.epsVerdier!) : null,
            begrunnelse: values.begrunnelse,
        };

        const ektefelle = { fnr: values.epsFnr };
        const erEktefelleUendret = eqEktefelle.equals(ektefelle, {
            fnr: hentBosituasjongrunnlag(props.behandling.grunnlagsdataOgVilkårsvurderinger)?.fnr,
        });

        if (eqFormue.equals(formueValues, props.behandling.behandlingsinformasjon.formue) && erEktefelleUendret) {
            clearDraft();
            history.push(nesteUrl);
            return;
        }

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
                        behandlingsinformasjon: { formue: formueValues },
                    },
                    () => {
                        clearDraft();
                        history.push(nesteUrl);
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
        return regnUtFormDataVerdier(watch.verdier);
    }, [watch]);

    const ektefellesFormue = React.useMemo(() => {
        return regnUtFormDataVerdier(watch.epsVerdier);
    }, [watch]);

    const totalFormue = søkersFormue + (watch.borSøkerMedEPS ? ektefellesFormue : 0);

    useEffect(() => {
        form.trigger('verdier.depositumskonto');
    }, [watch.verdier?.innskuddsbeløp]);

    useEffect(() => {
        form.trigger('epsVerdier.depositumskonto');
    }, [watch.epsVerdier?.innskuddsbeløp]);

    useEffect(() => {
        if (watch.epsFnr && fnrValidator.fnr(watch.epsFnr).status === 'valid') {
            fetchEps(watch.epsFnr);
        } else {
            resetEpsToInitial();
        }
    }, [watch.epsFnr]);

    useEffect(() => {
        if (!isDirty) {
            return;
        }
        form.setValue('epsFnr', null);
        setÅpnerNyFormueBlokkMenViserEnBlokk(false);
        if (!watch.borSøkerMedEPS) {
            form.setValue('epsVerdier', null);
            setInputToShow(Hvem.Søker);
        } else {
            form.setValue('epsVerdier', {
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

    const handleEpsSkjermingModalContinueClick = () => {
        form.handleSubmit(handleSave(Routes.home.createURL()), () => {
            dispatch(sakSliceActions.actions.resetSak());
            dispatch(personSlice.actions.resetSøker());
        });
    };

    const [inputToShow, setInputToShow] = useState<Nullable<Hvem>>(watch.borSøkerMedEPS ? null : Hvem.Søker);

    const vilkårErOppfylt = totalFormue <= senesteHalvG;

    const onLagreClick = (hvem: Hvem) => {
        form.trigger(hvem === Hvem.Søker ? 'verdier' : 'epsVerdier', {
            shouldFocus: true,
        }).then((isValid) => {
            if (isValid) {
                setInputToShow(null);
                setÅpnerNyFormueBlokkMenViserEnBlokk(false);
            }
        });
    };

    const onEndreFormueClick = (søkerEllerEktefelle: Hvem) => {
        if (inputToShow === null) {
            setInputToShow(søkerEllerEktefelle);
        } else {
            setÅpnerNyFormueBlokkMenViserEnBlokk(true);
        }
    };

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
                                    <RadioGroup
                                        legend={formatMessage('input.label.borSøkerMedEktefelle')}
                                        error={fieldState.error?.message}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        value={field.value?.toString()}
                                        onChange={(val) => field.onChange(val === true.toString())}
                                    >
                                        <Radio id={field.name} ref={field.ref} value={true.toString()}>
                                            {formatMessage('radio.label.ja')}
                                        </Radio>
                                        <Radio value={false.toString()}>{formatMessage('radio.label.nei')}</Radio>
                                    </RadioGroup>
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
                                                    () => <NavFrontendSpinner />,
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
                                                                            <Undertittel>
                                                                                {formatMessage(
                                                                                    'modal.skjerming.heading'
                                                                                )}
                                                                            </Undertittel>
                                                                            <Tekstomrade
                                                                                className={styles.modalTekst}
                                                                                rules={[
                                                                                    BoldRule,
                                                                                    HighlightRule,
                                                                                    LinebreakRule,
                                                                                ]}
                                                                            >
                                                                                {formatMessage(
                                                                                    'modal.skjerming.innhold',
                                                                                    {
                                                                                        navn: showName(
                                                                                            props.søker.navn
                                                                                        ),
                                                                                        fnr: søknadInnhold
                                                                                            .personopplysninger.fnr,
                                                                                    }
                                                                                )}
                                                                            </Tekstomrade>
                                                                            <Button
                                                                                variant="secondary"
                                                                                type="button"
                                                                                onClick={
                                                                                    handleEpsSkjermingModalContinueClick
                                                                                }
                                                                            >
                                                                                OK
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

                        <div className={styles.formueInputContainer}>
                            <Fieldset
                                legend="Søkers formue"
                                hideLegend
                                className={inputToShow === Hvem.Søker ? styles.aktivFormueBlokk : undefined}
                                error={
                                    errors.verdier &&
                                    inputToShow !== Hvem.Søker &&
                                    formatMessage('feil.måLeggeInn.søkersFormue')
                                }
                                errorPropagation={false}
                            >
                                {inputToShow === Hvem.Søker &&
                                    verdierId.map((keyNavn) => (
                                        <Controller
                                            key={keyNavn}
                                            control={form.control}
                                            name={`verdier.${keyNavn}` as const}
                                            render={({ field, fieldState }) => (
                                                <FormueInput
                                                    tittel={formatMessage(`input.label.${keyNavn}`)}
                                                    className={styles.formueInput}
                                                    inputName={field.name}
                                                    onChange={field.onChange}
                                                    defaultValue={field.value}
                                                    feil={fieldState.error?.message}
                                                    inputRef={field.ref}
                                                />
                                            )}
                                        />
                                    ))}

                                {watch.borSøkerMedEPS && (
                                    <>
                                        <ShowSum tittel={formatMessage('display.søkersFormue')} sum={søkersFormue} />

                                        {inputToShow !== Hvem.Søker ? (
                                            <div>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => onEndreFormueClick(Hvem.Søker)}
                                                    type="button"
                                                >
                                                    {formatMessage('knapp.endreSøkersFormue')}
                                                </Button>
                                                {åpnerNyFormueBlokkMenViserEnBlokk && (
                                                    <Feilmelding>
                                                        {formatMessage('feil.åpnerAnnenPersonFormueMenViserInput')}
                                                    </Feilmelding>
                                                )}
                                            </div>
                                        ) : (
                                            <Button
                                                variant="secondary"
                                                type="button"
                                                onClick={() => onLagreClick(Hvem.Søker)}
                                            >
                                                Lagre
                                            </Button>
                                        )}
                                    </>
                                )}
                            </Fieldset>

                            {watch.borSøkerMedEPS && (
                                <Fieldset
                                    legend="Ektefelle/partners formue"
                                    hideLegend
                                    className={inputToShow === Hvem.Ektefelle ? styles.aktivFormueBlokk : undefined}
                                    error={
                                        errors.epsVerdier &&
                                        inputToShow !== Hvem.Ektefelle &&
                                        formatMessage('feil.måLeggeInn.epsFormue')
                                    }
                                    errorPropagation={false}
                                >
                                    {inputToShow === Hvem.Ektefelle &&
                                        verdierId.map((keyNavn) => (
                                            <Controller
                                                key={keyNavn}
                                                control={form.control}
                                                name={`epsVerdier.${keyNavn}` as const}
                                                render={({ field, fieldState }) => (
                                                    <FormueInput
                                                        tittel={formatMessage(`input.label.${keyNavn}`)}
                                                        className={styles.formueInput}
                                                        inputName={field.name}
                                                        onChange={field.onChange}
                                                        defaultValue={field.value ?? '0'}
                                                        feil={fieldState.error?.message}
                                                        inputRef={field.ref}
                                                    />
                                                )}
                                            />
                                        ))}
                                    <ShowSum
                                        tittel={formatMessage('display.ektefellesFormue')}
                                        sum={ektefellesFormue}
                                    />

                                    {inputToShow !== Hvem.Ektefelle ? (
                                        <div>
                                            <Button
                                                variant="secondary"
                                                className={styles.toggleInput}
                                                onClick={() => onEndreFormueClick(Hvem.Ektefelle)}
                                                type="button"
                                            >
                                                {formatMessage('knapp.endreEktefellesFormue')}
                                            </Button>
                                            {åpnerNyFormueBlokkMenViserEnBlokk && (
                                                <Feilmelding>
                                                    {formatMessage('feil.åpnerAnnenPersonFormueMenViserInput')}
                                                </Feilmelding>
                                            )}
                                        </div>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            className={styles.toggleInput}
                                            type="button"
                                            onClick={() => onLagreClick(Hvem.Ektefelle)}
                                        >
                                            Lagre
                                        </Button>
                                    )}
                                </Fieldset>
                            )}
                        </div>

                        <div className={styles.totalFormueContainer}>
                            <ShowSum tittel={formatMessage('display.totalt')} sum={totalFormue} />

                            <div className={styles.status}>
                                <VilkårvurderingStatusIcon
                                    status={vilkårErOppfylt ? VilkårVurderingStatus.Ok : VilkårVurderingStatus.IkkeOk}
                                />
                                <div className={styles.statusInformasjon}>
                                    <p>
                                        {vilkårErOppfylt
                                            ? formatMessage('display.vilkårOppfylt')
                                            : formatMessage('display.vilkårIkkeOppfylt')}
                                    </p>
                                    <p>
                                        {vilkårErOppfylt
                                            ? formatMessage('display.vilkårOppfyltGrunn')
                                            : formatMessage('display.vilkårIkkeOppfyltGrunn')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Controller
                            control={form.control}
                            name="begrunnelse"
                            render={({ field, fieldState }) => (
                                <Textarea
                                    label={formatMessage('input.label.begrunnelse')}
                                    {...field}
                                    value={field.value || ''}
                                    error={fieldState.error?.message}
                                />
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="status"
                            render={({ field, fieldState }) => (
                                <Checkbox
                                    className={styles.henteMerInfoCheckbox}
                                    {...field}
                                    error={fieldState.error?.message}
                                    checked={field.value === FormueStatus.MåInnhenteMerInformasjon}
                                    onChange={() => {
                                        field.onChange(
                                            field.value === FormueStatus.VilkårOppfylt
                                                ? FormueStatus.MåInnhenteMerInformasjon
                                                : FormueStatus.VilkårOppfylt
                                        );
                                    }}
                                >
                                    {formatMessage('checkbox.henteMerInfo')}
                                </Checkbox>
                            )}
                        />

                        {pipe(
                            RemoteData.combine(lagreBehandlingsinformasjonStatus, lagreEpsGrunnlagStatus),
                            RemoteData.fold(
                                () => null,
                                () => <NavFrontendSpinner>{formatMessage('display.lagre.lagrer')}</NavFrontendSpinner>,
                                (err) => <ApiErrorAlert error={err} />,
                                () => null
                            )
                        )}

                        <Feiloppsummering
                            tittel={formatMessage('feiloppsummering.title')}
                            hidden={!isSubmitted || isValid}
                            feil={hookFormErrorsTilFeiloppsummering(errors)}
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
                ),
                right: <FormueFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Formue;
