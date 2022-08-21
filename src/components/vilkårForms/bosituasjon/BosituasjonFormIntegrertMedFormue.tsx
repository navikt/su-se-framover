import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyLong, Button, Heading, Loader, Modal, TextField } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ErrorCode } from '~src/api/apiClient';
import * as personApi from '~src/api/personApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import personSlice from '~src/features/person/person.slice';
import sakSliceActions, * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { ApiResult, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { useAppDispatch } from '~src/redux/Store';
import { SøknadInnhold } from '~src/types/Søknad';
import { removeSpaces } from '~src/utils/format/formatUtils';
import { showName } from '~src/utils/person/personUtils';

import { FormueVilkårOgDelvisBosituasjonFormData, lagTomFormuegrunnlagVerdier } from '../formue/FormueFormUtils';
import messages from '../VilkårForms-nb';

import styles from './bosituasjonFormIntegrertMedFormue.module.less';

const BosituasjonFormIntegrertMedFormue = (props: {
    sakId: string;
    søknadsbehandlingId: string;
    søker: personApi.Person;
    søknadInnhold: SøknadInnhold;
    eps: ApiResult<personApi.Person>;
    fetchEps: (args: string, onSuccess?: ((result: personApi.Person) => void) | undefined) => void;
    resetEpsToInitial: () => void;
    form: UseFormReturn<FormueVilkårOgDelvisBosituasjonFormData>;
}) => {
    const { formatMessage } = useI18n({ messages });

    const watch = props.form.watch();

    useEffect(() => {
        if (watch.epsFnr && watch.epsFnr.length === 11) {
            props.fetchEps(watch.epsFnr);
        } else {
            props.resetEpsToInitial();
        }
    }, [watch.epsFnr]);

    return (
        <div>
            <div className={styles.borSøkerMedEpsContainer}>
                <Controller
                    control={props.form.control}
                    name="borSøkerMedEPS"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            {...field}
                            legend={formatMessage('formueOgBosituasjon.input.label.borSøkerMedEktefelle')}
                            error={fieldState.error?.message}
                            onChange={(val) => {
                                field.onChange(val);
                                props.form.setValue('epsFnr', null);
                                props.form.setValue('formue.0.epsFormue', lagTomFormuegrunnlagVerdier());
                                props.resetEpsToInitial();
                            }}
                        />
                    )}
                />
            </div>
            {watch.borSøkerMedEPS && (
                <>
                    <div className={styles.fnrInputContainer}>
                        <Controller
                            control={props.form.control}
                            name="epsFnr"
                            render={({ field, fieldState }) => (
                                <TextField
                                    id={field.name}
                                    label={formatMessage('formueOgBosituasjon.input.ektefellesFødselsnummer')}
                                    error={fieldState.error?.message}
                                    size="small"
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(removeSpaces(e.target.value))}
                                />
                            )}
                        />
                        <EpsSkjermingModalOgPersonkort
                            sakId={props.sakId}
                            søknadsbehandlingId={props.søknadsbehandlingId}
                            form={props.form}
                            eps={props.eps}
                            søknadInnhold={props.søknadInnhold}
                            søker={props.søker}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

const EpsSkjermingModalOgPersonkort = (props: {
    sakId: string;
    søknadsbehandlingId: string;
    form: UseFormReturn<FormueVilkårOgDelvisBosituasjonFormData>;
    eps: ApiResult<personApi.Person>;
    søknadInnhold: SøknadInnhold;
    søker: personApi.Person;
}) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { formatMessage } = useI18n({ messages });

    const [lagreEpsGrunnlagSkjermetStatus, lagreEpsGrunnlagSkjermet] = useAsyncActionCreator(
        sakSlice.lagreEpsGrunnlagSkjermet
    );
    const handleEpsSkjermingModalContinueClick = (epsFnr: string) => {
        lagreEpsGrunnlagSkjermet(
            {
                sakId: props.sakId,
                behandlingId: props.søknadsbehandlingId,
                epsFnr: epsFnr,
            },
            () => {
                dispatch(sakSliceActions.actions.resetSak());
                dispatch(personSlice.actions.resetSøker());
                navigate(Routes.home.createURL());
            }
        );
    };

    return (
        <div className={styles.result}>
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
                                    >
                                        <Modal.Content>
                                            <div className={styles.modalInnhold}>
                                                <Heading level="2" size="small" spacing>
                                                    {formatMessage('formueOgBosituasjon.modal.skjerming.heading')}
                                                </Heading>
                                                <BodyLong spacing>
                                                    {formatMessage('formueOgBosituasjon.modal.skjerming.innhold', {
                                                        navn: showName(props.søker.navn),
                                                        fnr: props.søknadInnhold.personopplysninger.fnr,
                                                        b: (chunks) => <b>{chunks}</b>,
                                                        // eslint-disable-next-line react/display-name
                                                        br: () => <br />,
                                                    })}
                                                </BodyLong>
                                                {RemoteData.isFailure(lagreEpsGrunnlagSkjermetStatus) && (
                                                    <ApiErrorAlert error={lagreEpsGrunnlagSkjermetStatus.error} />
                                                )}
                                                <Button
                                                    variant="secondary"
                                                    type="button"
                                                    onClick={() =>
                                                        handleEpsSkjermingModalContinueClick(
                                                            props.form.getValues().epsFnr ?? ''
                                                        )
                                                    }
                                                >
                                                    OK
                                                    {RemoteData.isPending(lagreEpsGrunnlagSkjermetStatus) && <Loader />}
                                                </Button>
                                            </div>
                                        </Modal.Content>
                                    </Modal>
                                )}
                            </>
                        );
                    },
                    () => null
                )
            )}
        </div>
    );
};

export default BosituasjonFormIntegrertMedFormue;
