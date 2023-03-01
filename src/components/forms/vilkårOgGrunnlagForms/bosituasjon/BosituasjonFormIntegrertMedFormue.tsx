import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyLong, Button, Heading, Loader, Modal, TextField } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ErrorCode } from '~src/api/apiClient';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import personSlice from '~src/features/person/person.slice';
import sakSliceActions from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { ApiResult, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { useAppDispatch } from '~src/redux/Store';
import { Person } from '~src/types/Person';
import { SøknadInnhold } from '~src/types/Søknadinnhold';
import { removeSpaces } from '~src/utils/format/formatUtils';
import { showName } from '~src/utils/person/personUtils';

import { FormueVilkårOgDelvisBosituasjonFormData } from '../formue/FormueFormUtils';
import messages from '../VilkårOgGrunnlagForms-nb';

import styles from './bosituasjonFormIntegrertMedFormue.module.less';

const BosituasjonFormIntegrertMedFormue = (props: {
    sakId: string;
    søknadsbehandlingId: string;
    søker: Person;
    søknadInnhold: SøknadInnhold;
    eps: ApiResult<Person>;
    fetchEps: (args: string, onSuccess?: ((result: Person) => void) | undefined) => void;
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
                                props.form.setValue('epsFnr', '');
                                props.form.setValue('formue.0.epsFnr', null);
                                props.form.setValue('formue.0.epsFormue', null);
                                props.resetEpsToInitial();
                            }}
                        />
                    )}
                />
            </div>
            {watch.borSøkerMedEPS && (
                <div className={styles.fnrInputContainer}>
                    <Controller
                        control={props.form.control}
                        name="epsFnr"
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                label={formatMessage('formueOgBosituasjon.input.ektefellesFødselsnummer')}
                                error={fieldState.error?.message}
                                size="small"
                                onChange={(e) => field.onChange(removeSpaces(e.target.value))}
                            />
                        )}
                    />
                    <EpsSkjermingModalOgPersonkort {...props} />
                </div>
            )}
        </div>
    );
};

const EpsSkjermingModalOgPersonkort = (props: {
    sakId: string;
    søknadsbehandlingId: string;
    form: UseFormReturn<FormueVilkårOgDelvisBosituasjonFormData>;
    eps: ApiResult<Person>;
    søknadInnhold: SøknadInnhold;
    søker: Person;
}) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { formatMessage } = useI18n({ messages });

    const [lagreEpsGrunnlagStatus, lagreEpsGrunnlag] = useAsyncActionCreator(
        GrunnlagOgVilkårActions.lagreUfullstendigBosituasjon
    );

    const handleEpsSkjermingModalContinueClick = async () => {
        await lagreEpsGrunnlag(
            {
                sakId: props.sakId,
                behandlingId: props.søknadsbehandlingId,
                epsFnr: props.form.getValues('epsFnr'),
            },
            () => {
                dispatch(sakSliceActions.actions.resetSak());
                dispatch(personSlice.actions.resetSøkerData());
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
                                                {RemoteData.isFailure(lagreEpsGrunnlagStatus) && (
                                                    <ApiErrorAlert error={lagreEpsGrunnlagStatus.error} />
                                                )}
                                                <Button
                                                    variant="secondary"
                                                    type="button"
                                                    onClick={() => handleEpsSkjermingModalContinueClick()}
                                                >
                                                    OK
                                                    {RemoteData.isPending(lagreEpsGrunnlagStatus) && <Loader />}
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
