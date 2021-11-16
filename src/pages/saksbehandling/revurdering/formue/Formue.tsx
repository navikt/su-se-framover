import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Delete } from '@navikt/ds-icons';
import { Panel, Accordion, Button, Loader, Textarea, TextField, Heading, Label, BodyShort } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Control,
    Controller,
    FieldArrayWithId,
    useFieldArray,
    useForm,
    UseFormTrigger,
    UseFormWatch,
} from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import * as personApi from '~api/personApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import DatePicker from '~components/datePicker/DatePicker';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import { Personkort } from '~components/personkort/Personkort';
import Formuestatus from '~components/revurdering/formuestatus/Formuestatus';
import FormuevilkårOppsummering from '~components/revurdering/oppsummering/formuevilkåroppsummering/FormuevilkårOppsummering';
import ToKolonner from '~components/toKolonner/ToKolonner';
import { lagreFormuegrunnlag } from '~features/revurdering/revurderingActions';
import { useApiCall, useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';
import { getDateErrorMessage, hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { Formuegrenser } from '~types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { Periode } from '~types/Periode';
import { RevurderingProps } from '~types/Revurdering';
import { hentBosituasjongrunnlag } from '~utils/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';
import { regnUtFormDataVerdier, verdierId } from '~utils/søknadsbehandlingOgRevurdering/formue/formueSøbOgRevUtils';
import sharedFormueMessages from '~utils/søknadsbehandlingOgRevurdering/formue/sharedFormueMessages-nb';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';
import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';

import messages from './formue-nb';
import styles from './formue.module.less';
import {
    erFormueVilkårOppfylt,
    FormueFormData,
    formueFormDataTilFormuegrunnlagRequest,
    getDefaultValues,
    getTomFormueData,
    revurderFormueSchema,
} from './formueUtils';

const Formue = (props: RevurderingProps) => {
    const formuegrenser = props.gjeldendeGrunnlagsdataOgVilkårsvurderinger.formue.formuegrenser;
    const history = useHistory();
    const { formatMessage } = useI18n({ messages });
    const [epsStatus, hentEPS] = useApiCall(personApi.fetchPerson);
    const epsFnr = hentBosituasjongrunnlag(props.revurdering.grunnlagsdataOgVilkårsvurderinger).fnr;
    const [lagreFormuegrunnlagStatus, lagreFormuegrunnlagAction] = useAsyncActionCreator(lagreFormuegrunnlag);

    const {
        control,
        trigger,
        handleSubmit,
        watch,
        formState: { errors, isValid, isSubmitted },
    } = useForm<FormueFormData>({
        defaultValues: getDefaultValues(props.revurdering.grunnlagsdataOgVilkårsvurderinger.formue, epsFnr),
        resolver: yupResolver(revurderFormueSchema),
    });

    const formueArray = useFieldArray({
        name: 'formue',
        control: control,
    });

    const lagreFormuegrunnlaget = (data: FormueFormData) => {
        lagreFormuegrunnlagAction(
            {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                formue: formueFormDataTilFormuegrunnlagRequest(data.formue),
            },
            (res) => {
                if (res.feilmeldinger.length === 0) {
                    history.push(props.nesteUrl(res.revurdering));
                }
            }
        );
    };

    useEffect(() => {
        if (RemoteData.isSuccess(epsStatus) && epsStatus.value.fnr === epsFnr) {
            return;
        }
        if (epsFnr) {
            hentEPS(epsFnr);
        }
    }, [epsFnr, hentEPS, epsStatus]);

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <form onSubmit={handleSubmit(lagreFormuegrunnlaget)} className={styles.container}>
                        {RemoteData.isPending(epsStatus) && <Loader />}
                        {RemoteData.isFailure(epsStatus) && <ApiErrorAlert error={epsStatus.error} />}
                        <ul className={styles.formueBlokkContainer}>
                            {formueArray.fields.map((field, index) => (
                                <li key={field.id}>
                                    <Panel border>
                                        <FormueBlokk
                                            revurderingsperiode={props.revurdering.periode}
                                            blokkIndex={index}
                                            blokkField={field}
                                            formueArrayLengde={formueArray.fields.length}
                                            eps={RemoteData.isSuccess(epsStatus) ? epsStatus.value : null}
                                            formController={control}
                                            triggerValidation={trigger}
                                            onSlettClick={() => formueArray.remove(index)}
                                            formuegrenser={formuegrenser}
                                            watch={watch}
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
                                    formueArray.append(getTomFormueData(epsFnr));
                                }}
                            >
                                {formatMessage('knapp.nyPeriode')}
                            </Button>
                        </div>
                        <Feiloppsummering
                            tittel={formatMessage('feiloppsummering.tittel')}
                            className={styles.feiloppsummering}
                            feil={hookFormErrorsTilFeiloppsummering(errors)}
                            hidden={isValid || !isSubmitted}
                        />
                        {RemoteData.isFailure(lagreFormuegrunnlagStatus) && (
                            <ApiErrorAlert error={lagreFormuegrunnlagStatus.error} />
                        )}
                        {RemoteData.isSuccess(lagreFormuegrunnlagStatus) && (
                            <UtfallSomIkkeStøttes feilmeldinger={lagreFormuegrunnlagStatus.value.feilmeldinger} />
                        )}
                        <RevurderingBunnknapper
                            onNesteClick="submit"
                            tilbakeUrl={props.forrigeUrl}
                            onNesteClickSpinner={RemoteData.isPending(lagreFormuegrunnlagStatus)}
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
                        <FormuevilkårOppsummering
                            gjeldendeFormue={props.gjeldendeGrunnlagsdataOgVilkårsvurderinger.formue}
                        />
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
    eps: Nullable<personApi.Person>;
    formController: Control<FormueFormData>;
    triggerValidation: UseFormTrigger<FormueFormData>;
    onSlettClick: (index: number) => void;
    watch: UseFormWatch<FormueFormData>;
}) => {
    const { formatMessage } = useI18n({ messages });
    const blokkName = `formue.${props.blokkIndex}` as const;
    const [søkersBekreftetFormue, setSøkersBekreftetFormue] = useState<number>(
        regnUtFormDataVerdier(props.blokkField.søkersFormue)
    );
    const [epsBekreftetFormue, setEPSBekreftetFormue] = useState<number>(
        regnUtFormDataVerdier(props.blokkField.epsFormue)
    );

    const watch = props.watch().formue[props.blokkIndex];

    const erVilkårOppfylt = erFormueVilkårOppfylt(
        søkersBekreftetFormue,
        epsBekreftetFormue,
        watch.periode.fraOgMed,
        props.formuegrenser
    );

    const revurderingsperiode = {
        fraOgMed: new Date(props.revurderingsperiode.fraOgMed),
        tilOgMed: new Date(props.revurderingsperiode.tilOgMed),
    };

    return (
        <div className={styles.formueBlokk}>
            <div className={styles.periodeOgSøppelbøtteContainer}>
                <div className={styles.periodeContainer}>
                    <Controller
                        control={props.formController}
                        name={`${blokkName}.periode.fraOgMed`}
                        defaultValue={props.blokkField.periode.fraOgMed}
                        render={({ field, fieldState }) => (
                            <DatePicker
                                id={field.name}
                                label={formatMessage('periode.fraOgMed')}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                isClearable
                                autoComplete="off"
                                value={field.value}
                                onChange={(date: Date | null) => {
                                    field.onChange(date ? DateFns.startOfMonth(date) : null);
                                }}
                                feil={getDateErrorMessage(fieldState.error)}
                                minDate={revurderingsperiode.fraOgMed}
                                maxDate={revurderingsperiode.tilOgMed}
                                startDate={field.value}
                                endDate={watch.periode.tilOgMed}
                            />
                        )}
                    />
                    <Controller
                        control={props.formController}
                        name={`${blokkName}.periode.tilOgMed`}
                        defaultValue={props.blokkField.periode.tilOgMed}
                        render={({ field, fieldState }) => (
                            <DatePicker
                                id={field.name}
                                label={formatMessage('periode.tilOgMed')}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                isClearable
                                autoComplete="off"
                                value={field.value}
                                onChange={(date: Date | null) => {
                                    field.onChange(date ? DateFns.endOfMonth(date) : null);
                                }}
                                feil={getDateErrorMessage(fieldState.error)}
                                minDate={watch.periode.fraOgMed}
                                maxDate={revurderingsperiode.tilOgMed}
                                startDate={watch.periode.fraOgMed}
                                endDate={field.value}
                            />
                        )}
                    />
                </div>
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

            {props.eps && (
                <div className={styles.personkortContainer}>
                    <Label>{formatMessage('personkort.eps')}</Label>
                    <Personkort person={props.eps} />
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
                    {props.eps && (
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

            <div className={styles.begrunnelseContainer}>
                <Controller
                    control={props.formController}
                    name={`${blokkName}.begrunnelse`}
                    defaultValue={props.blokkField.begrunnelse}
                    render={({ field, fieldState }) => (
                        <Textarea
                            label={formatMessage('formueblokk.begrunnelse')}
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            </div>
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
