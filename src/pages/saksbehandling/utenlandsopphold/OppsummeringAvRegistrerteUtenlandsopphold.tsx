import { ExternalLink } from '@navikt/ds-icons';
import { Accordion, Button, Checkbox, Heading, Label, Link, Panel } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import React, { useState } from 'react';

import DatePicker from '~src/components/datePicker/DatePicker';
import { OppsummeringPar, OppsummeringsParSortering } from '~src/components/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { RegistrertUtenlandsopphold } from '~src/types/RegistrertUtenlandsopphold';
import { formatDate, formatPeriodeMedDager } from '~src/utils/date/dateUtils';

import { RegistreringAvUtenlandsoppholdForm } from './RegistreringAvUtenlandsopphold';
import messages from './RegistreringAvUtenlandsopphold-nb';
import styles from './RegistreringAvUtenlandsopphold.module.less';

const OppsummeringAvRegistrerteUtenlandsopphold = (props: {
    sakId: string;
    registrerteUtenlandsopphold: RegistrertUtenlandsopphold[];
}) => {
    const { formatMessage } = useI18n({ messages });
    const [fraOgMed, setFraOgMed] = useState<Nullable<Date>>(null);
    const [tilOgMed, setTilOgMed] = useState<Nullable<Date>>(null);
    const [visUgyldiggjort, setVisUgyldigjort] = useState(false);

    const filtrerteUtenlandsopphold = props.registrerteUtenlandsopphold
        .filter((it) => (fraOgMed ? new Date(it.periode.fraOgMed) >= fraOgMed : true))
        .filter((it) => (tilOgMed ? new Date(it.periode.tilOgMed) <= tilOgMed : true))
        .filter(() => (visUgyldiggjort ? true : true));

    return (
        <div className={styles.oppsummeringAvRegistrerteUtenlandsoppholdContainer}>
            <Heading className={styles.heading} size="large">
                {formatMessage('oppsummeringAvRegistrerteUtenlandsopphold.oversiktOverUtenlandsopphold')}
            </Heading>
            <Panel border className={styles.panel}>
                <div className={styles.filterContainer}>
                    <DatePicker
                        label={formatMessage('oppsummeringAvRegistrerteUtenlandsopphold.fraOgMed')}
                        dateFormat={'dd.MM.yyyy'}
                        value={fraOgMed}
                        onChange={(dato) => (dato ? setFraOgMed(DateFns.startOfDay(dato)) : setFraOgMed(dato))}
                        isClearable
                    />
                    <DatePicker
                        label={formatMessage('oppsummeringAvRegistrerteUtenlandsopphold.tilOgMed')}
                        value={tilOgMed}
                        dateFormat={'dd.MM.yyyy'}
                        onChange={(dato) => {
                            console.log(dato);
                            return dato ? setTilOgMed(DateFns.endOfDay(dato)) : setTilOgMed(dato);
                        }}
                        isClearable
                    />
                    <Checkbox checked={visUgyldiggjort} onChange={(e) => setVisUgyldigjort(e.target.checked)}>
                        {formatMessage('oppsummeringAvRegistrerteUtenlandsopphold.ugyldiggjort')}
                    </Checkbox>
                </div>
                <Accordion>
                    {filtrerteUtenlandsopphold.map((it) => (
                        <Accordion.Item key={it.id}>
                            <Accordion.Header>
                                <div className={styles.accordionHeaderContentContainer}>
                                    <Heading size="small">{formatPeriodeMedDager(it.periode)}</Heading>
                                    <Heading size="small">{it.antallDager}</Heading>
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
            </Panel>
        </div>
    );
};

const OppsummeringAvRegistrertUtenlandsopphold = (props: {
    sakId: string;
    registrertUtenlandsopphold: RegistrertUtenlandsopphold;
    medEndreKnapp?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages });
    const [endrerRegistrertUtenlandsopphold, setEndrerRegistrertUtenlandsopphold] = useState<boolean>(false);

    if (endrerRegistrertUtenlandsopphold) {
        return (
            <RegistreringAvUtenlandsoppholdForm
                sakId={props.sakId}
                endrerRegistrertUtenlandsopphold={{
                    avsluttEndringAvUtenlandsopphold: () => setEndrerRegistrertUtenlandsopphold(false),
                    registrertUtenlandsopphold: props.registrertUtenlandsopphold,
                }}
            />
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
                    verdi={props.registrertUtenlandsopphold.opprettetTidspunkt}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
                <OppsummeringPar
                    label={formatMessage('oppsummeringAvRegistrertUtenlandsopphold.endretAv')}
                    verdi={props.registrertUtenlandsopphold.endretAv}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
                <OppsummeringPar
                    label={formatMessage('oppsummeringAvRegistrertUtenlandsopphold.endretTidspunkt')}
                    verdi={props.registrertUtenlandsopphold.endretTidspunkt}
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
                            <li key={it}>
                                <Link href="#">
                                    {it}
                                    <ExternalLink />
                                </Link>
                            </li>
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
