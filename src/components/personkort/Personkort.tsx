import { Ingress } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';

import { Kjønn, Navn, Person } from '~src/api/personApi';
import GenderIcon from '~src/components/personlinje/GenderIcon';

import * as styles from './personkort.module.less';
import { PersonAdvarsel } from './PersonkortHelper';

export const Personkort = (props: { person: Person; variant?: 'normal' | 'wide' }) => {
    return (
        <div className={classNames(styles.personkortContainer, styles[`variant-${props.variant ?? 'normal'}`])}>
            <div>
                <span className={styles.personkortSVG}>
                    <GenderIcon kjønn={props.person.kjønn ?? Kjønn.Ukjent} />
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

const showName = (navn: Navn) => {
    const mellomnavn = navn.mellomnavn ? ` ${navn.mellomnavn} ` : ' ';
    return `${navn.fornavn}${mellomnavn}${navn.etternavn}`;
};

const formatFnr = (fnr: string) => `${fnr.substr(0, 6)} ${fnr.substr(6, 11)}`;
