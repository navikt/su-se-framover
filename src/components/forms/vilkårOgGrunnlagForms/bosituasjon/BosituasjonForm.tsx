import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyLong, Button, Heading, Loader, Modal } from '@navikt/ds-react';
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
import { harFylt67VedDato, showName } from '~src/utils/person/personUtils';
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
                                                props.form.setValue(`${nameAndIdx}.erEpsFylt67`, null);
                                                props.form.setValue(`${nameAndIdx}.erEPSUførFlyktning`, null);
                                                // epsStatus kan ellers henge igjen fra forrige EPS (før nytt fnr
                                                // er skrevet inn), og gjøre at erEpsFylt67 beregnes ut fra feil person.
                                                setEpsStatus(RemoteData.initial);
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
                                                    onFnrChange={field.onChange}
                                                    fnr={field.value ?? ''}
                                                    feil={fieldState.error?.message}
                                                    getPersonStatus={(res) => setEpsStatus(res)}
                                                />
                                            )}
                                        />
                                        {RemoteData.isSuccess(epsStatus) && (
                                            <ErEpsFylt67Felt
                                                form={props.form}
                                                nameAndIdx={nameAndIdx}
                                                epsStatus={epsStatus}
                                                periodeFraOgMed={watch.periode.fraOgMed}
                                            />
                                        )}

                                        {watch.erEpsFylt67 === false && (
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
    epsStatus: ApiResult<Person>;
    periodeFraOgMed: Nullable<Date>;
}) => {
    // Beregnet fra EPS' fødselsdato og periodens fraOgMed. `null` betyr at vi ikke kan beregne
    // det automatisk (EPS ikke hentet ennå, periode mangler, eller fødselsdato er ukjent) -
    // i så fall må saksbehandler fylle ut verdien manuelt, og feltet låses ikke.
    const beregnetVerdi = RemoteData.isSuccess(props.epsStatus)
        ? harFylt67VedDato(props.periodeFraOgMed!, props.epsStatus.value.fødsel)
        : null;

    useEffect(() => {
        if (!RemoteData.isSuccess(props.epsStatus) || !props.periodeFraOgMed) {
            // EPS er ikke (lenger) hentet, eller periode mangler - nullstill slik at et evt.
            // tidligere auto-utfylt svar ikke henger igjen for en annen/fjernet EPS.
            props.form.setValue(`${props.nameAndIdx}.erEpsFylt67`, null);
            return;
        }

        if (beregnetVerdi !== null) {
            props.form.setValue(`${props.nameAndIdx}.erEpsFylt67`, beregnetVerdi);
        }
    }, [props.epsStatus, props.periodeFraOgMed]);

    return (
        <Controller
            control={props.form.control}
            name={`${props.nameAndIdx}.erEpsFylt67`}
            render={({ field, fieldState }) => (
                <BooleanRadioGroup
                    legend="Er ektefelle/samboer fylt 67?"
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
