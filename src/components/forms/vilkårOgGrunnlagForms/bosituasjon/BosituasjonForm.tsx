import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyLong, BodyShort, Button, Heading, Loader, Modal } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import { ReactNode, useEffect, useState } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ErrorCode } from '~src/api/apiClient';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import { FnrInput } from '~src/components/inputs/FnrInput/FnrInput';
import MultiPeriodeVelger, { PartialName } from '~src/components/inputs/multiPeriodeVelger/MultiPeriodeVelger';
import personSlice from '~src/features/person/person.slice';
import sakSliceActions from '~src/features/saksoversikt/sak.slice';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { useAppDispatch } from '~src/redux/Store';
import { Person } from '~src/types/Person';
import { Sakstype } from '~src/types/Sak.ts';
import {
    finnÅrPersonFyller67,
    fyller67ILøpetAvPeriode,
    harFylt67VedDato,
    kunneFylle67IPerioden,
    showName,
} from '~src/utils/person/personUtils';
import messages from '../VilkårOgGrunnlagForms-nb';
import { VilkårFormProps } from '../VilkårOgGrunnlagFormUtils';
import styles from './BosituasjonForm.module.less';
import { BosituasjonGrunnlagFormData, nyBosituasjon } from './BosituasjonFormUtils';

interface Props extends VilkårFormProps<BosituasjonGrunnlagFormData> {
    begrensTilEnPeriode?: boolean;
    skalIkkeKunneVelgePeriode?: boolean;
    sakstype: Sakstype;
    søker: Person;
    children?: ReactNode;
}

const BosituasjonForm = (props: Props) => {
    const { formatMessage } = useI18n({ messages });

    const [epsStatus, setEpsStatus] = useState<ApiResult<Person>>(RemoteData.initial);

    return (
        <FormWrapper {...props}>
            <>
                <MultiPeriodeVelger
                    name={'bosituasjoner'}
                    begrensTilEnPeriode={props.begrensTilEnPeriode}
                    controller={props.form.control}
                    appendNyPeriode={nyBosituasjon}
                    skalIkkeKunneVelgePeriode={props.skalIkkeKunneVelgePeriode}
                    periodeConfig={{
                        minDate: props.minOgMaxPeriode.fraOgMed,
                        maxDate: props.minOgMaxPeriode.tilOgMed,
                    }}
                    getChild={(nameAndIdx) => {
                        const watch = props.form.watch(nameAndIdx);
                        const nullstillEpsData = () => {
                            props.form.setValue(`${nameAndIdx}.erEpsFylt67`, null);
                            props.form.setValue(`${nameAndIdx}.erEPSUførFlyktning`, null);
                            setEpsStatus(RemoteData.initial);
                        };
                        return (
                            <div>
                                <EpsSkjermingModalOgPersonkort eps={epsStatus} søker={props.søker} />
                                <Controller
                                    control={props.form.control}
                                    name={`${nameAndIdx}.harEPS`}
                                    render={({ field, fieldState }) => (
                                        <BooleanRadioGroup
                                            {...field}
                                            legend={formatMessage('bosituasjon.harSøkerEPS')}
                                            error={fieldState.error?.message}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                props.form.setValue(`${nameAndIdx}.epsFnr`, null);
                                                // harEPS endret seg - fjerner/legger til EPS,
                                                // så gjeldende EPS-data er ikke lenger gyldig.
                                                nullstillEpsData();
                                            }}
                                        />
                                    )}
                                />
                                {watch.harEPS && (
                                    <div className={styles.epsFormContainer}>
                                        <Controller
                                            control={props.form.control}
                                            name={`${nameAndIdx}.epsFnr`}
                                            render={({ field, fieldState }) => (
                                                <FnrInput
                                                    sakstype={props.sakstype}
                                                    label={formatMessage('bosituasjon.epsFnr')}
                                                    inputId="epsFnr"
                                                    name={`${nameAndIdx}.epsFnr`}
                                                    onFnrChange={(fnr) => {
                                                        field.onChange(fnr);
                                                        // Nytt fnr betyr en annen EPS - nullstill data avledet av den forrige.
                                                        nullstillEpsData();
                                                    }}
                                                    fnr={field.value ?? ''}
                                                    feil={fieldState.error?.message}
                                                    getPersonStatus={(res) => setEpsStatus(res)}
                                                />
                                            )}
                                        />
                                        {RemoteData.isSuccess(epsStatus) && (
                                            <div>DEBUG fødselsår: {epsStatus.value.fødsel?.år ?? 'ukjent'}</div>
                                        )}
                                        {RemoteData.isSuccess(epsStatus) && (
                                            <ErEpsFylt67Felt
                                                form={props.form}
                                                nameAndIdx={nameAndIdx}
                                                eps={epsStatus.value}
                                                periodeFraOgMed={watch.periode.fraOgMed}
                                            />
                                        )}

                                        {RemoteData.isSuccess(epsStatus) &&
                                            watch.periode.fraOgMed &&
                                            watch.periode.tilOgMed && (
                                                <EpsFyller67Varsel
                                                    eps={epsStatus.value}
                                                    periode={{
                                                        fraOgMed: watch.periode.fraOgMed,
                                                        tilOgMed: watch.periode.tilOgMed,
                                                    }}
                                                />
                                            )}

                                        {watch.erEpsFylt67 === false && RemoteData.isSuccess(epsStatus) && (
                                            <Controller
                                                control={props.form.control}
                                                name={`${nameAndIdx}.erEPSUførFlyktning`}
                                                render={({ field, fieldState }) => (
                                                    <BooleanRadioGroup
                                                        legend={formatMessage('bosituasjon.erEPSUførFlyktning')}
                                                        error={fieldState.error?.message}
                                                        {...field}
                                                    />
                                                )}
                                            />
                                        )}
                                    </div>
                                )}
                                {watch.harEPS === false && (
                                    <Controller
                                        control={props.form.control}
                                        name={`${nameAndIdx}.delerBolig`}
                                        render={({ field, fieldState }) => (
                                            <BooleanRadioGroup
                                                legend={formatMessage('bosituasjon.delerBolig')}
                                                error={fieldState.error?.message}
                                                {...field}
                                            />
                                        )}
                                    />
                                )}
                            </div>
                        );
                    }}
                />
                {props.children}
            </>
        </FormWrapper>
    );
};

export default BosituasjonForm;

const ErEpsFylt67Felt = (props: {
    form: UseFormReturn<BosituasjonGrunnlagFormData>;
    nameAndIdx: PartialName<BosituasjonGrunnlagFormData>;
    eps: Person;
    periodeFraOgMed: Nullable<Date>;
}) => {
    const { formatMessage } = useI18n({ messages });

    // Beregnet fra EPS' fødselsdato og periodens fraOgMed.
    // `null` betyr at vi ikke kan beregne det automatisk (periode mangler, eller fødselsdato er ukjent) -
    // i så fall må saksbehandler fylle ut verdien manuelt, og feltet låses ikke.
    const beregnetVerdi = props.periodeFraOgMed ? harFylt67VedDato(props.periodeFraOgMed, props.eps.fødsel) : null;

    useEffect(() => {
        const gjeldendeErEpsFylt67 = props.form.getValues(`${props.nameAndIdx}.erEpsFylt67`);

        if (!props.periodeFraOgMed) {
            // Periode mangler - nullstill slik at et evt. tidligere auto-utfylt svar ikke
            // henger igjen når vi ikke lenger kan beregne det.
            if (gjeldendeErEpsFylt67 !== null) {
                props.form.setValue(`${props.nameAndIdx}.erEpsFylt67`, null);
                props.form.setValue(`${props.nameAndIdx}.erEPSUførFlyktning`, null);
            }
            return;
        }

        if (beregnetVerdi !== null && beregnetVerdi !== gjeldendeErEpsFylt67) {
            props.form.setValue(`${props.nameAndIdx}.erEpsFylt67`, beregnetVerdi);
            // erEpsFylt67 endret seg - nullstill uførflyktning-svaret av samme grunn som over.
            props.form.setValue(`${props.nameAndIdx}.erEPSUførFlyktning`, null);
        }
    }, [props.eps, props.periodeFraOgMed]);

    return (
        <Controller
            control={props.form.control}
            name={`${props.nameAndIdx}.erEpsFylt67`}
            render={({ field, fieldState }) => (
                <BooleanRadioGroup
                    legend={formatMessage('bosituasjon.erEPSFylt67')}
                    description={
                        beregnetVerdi !== null ? formatMessage('bosituasjon.erEPSFylt67Forhåndsutfylt') : undefined
                    }
                    error={fieldState.error?.message}
                    readOnly={beregnetVerdi !== null}
                    {...field}
                    onChange={(e) => {
                        field.onChange(e);
                        props.form.setValue(`${props.nameAndIdx}.erEPSUførFlyktning`, null);
                    }}
                />
            )}
        />
    );
};

// Viser et varsel om at EPS fyller 67 år i perioden. Fallback-trinnene under dekker at
// fødselsdatoen kan mangle eller være ugyldig, mens fødselsåret som regel er kjent.
const EpsFyller67Varsel = (props: { eps: Person; periode: { fraOgMed: Date; tilOgMed: Date } }) => {
    const { formatMessage } = useI18n({ messages });

    const epsFyller67IPerioden = fyller67ILøpetAvPeriode(props.periode, props.eps.fødsel);

    if (epsFyller67IPerioden === true) {
        return (
            <Alert variant="info" className={styles.epsFyller67Alert}>
                <BodyShort>{formatMessage('bosituasjon.epsFyller67IPerioden')}</BodyShort>
            </Alert>
        );
    }

    if (epsFyller67IPerioden === false) {
        return null;
    }

    // epsFyller67IPerioden === null: fødselsdatoen mangler eller er ugyldig.
    const fødselsår = props.eps.fødsel?.år;
    const kunneFylle67 = fødselsår ? kunneFylle67IPerioden(props.periode, fødselsår) : false;

    if (kunneFylle67 && fødselsår) {
        return (
            <Alert variant="info" className={styles.epsFyller67Alert}>
                <BodyShort>
                    {formatMessage('bosituasjon.epsMuligFyller67IÅr', { år: finnÅrPersonFyller67(fødselsår) })}
                </BodyShort>
            </Alert>
        );
    }

    if (!fødselsår) {
        return (
            <Alert variant="info" className={styles.epsFyller67Alert}>
                <BodyShort>{formatMessage('bosituasjon.epsFødselsdatoUgyldig')}</BodyShort>
            </Alert>
        );
    }

    return null;
};

const EpsSkjermingModalOgPersonkort = (props: { eps: ApiResult<Person>; søker: Person }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { formatMessage } = useI18n({ messages });

    const handleEpsSkjermingModalContinueClick = async () => {
        dispatch(sakSliceActions.actions.resetSak());
        dispatch(personSlice.actions.resetSøkerData());
        navigate(Routes.home.createURL());
    };

    return (
        <div>
            {pipe(
                props.eps,
                RemoteData.fold(
                    () => null,
                    () => <Loader />,
                    (err) => {
                        return (
                            <>
                                <ApiErrorAlert error={err} />

                                {err?.statusCode === ErrorCode.Unauthorized && (
                                    <Modal
                                        open={true}
                                        onClose={() => {
                                            return;
                                        }}
                                        aria-label={formatMessage('formueOgBosituasjon.modal.skjerming.heading')}
                                    >
                                        <Modal.Body>
                                            <div className={styles.modalInnhold}>
                                                <Heading level="2" size="small" spacing>
                                                    {formatMessage('formueOgBosituasjon.modal.skjerming.heading')}
                                                </Heading>
                                                <BodyLong spacing>
                                                    {formatMessage('formueOgBosituasjon.modal.skjerming.innhold', {
                                                        navn: showName(props.søker.navn),
                                                        fnr: props.søker.fnr,
                                                        b: (chunks) => <b>{chunks}</b>,

                                                        br: () => <br />,
                                                    })}
                                                </BodyLong>
                                                <Button
                                                    variant="secondary"
                                                    type="button"
                                                    onClick={() => handleEpsSkjermingModalContinueClick()}
                                                >
                                                    OK
                                                </Button>
                                            </div>
                                        </Modal.Body>
                                    </Modal>
                                )}
                            </>
                        );
                    },
                    () => null,
                ),
            )}
        </div>
    );
};
