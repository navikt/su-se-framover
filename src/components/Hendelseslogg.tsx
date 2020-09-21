import { format } from 'date-fns';
import { Element, Undertekst } from 'nav-frontend-typografi';
import React from 'react';

import { Hendelse } from '~types/Behandling';
import { Sak } from '~types/Sak';

import styles from './hendelseslogg.module.less';

type Props = {
    sak: Sak;
};
const Hendelseslogg = ({ sak }: Props) => {
    const hendelser = sak.behandlinger
        .flatMap((b) => b.hendelser ?? [])
        .sort((a, b) => new Date(a.tidspunkt).getMilliseconds() - new Date(b.tidspunkt).getMilliseconds());

    return (
        <div className={styles.hendelseslogg}>
            {hendelser ? (
                hendelser.map((hendelse, index) => <HendelseComponent key={index} hendelse={hendelse} />)
            ) : (
                <div> inge hendelser nå</div>
            )}
        </div>
    );
};

const HendelseComponent = (props: { hendelse: Hendelse }) => {
    const { overskrift, melding, tidspunkt } = props.hendelse;

    return (
        <div className={styles.hendelse}>
            <div className={styles.connection}>
                <div className={styles.circle} />
                <div className={styles.dottedLine} />
            </div>
            <div className={styles.content}>
                <Element>{overskrift}</Element>
                <Undertekst className={styles.undertekst}>{format(new Date(tidspunkt), 'dd.MM.yyyy')}</Undertekst>
                <p className={styles.melding}>{melding}</p>
            </div>
        </div>
    );
};

export default Hendelseslogg;
