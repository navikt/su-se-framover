import * as RemoteData from '@devexperts/remote-data-ts';
import { RemoteSuccess } from '@devexperts/remote-data-ts';
import { Accordion, BodyShort, Button, Checkbox, Label, Loader, TextField } from '@navikt/ds-react';
import { useEffect, useMemo, useState } from 'react';
import { Control, Controller, UseFormTrigger, useWatch } from 'react-hook-form';

import { RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import * as PersonApi from '~src/api/personApi';
import Formuestatus from '~src/components/formuestatus/Formuestatus';
import MultiPeriodeVelger from '~src/components/inputs/multiPeriodeVelger/MultiPeriodeVelger';
import { Personkort } from '~src/components/personkort/Personkort';
import { ApiResult, useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import UtfallSomIkkeStøttes from '~src/pages/saksbehandling/revurdering/utfallSomIkkeStøttes/UtfallSomIkkeStøttes';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import {
    Bosituasjon,
    bosituasjonPåDato,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { Formuegrenser } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { toStringDateOrNull } from '~src/utils/date/dateUtils';

import messages from '../VilkårOgGrunnlagForms-nb';
import { VilkårFormProps } from '../VilkårOgGrunnlagFormUtils';
import {
    erFormueVilkårOppfylt,
    FormuegrunnlagVerdierFormData,
    FormueVilkårFormData,
    lagTomFormuegrunnlagVerdier,
    nyFormuegrunnlagMedEllerUtenPeriode,
    regnUtFormuegrunnlagVerdier,
    verdierId,
} from './FormueFormUtils';
import styles from './formueForm.module.less';

interface Props extends VilkårFormProps<FormueVilkårFormData> {
    begrensTilEnPeriode?: boolean;
    skalIkkeKunneVelgePeriode?: boolean;
    formuegrenser: Formuegrenser[];
    bosituasjonsgrunnlag: Bosituasjon[];
}

const FormueForm = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <FormWrapper {...props}>
            <>
                <MultiPeriodeVelger
                    name="formue"
                    controller={props.form.control}
                    appendNyPeriode={nyFormuegrunnlagMedEllerUtenPeriode}
                    periodeConfig={{
                        minDate: props.minOgMaxPeriode.fraOgMed,
                        maxDate: props.minOgMaxPeriode.tilOgMed,
                    }}
                    getChild={(nameAndIdx: `formue.${number}`) => (
                        <>
                            <FormueGrunnlagsperiode
                                nameAndIdx={nameAndIdx}
                                bosituasjonsgrunnlag={props.bosituasjonsgrunnlag}
                                control={props.form.control}
                                triggerValidation={props.form.trigger}
                                formuegrenser={props.formuegrenser}
                                setEpsValues={(epsValues) => props.form.setValue(`${nameAndIdx}.epsFormue`, epsValues)}
                                setEpsFnr={(epsFnr) => props.form.setValue(`${nameAndIdx}.epsFnr`, epsFnr)}
                            />
                            {props.søknadsbehandlingEllerRevurdering === 'Søknadsbehandling' && (
                                <Controller
                                    control={props.form.control}
                                    name={`${nameAndIdx}.måInnhenteMerInformasjon`}
                                    render={({ field }) => (
                                        <Checkbox {...field} checked={field.value}>
                                            {formatMessage('formue.checkbox.henteMerInfo')}
                                        </Checkbox>
                                    )}
                                />
                            )}
                        </>
                    )}
                    {...props}
                />

                {/* Fordi formue ved søkadsbehandling skal være så spesiell, blir vanskelig å gjøre formet generisk. */}
                {/* Vi vet dermed hva retur typene på Api-kallene ved revurdering er alltid, og dermed bare gjør et kasting helvete */}
                {props.søknadsbehandlingEllerRevurdering === 'Revurdering' &&
                    RemoteData.isSuccess(props.neste.savingState as ApiResult<RevurderingOgFeilmeldinger>) &&
                    'feilmeldinger' in
                        (props.neste.savingState as unknown as RemoteSuccess<ApiResult<RevurderingOgFeilmeldinger>>)
                            .value && (
                        <UtfallSomIkkeStøttes
                            feilmeldinger={
                                (
                                    (
                                        props.neste.savingState as unknown as RemoteSuccess<
                                            ApiResult<RevurderingOgFeilmeldinger>
                                        >
                                    ).value as unknown as RevurderingOgFeilmeldinger
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
    setEpsValues: (epsValues: FormuegrunnlagVerdierFormData) => void;
    setEpsFnr: (epsFnr: string) => void;
}) => {
    const { formatMessage } = useI18n({ messages });
    const watch = useWatch({ control: props.control, name: props.nameAndIdx });
    const [epsStatus, hentEPS, resetToInitial] = useApiCall(PersonApi.fetchPerson);

    const [søkersBekreftetFormue, setSøkersBekreftetFormue] = useState<number>(
        regnUtFormuegrunnlagVerdier(watch.søkersFormue),
    );
    const [epsBekreftetFormue, setEPSBekreftetFormue] = useState<number>(regnUtFormuegrunnlagVerdier(watch.epsFormue));

    const bosituasjon =
        watch.periode.fraOgMed &&
        bosituasjonPåDato(props.bosituasjonsgrunnlag, toStringDateOrNull(watch.periode.fraOgMed)!);

    useEffect(() => {
        if (bosituasjon?.fnr?.length === 11) {
            hentEPS(bosituasjon.fnr, (eps) => {
                props.setEpsValues(watch.epsFormue ?? lagTomFormuegrunnlagVerdier());
                props.setEpsFnr(eps.fnr);
            });
        } else {
            resetToInitial();
            setEPSBekreftetFormue(0);
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
                    props.formuegrenser,
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
                                    {...field}
                                    value={field.value ?? ''}
                                    label={formatMessage(`formue.grunnlag.verdi.${id}`)}
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
