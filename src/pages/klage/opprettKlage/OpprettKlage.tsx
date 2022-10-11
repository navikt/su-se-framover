import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Heading, HelpText, Loader, TextField } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import DatePicker from '~src/components/datePicker/DatePicker';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import * as klageActions from '~src/features/klage/klageActions';
import { pipe } from '~src/lib/fp';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import yup from '~src/lib/validering';
import { KlageSteg } from '~src/pages/saksbehandling/types';

import messages from '../klage-nb';

import * as styles from './opprettKlage.module.less';

interface FormData {
    journalpostId: string;
    datoKlageMottatt: Date;
}
const schema = yup.object<FormData>({
    journalpostId: yup
        .string()
        .trim()
        .required()
        .test('isNumeric', 'Må være et tall', function (id) {
            return pipe(id, Number, Number.isInteger);
        }),
    datoKlageMottatt: yup
        .date()
        .required()
        .typeError('Feltet må være en dato på formatet dd/mm/yyyy')
        .max(DateFns.endOfDay(new Date())),
});

const OpprettKlage = () => {
    const props = useOutletContext<SaksoversiktContext>();
    const [opprettKlageStatus, opprettKlage] = useAsyncActionCreator(klageActions.opprettKlage);
    const { handleSubmit, register, control, formState } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            journalpostId: '',
        },
    });
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    return (
        <form
            className={styles.form}
            onSubmit={handleSubmit((values) =>
                opprettKlage(
                    {
                        sakId: props.sak.id,
                        journalpostId: values.journalpostId,
                        datoKlageMottatt: DateFns.formatISO(values.datoKlageMottatt, { representation: 'date' }),
                    },
                    (klage) => {
                        navigate(
                            Routes.klage.createURL({ sakId: props.sak.id, klageId: klage.id, steg: KlageSteg.Formkrav })
                        );
                    }
                )
            )}
        >
            <Heading level="2" size="medium">
                {formatMessage('opprett.tittel')}
            </Heading>
            <TextField
                {...register('journalpostId')}
                error={formState.errors.journalpostId?.message}
                label={
                    <div className={styles.journalpostIdLabel}>
                        {formatMessage('opprett.journalpostId.label')}
                        <HelpText>{formatMessage('opprett.journalpostId.hjelpetekst')}</HelpText>
                    </div>
                }
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
                        maxDate={DateFns.endOfDay(new Date())}
                        value={field.value}
                        autoComplete="off"
                        hjelpetekst={formatMessage('opprett.klageMottatt.hjelpetekst')}
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
