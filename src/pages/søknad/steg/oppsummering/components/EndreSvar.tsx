import { PencilIcon } from '@navikt/aksel-icons';
import { Link, useOutletContext } from 'react-router-dom';

import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { SøknadContext } from '~src/pages/søknad';
import { Søknadssteg } from '~src/pages/søknad/types';
import styles from '../Søknadoppsummering/søknadsoppsummering.module.less';
import messages from '../Søknadoppsummering/søknadsoppsummering-nb';

export const EndreSvar = (props: { path: Søknadssteg }) => {
    const { sakstype } = useOutletContext<SøknadContext>();
    const { intl } = useI18n({ messages });
    return (
        <Link
            className={styles.endreSvarContainer}
            to={routes.soknadsutfylling.createURL({ step: props.path, soknadstema: routes.urlForSakstype(sakstype) })}
        >
            <span className={styles.marginRight}>
                <PencilIcon />
            </span>
            <span>{intl.formatMessage({ id: 'oppsummering.endreSvar' })}</span>
        </Link>
    );
};
