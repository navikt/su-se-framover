import { Heading } from '@navikt/ds-react';
import { useOutletContext } from 'react-router-dom';

import Framdriftsindikator from '~src/components/framdriftsindikator/Framdriftsindikator';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { FerdigstillOmgjøringKlage } from '~src/pages/klage/sendKlageTilAttestering/FerdigstillOmgjøringKlage';
import { KlageSteg } from '~src/types/Klage';
import {
    erKlageOmgjort,
    erKlageVilkårsvurdertUtfyltEllerSenere,
    getDefaultFramdriftsindikatorLinjer,
    getFramdriftsindikatorLinjer,
    getPartialFramdriftsindikatorLinjeInfo,
} from '~src/utils/klage/klageUtils';

import AvvistKlage from './avvistKlage/AvvistKlage';
import styles from './klage.module.less';
import messages from './klage-nb';
import SendKlageTilAttestering from './sendKlageTilAttestering/SendKlageTilAttestering';
import VurderFormkrav from './vurderFormkrav/VurderFormkrav';
import VurderingAvKlage from './vurderingAvKlage/VurderingAvKlage';

const Klage = () => {
    const props = useOutletContext<SaksoversiktContext>();
    const urlParams = Routes.useRouteParams<typeof Routes.klage>();
    const klage = props.sak.klager.find((k) => k.id === urlParams.klageId);
    const { formatMessage } = useI18n({ messages });

    if (!klage) {
        return <div>{formatMessage('feil.fantIkkeKlage')}</div>;
    }

    const lagFramdriftsindikatorLinjer = () => {
        if (erKlageVilkårsvurdertUtfyltEllerSenere(klage)) {
            return getFramdriftsindikatorLinjer({
                sakId: props.sak.id,
                klage: klage,
                formatMessage: formatMessage,
            });
        }

        const formkravLinjeInfo = getPartialFramdriftsindikatorLinjeInfo(KlageSteg.Formkrav, klage);
        return getDefaultFramdriftsindikatorLinjer({
            sakId: props.sak.id,
            klageId: klage.id,
            formkravLinjeInfo: { status: formkravLinjeInfo.status, erKlikkbar: formkravLinjeInfo.erKlikkbar },
            formatMessage: formatMessage,
        });
    };

    return (
        <div className={styles.pageContainer}>
            <Heading level="1" size="large" className={styles.pageTittel}>
                {formatMessage('page.tittel')}
            </Heading>
            <div className={styles.klageContainerMedFramdriftsindikator}>
                {urlParams.steg !== KlageSteg.Oppsummering && (
                    <Framdriftsindikator aktivId={urlParams.steg ?? ''} elementer={lagFramdriftsindikatorLinjer()} />
                )}
                {urlParams.steg == KlageSteg.Formkrav && (
                    <VurderFormkrav sakId={props.sak.id} vedtak={props.sak.vedtak} klage={klage} />
                )}
                {urlParams.steg == KlageSteg.Vurdering && <VurderingAvKlage sakId={props.sak.id} klage={klage} />}
                {urlParams.steg == KlageSteg.Avvisning && <AvvistKlage sakId={props.sak.id} klage={klage} />}
                {urlParams.steg === KlageSteg.Oppsummering &&
                    (erKlageOmgjort(klage) ? (
                        <FerdigstillOmgjøringKlage sakId={props.sak.id} klage={klage} vedtaker={props.sak.vedtak} />
                    ) : (
                        <SendKlageTilAttestering sakId={props.sak.id} klage={klage} vedtaker={props.sak.vedtak} />
                    ))}
            </div>
        </div>
    );
};

export default Klage;
