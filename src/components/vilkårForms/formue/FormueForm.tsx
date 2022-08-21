import * as RemoteData from '@devexperts/remote-data-ts';
import { RemoteSuccess } from '@devexperts/remote-data-ts';
import { Accordion, BodyShort, Button, Checkbox, Label, Loader, TextField } from '@navikt/ds-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Control, Controller, UseFormTrigger, useWatch } from 'react-hook-form';

import { ApiError } from '~src/api/apiClient';
import * as PersonApi from '~src/api/personApi';
import MultiPeriodeVelger from '~src/components/multiPeriodeVelger/MultiPeriodeVelger';
import { Personkort } from '~src/components/personkort/Personkort';
import Formuestatus from '~src/components/revurdering/formuestatus/Formuestatus';
import { VilkårApiResult } from '~src/features/revurdering/revurderingActions';
import { ApiResult, useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import UtfallSomIkkeStøttes from '~src/pages/saksbehandling/revurdering/utfallSomIkkeStøttes/UtfallSomIkkeStøttes';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import {
    Bosituasjon,
    bosituasjonPåDato,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { Formuegrenser } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { toStringDateOrNull } from '~src/utils/date/dateUtils';

import messages from '../VilkårForms-nb';
import { VilkårFormProps, VilkårFormSaveState } from '../VilkårFormUtils';

import styles from './formueForm.module.less';
import {
    FormueVilkårFormData,
    nyFormuegrunnlagMedEllerUtenPeriode,
    FormueFormDataer,
    verdierId,
    erFormueVilkårOppfylt,
    regnUtFormuegrunnlagVerdier,
} from './FormueFormUtils';

//Omitter savingState, slik at vi kan override den
interface Props extends Omit<VilkårFormProps<FormueVilkårFormData>, 'savingState' | 'onFormSubmit'> {
    onFormSubmit<T extends FormueFormDataer>(values: T, onSuccess: () => void): void;
    savingState:
        | VilkårFormSaveState
        | RemoteData.RemoteData<ApiError | undefined, [Søknadsbehandling, Søknadsbehandling]>;
    begrensTilEnPeriode?: boolean;
    skalIkkeKunneVelgePeriode?: boolean;
    formuegrenser: Formuegrenser[];
    bosituasjonsgrunnlag: Bosituasjon[];
}

const FormueForm = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <FormWrapper
            form={props.form}
            save={props.onFormSubmit}
            savingState={props.savingState}
            avsluttUrl={props.avsluttUrl}
            forrigeUrl={props.forrigeUrl}
            nesteUrl={props.nesteUrl}
            onTilbakeClickOverride={props.onTilbakeClickOverride}
        >
            <>
                <MultiPeriodeVelger
                    name="formue"
                    controller={props.form.control}
                    appendNyPeriode={nyFormuegrunnlagMedEllerUtenPeriode}
                    periodeConfig={{
                        minFraOgMed: props.minOgMaxPeriode.fraOgMed,
                        maxTilOgMed: props.minOgMaxPeriode.tilOgMed,
                    }}
                    getChild={(nameAndIdx: `formue.${number}`) => (
                        <>
                            <FormueGrunnlagsperiode
                                nameAndIdx={nameAndIdx}
                                bosituasjonsgrunnlag={props.bosituasjonsgrunnlag}
                                control={props.form.control}
                                triggerValidation={props.form.trigger}
                                formuegrenser={props.formuegrenser}
                            />
                            {props.søknadsbehandlingEllerRevurdering === 'Søknadsbehandling' && (
                                <Controller
                                    control={props.form.control}
                                    name={`${nameAndIdx}.måInnhenteMerInformasjon`}
                                    render={({ field }) => (
                                        <Checkbox
                                            className={styles.henteMerInfoCheckbox}
                                            {...field}
                                            checked={field.value}
                                        >
                                            {formatMessage('formue.checkbox.henteMerInfo')}
                                        </Checkbox>
                                    )}
                                />
                            )}
                        </>
                    )}
                    begrensTilEnPeriode={props.begrensTilEnPeriode}
                    skalIkkeKunneVelgePeriode={props.skalIkkeKunneVelgePeriode}
                />

                {/* Fordi formue ved søkadsbehandling skal være så spesiell, blir vanskelig å gjøre formet generisk. */}
                {/* Vi vet dermed hva retur typene på Api-kallene ved revurdering er alltid, og dermed bare gjør et kasting helvete */}
                {props.søknadsbehandlingEllerRevurdering === 'Revurdering' &&
                    RemoteData.isSuccess(props.savingState as ApiResult<VilkårApiResult>) &&
                    'feilmeldinger' in
                        (props.savingState as unknown as RemoteSuccess<ApiResult<VilkårApiResult>>).value && (
                        <UtfallSomIkkeStøttes
                            feilmeldinger={
                                (
                                    (props.savingState as unknown as RemoteSuccess<ApiResult<VilkårApiResult>>)
                                        .value as unknown as VilkårApiResult
                                ).feilmeldinger
                            }
                        />
                    )}
            </>
        </FormWrapper>
    );
};

export default FormueForm;

const FormueGrunnlagsperiode = (props: {
    nameAndIdx: `formue.${number}`;
    bosituasjonsgrunnlag: Bosituasjon[];
    formuegrenser: Formuegrenser[];
    control: Control<FormueVilkårFormData>;
    triggerValidation: UseFormTrigger<FormueVilkårFormData>;
}) => {
    const { formatMessage } = useI18n({ messages });

    const watch = useWatch({ control: props.control, name: props.nameAndIdx });

    const [søkersBekreftetFormue, setSøkersBekreftetFormue] = useState<number>(
        regnUtFormuegrunnlagVerdier(watch.søkersFormue)
    );
    const [epsBekreftetFormue, setEPSBekreftetFormue] = useState<number>(regnUtFormuegrunnlagVerdier(watch.epsFormue));

    const bosituasjon = watch.periode.fraOgMed
        ? bosituasjonPåDato(props.bosituasjonsgrunnlag, toStringDateOrNull(watch.periode.fraOgMed)!)
        : undefined;

    const [epsStatus, hentEPS, resetToInitial] = useApiCall(PersonApi.fetchPerson);

    useEffect(() => {
        if (bosituasjon?.fnr) {
            hentEPS(bosituasjon.fnr);
        } else {
            resetToInitial();
        }
    }, [bosituasjon?.fnr]);

    return (
        <div>
            {RemoteData.isPending(epsStatus) && <Loader />}
            {RemoteData.isSuccess(epsStatus) && (
                <div className={styles.personkortContainer}>
                    <Label>{formatMessage('formue.personkort.eps')}</Label>
                    <Personkort person={epsStatus.value} />
                </div>
            )}

            <Accordion className={styles.accordion}>
                <FormuegrunnlagPanel
                    nameAndIdx={`${props.nameAndIdx}`}
                    tilhører={'Søkers'}
                    bekreftedeFormue={søkersBekreftetFormue}
                    setBekreftetFormue={setSøkersBekreftetFormue}
                    control={props.control}
                    triggerValidation={props.triggerValidation}
                />
                {bosituasjon?.fnr && (
                    <FormuegrunnlagPanel
                        nameAndIdx={`${props.nameAndIdx}`}
                        tilhører={'Eps'}
                        setBekreftetFormue={setEPSBekreftetFormue}
                        bekreftedeFormue={epsBekreftetFormue}
                        control={props.control}
                        triggerValidation={props.triggerValidation}
                    />
                )}
            </Accordion>

            <Formuestatus
                bekreftetFormue={søkersBekreftetFormue + epsBekreftetFormue}
                erVilkårOppfylt={erFormueVilkårOppfylt(
                    søkersBekreftetFormue,
                    epsBekreftetFormue,
                    watch.periode.fraOgMed,
                    props.formuegrenser
                )}
            />
        </div>
    );
};

const FormuegrunnlagPanel = (props: {
    nameAndIdx: `formue.${number}`;
    tilhører: 'Søkers' | 'Eps';
    setBekreftetFormue: (formue: number) => void;
    bekreftedeFormue: number;
    control: Control<FormueVilkårFormData>;
    triggerValidation: UseFormTrigger<FormueVilkårFormData>;
}) => {
    const { formatMessage } = useI18n({ messages });
    const [åpen, setÅpen] = useState<boolean>(false);
    const handlePanelKlikk = () => (åpen ? handleBekreftClick() : setÅpen(true));
    const formueTilhører = props.tilhører === 'Søkers' ? 'søkersFormue' : 'epsFormue';
    const navn = `${props.nameAndIdx}.${formueTilhører}` as `formue.${number}.${'søkersFormue' | 'epsFormue'}`;

    const watch = useWatch({ control: props.control, name: navn });

    const utregnetFormue = useMemo(() => {
        return regnUtFormuegrunnlagVerdier(watch);
    }, [watch]);

    const handleBekreftClick = () => {
        props.triggerValidation(navn).then((isPanelValid) => {
            if (isPanelValid) {
                setÅpen(false);
                props.setBekreftetFormue(utregnetFormue);
            }
        });
    };

    return (
        <Accordion.Item open={åpen}>
            <Accordion.Header type="button" onClick={handlePanelKlikk}>
                <div>
                    <BodyShort>
                        {props.tilhører === 'Søkers'
                            ? formatMessage('formue.grunnlag.panel.formue.søkers')
                            : formatMessage('formue.grunnlag.panel.formue.eps')}
                    </BodyShort>
                    <p>
                        {props.bekreftedeFormue} {formatMessage('formue.grunnlag.panel.kroner')}
                    </p>
                </div>
            </Accordion.Header>
            <Accordion.Content>
                <FormueGrunnlagInputs nameIdxTilhørighet={navn} control={props.control} />
                <div className={styles.nyBeregningContainer}>
                    <BodyShort>{formatMessage('formue.grunnlag.panel.nyBeregning')}</BodyShort>
                    <Label>
                        {utregnetFormue} {formatMessage('formue.grunnlag.panel.kroner')}
                    </Label>
                </div>

                <Button variant="secondary" type="button" onClick={() => handleBekreftClick()}>
                    {formatMessage('formue.grunnlag.panel.knapp.bekreft')}
                </Button>
            </Accordion.Content>
        </Accordion.Item>
    );
};

const FormueGrunnlagInputs = (props: {
    nameIdxTilhørighet: `formue.${number}.${'søkersFormue' | 'epsFormue'}`;
    control: Control<FormueVilkårFormData>;
}) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <ul className={styles.formueInputs}>
            {verdierId.map((id) => {
                return (
                    <li key={`${props.nameIdxTilhørighet}.${id}`}>
                        <Controller
                            name={`${props.nameIdxTilhørighet}.${id}`}
                            control={props.control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    id={field.name}
                                    label={formatMessage(`formue.grunnlag.verdi.${id}`)}
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
    );
};
