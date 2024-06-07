import { BodyLong, Heading, HelpText } from '@navikt/ds-react';

import { ÅpentBrev } from '~src/assets/Illustrations';

import styles from './dokumenterPage.module.less';

const DokumentHeader = (props: { saksnummer: number }) => (
    <div className={styles.headerContainer}>
        <div className={styles.illustrasjonContainer}>
            <div className={styles.illustrasjon}>
                <ÅpentBrev />
            </div>
        </div>
        <div className={styles.undertittel}>
            <Heading level="1" size="large">
                Brev sendt fra SU
            </Heading>
            <HelpText>
                Brev som skal sendes, eller er sendt ut vil vises her. Dersom du har nylig sendt ut et brev, kan det ta
                litt tid før den vises her. Det samme vil gjelde journalføring & utsending
            </HelpText>
        </div>
        <BodyLong size="large">Saknummer {props.saksnummer}</BodyLong>
    </div>
);

export default DokumentHeader;
