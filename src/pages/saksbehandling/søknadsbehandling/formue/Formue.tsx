import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import fnrValidator from '@navikt/fnrvalidator';
import { startOfMonth } from 'date-fns/esm';
import AlertStripe from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import { Input, Textarea, Checkbox, RadioGruppe, Radio, Feiloppsummering, SkjemaGruppe } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import Tekstomrade, { BoldRule, HighlightRule, LinebreakRule } from 'nav-frontend-tekstomrade';
import { Element, Feilmelding, Undertittel } from 'nav-frontend-typografi';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { ErrorCode } from '~api/apiClient';
import * as personApi from '~api/personApi';
import { FormueFaktablokk } from '~components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/FormueFaktablokk';
import { Personkort } from '~components/personkort/Personkort';
import ToKolonner from '~components/toKolonner/ToKolonner';
import VilkårvurderingStatusIcon from '~components/VilkårvurderingStatusIcon';
import personSlice from '~features/person/person.slice';
import sakSliceActions, * as sakSlice from '~features/saksoversikt/sak.slice';
import { focusAfterTimeout } from '~lib/formUtils';
import { pipe } from '~lib/fp';
import { useApiCall, useAsyncActionCreator, useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering, validateStringAsNonNegativeNumber } from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { Behandling } from '~types/Behandling';
import { FormueStatus, Formue as FormueType } from '~types/Behandlingsinformasjon';
import { VilkårVurderingStatus } from '~types/Vilkårsvurdering';
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
} from './utils';

const VerdierSchema: yup.ObjectSchema<VerdierFormData | undefined> = yup.object<VerdierFormData>({
    verdiPåBolig: validateStringAsNonNegativeNumber('Verdi på boliger'),
    verdiPåEiendom: validateStringAsNonNegativeNumber('Verdi på eiendommene'),
    verdiPåKjøretøy: validateStringAsNonNegativeNumber('Verdi bil'),
    innskuddsbeløp: validateStringAsNonNegativeNumber('Innskudd på konto'),
    verdipapir: validateStringAsNonNegativeNumber('Verdipapirer og aksjefond'),
    stårNoenIGjeldTilDeg: validateStringAsNonNegativeNumber('Om noen skylder søker penger'),
    kontanterOver1000: validateStringAsNonNegativeNumber('Kontanter'),
    depositumskonto: validateStringAsNonNegativeNumber('Depositumskontoverdi'),
});

const schema = yup.object<FormueFormData>({
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
});

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
            history.push(nesteUrl);
            return;
        }

        lagreEpsGrunnlag(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                epsFnr: values.epsFnr,
            },
            () => {
                lagreBehandlingsinformasjon(
                    {
                        sakId: props.sakId,
                        behandlingId: props.behandling.id,
                        behandlingsinformasjon: { formue: formueValues },
                    },
                    () => {
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
        defaultValues: getFormueInitialValues(
            props.behandling.behandlingsinformasjon,
            søknadInnhold,
            props.behandling.grunnlagsdataOgVilkårsvurderinger
        ),
        resolver: yupResolver(schema),
    });
    const watch = form.watch();

    const søkersFormue = useMemo(() => {
        return regnUtFormDataVerdier(watch.verdier);
    }, [watch.verdier]);

    const ektefellesFormue = useMemo(() => {
        return regnUtFormDataVerdier(watch.epsVerdier);
    }, [watch.epsVerdier]);

    const totalFormue = søkersFormue + (watch.borSøkerMedEPS ? ektefellesFormue : 0);

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
                            <Element>{formatMessage('input.label.borSøkerMedEktefelle')}</Element>
                            <Controller
                                control={form.control}
                                name="borSøkerMedEPS"
                                render={({ field, fieldState }) => (
                                    <RadioGruppe feil={fieldState.error?.message} onBlur={field.onBlur}>
                                        <Radio
                                            id={field.name}
                                            radioRef={field.ref}
                                            label="Ja"
                                            name={field.name}
                                            checked={field.value}
                                            onChange={() => {
                                                field.onChange(true);
                                            }}
                                        />
                                        <Radio
                                            label="Nei"
                                            name={field.name}
                                            checked={field.value === false}
                                            onChange={() => {
                                                field.onChange(false);
                                            }}
                                        />
                                    </RadioGruppe>
                                )}
                            />
                            {watch.borSøkerMedEPS && (
                                <>
                                    <Element>{formatMessage('input.label.ektefellesFødselsnummer')}</Element>
                                    <div className={styles.fnrInput}>
                                        <Controller
                                            control={form.control}
                                            name="epsFnr"
                                            render={({ field, fieldState }) => (
                                                <Input
                                                    id={field.name}
                                                    bredde="S"
                                                    feil={fieldState.error?.message}
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
                                                        <AlertStripe type="feil">
                                                            {err?.statusCode === ErrorCode.Unauthorized ? (
                                                                <ModalWrapper
                                                                    isOpen={true}
                                                                    onRequestClose={() => {
                                                                        return;
                                                                    }}
                                                                    contentLabel={formatMessage(
                                                                        'modal.skjerming.ariaBeskrivelse'
                                                                    )}
                                                                    closeButton={false}
                                                                    contentClass={styles.modalInnhold}
                                                                >
                                                                    <Undertittel>
                                                                        {formatMessage('modal.skjerming.heading')}
                                                                    </Undertittel>
                                                                    <Tekstomrade
                                                                        className={styles.modalTekst}
                                                                        rules={[BoldRule, HighlightRule, LinebreakRule]}
                                                                    >
                                                                        {formatMessage('modal.skjerming.innhold', {
                                                                            navn: showName(props.søker.navn),
                                                                            fnr: søknadInnhold.personopplysninger.fnr,
                                                                        })}
                                                                    </Tekstomrade>
                                                                    <Knapp
                                                                        htmlType="button"
                                                                        onClick={handleEpsSkjermingModalContinueClick}
                                                                    >
                                                                        OK
                                                                    </Knapp>
                                                                </ModalWrapper>
                                                            ) : err?.statusCode === ErrorCode.NotFound ? (
                                                                formatMessage('feilmelding.ikkeFunnet')
                                                            ) : (
                                                                formatMessage('feilmelding.ukjent')
                                                            )}
                                                        </AlertStripe>
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
                            <SkjemaGruppe
                                className={inputToShow === Hvem.Søker ? styles.aktivFormueBlokk : undefined}
                                feil={
                                    errors.verdier &&
                                    inputToShow !== Hvem.Søker &&
                                    formatMessage('feil.måLeggeInn.søkersFormue')
                                }
                                utenFeilPropagering
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
                                                    defaultValue={field.value ?? '0'}
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
                                                <Knapp
                                                    className={styles.toggleInput}
                                                    onClick={() => onEndreFormueClick(Hvem.Søker)}
                                                    htmlType="button"
                                                >
                                                    {formatMessage('knapp.endreSøkersFormue')}
                                                </Knapp>
                                                {åpnerNyFormueBlokkMenViserEnBlokk && (
                                                    <Feilmelding>
                                                        {formatMessage('feil.åpnerAnnenPersonFormueMenViserInput')}
                                                    </Feilmelding>
                                                )}
                                            </div>
                                        ) : (
                                            <Knapp
                                                htmlType="button"
                                                className={styles.toggleInput}
                                                onClick={() => onLagreClick(Hvem.Søker)}
                                            >
                                                Lagre
                                            </Knapp>
                                        )}
                                    </>
                                )}
                            </SkjemaGruppe>

                            {watch.borSøkerMedEPS && (
                                <SkjemaGruppe
                                    className={inputToShow === Hvem.Ektefelle ? styles.aktivFormueBlokk : undefined}
                                    feil={
                                        errors.epsVerdier &&
                                        inputToShow !== Hvem.Ektefelle &&
                                        formatMessage('feil.måLeggeInn.epsFormue')
                                    }
                                    utenFeilPropagering
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
                                            <Knapp
                                                className={styles.toggleInput}
                                                onClick={() => onEndreFormueClick(Hvem.Ektefelle)}
                                                htmlType="button"
                                            >
                                                {formatMessage('knapp.endreEktefellesFormue')}
                                            </Knapp>
                                            {åpnerNyFormueBlokkMenViserEnBlokk && (
                                                <Feilmelding>
                                                    {formatMessage('feil.åpnerAnnenPersonFormueMenViserInput')}
                                                </Feilmelding>
                                            )}
                                        </div>
                                    ) : (
                                        <Knapp
                                            className={styles.toggleInput}
                                            htmlType="button"
                                            onClick={() => onLagreClick(Hvem.Ektefelle)}
                                        >
                                            Lagre
                                        </Knapp>
                                    )}
                                </SkjemaGruppe>
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
                                    feil={fieldState.error?.message}
                                />
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="status"
                            render={({ field, fieldState }) => (
                                <Checkbox
                                    label={formatMessage('checkbox.henteMerInfo')}
                                    className={styles.henteMerInfoCheckbox}
                                    {...field}
                                    feil={fieldState.error?.message}
                                    checked={field.value === FormueStatus.MåInnhenteMerInformasjon}
                                    onChange={() => {
                                        field.onChange(
                                            field.value === FormueStatus.VilkårOppfylt
                                                ? FormueStatus.MåInnhenteMerInformasjon
                                                : FormueStatus.VilkårOppfylt
                                        );
                                    }}
                                />
                            )}
                        />

                        {pipe(
                            RemoteData.combine(lagreBehandlingsinformasjonStatus, lagreEpsGrunnlagStatus),
                            RemoteData.fold(
                                () => null,
                                () => <NavFrontendSpinner>{formatMessage('display.lagre.lagrer')}</NavFrontendSpinner>,
                                (error) => (
                                    <AlertStripe type="feil">
                                        {error?.body?.code === 'ugyldige_verdier_på_formue'
                                            ? formatMessage('feilmelding.ugyldigeVerdier.depositum')
                                            : formatMessage('display.lagre.lagringFeilet')}
                                    </AlertStripe>
                                ),
                                () => null
                            )
                        )}

                        <Feiloppsummering
                            tittel={formatMessage('feiloppsummering.title')}
                            hidden={!isSubmitted || isValid}
                            feil={hookFormErrorsTilFeiloppsummering(errors)}
                            innerRef={feiloppsummeringRef}
                        />
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                form.handleSubmit(
                                    handleSave(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })),
                                    focusAfterTimeout(feiloppsummeringRef)
                                );
                            }}
                        />
                    </form>
                ),
                right: <FormueFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Formue;
