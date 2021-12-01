import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Ingress, Loader, TextField } from '@navikt/ds-react';
import { formatISO } from 'date-fns';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import DatePicker from '~components/datePicker/DatePicker';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import * as klageActions from '~features/klage/klageActions';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import yup from '~lib/validering';
import { KlageSteg } from '~pages/saksbehandling/types';
import { Sak } from '~types/Sak';

import messages from './klage-nb';
import styles from './klage.module.less';

interface FormData {
    journalpostId: string;
    datoKlageMottatt: Date;
}
const schema = yup.object<FormData>({
    journalpostId: yup.string().trim().required(),
    datoKlageMottatt: yup.date().required().typeError('Feltet må være en dato på formatet dd/mm/yyyy').max(new Date()),
});

const OpprettKlage = (props: { sak: Sak }) => {
    const [opprettKlageStatus, opprettKlage] = useAsyncActionCreator(klageActions.opprettKlage);
    const { handleSubmit, register, control, formState } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            journalpostId: '',
        },
    });
    const history = useHistory();
    const { formatMessage } = useI18n({ messages });

    return (
        <form
            className={styles.form}
            onSubmit={handleSubmit((values) =>
                opprettKlage(
                    {
                        sakId: props.sak.id,
                        journalpostId: values.journalpostId,
                        datoKlageMottatt: formatISO(values.datoKlageMottatt, { representation: 'date' }),
                    },
                    (klage) => {
                        history.push(
                            Routes.klage.createURL({ sakId: props.sak.id, klageId: klage.id, steg: KlageSteg.Formkrav })
                        );
                    }
                )
            )}
        >
            <Ingress>{formatMessage('opprett.tittel')}</Ingress>
            <TextField
                {...register('journalpostId')}
                error={formState.errors.journalpostId?.message}
                label="JournalpostId"
            />

            <Controller
                control={control}
                name="datoKlageMottatt"
                render={({ field, fieldState }) => (
                    <DatePicker
                        {...field}
                        dateFormat="dd/MM/yyyy"
                        label={formatMessage('opprett.klageMottatt.label')}
                        feil={fieldState.error?.message}
                        maxDate={new Date()}
                        value={field.value}
                        autoComplete="off"
                    />
                )}
            />

            <div className={styles.buttons}>
                <LinkAsButton variant="secondary" href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })}>
                    {formatMessage('opprett.button.tilbake')}
                </LinkAsButton>
                <Button>
                    {formatMessage('opprett.button.submit')}
                    {RemoteData.isPending(opprettKlageStatus) && <Loader />}
                </Button>
            </div>
            {RemoteData.isFailure(opprettKlageStatus) && <ApiErrorAlert error={opprettKlageStatus.error} />}
        </form>
    );
};

export default OpprettKlage;
