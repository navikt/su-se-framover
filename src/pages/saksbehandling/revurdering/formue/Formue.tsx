import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Delete } from '@navikt/ds-icons';
import { Panel, Accordion, Button, TextField, Heading, Label, BodyShort, Loader } from '@navikt/ds-react';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Control,
    Controller,
    FieldArrayWithId,
    FieldErrors,
    useFieldArray,
    useForm,
    UseFormTrigger,
    UseFormWatch,
} from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import * as personApi from '~src/api/personApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import { PeriodeForm } from '~src/components/formElements/FormElements';
import { Personkort } from '~src/components/personkort/Personkort';
import Formuestatus from '~src/components/revurdering/formuestatus/Formuestatus';
import FormuevilkårOppsummering from '~src/components/revurdering/oppsummering/formuevilkåroppsummering/FormuevilkårOppsummering';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { lagreFormuegrunnlag } from '~src/features/revurdering/revurderingActions';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import sharedMessages from '~src/pages/saksbehandling/revurdering/revurdering-nb';
import {
    Bosituasjon,
    bosituasjonPåDato,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { Formuegrenser } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { NullablePeriode, Periode } from '~src/types/Periode';
import { RevurderingStegProps } from '~src/types/Revurdering';
import { toStringDateOrNull } from '~src/utils/date/dateUtils';
import { regnUtFormDataVerdier, verdierId } from '~src/utils/søknadsbehandlingOgRevurdering/formue/formueSøbOgRevUtils';
import sharedFormueMessages from '~src/utils/søknadsbehandlingOgRevurdering/formue/sharedFormueMessages-nb';

import { Navigasjonsknapper } from '../bunnknapper/Navigasjonsknapper';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';
import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';

import messages from './formue-nb';
import * as styles from './formue.module.less';
import {
    erFormueVilkårOppfylt,
    FormueData,
    FormueFormData,
    formueFormDataTilFormuegrunnlagRequest,
    getDefaultValues,
    getTomFormueData,
    revurderFormueSchema,
} from './formueUtils';

const Formue = (props: RevurderingStegProps) => {
    const formuegrenser = props.grunnlagsdataOgVilkårsvurderinger.formue.formuegrenser;
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [lagreFormuegrunnlagStatus, lagreFormuegrunnlagAction] = useAsyncActionCreator(lagreFormuegrunnlag);

    const {
        control,
        trigger,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isValid, isSubmitted },
    } = useForm<FormueFormData>({
        defaultValues: getDefaultValues(
            props.revurdering.grunnlagsdataOgVilkårsvurderinger.formue,
            props.revurdering.grunnlagsdataOgVilkårsvurderinger.bosituasjon
        ),
        resolver: yupResolver(revurderFormueSchema),
    });

    const formueArray = useFieldArray({
        name: 'formue',
        control: control,
    });

    const lagreFormuegrunnlaget = (data: FormueFormData, gåtil: 'neste' | 'avbryt') => {
        lagreFormuegrunnlagAction(
            {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                formue: formueFormDataTilFormuegrunnlagRequest(data.formue),
            },
            (res) => {
                if (res.feilmeldinger.length === 0) {
                    navigate(gåtil === 'neste' ? props.nesteUrl : props.avsluttUrl);
                }
            }
        );
    };

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <form
                        onSubmit={handleSubmit((values) => lagreFormuegrunnlaget(values, 'neste'))}
                        className={styles.container}
                    >
                        <ul className={styles.formueBlokkContainer}>
                            {formueArray.fields.map((field, index) => (
                                <li key={field.id}>
                                    <Panel border>
                                        <FormueBlokk
                                            revurderingsperiode={props.revurdering.periode}
                                            blokkIndex={index}
                                            blokkField={field}
                                            bosituasjonsgrunnlag={
                                                props.revurdering.grunnlagsdataOgVilkårsvurderinger.bosituasjon
                                            }
                                            formueArrayLengde={formueArray.fields.length}
                                            formController={control}
                                            triggerValidation={trigger}
                                            onSlettClick={() => formueArray.remove(index)}
                                            formuegrenser={formuegrenser}
                                            watch={watch}
                                            update={(idx: number, data: FormueData) => {
                                                setValue(`formue.${idx}`, data);
                                            }}
                                            errors={errors}
                                        />
                                    </Panel>
                                </li>
                            ))}
                        </ul>
                        <div className={styles.nyPeriodeKnappContainer}>
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={() => {
                                    formueArray.append(getTomFormueData());
                                }}
                            >
                                {formatMessage('knapp.nyPeriode')}
                            </Button>
                        </div>
                        <Feiloppsummering
                            tittel={formatMessage('feiloppsummering.tittel')}
                            feil={hookFormErrorsTilFeiloppsummering(errors)}
                            hidden={isValid || !isSubmitted}
                        />
                        {RemoteData.isFailure(lagreFormuegrunnlagStatus) && (
                            <ApiErrorAlert error={lagreFormuegrunnlagStatus.error} />
                        )}
                        {RemoteData.isSuccess(lagreFormuegrunnlagStatus) && (
                            <UtfallSomIkkeStøttes feilmeldinger={lagreFormuegrunnlagStatus.value.feilmeldinger} />
                        )}
                        <Navigasjonsknapper
                            tilbake={props.forrige}
                            loading={RemoteData.isPending(lagreFormuegrunnlagStatus)}
                            onLagreOgFortsettSenereClick={handleSubmit((values) =>
                                lagreFormuegrunnlaget(values, 'avbryt')
                            )}
                        />
                    </form>
                ),
                right: (
                    <div>
                        <div className={styles.eksisterendeVedtakTittelContainer}>
                            <Heading level="2" size="large">
                                {formatMessage('eksisterende.vedtakinfo.tittel')}
                            </Heading>
                        </div>
                        <FormuevilkårOppsummering gjeldendeFormue={props.grunnlagsdataOgVilkårsvurderinger.formue} />
                    </div>
                ),
            }}
        </ToKolonner>
    );
};

const FormueBlokk = (props: {
    revurderingsperiode: Periode<string>;
    blokkIndex: number;
    blokkField: FieldArrayWithId<FormueFormData>;
    formuegrenser: Formuegrenser[];
    formueArrayLengde: number;
    bosituasjonsgrunnlag: Bosituasjon[];
    formController: Control<FormueFormData>;
    triggerValidation: UseFormTrigger<FormueFormData>;
    onSlettClick: (index: number) => void;
    watch: UseFormWatch<FormueFormData>;
    update: (idx: number, data: FormueData) => void;
    errors: FieldErrors<FormueFormData>;
}) => {
    const [søkersBekreftetFormue, setSøkersBekreftetFormue] = useState<number>(
        regnUtFormDataVerdier(props.blokkField.søkersFormue)
    );
    const [epsBekreftetFormue, setEPSBekreftetFormue] = useState<number>(
        regnUtFormDataVerdier(props.blokkField.epsFormue)
    );

    const watch = props.watch().formue[props.blokkIndex];
    const fraOgMed = watch.periode.fraOgMed;
    const bosituasjon = fraOgMed
        ? bosituasjonPåDato(props.bosituasjonsgrunnlag, toStringDateOrNull(fraOgMed)!)
        : undefined;
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });
    const [epsStatus, hentEPS, resetToInitial] = useApiCall(personApi.fetchPerson);
    const blokkName = `formue.${props.blokkIndex}` as const;

    useEffect(() => {
        if (bosituasjon?.fnr) {
            hentEPS(bosituasjon.fnr);
        } else {
            resetToInitial();
        }
    }, [bosituasjon?.fnr]);

    const erVilkårOppfylt = erFormueVilkårOppfylt(
        søkersBekreftetFormue,
        epsBekreftetFormue,
        fraOgMed,
        props.formuegrenser
    );

    const revurderingsperiode = {
        fraOgMed: new Date(props.revurderingsperiode.fraOgMed),
        tilOgMed: new Date(props.revurderingsperiode.tilOgMed),
    };

    return (
        <div className={styles.formueBlokk}>
            <div className={styles.periodeOgSøppelbøtteContainer}>
                <PeriodeForm
                    name={`${blokkName}.periode`}
                    value={watch.periode}
                    onChange={(periode: NullablePeriode) =>
                        props.update(props.blokkIndex, { ...watch, periode: periode })
                    }
                    error={props.errors?.formue?.[props.blokkIndex]?.periode}
                    minDate={{
                        fraOgMed: revurderingsperiode.fraOgMed,
                        tilOgMed: revurderingsperiode.tilOgMed,
                    }}
                    maxDate={{
                        fraOgMed: revurderingsperiode.fraOgMed,
                        tilOgMed: revurderingsperiode.tilOgMed,
                    }}
                />

                {props.formueArrayLengde > 1 && (
                    <Button
                        variant="secondary"
                        className={styles.søppelbøtte}
                        type="button"
                        onClick={() => {
                            props.onSlettClick(props.blokkIndex);
                        }}
                        size="small"
                        aria-label={formatMessage('knapp.fjernPeriode')}
                    >
                        <Delete />
                    </Button>
                )}
            </div>

            {watch.periode.fraOgMed && watch.periode.tilOgMed && (
                <>
                    {RemoteData.isPending(epsStatus) && <Loader />}
                    {RemoteData.isSuccess(epsStatus) && (
                        <div className={styles.personkortContainer}>
                            <Label>{formatMessage('personkort.eps')}</Label>
                            <Personkort person={epsStatus.value} />
                        </div>
                    )}

                    <div className={styles.formuePanelerContainer}>
                        <Accordion>
                            <FormuePanel
                                tilhører={'Søkers'}
                                blokkIndex={props.blokkIndex}
                                sumFormue={søkersBekreftetFormue}
                                setBekreftetFormue={setSøkersBekreftetFormue}
                                formController={props.formController}
                                triggerValidation={props.triggerValidation}
                                watch={props.watch}
                            />
                            {bosituasjon?.fnr && (
                                <FormuePanel
                                    tilhører={'Ektefelle/Samboers'}
                                    blokkIndex={props.blokkIndex}
                                    sumFormue={epsBekreftetFormue}
                                    setBekreftetFormue={setEPSBekreftetFormue}
                                    formController={props.formController}
                                    triggerValidation={props.triggerValidation}
                                    watch={props.watch}
                                />
                            )}
                        </Accordion>
                    </div>

                    <Formuestatus
                        bekreftetFormue={søkersBekreftetFormue + epsBekreftetFormue}
                        erVilkårOppfylt={erVilkårOppfylt}
                    />
                </>
            )}
        </div>
    );
};

const FormuePanel = (props: {
    tilhører: 'Søkers' | 'Ektefelle/Samboers';
    blokkIndex: number;
    sumFormue: number;
    setBekreftetFormue: (formue: number) => void;
    formController: Control<FormueFormData>;
    triggerValidation: UseFormTrigger<FormueFormData>;
    watch: UseFormWatch<FormueFormData>;
}) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedFormueMessages } });
    const [åpen, setÅpen] = useState<boolean>(false);
    const formueTilhører = props.tilhører === 'Søkers' ? 'søkersFormue' : 'epsFormue';
    const panelName = `formue.${props.blokkIndex}.${formueTilhører}` as const;

    const watch = props.watch();
    const formueVerdier = watch.formue[props.blokkIndex]?.[formueTilhører];

    const handlePanelKlikk = () => (åpen ? handleBekreftClick() : setÅpen(true));

    const utregnetFormue = useMemo(() => {
        return regnUtFormDataVerdier(formueVerdier);
    }, [watch]);

    const handleBekreftClick = () => {
        props.triggerValidation(panelName).then((isPanelValid) => {
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
                        {formatMessage(props.tilhører === 'Søkers' ? 'panel.formue.søkers' : 'panel.formue.eps')}
                    </BodyShort>
                    <p>
                        {props.sumFormue} {formatMessage('panel.kroner')}
                    </p>
                </div>
            </Accordion.Header>
            <Accordion.Content>
                <ul className={styles.formueInputs}>
                    {verdierId.map((id) => {
                        return (
                            <li key={id}>
                                <Controller
                                    name={`${panelName}.${id}`}
                                    control={props.formController}
                                    defaultValue={formueVerdier?.[id] ?? '0'}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            id={field.name}
                                            label={formatMessage(`formuepanel.${id}`)}
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
                    <BodyShort>{formatMessage('formuepanel.nyBeregning')}</BodyShort>
                    <Label>
                        {utregnetFormue} {formatMessage('panel.kroner')}
                    </Label>
                </div>

                <Button variant="secondary" type="button" onClick={() => handleBekreftClick()}>
                    {formatMessage('knapp.bekreft')}
                </Button>
            </Accordion.Content>
        </Accordion.Item>
    );
};

export default Formue;
