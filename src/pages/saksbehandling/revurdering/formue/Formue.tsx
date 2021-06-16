import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import * as DateFns from 'date-fns';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { EkspanderbartpanelBase } from 'nav-frontend-ekspanderbartpanel';
import { Knapp } from 'nav-frontend-knapper';
import { Input, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Element, Normaltekst, Undertittel } from 'nav-frontend-typografi';
import React, { useEffect, useMemo, useState } from 'react';
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
import { TrashBin } from '~assets/Icons';
import DatePicker from '~components/datePicker/DatePicker';
import { Personkort } from '~components/Personkort';
import ToKolonner from '~components/toKolonner/ToKolonner';
import VilkårvurderingStatusIcon from '~components/VilkårvurderingStatusIcon';
import { lagreFormuegrunnlag } from '~features/revurdering/revurderingActions';
import { pipe } from '~lib/fp';
import { useApiCall, useAsyncActionCreator, useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import { Periode } from '~types/Periode';
import { RevurderingProps } from '~types/Revurdering';
import { Formuegrenser } from '~types/Vilkår';
import { VilkårVurderingStatus } from '~types/Vilkårsvurdering';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import RevurderingskallFeilet from '../revurderingskallFeilet/RevurderingskallFeilet';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';
import { hentBosituasjongrunnlag } from '../revurderingUtils';

import messages from './formue-nb';
import styles from './formue.module.less';
import GjeldendeFormue from './GjeldendeFormue';
import {
    FormueFormData,
    revurderFormueSchema,
    VerdierFormData,
    getDefaultValues,
    regnUtFormue,
    leggTilNyPeriode,
    formueFormDataTilFormuegrunnlagRequest,
    getGVerdiForFormuegrense,
} from './RevurderFormueUtils';

const Formue = (props: RevurderingProps) => {
    const formuegrenser = props.gjeldendeGrunnlagsdataOgVilkårsvurderinger.formue.formuegrenser;
    const history = useHistory();
    const intl = useI18n({ messages });
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

    const EPSPersonkort = pipe(
        epsStatus,
        RemoteData.fold(
            () => null,
            () => <NavFrontendSpinner />,
            (err) => (
                <AlertStripeFeil>
                    <RevurderingskallFeilet error={err} />
                </AlertStripeFeil>
            ),
            (eps) => (
                <div className={styles.personkortContainer}>
                    <Element>{intl.formatMessage({ id: 'personkort.eps' })}</Element>
                    <Personkort person={eps} />
                </div>
            )
        )
    );

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <form onSubmit={handleSubmit(lagreFormuegrunnlaget)}>
                        {formueArray.fields.map((field, index) => (
                            <FormueBlokk
                                key={field.id}
                                revurderingsperiode={props.revurdering.periode}
                                blokkIndex={index}
                                blokkField={field}
                                EPSPersonkort={EPSPersonkort}
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
                                    formueArray.append(leggTilNyPeriode(epsFnr));
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
                right: <GjeldendeFormue gjeldendeFormue={props.gjeldendeGrunnlagsdataOgVilkårsvurderinger.formue} />,
            }}
        </ToKolonner>
    );
};

const FormueBlokk = (props: {
    revurderingsperiode: Periode<string>;
    blokkIndex: number;
    blokkField: FieldArrayWithId<FormueFormData>;
    formuegrenser: Formuegrenser[];
    EPSPersonkort: Nullable<JSX.Element>;
    formController: Control<FormueFormData>;
    triggerValidation: UseFormTrigger<FormueFormData>;
    onSlettClick: (index: number) => void;
}) => {
    const intl = useI18n({ messages });
    const blokkName = `formue.${props.blokkIndex}` as const;
    const [søkersBekreftetFormue, setSøkersBekreftetFormue] = useState<number>(
        regnUtFormue(props.blokkField.søkersFormue)
    );
    const [epsBekreftetFormue, setEPSBekreftetFormue] = useState<number>(regnUtFormue(props.blokkField.epsFormue));

    const periode = {
        fraOgMed: new Date(props.revurderingsperiode.fraOgMed),
        tilOgMed: new Date(props.revurderingsperiode.tilOgMed),
    };

    const watch = useWatch({
        name: blokkName,
        control: props.formController,
    });

    const erVilkårOppfylt =
        søkersBekreftetFormue + epsBekreftetFormue <=
        getGVerdiForFormuegrense(watch.periode.fraOgMed, props.formuegrenser);

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
                                minDate={periode.fraOgMed}
                                maxDate={periode.tilOgMed}
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
                                maxDate={periode.tilOgMed}
                                startDate={watch.periode.fraOgMed}
                                endDate={field.value}
                            />
                        )}
                    />
                </div>
                {props.blokkIndex > 0 && (
                    <Knapp
                        className={styles.søppelbøtte}
                        htmlType="button"
                        onClick={() => {
                            props.onSlettClick(props.blokkIndex);
                        }}
                        kompakt
                        aria-label={intl.formatMessage({ id: 'knapp.fjernPeriode' })}
                    >
                        <TrashBin width="24px" height="24px" />
                    </Knapp>
                )}
            </div>

            {props.EPSPersonkort}

            <div className={styles.formuePanelerContainer}>
                <FormuePanel
                    tilhører={'Søkers'}
                    blokkIndex={props.blokkIndex}
                    sumFormue={søkersBekreftetFormue}
                    setBekreftetFormue={setSøkersBekreftetFormue}
                    formController={props.formController}
                    triggerValidation={props.triggerValidation}
                />
                {watch.epsFnr && (
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

            <div className={styles.statusContainer}>
                <div>
                    <Normaltekst>{intl.formatMessage({ id: 'formueblokk.totalFormue' })}</Normaltekst>
                    <Undertittel>
                        {søkersBekreftetFormue + epsBekreftetFormue} {intl.formatMessage({ id: 'panel.kroner' })}
                    </Undertittel>
                </div>

                <div className={styles.status}>
                    <VilkårvurderingStatusIcon
                        status={erVilkårOppfylt ? VilkårVurderingStatus.Ok : VilkårVurderingStatus.IkkeOk}
                    />
                    <div className={styles.statusInformasjon}>
                        <p>
                            {erVilkårOppfylt
                                ? intl.formatMessage({ id: 'formueblokk.vilkårOppfylt' })
                                : intl.formatMessage({ id: 'formueblokk.vilkårIkkeOppfylt' })}
                        </p>
                        <p>
                            {erVilkårOppfylt
                                ? intl.formatMessage({ id: 'formueblokk.vilkårOppfyltGrunn' })
                                : intl.formatMessage({ id: 'formueblokk.vilkårIkkeOppfyltGrunn' })}
                        </p>
                    </div>
                </div>
            </div>

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
    const intl = useI18n({ messages });
    const [åpen, setÅpen] = useState<boolean>(false);
    const formueTilhører = props.tilhører === 'Søkers' ? 'søkersFormue' : 'epsFormue';
    const panelName = `formue.${props.blokkIndex}.${formueTilhører}` as const;

    const formueVerdier = useWatch({
        name: panelName,
        control: props.formController,
    });

    const { errors } = useFormState<FormueFormData>({
        name: panelName,
        control: props.formController,
    });

    const utregnetFormue = useMemo(() => {
        return regnUtFormue(formueVerdier);
    }, [{ ...formueVerdier }]);

    const handlePanelKlikk = () => (åpen ? validerInputs() : setÅpen(true));

    function objectValues(obj?: Record<string, unknown>) {
        if (!obj) {
            return [];
        }
        return Object.values(obj);
    }

    const validerInputs = () => {
        props.triggerValidation(panelName).then(() => {
            const triggeredErrors = errors?.formue?.[props.blokkIndex]?.[formueTilhører];

            if (objectValues(triggeredErrors).length <= 0) {
                setÅpen(false);
                props.setBekreftetFormue(utregnetFormue);
            }
        });
    };

    const verdierId: Array<keyof VerdierFormData> = [
        'verdiPåBolig',
        'verdiPåEiendom',
        'verdiPåKjøretøy',
        'innskuddsbeløp',
        'verdipapir',
        'pengerSkyldt',
        'kontanterOver1000',
        'depositumskonto',
    ];

    return (
        <EkspanderbartpanelBase
            className={åpen ? styles.formuePanel : undefined}
            tittel={
                <div>
                    <Normaltekst>
                        {props.tilhører} {intl.formatMessage({ id: 'panel.formue' })}
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
                            render={({ field, fieldState }) => (
                                <Input
                                    id={field.name}
                                    label={intl.formatMessage({ id: `formuepanel.${id}` })}
                                    {...field}
                                    feil={fieldState.error?.message}
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

            <Knapp htmlType="button" onClick={() => validerInputs()}>
                {intl.formatMessage({ id: 'knapp.bekreft' })}
            </Knapp>
        </EkspanderbartpanelBase>
    );
};

export default Formue;
