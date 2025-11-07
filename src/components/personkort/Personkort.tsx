import { Ingress } from '@navikt/ds-react';
import classNames from 'classnames';

import { KjønnUkjent } from '~src/assets/Icons';
import { Person } from '~src/types/Person';
import { formatFnr, showName } from '~src/utils/person/personUtils';

import { PersonAdvarsel } from '../personadvarsel/PersonAdvarsel';

import styles from './personkort.module.less';

//TODO: tekstfil :thinkies:

export const Personkort = (props: { person: Person; variant?: 'normal' | 'wide' }) => {
    return (
        <div className={classNames(styles.personkortContainer, styles[`variant-${props.variant ?? 'normal'}`])}>
            <div className={styles.personkortSVG}>
                <KjønnUkjent size="24px" />
            </div>

            <div className={styles.personalia}>
                {props.variant === 'wide' ? (
                    <>
                        <Ingress>{showName(props.person.navn)}</Ingress>
                        <Ingress>-</Ingress>
                        <Ingress>{formatFnr(props.person.fnr)}</Ingress>
                        <Ingress>-</Ingress>
                        <Ingress>
                            {props.person.fødsel?.alder ? `${props.person.fødsel.alder} år` : 'Alder ikke tilgjengelig'}
                        </Ingress>
                        <PersonAdvarsel person={props.person} />
                    </>
                ) : (
                    <>
                        <span>{showName(props.person.navn)}</span>
                        <span>{`${formatFnr(props.person.fnr)}, ${
                            props.person.fødsel?.alder ? `${props.person.fødsel?.alder} år` : 'alder ikke tilgjengelig'
                        }`}</span>
                        <PersonAdvarsel person={props.person} />
                    </>
                )}
            </div>
        </div>
    );
};
