import { PencilIcon } from '@navikt/aksel-icons';
import { Link, useParams } from 'react-router-dom';
import messages from 'src/pages/kontrollsamtale/steg/oppsummering/components/Kontrollsamtaleoppsummering/kontrollsamtaleoppsummering-nb.ts';
import { useI18n } from '~src/lib/i18n.ts';
import * as routes from '~src/lib/routes.ts';
import { KontrollsamtaleSteg } from '~src/pages/kontrollsamtale/types.ts';
import styles from '~src/pages/søknad/steg/oppsummering/Søknadoppsummering/søknadsoppsummering.module.less';

export const EndreSvar = (props: { path: KontrollsamtaleSteg }) => {
    const { sakId } = useParams<{ sakId: string }>();

    if (!sakId) {
        throw new Error('Mangler sakId');
    }
    const { intl } = useI18n({ messages });
    return (
        <Link
            className={styles.endreSvarContainer}
            to={routes.kontrollsamtaleUtfylling.createURL({ step: props.path, sakId })}
        >
            <span className={styles.marginRight}>
                <PencilIcon />
            </span>
            <span>{intl.formatMessage({ id: 'oppsummering.endreSvar' })}</span>
        </Link>
    );
};
