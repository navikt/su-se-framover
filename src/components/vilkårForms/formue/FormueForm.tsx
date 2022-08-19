import * as RemoteData from '@devexperts/remote-data-ts';
import { Accordion, BodyShort, Button, Label, TextField } from '@navikt/ds-react';
import React, { useMemo, useState } from 'react';
import { Control, Controller, UseFormTrigger, useWatch } from 'react-hook-form';

import { Person } from '~src/api/personApi';
import MultiPeriodeVelger from '~src/components/multiPeriodeVelger/MultiPeriodeVelger';
import { Personkort } from '~src/components/personkort/Personkort';
import Formuestatus from '~src/components/revurdering/formuestatus/Formuestatus';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { erFormueVilkårOppfylt } from '~src/pages/saksbehandling/revurdering/formue/formueUtils';
import UtfallSomIkkeStøttes from '~src/pages/saksbehandling/revurdering/utfallSomIkkeStøttes/UtfallSomIkkeStøttes';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { Formuegrenser } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { regnUtFormDataVerdier } from '~src/utils/søknadsbehandlingOgRevurdering/formue/formueSøbOgRevUtils';

import messages from '../VilkårForms-nb';
import { VilkårFormProps } from '../VilkårFormUtils';

import styles from './formueForm.module.less';
import { FormueVilkårFormData, nyFormuegrunnlagMedEllerUtenPeriode, verdierId } from './FormueFormUtils';

interface Props extends VilkårFormProps<FormueVilkårFormData> {
    begrensTilEnPeriode?: boolean;
    skalIkkeKunneVelgePeriode?: boolean;
    formuegrenser: Formuegrenser[];
    eps: Nullable<Person>;
}

const FormueForm = (props: Props) => {
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
                        <FormueGrunnlagsperiode
                            nameAndIdx={nameAndIdx}
                            eps={props.eps}
                            control={props.form.control}
                            triggerValidation={props.form.trigger}
                            formuegrenser={props.formuegrenser}
                        />
                    )}
                    begrensTilEnPeriode={props.begrensTilEnPeriode}
                    skalIkkeKunneVelgePeriode={props.skalIkkeKunneVelgePeriode}
                />
                {RemoteData.isSuccess(props.savingState) && 'feilmeldinger' in props.savingState.value && (
                    <UtfallSomIkkeStøttes feilmeldinger={props.savingState.value.feilmeldinger} />
                )}
            </>
        </FormWrapper>
    );
};

export default FormueForm;

const FormueGrunnlagsperiode = (props: {
    nameAndIdx: `formue.${number}`;
    eps: Nullable<Person>;
    formuegrenser: Formuegrenser[];
    control: Control<FormueVilkårFormData>;
    triggerValidation: UseFormTrigger<FormueVilkårFormData>;
}) => {
    const { formatMessage } = useI18n({ messages });

    const watch = useWatch({ control: props.control, name: props.nameAndIdx });

    const [søkersBekreftetFormue, setSøkersBekreftetFormue] = useState<number>(
        regnUtFormDataVerdier(watch.søkersFormue)
    );
    const [epsBekreftetFormue, setEPSBekreftetFormue] = useState<number>(regnUtFormDataVerdier(watch.epsFormue));

    return (
        <div>
            {props.eps && (
                <div className={styles.personkortContainer}>
                    <Label>{formatMessage('formue.personkort.eps')}</Label>
                    <Personkort person={props.eps} />
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
                {props.eps && (
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
        return regnUtFormDataVerdier(watch);
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
