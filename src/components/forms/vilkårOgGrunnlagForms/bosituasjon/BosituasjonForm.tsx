import * as RemoteData from '@devexperts/remote-data-ts';
import { Loader, Modal, Heading, BodyLong, Button } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import { ReactNode, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ErrorCode } from '~src/api/apiClient';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import { FnrInput } from '~src/components/inputs/FnrInput/FnrInput';
import MultiPeriodeVelger from '~src/components/inputs/multiPeriodeVelger/MultiPeriodeVelger';
import personSlice from '~src/features/person/person.slice';
import sakSliceActions from '~src/features/saksoversikt/sak.slice';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { useAppDispatch } from '~src/redux/Store';
import { Person } from '~src/types/Person';
import { showName } from '~src/utils/person/personUtils';

import messages from '../VilkårOgGrunnlagForms-nb';
import { VilkårFormProps } from '../VilkårOgGrunnlagFormUtils';

import styles from './BosituasjonForm.module.less';
import { BosituasjonGrunnlagFormData, nyBosituasjon } from './BosituasjonFormUtils';

interface Props extends VilkårFormProps<BosituasjonGrunnlagFormData> {
    begrensTilEnPeriode?: boolean;
    skalIkkeKunneVelgePeriode?: boolean;
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
                                            <Controller
                                                control={props.form.control}
                                                name={`${nameAndIdx}.erEpsFylt67`}
                                                render={({ field, fieldState }) => (
                                                    <BooleanRadioGroup
                                                        legend="Er ektefelle/samboer fylt 67?"
                                                        error={fieldState.error?.message}
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            props.form.setValue(
                                                                `${nameAndIdx}.erEPSUførFlyktning`,
                                                                null,
                                                            );
                                                        }}
                                                    />
                                                )}
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
