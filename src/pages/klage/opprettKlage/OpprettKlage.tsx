import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, HelpText, Loader, Select, TextField } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import HentOgVisJournalposter from '~src/components/hentOgVisJournalposter/HentOgVisJournalposter';
import { DatePicker } from '~src/components/inputs/datePicker/DatePicker';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import * as klageActions from '~src/features/klage/klageActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { KlageSteg } from '~src/types/Klage';
import { formatDateTime } from '~src/utils/date/dateUtils.ts';
import messages from '../klage-nb';
import { OpprettKlageFormData, opprettKlageSchema } from './OpprettKlageUtils';
import styles from './opprettKlage.module.less';

const OpprettKlage = () => {
    const props = useOutletContext<SaksoversiktContext>();
    const [opprettKlageStatus, opprettKlage] = useAsyncActionCreator(klageActions.opprettKlage);

    const { handleSubmit, register, control, formState } = useForm<OpprettKlageFormData>({
        resolver: yupResolver(opprettKlageSchema),
        defaultValues: { journalpostId: '' },
    });
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.form}>
            <Oppsummeringspanel
                ikon={Oppsummeringsikon.Blyant}
                farge={Oppsummeringsfarge.Grønn}
                tittel={formatMessage('opprett.tittel')}
            >
                <form
                    onSubmit={handleSubmit((values) =>
                        opprettKlage(
                            {
                                sakId: props.sak.id,
                                journalpostId: values.journalpostId,
                                datoKlageMottatt: DateFns.formatISO(values.datoKlageMottatt!, {
                                    representation: 'date',
                                }),
                                relatertBehandlingId: values.relatertBehandlingId,
                            },
                            (klage) => {
                                navigate(
                                    Routes.klage.createURL({
                                        sakId: props.sak.id,
                                        klageId: klage.id,
                                        steg: KlageSteg.Formkrav,
                                    }),
                                );
                            },
                        ),
                    )}
                >
                    <div className={styles.opprettelseContainer}>
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
                                    label={formatMessage('opprett.klageMottatt.label')}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                    toDate={DateFns.endOfDay(new Date())}
                                    hjelpetekst={formatMessage('opprett.klageMottatt.hjelpetekst')}
                                />
                            )}
                        />
                        <Controller
                            name={'relatertBehandlingId'}
                            control={control}
                            render={({ field, fieldState }) => (
                                <Select
                                    label="Relatert vedtak"
                                    {...field}
                                    value={field.value}
                                    error={fieldState.error?.message}
                                >
                                    <option value="">Velg vedtak</option>
                                    {props.sak.vedtak.map((vedtak) => {
                                        return (
                                            <option key={vedtak.id} value={vedtak.behandlingId}>
                                                {vedtak.type} {formatDateTime(vedtak.opprettet)}
                                            </option>
                                        );
                                    })}
                                </Select>
                            )}
                        />
                        <div className={styles.buttons}>
                            <LinkAsButton
                                variant="secondary"
                                href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })}
                            >
                                {formatMessage('opprett.button.tilbake')}
                            </LinkAsButton>
                            <Button>
                                {formatMessage('opprett.button.submit')}
                                {RemoteData.isPending(opprettKlageStatus) && <Loader />}
                            </Button>
                        </div>
                        {RemoteData.isFailure(opprettKlageStatus) && <ApiErrorAlert error={opprettKlageStatus.error} />}
                    </div>
                </form>
            </Oppsummeringspanel>

            <HentOgVisJournalposter sakId={props.sak.id} />
        </div>
    );
};

export default OpprettKlage;
