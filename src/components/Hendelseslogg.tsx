import React from 'react';

import { Nullable } from '~lib/types';
import { Hendelse } from '~types/Behandling';

import styles from './hendelseslogg.module.less';

type Props = {
    hendelser: Nullable<Array<Hendelse>>;
};
const Hendelseslogg = ({ hendelser }: Props) => {
    console.log(hendelser);
    return (
        <div className={styles.hendelseslogg}>
            {hendelser ? (
                hendelser.map((hendelse, index) => <Hendelse key={index} hendelse={hendelse} />)
            ) : (
                <div> inge hendelser nå</div>
            )}
        </div>
    );
};

const Hendelse = (props: { hendelse: Hendelse }) => (
    <div className={styles.hendelse}>
        <div className={styles.connection}>
            <div className={styles.circle} />
            <div className={styles.dottedLine} />
        </div>
        <div className={styles.content}>
            <p>{props.hendelse.overskrift}</p>
            <p>{props.hendelse.melding}</p>
        </div>
    </div>
);

export default Hendelseslogg;
