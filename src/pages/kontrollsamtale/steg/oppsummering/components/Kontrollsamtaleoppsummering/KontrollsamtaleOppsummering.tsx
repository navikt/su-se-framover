import {
    AirplaneIcon,
    CalculatorIcon,
    EnvelopeClosedIcon,
    FileTextIcon,
    HouseIcon,
    PiggybankIcon,
} from '@navikt/aksel-icons';
import { Accordion } from '@navikt/ds-react';
import { AccordionContent, AccordionHeader, AccordionItem } from '@navikt/ds-react/Accordion';
import { MessageFormatter, useI18n } from '~src/lib/i18n.ts';
import { Nullable } from '~src/lib/types.ts';
import stegMessages from '~src/pages/kontrollsamtale/nb.ts';
import andreforholdMessages from '~src/pages/kontrollsamtale/steg/andreforhold/andreForhold-nb.ts';
import fullmaktoglegeerklæringMessages from '~src/pages/kontrollsamtale/steg/fullmakt/fullmaktOgLegeerklæring-nb.ts';
import { EndreSvar } from '~src/pages/kontrollsamtale/steg/oppsummering/components/Endresvar.tsx';
import oppsummeringMessages from '~src/pages/kontrollsamtale/steg/oppsummering/components/Kontrollsamtaleoppsummering/kontrollsamtaleoppsummering-nb.ts';
import originalpassMessages from '~src/pages/kontrollsamtale/steg/pass/originalPass-nb.ts';
import personligoppmøteMessages from '~src/pages/kontrollsamtale/steg/personligOppmøte/personligOppmøte-nb.ts';
import skatteOpplysningerMessages from '~src/pages/kontrollsamtale/steg/skatteopplysninger/skatteOpplysninger-nb.ts';
import utenlandsoppholdMessages from '~src/pages/kontrollsamtale/steg/utenlandsopphold/utenlandsOpphold-nb.ts';
import økonomiskSituasjonMessages from '~src/pages/kontrollsamtale/steg/økonomi/økonomiskSituasjon-nb.ts';
import { KontrollsamtaleSteg } from '~src/pages/kontrollsamtale/types.ts';
import { Oppsummeringsfelt } from '~src/pages/søknad/steg/oppsummering/components/Oppsummeringsfelt.tsx';
import styles from '~src/pages/søknad/steg/oppsummering/Søknadoppsummering/søknadsoppsummering.module.less';
import { useAppSelector } from '~src/redux/Store.ts';

const booleanSvar = (bool: Nullable<boolean>, formatMessage: MessageFormatter<typeof oppsummeringMessages>) =>
    bool ? formatMessage('ja') : bool === false ? formatMessage('nei') : formatMessage('ubesvart');

const KontrollsamtaleOppsummering = () => {
    const kontrollsamtale = useAppSelector((s) => s.kontrollsamtale);

    const { formatMessage } = useI18n({
        messages: {
            ...stegMessages,
            ...personligoppmøteMessages,
            ...fullmaktoglegeerklæringMessages,
            ...originalpassMessages,
            ...økonomiskSituasjonMessages,
            ...utenlandsoppholdMessages,
            ...andreforholdMessages,
            ...skatteOpplysningerMessages,
            ...oppsummeringMessages,
        },
    });

    return (
        <Accordion>
            <AccordionItem>
                <AccordionHeader type="button">
                    <div className={styles.headerContent}>
                        <EnvelopeClosedIcon fontSize={'25px'} /> {formatMessage(KontrollsamtaleSteg.PersonligOppmøte)}
                    </div>
                </AccordionHeader>
                <Accordion.Content>
                    <Oppsummeringsfelt
                        label={formatMessage('input.harBrukerMøttPersonlig.label')}
                        verdi={booleanSvar(kontrollsamtale.personligOppmøte, formatMessage)}
                    />
                    <EndreSvar path={KontrollsamtaleSteg.PersonligOppmøte} />
                </Accordion.Content>
            </AccordionItem>

            <AccordionItem>
                <AccordionHeader type="button">
                    <div className={styles.headerContent}>
                        <FileTextIcon fontSize={'25px'} /> {formatMessage(KontrollsamtaleSteg.FullmaktOgLegeerklæring)}
                    </div>
                </AccordionHeader>
                <AccordionContent>
                    <Oppsummeringsfelt
                        label={formatMessage('fullmaktOgLegeerklæring.label')}
                        verdi={booleanSvar(kontrollsamtale.fullmaktOgLegeerklæring, formatMessage)}
                    />
                    <EndreSvar path={KontrollsamtaleSteg.FullmaktOgLegeerklæring} />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem>
                <AccordionHeader type="button">
                    <div className={styles.headerContent}>
                        <FileTextIcon fontSize={'25px'} /> {formatMessage(KontrollsamtaleSteg.OriginalPass)}
                    </div>
                </AccordionHeader>
                <AccordionContent>
                    <Oppsummeringsfelt
                        label={formatMessage('originalPass.label')}
                        verdi={booleanSvar(kontrollsamtale.originalPass, formatMessage)}
                    />
                    <EndreSvar path={KontrollsamtaleSteg.OriginalPass} />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem>
                <AccordionHeader type="button">
                    <div className={styles.headerContent}>
                        <AirplaneIcon fontSize={'25px'} /> {formatMessage(KontrollsamtaleSteg.ReisetilUtlandet)}
                    </div>
                </AccordionHeader>
                <AccordionContent>
                    <Oppsummeringsfelt
                        label={formatMessage('harVærtUtenlands.label')}
                        verdi={booleanSvar(kontrollsamtale.harVærtUtenlands, formatMessage)}
                    />
                    <Oppsummeringsfelt
                        label={formatMessage('harPlanerOmUtenlandsreise.label')}
                        verdi={booleanSvar(kontrollsamtale.harPlanerOmUtenlandsreise, formatMessage)}
                    />
                    <Oppsummeringsfelt
                        label={formatMessage('reisedokumentasjon.label')}
                        verdi={booleanSvar(kontrollsamtale.reisedokumentasjon, formatMessage)}
                    />
                    <EndreSvar path={KontrollsamtaleSteg.ReisetilUtlandet} />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem>
                <AccordionHeader type="button">
                    <div className={styles.headerContent}>
                        <CalculatorIcon fontSize={'25px'} /> {formatMessage(KontrollsamtaleSteg.ØkonomiskSituasjon)}
                    </div>
                </AccordionHeader>
                <AccordionContent>
                    <Oppsummeringsfelt
                        label={formatMessage(' økonomiskSituasjon.label')}
                        verdi={booleanSvar(kontrollsamtale.økonomiskSituasjon, formatMessage)}
                    />
                    <EndreSvar path={KontrollsamtaleSteg.ØkonomiskSituasjon} />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem>
                <AccordionHeader type="button">
                    <div className={styles.headerContent}>
                        <HouseIcon fontSize={'25px'} /> {formatMessage(KontrollsamtaleSteg.AndreForhold)}
                    </div>
                </AccordionHeader>
                <AccordionContent>
                    <Oppsummeringsfelt
                        label={formatMessage('andreForhold.label')}
                        verdi={booleanSvar(kontrollsamtale.andreForhold, formatMessage)}
                    />
                    <EndreSvar path={KontrollsamtaleSteg.AndreForhold} />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem>
                <AccordionHeader type="button">
                    <div className={styles.headerContent}>
                        <PiggybankIcon fontSize={'25px'} /> {formatMessage(KontrollsamtaleSteg.SkatteOpplysninger)}
                    </div>
                </AccordionHeader>
                <AccordionContent>
                    <Oppsummeringsfelt
                        label={formatMessage('skatteopplysninger.label')}
                        verdi={booleanSvar(kontrollsamtale.skatteOpplysninger, formatMessage)}
                    />
                    <EndreSvar path={KontrollsamtaleSteg.SkatteOpplysninger} />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default KontrollsamtaleOppsummering;
