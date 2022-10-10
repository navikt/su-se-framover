import * as RemoteData from '@devexperts/remote-data-ts';
import { Close } from '@navikt/ds-icons';
import { Accordion, Button, Checkbox, Heading, Label, Panel } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import React, { useState } from 'react';

import { WarningIcon } from '~src/assets/Icons';
import DatePicker from '~src/components/datePicker/DatePicker';
import { OppsummeringPar, OppsummeringsParSortering } from '~src/components/oppsummeringspar/Oppsummeringsverdi';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/revurdering/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import * as SakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { RegistrertUtenlandsopphold } from '~src/types/RegistrertUtenlandsopphold';
import { formatDate, formatDateTime, formatPeriodeMedDager, toIsoDateOnlyString } from '~src/utils/date/dateUtils';

import messages from './RegistreringAvUtenlandsopphold-nb';
import styles from './RegistreringAvUtenlandsopphold.module.less';
import RegistreringAvUtenlandsoppholdForm from './RegistreringAvUtenlandsoppholdForm';

const OppsummeringAvRegistrerteUtenlandsopphold = (props: {
    sakId: string;
    registrerteUtenlandsopphold: RegistrertUtenlandsopphold[];
}) => {
    const { formatMessage } = useI18n({ messages });
    const [fraOgMed, setFraOgMed] = useState<Nullable<Date>>(null);
    const [tilOgMed, setTilOgMed] = useState<Nullable<Date>>(null);
    const [visUgyldiggjort, setVisUgyldigjort] = useState(false);

    const filtrerteUtenlandsopphold = props.registrerteUtenlandsopphold
        .sort(
            (a: RegistrertUtenlandsopphold, b: RegistrertUtenlandsopphold) =>
                Date.parse(a.periode.fraOgMed) - Date.parse(b.periode.fraOgMed)
        )
        .filter((it) => (fraOgMed ? new Date(it.periode.fraOgMed) >= fraOgMed : true))
        .filter((it) => (tilOgMed ? new Date(it.periode.tilOgMed) <= tilOgMed : true))
        .filter((it) => (visUgyldiggjort ? true : it.annullert));

    return (
        <Oppsummeringspanel
            ikon={Oppsummeringsikon.Liste}
            farge={Oppsummeringsfarge.Lilla}
            tittel={formatMessage('oppsummeringAvRegistrerteUtenlandsopphold.oversiktOverUtenlandsopphold')}
        >
            <div className={styles.oppsummeringContentContainer}>
                <div className={styles.filterContainer}>
                    <DatePicker
                        label={formatMessage('oppsummeringAvRegistrerteUtenlandsopphold.filtrering.fraOgMed')}
                        dateFormat={'dd.MM.yyyy'}
                        value={fraOgMed}
                        onChange={(dato) => (dato ? setFraOgMed(DateFns.startOfDay(dato)) : setFraOgMed(dato))}
                        isClearable
                    />
                    <DatePicker
                        label={formatMessage('oppsummeringAvRegistrerteUtenlandsopphold.filtrering.tilOgMed')}
                        value={tilOgMed}
                        dateFormat={'dd.MM.yyyy'}
                        onChange={(dato) => (dato ? setTilOgMed(DateFns.endOfDay(dato)) : setTilOgMed(dato))}
                        isClearable
                    />
                    <Checkbox checked={visUgyldiggjort} onChange={(e) => setVisUgyldigjort(e.target.checked)}>
                        {formatMessage('oppsummeringAvRegistrerteUtenlandsopphold.filtrering.annullerte')}
                    </Checkbox>
                </div>
                <Accordion className={styles.accordion}>
                    {filtrerteUtenlandsopphold.map((it) => (
                        <Accordion.Item key={it.id}>
                            <Accordion.Header>
                                <div className={styles.accordionHeaderContentContainer}>
                                    <Heading size="small">{formatPeriodeMedDager(it.periode)}</Heading>
                                    <div className={styles.warningOgAntallDagerContainer}>
                                        {!it.annullert && <WarningIcon width={25} />}
                                        <Heading size="small">{it.antallDager}</Heading>
                                    </div>
                                </div>
                            </Accordion.Header>
                            <Accordion.Content>
                                <OppsummeringAvRegistrertUtenlandsopphold
                                    sakId={props.sakId}
                                    registrertUtenlandsopphold={it}
                                    medEndreKnapp
                                />
                            </Accordion.Content>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </div>
        </Oppsummeringspanel>
    );
};

const OppsummeringAvRegistrertUtenlandsopphold = (props: {
    sakId: string;
    registrertUtenlandsopphold: RegistrertUtenlandsopphold;
    medEndreKnapp?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages });
    const [endrerRegistrertUtenlandsopphold, setEndrerRegistrertUtenlandsopphold] = useState<boolean>(false);
    const [oppdaterStatus, oppdaterUtenlandsopphold] = useAsyncActionCreator(
        SakSlice.oppdaterRegistrertUtenlandsopphold
    );
    const [ugyldiggjørStatus, ugyldiggjørUtenlandsopphold] = useAsyncActionCreator(
        SakSlice.ugyldiggjørRegistrertUtenlandsopphold
    );

    if (endrerRegistrertUtenlandsopphold) {
        return (
            <Panel border>
                <div className={styles.avsluttEndringAvUtenlandsoppholdButtonContainer}>
                    <Button variant="tertiary" type="button" onClick={() => setEndrerRegistrertUtenlandsopphold(false)}>
                        <Close />
                    </Button>
                </div>

                <RegistreringAvUtenlandsoppholdForm
                    sakId={props.sakId}
                    registrertUtenlandsopphold={props.registrertUtenlandsopphold}
                    status={oppdaterStatus}
                    onFormSubmit={(validatedVlaues) =>
                        oppdaterUtenlandsopphold({
                            sakId: props.sakId,
                            utenlandsoppholdId: props.registrertUtenlandsopphold.id,
                            periode: {
                                fraOgMed: toIsoDateOnlyString(validatedVlaues.periode.fraOgMed!),
                                tilOgMed: toIsoDateOnlyString(validatedVlaues.periode.tilOgMed!),
                            },
                            dokumentasjon: validatedVlaues.dokumentasjon!,
                            journalposter: validatedVlaues.journalposter.map((it) => it.journalpostId!),
                        })
                    }
                >
                    <div className={styles.buttonsContainer}>
                        <Button
                            variant="danger"
                            type="button"
                            loading={RemoteData.isPending(ugyldiggjørStatus)}
                            onClick={() =>
                                ugyldiggjørUtenlandsopphold({
                                    sakId: props.sakId,
                                    utenlandsoppholdId: props.registrertUtenlandsopphold.id,
                                })
                            }
                        >
                            {formatMessage('registreringAvUtenlandsopphold.form.button.annuller')}
                        </Button>
                        <Button loading={RemoteData.isPending(oppdaterStatus)}>
                            {formatMessage('registreringAvUtenlandsopphold.form.button.oppdater')}
                        </Button>
                    </div>
                </RegistreringAvUtenlandsoppholdForm>
            </Panel>
        );
    }

    return (
        <Panel border className={styles.registrertUtenlandsoppholdContainer}>
            <div className={styles.utenlandsoppholdMetadataContainer}>
                <OppsummeringPar
                    label={formatMessage('oppsummeringAvRegistrertUtenlandsopphold.opprettetAv')}
                    verdi={props.registrertUtenlandsopphold.opprettetAv}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
                <OppsummeringPar
                    label={formatMessage('oppsummeringAvRegistrertUtenlandsopphold.opprettetTidspunkt')}
                    verdi={formatDateTime(props.registrertUtenlandsopphold.opprettetTidspunkt)}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
                <OppsummeringPar
                    label={formatMessage('oppsummeringAvRegistrertUtenlandsopphold.endretAv')}
                    verdi={props.registrertUtenlandsopphold.endretAv}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
                <OppsummeringPar
                    label={formatMessage('oppsummeringAvRegistrertUtenlandsopphold.endretTidspunkt')}
                    verdi={formatDateTime(props.registrertUtenlandsopphold.endretTidspunkt)}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
            </div>
            <div className={styles.utenlandsoppholdPeriodecontainer}>
                <OppsummeringPar
                    label={formatMessage('oppsummeringAvRegistrertUtenlandsopphold.fraOgMed')}
                    verdi={formatDate(props.registrertUtenlandsopphold.periode.fraOgMed)}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
                <OppsummeringPar
                    label={formatMessage('oppsummeringAvRegistrertUtenlandsopphold.tilOgMed')}
                    verdi={formatDate(props.registrertUtenlandsopphold.periode.tilOgMed)}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
            </div>
            <OppsummeringPar
                label={formatMessage('oppsummeringAvRegistrertUtenlandsopphold.dokumentasjon')}
                verdi={props.registrertUtenlandsopphold.dokumentasjon}
                sorteres={OppsummeringsParSortering.Vertikalt}
            />
            {props.registrertUtenlandsopphold.journalposter.length > 0 && (
                <div>
                    <Label>{formatMessage('oppsummeringAvRegistrertUtenlandsopphold.journalposter')}</Label>
                    <ul className={styles.journalposterContainer}>
                        {props.registrertUtenlandsopphold.journalposter.map((it) => (
                            <li key={it}>{it}</li>
                        ))}
                    </ul>
                </div>
            )}
            {props.medEndreKnapp && (
                <div className={styles.endreKnappContainer}>
                    <Button
                        variant="secondary"
                        onClick={() => setEndrerRegistrertUtenlandsopphold(!endrerRegistrertUtenlandsopphold)}
                    >
                        {formatMessage('oppsummeringAvRegistrertUtenlandsopphold.knapp.endre')}
                    </Button>
                </div>
            )}
        </Panel>
    );
};

export default OppsummeringAvRegistrerteUtenlandsopphold;
