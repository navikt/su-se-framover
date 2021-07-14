import Clipboard from '@navikt/nap-clipboard';
import { Normaltekst } from 'nav-frontend-typografi';
import * as React from 'react';

import { Kjønn, Person } from '~api/personApi';
import { useI18n } from '~lib/hooks';
import { Sak } from '~types/Sak';
import { showName } from '~utilsLOL/person/personUtils';

import { PersonAdvarsel } from '../personadvarsel/PersonAdvarsel';

import GenderIcon from './GenderIcon';
import messages from './personlinje-nb';
import styles from './personlinje.module.less';

const Separator = () => (
    <Normaltekst tag="span" className={styles.separator}>
        /
    </Normaltekst>
);

const Personlinje = (props: { søker: Person; sak: Sak }) => {
    const { intl } = useI18n({ messages });

    return (
        <div className={styles.container}>
            <span className={styles.icon}>
                <GenderIcon kjønn={props.søker.kjønn ?? Kjønn.Ukjent} />
            </span>
            <Normaltekst tag="span" className={styles.navn}>
                {showName(props.søker.navn)}
            </Normaltekst>

            <Separator />

            <Clipboard buttonLabel={intl.formatMessage({ id: 'ariaLabel.kopierFnr' })}>
                <Normaltekst tag="span">{props.sak.fnr}</Normaltekst>
            </Clipboard>

            <Separator />

            <span className={styles.saksnummer}>
                <Normaltekst tag="span">{intl.formatMessage({ id: 'label.saksnummer' })}&nbsp;</Normaltekst>
                <Clipboard buttonLabel={intl.formatMessage({ id: 'ariaLabel.kopierSaksnummer' })}>
                    <Normaltekst>{props.sak.saksnummer.toString()}</Normaltekst>
                </Clipboard>
            </span>
            <PersonAdvarsel person={props.søker} />
        </div>
    );
};

export default Personlinje;
