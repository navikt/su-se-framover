import { Modal } from '@navikt/ds-react';
import React from 'react';

import HentOgVisSkattegrunnlag from '~src/components/hentOgVisSkattegrunnlag/HentOgVisSkattegrunnlag';

import styles from './Skattegrunnlagsmodal.module.less';

const Skattegrunnlagsmodal = (props: { sakId: string; behandlingId: string; open: boolean; close: () => void }) => {
    return (
        <Modal open={props.open} onClose={() => props.close()}>
            <Modal.Content className={styles.skattegrunnlagsmodal}>
                <HentOgVisSkattegrunnlag
                    sakId={props.sakId}
                    behandlingId={props.behandlingId}
                    hentBareEksisterende
                    harSkattegrunnlag
                />
            </Modal.Content>
        </Modal>
    );
};

export default Skattegrunnlagsmodal;
