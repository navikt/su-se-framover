import { Heading } from '@navikt/ds-react';
import { Outlet } from 'react-router-dom';
import KontrollsamtaleVedleggToolbar from '~src/components/kontrollsamtaleNotat/KontrollsamtaleVedleggToolbar.tsx';
import { useKontrollsamtaleVedlegg } from '~src/components/kontrollsamtaleNotat/useKontrollsamtaleVedlegg.ts';
import NotatVedleggModal from '~src/components/notat/NotatVedleggModal.tsx';
import { kontrollsamtaleUtfylling, useRouteParams } from '~src/lib/routes.ts';
import styles from '~src/pages/søknad/index.module.less';

const index = () => {
    const { sakId, kontrollsamtaleId } = useRouteParams<typeof kontrollsamtaleUtfylling>();

    const kontrollsantaleVedlegg = useKontrollsamtaleVedlegg({
        sakId,
        kontrollsamtaleId,
    });

    return (
        <div className={styles.container}>
            <div className={styles.infostripe}>
                <Heading level="2" size="small">
                    Kontrollsamtale
                </Heading>
            </div>
            <div className={styles.contentContainer}>
                <div className={styles.content}>
                    {kontrollsamtaleId && (
                        <div className={styles.vedleggToolbar}>
                            <KontrollsamtaleVedleggToolbar
                                antallVedlegg={kontrollsantaleVedlegg.antallVedlegg}
                                onOpenVedlegg={kontrollsantaleVedlegg.onOpenVedlegg}
                            />
                        </div>
                    )}
                    <Outlet />
                </div>
            </div>

            <NotatVedleggModal {...kontrollsantaleVedlegg.vedleggModal} />
        </div>
    );
};

export default index;
