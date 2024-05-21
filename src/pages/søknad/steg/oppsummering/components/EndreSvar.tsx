import { PencilIcon } from '@navikt/aksel-icons';
import { Link, useOutletContext } from 'react-router-dom';

import * as routes from '~src/lib/routes';
import { SøknadContext } from '~src/pages/søknad';
import { Søknadssteg } from '~src/pages/søknad/types';

import styles from '../Søknadoppsummering/søknadsoppsummering.module.less';

export const EndreSvar = (props: { path: Søknadssteg }) => {
    const { sakstype } = useOutletContext<SøknadContext>();

    return (
        <Link
            className={styles.endreSvarContainer}
            to={routes.soknadsutfylling.createURL({ step: props.path, soknadstema: routes.urlForSakstype(sakstype) })}
        >
            <span className={styles.marginRight}>
                <PencilIcon />
            </span>
            <span>Endre svar</span>
        </Link>
    );
};
