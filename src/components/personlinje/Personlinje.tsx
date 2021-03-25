import Clipboard from '@navikt/nap-clipboard';
import { PersonCard } from '@navikt/nap-person-card';
import { Normaltekst } from 'nav-frontend-typografi';
import * as React from 'react';

import { Person } from '~api/personApi';
import { getGender, showName } from '~features/person/personUtils';
import { useI18n } from '~lib/hooks';
import { Sak } from '~types/Sak';

import { PersonAdvarsel } from '../PersonAdvarsel';

import messages from './personlinje-nb';
import styles from './personlinje.module.less';

const Personlinje = (props: { søker: Person; sak: Sak }) => {
    const intl = useI18n({ messages });

    return (
        <div className={styles.container}>
            <PersonCard
                fodselsnummer={props.søker.fnr}
                gender={getGender(props.søker)}
                name={showName(props.søker.navn)}
                renderLabelContent={(): JSX.Element => (
                    <div className={styles.extra}>
                        <Normaltekst tag="span" className={styles.separator}>
                            /
                        </Normaltekst>
                        <span className={styles.saksnummer}>
                            <Normaltekst tag="span">{intl.formatMessage({ id: 'label.saksnummer' })}&nbsp;</Normaltekst>
                            <Clipboard buttonLabel={intl.formatMessage({ id: 'ariaLabel.kopierSaksnummer' })}>
                                <Normaltekst>{props.sak.saksnummer.toString()}</Normaltekst>
                            </Clipboard>
                        </span>
                        <PersonAdvarsel person={props.søker} />
                    </div>
                )}
            />
        </div>
    );
};

export default Personlinje;
