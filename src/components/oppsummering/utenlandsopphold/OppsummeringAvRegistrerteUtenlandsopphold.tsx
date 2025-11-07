import * as RemoteData from '@devexperts/remote-data-ts';
import { XMarkIcon } from '@navikt/aksel-icons';
import { Accordion, Button, Checkbox, Heading, Label, Panel } from '@navikt/ds-react';
import classNames from 'classnames';
import * as DateFns from 'date-fns';
import { useState } from 'react';

import { WarningIcon } from '~src/assets/Icons';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import RegistreringAvUtenlandsoppholdForm from '~src/components/forms/utenlandsopphold/RegistreringAvUtenlandsoppholdForm';
import { registrerUtenlandsoppholdFormDataTilOppdaterRequest } from '~src/components/forms/utenlandsopphold/RegistreringAvUtenlandsoppholdFormUtils';
import { DatePicker } from '~src/components/inputs/datePicker/DatePicker';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import * as SakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { RegistrertUtenlandsopphold, UtenlandsoppholdDokumentasjon } from '~src/types/RegistrertUtenlandsopphold';
import { formatDate, formatDateTime } from '~src/utils/date/dateUtils';
import { formatPeriodeMedDager } from '~src/utils/periode/periodeUtils';
import styles from './OppsummeringAvRegistrerteUtenlandsopphold.module.less';
import messages from './OppsummeringAvRegistrerteUtenlandsopphold-nb';

const OppsummeringAvRegistrerteUtenlandsopphold = (props: {
    sakId: string;
    saksversjon: number;
    registrerteUtenlandsopphold: RegistrertUtenlandsopphold[];
}) => {
    const { formatMessage } = useI18n({ messages });
    const [visAnnullerte, setVisAnnullerte] = useState(false);
    const [fraOgMed, setFraOgMed] = useState<Nullable<Date>>(null);
    const [tilOgMed, setTilOgMed] = useState<Nullable<Date>>(null);

    const filtrerteUtenlandsopphold = props.registrerteUtenlandsopphold
        .slice()
        .sort((a, b) => Date.parse(a.periode.fraOgMed) - Date.parse(b.periode.fraOgMed))
        .filter((it) => (fraOgMed ? new Date(it.periode.fraOgMed) >= fraOgMed : true))
        .filter((it) => (tilOgMed ? new Date(it.periode.tilOgMed) <= tilOgMed : true))
        .filter((it) => (visAnnullerte ? true : !it.erAnnullert));

    return (
        <Oppsummeringspanel
            ikon={Oppsummeringsikon.Liste}
            farge={Oppsummeringsfarge.Lilla}
            tittel={formatMessage('oppsummeringAvRegistrerteUtenlandsopphold.oversiktOverUtenlandsopphold')}
        >
            <div className={styles.oppsummeringContentContainer}>
                <Oppsummeringsfiltrering
                    fraOgMed={{ value: fraOgMed, set: setFraOgMed }}
                    tilOgMed={{ value: tilOgMed, set: setTilOgMed }}
                    annullert={{ value: visAnnullerte, set: setVisAnnullerte }}
                />
                <Accordion className={styles.accordion}>
                    {filtrerteUtenlandsopphold.map((it) => (
                        <RegistrertUtenlandsoppholdAccordionItem
                            key={it.versjon}
                            sakId={props.sakId}
                            saksversjon={props.saksversjon}
                            registrertUtenlandsopphold={it}
                        />
                    ))}
                </Accordion>
            </div>
        </Oppsummeringspanel>
    );
};

const Oppsummeringsfiltrering = (props: {
    fraOgMed: { value: Nullable<Date>; set: (date: Nullable<Date>) => void };
    tilOgMed: { value: Nullable<Date>; set: (date: Nullable<Date>) => void };
    annullert: { value: boolean; set: (b: boolean) => void };
}) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.filterContainer}>
            <DatePicker
                label={formatMessage('oppsummeringAvRegistrerteUtenlandsopphold.filtrering.fraOgMed')}
                value={props.fraOgMed.value}
                onChange={(dato) => (dato ? props.fraOgMed.set(DateFns.startOfDay(dato)) : props.fraOgMed.set(dato))}
            />
            <DatePicker
                label={formatMessage('oppsummeringAvRegistrerteUtenlandsopphold.filtrering.tilOgMed')}
                value={props.tilOgMed.value}
                onChange={(dato) => (dato ? props.tilOgMed.set(DateFns.endOfDay(dato)) : props.tilOgMed.set(dato))}
            />
            <Checkbox checked={props.annullert.value} onChange={(e) => props.annullert.set(e.target.checked)}>
                {formatMessage('oppsummeringAvRegistrerteUtenlandsopphold.filtrering.annullerte')}
            </Checkbox>
        </div>
    );
};

const RegistrertUtenlandsoppholdAccordionItem = (props: {
    sakId: string;
    saksversjon: number;
    registrertUtenlandsopphold: RegistrertUtenlandsopphold;
}) => {
    return (
        <Accordion.Item>
            <Accordion.Header
                className={classNames({
                    [styles.accordionHeader]: true,
                    [styles.grønn]:
                        props.registrertUtenlandsopphold.dokumentasjon === UtenlandsoppholdDokumentasjon.Dokumentert,
                    [styles.gul]:
                        props.registrertUtenlandsopphold.dokumentasjon ===
                        UtenlandsoppholdDokumentasjon.Sannsynliggjort,
                    [styles.rød]:
                        props.registrertUtenlandsopphold.dokumentasjon === UtenlandsoppholdDokumentasjon.Udokumentert,
                })}
            >
                <Heading size="small">{formatPeriodeMedDager(props.registrertUtenlandsopphold.periode)}</Heading>
                <div className={styles.warningOgAntallDagerContainer}>
                    {props.registrertUtenlandsopphold.erAnnullert && <WarningIcon width={25} />}
                    <Heading size="small">{props.registrertUtenlandsopphold.antallDager}</Heading>
                </div>
            </Accordion.Header>
            <Accordion.Content>
                <OppsummeringAvRegistrertUtenlandsopphold
                    sakId={props.sakId}
                    saksversjon={props.saksversjon}
                    registrertUtenlandsopphold={props.registrertUtenlandsopphold}
                    medEndreKnapp={!props.registrertUtenlandsopphold.erAnnullert}
                />
            </Accordion.Content>
        </Accordion.Item>
    );
};

const OppsummeringAvRegistrertUtenlandsopphold = (props: {
    sakId: string;
    saksversjon: number;
    registrertUtenlandsopphold: RegistrertUtenlandsopphold;
    medEndreKnapp?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages });
    const [endrerRegistrertUtenlandsopphold, setEndrerRegistrertUtenlandsopphold] = useState<boolean>(false);
    const [oppdaterStatus, oppdaterUtenlandsopphold] = useAsyncActionCreator(
        SakSlice.oppdaterRegistrertUtenlandsopphold,
    );
    const [ugyldiggjørStatus, ugyldiggjørUtenlandsopphold] = useAsyncActionCreator(
        SakSlice.annullerRegistrertUtenlandsopphold,
    );

    if (endrerRegistrertUtenlandsopphold) {
        return (
            <Panel border>
                <div className={styles.avsluttEndringAvUtenlandsoppholdButtonContainer}>
                    <Button variant="tertiary" type="button" onClick={() => setEndrerRegistrertUtenlandsopphold(false)}>
                        <XMarkIcon />
                    </Button>
                </div>

                <RegistreringAvUtenlandsoppholdForm
                    sakId={props.sakId}
                    saksversjon={props.saksversjon}
                    registrertUtenlandsopphold={props.registrertUtenlandsopphold}
                    status={oppdaterStatus}
                    onFormSubmit={(validatedValues) =>
                        oppdaterUtenlandsopphold(
                            registrerUtenlandsoppholdFormDataTilOppdaterRequest({
                                sakId: props.sakId,
                                saksversjon: props.saksversjon,
                                oppdatererVersjon: props.registrertUtenlandsopphold.versjon,
                                data: validatedValues,
                            }),
                        )
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
                                    saksversjon: props.saksversjon,
                                    annullererVersjon: props.registrertUtenlandsopphold.versjon,
                                })
                            }
                        >
                            {formatMessage('registreringAvUtenlandsopphold.form.button.annuller')}
                        </Button>
                        <Button loading={RemoteData.isPending(oppdaterStatus)}>
                            {formatMessage('registreringAvUtenlandsopphold.form.button.oppdater')}
                        </Button>
                    </div>
                    {RemoteData.isFailure(oppdaterStatus) && <ApiErrorAlert error={oppdaterStatus.error} />}
                    {RemoteData.isFailure(ugyldiggjørStatus) && <ApiErrorAlert error={ugyldiggjørStatus.error} />}
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
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('oppsummeringAvRegistrertUtenlandsopphold.opprettetTidspunkt')}
                    verdi={formatDateTime(props.registrertUtenlandsopphold.opprettetTidspunkt)}
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('oppsummeringAvRegistrertUtenlandsopphold.endretAv')}
                    verdi={props.registrertUtenlandsopphold.endretAv}
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('oppsummeringAvRegistrertUtenlandsopphold.endretTidspunkt')}
                    verdi={formatDateTime(props.registrertUtenlandsopphold.endretTidspunkt)}
                    retning={'vertikal'}
                />
            </div>
            <div className={styles.utenlandsoppholdPeriodecontainer}>
                <OppsummeringPar
                    label={formatMessage('oppsummeringAvRegistrertUtenlandsopphold.fraOgMed')}
                    verdi={formatDate(props.registrertUtenlandsopphold.periode.fraOgMed)}
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('oppsummeringAvRegistrertUtenlandsopphold.tilOgMed')}
                    verdi={formatDate(props.registrertUtenlandsopphold.periode.tilOgMed)}
                    retning={'vertikal'}
                />
            </div>
            <div className={styles.utenlandsoppholdPeriodecontainer}>
                <OppsummeringPar
                    label={formatMessage('oppsummeringAvRegistrertUtenlandsopphold.dokumentasjon')}
                    verdi={props.registrertUtenlandsopphold.dokumentasjon}
                    retning={'vertikal'}
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
            </div>
            {props.registrertUtenlandsopphold.begrunnelse && (
                <OppsummeringPar
                    label={formatMessage('oppsummeringAvRegistrertUtenlandsopphold.begrunnelse')}
                    verdi={props.registrertUtenlandsopphold.begrunnelse}
                    retning={'vertikal'}
                />
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
