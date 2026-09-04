import { PencilIcon } from '@navikt/aksel-icons';
import { Link } from 'react-router-dom';
import messages from 'src/pages/kontrollsamtale/steg/oppsummering/components/Kontrollsamtaleoppsummering/kontrollsamtaleoppsummering-nb.ts';
import { useI18n } from '~src/lib/i18n.ts';
import * as routes from '~src/lib/routes.ts';
import { useRouteParams } from '~src/lib/routes.ts';
import { KontrollsamtaleSteg } from '~src/pages/kontrollsamtale/types.ts';
import styles from '~src/pages/søknad/steg/oppsummering/Søknadoppsummering/søknadsoppsummering.module.less';

export const EndreSvar = (props: { path: KontrollsamtaleSteg }) => {
    const { sakId, kontrollsamtaleId } = useRouteParams<typeof routes.kontrollsamtaleUtfylling>();

    if (!sakId) {
        throw new Error('Mangler sakId');
    }
    const { intl } = useI18n({ messages });

    if (!sakId || !kontrollsamtaleId) {
        throw new Error('Mangler sakId eller kontrollsamtaleId');
    }
    return (
        <Link
            className={styles.endreSvarContainer}
            to={routes.kontrollsamtaleUtfylling.createURL({
                step: props.path,
                sakId,
                kontrollsamtaleId,
            })}
        >
            <span className={styles.marginRight}>
                <PencilIcon />
            </span>
            <span>{intl.formatMessage({ id: 'oppsummering.endreSvar' })}</span>
        </Link>
    );
};
