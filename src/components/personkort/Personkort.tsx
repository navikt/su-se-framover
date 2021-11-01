import { Ingress } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';

import { Person, Kjønn } from '~api/personApi';
import { KjønnKvinne, KjønnMann, KjønnUkjent } from '~assets/Icons';
import { Nullable } from '~lib/types';
import { formatFnr, showName } from '~utils/person/personUtils';

import { PersonAdvarsel } from '../personadvarsel/PersonAdvarsel';

import styles from './personkort.module.less';

const KjønnIkon = (props: { kjønn: Nullable<Kjønn> }) => {
    switch (props.kjønn) {
        case Kjønn.Kvinne:
            return <KjønnKvinne />;
        case Kjønn.Mann:
            return <KjønnMann />;
        case Kjønn.Ukjent:
            return <KjønnUkjent />;
    }
    return null;
};

export const Personkort = (props: { person: Person; variant?: 'normal' | 'wide' }) => {
    return (
        <div className={classNames(styles.personkortContainer, styles[`variant-${props.variant ?? 'normal'}`])}>
            <div>
                <span className={styles.personkortSVG}>
                    <KjønnIkon kjønn={props.person.kjønn} />
                </span>
            </div>
            <Ingress as="div" className={styles.personalia}>
                {props.variant === 'wide' ? (
                    <>
                        <span>{showName(props.person.navn)}</span>
                        <span className={styles.horizontalSeparator}>–</span>
                        <span>{formatFnr(props.person.fnr)}</span>
                        <span className={styles.horizontalSeparator}>–</span>
                        <span>{props.person.alder} år</span>
                        <PersonAdvarsel person={props.person} />
                    </>
                ) : (
                    <>
                        <span>{showName(props.person.navn)}</span>
                        <span>{`${formatFnr(props.person.fnr)}, ${props.person.alder} år`}</span>
                        <PersonAdvarsel person={props.person} />
                    </>
                )}
            </Ingress>
        </div>
    );
};
