import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Delete } from '@navikt/ds-icons';
import * as DateFns from 'date-fns';
import { EkspanderbartpanelBase } from 'nav-frontend-ekspanderbartpanel';
import { Knapp } from 'nav-frontend-knapper';
import { Input, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Element, Ingress, Normaltekst, Undertittel } from 'nav-frontend-typografi';
import React, { useEffect, useState } from 'react';
import {
    Control,
    Controller,
    FieldArrayWithId,
    useFieldArray,
    useForm,
    useFormState,
    UseFormTrigger,
    useWatch,
} from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import * as personApi from '~api/personApi';
import DatePicker from '~components/datePicker/DatePicker';
import { Personkort } from '~components/personkort/Personkort';
import Formuestatus from '~components/revurdering/formuestatus/Formuestatus';
import FormuevilkårOppsummering from '~components/revurdering/oppsummering/formuevilkåroppsummering/FormuevilkårOppsummering';
import RevurderingskallFeilet from '~components/revurdering/revurderingskallFeilet/RevurderingskallFeilet';
import ToKolonner from '~components/toKolonner/ToKolonner';
import { lagreFormuegrunnlag } from '~features/revurdering/revurderingActions';
import { useApiCall, useAsyncActionCreator, useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import { Formuegrenser } from '~types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { Periode } from '~types/Periode';
import { RevurderingProps } from '~types/Revurdering';
import { hentBosituasjongrunnlag } from '~utilsLOL/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';
import { regnUtFormDataVerdier, verdierId } from '~utilsLOL/søknadsbehandlingOgRevurdering/formue/formueSøbOgRevUtils';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';

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
    const { intl } = useI18n({ messages });
    const [epsStatus, hentEPS] = useApiCall(personApi.fetchPerson);
    const epsFnr = hentBosituasjongrunnlag(props.revurdering.grunnlagsdataOgVilkårsvurderinger).fnr;
    const [lagreFormuegrunnlagStatus, lagreFormuegrunnlagAction] = useAsyncActionCreator(lagreFormuegrunnlag);

    const { control, trigger, handleSubmit } = useForm<FormueFormData>({
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
                history.push(props.nesteUrl(res));
            }
        );
    };

    useEffect(() => {
        if (epsFnr) {
            hentEPS(epsFnr);
        }
    }, [epsFnr]);

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <form onSubmit={handleSubmit(lagreFormuegrunnlaget)}>
                        {RemoteData.isPending(epsStatus) && <NavFrontendSpinner />}
                        {RemoteData.isFailure(epsStatus) && <RevurderingskallFeilet error={epsStatus.error} />}
                        {formueArray.fields.map((field, index) => (
                            <FormueBlokk
                                key={field.id}
                                revurderingsperiode={props.revurdering.periode}
                                blokkIndex={index}
                                blokkField={field}
                                formueArrayLengde={formueArray.fields.length}
                                eps={RemoteData.isSuccess(epsStatus) ? epsStatus.value : null}
                                formController={control}
                                triggerValidation={trigger}
                                onSlettClick={() => formueArray.remove(index)}
                                formuegrenser={formuegrenser}
                            />
                        ))}
                        <div className={styles.nyPeriodeKnappContainer}>
                            <Knapp
                                htmlType="button"
                                onClick={() => {
                                    formueArray.append(getTomFormueData(epsFnr));
                                }}
                            >
                                {intl.formatMessage({ id: 'knapp.nyPeriode' })}
                            </Knapp>
                        </div>
                        {RemoteData.isFailure(lagreFormuegrunnlagStatus) && (
                            <RevurderingskallFeilet error={lagreFormuegrunnlagStatus.error} />
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
                            <Ingress>{intl.formatMessage({ id: 'eksisterende.vedtakinfo.tittel' })}</Ingress>
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
}) => {
    const { intl } = useI18n({ messages });
    const blokkName = `formue.${props.blokkIndex}` as const;
    const [søkersBekreftetFormue, setSøkersBekreftetFormue] = useState<number>(
        regnUtFormDataVerdier(props.blokkField.søkersFormue)
    );
    const [epsBekreftetFormue, setEPSBekreftetFormue] = useState<number>(
        regnUtFormDataVerdier(props.blokkField.epsFormue)
    );

    const watch = useWatch({
        name: blokkName,
        control: props.formController,
    });

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
                                label={intl.formatMessage({ id: 'periode.fraOgMed' })}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                isClearable
                                autoComplete="off"
                                value={field.value}
                                onChange={(date) => {
                                    field.onChange(
                                        date
                                            ? Array.isArray(date)
                                                ? DateFns.startOfMonth(date[0])
                                                : DateFns.startOfMonth(date)
                                            : null
                                    );
                                }}
                                feil={fieldState.error?.message}
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
                                label={intl.formatMessage({ id: 'periode.tilOgMed' })}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                isClearable
                                autoComplete="off"
                                value={field.value}
                                onChange={(date) => {
                                    field.onChange(
                                        date
                                            ? Array.isArray(date)
                                                ? DateFns.endOfMonth(date[0])
                                                : DateFns.endOfMonth(date)
                                            : null
                                    );
                                }}
                                feil={fieldState.error?.message}
                                minDate={watch.periode.fraOgMed}
                                maxDate={revurderingsperiode.tilOgMed}
                                startDate={watch.periode.fraOgMed}
                                endDate={field.value}
                            />
                        )}
                    />
                </div>
                {props.formueArrayLengde > 1 && (
                    <Knapp
                        className={styles.søppelbøtte}
                        htmlType="button"
                        onClick={() => {
                            props.onSlettClick(props.blokkIndex);
                        }}
                        kompakt
                        aria-label={intl.formatMessage({ id: 'knapp.fjernPeriode' })}
                    >
                        <Delete />
                    </Knapp>
                )}
            </div>

            {props.eps && (
                <div className={styles.personkortContainer}>
                    <Element>{intl.formatMessage({ id: 'personkort.eps' })}</Element>
                    <Personkort person={props.eps} />
                </div>
            )}

            <div className={styles.formuePanelerContainer}>
                <FormuePanel
                    tilhører={'Søkers'}
                    blokkIndex={props.blokkIndex}
                    sumFormue={søkersBekreftetFormue}
                    setBekreftetFormue={setSøkersBekreftetFormue}
                    formController={props.formController}
                    triggerValidation={props.triggerValidation}
                />
                {props.eps && (
                    <FormuePanel
                        tilhører={'Ektefelle/Samboers'}
                        blokkIndex={props.blokkIndex}
                        sumFormue={epsBekreftetFormue}
                        setBekreftetFormue={setEPSBekreftetFormue}
                        formController={props.formController}
                        triggerValidation={props.triggerValidation}
                    />
                )}
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
                            label={intl.formatMessage({ id: 'formueblokk.begrunnelse' })}
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            feil={fieldState.error?.message}
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
}) => {
    const { intl } = useI18n({ messages });
    const [åpen, setÅpen] = useState<boolean>(false);
    const formueTilhører = props.tilhører === 'Søkers' ? 'søkersFormue' : 'epsFormue';
    const panelName = `formue.${props.blokkIndex}.${formueTilhører}` as const;

    const formueVerdier = useWatch({
        name: panelName,
        control: props.formController,
    });

    const { errors } = useFormState({
        name: panelName,
        control: props.formController,
    });

    const handlePanelKlikk = () => (åpen ? handleBekreftClick() : setÅpen(true));

    let utregnetFormue = regnUtFormDataVerdier(formueVerdier);
    useEffect(() => {
        utregnetFormue = regnUtFormDataVerdier(formueVerdier);
    }, [formueVerdier]);

    const handleBekreftClick = () => {
        props.triggerValidation(panelName).then((isPanelValid) => {
            if (isPanelValid) {
                setÅpen(false);
                props.setBekreftetFormue(utregnetFormue);
            }
        });
    };

    return (
        <EkspanderbartpanelBase
            className={åpen ? styles.formuePanel : undefined}
            tittel={
                <div>
                    <Normaltekst>
                        {intl.formatMessage({
                            id: props.tilhører === 'Søkers' ? 'panel.formue.søkers' : 'panel.formue.eps',
                        })}
                    </Normaltekst>
                    <p>
                        {props.sumFormue} {intl.formatMessage({ id: 'panel.kroner' })}
                    </p>
                </div>
            }
            apen={åpen}
            onClick={() => handlePanelKlikk()}
        >
            <ul className={styles.formueInputs}>
                {verdierId.map((id) => {
                    return (
                        <Controller
                            key={id}
                            name={`${panelName}.${id}`}
                            control={props.formController}
                            defaultValue={formueVerdier?.[id] ?? '0'}
                            render={({ field }) => (
                                <Input
                                    id={field.name}
                                    label={intl.formatMessage({ id: `formuepanel.${id}` })}
                                    {...field}
                                    feil={errors.formue?.[props.blokkIndex]?.[formueTilhører]?.[id]?.message}
                                    bredde="M"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                />
                            )}
                        />
                    );
                })}
            </ul>

            <div className={styles.nyBeregningContainer}>
                <Normaltekst>{intl.formatMessage({ id: 'formuepanel.nyBeregning' })}</Normaltekst>
                <Undertittel>
                    {utregnetFormue} {intl.formatMessage({ id: 'panel.kroner' })}
                </Undertittel>
            </div>

            <Knapp htmlType="button" onClick={() => handleBekreftClick()}>
                {intl.formatMessage({ id: 'knapp.bekreft' })}
            </Knapp>
        </EkspanderbartpanelBase>
    );
};

export default Formue;
