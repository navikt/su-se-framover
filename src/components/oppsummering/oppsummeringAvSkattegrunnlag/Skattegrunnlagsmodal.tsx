import { Modal } from '@navikt/ds-react';
import React from 'react';

import { EksternGrunnlagSkatt } from '~src/types/EksterneGrunnlag';

import OppsummeringAvEksternGrunnlagSkatt from '../oppsummeringAvEksternGrunnlag/OppsummeringAvEksternGrunnlagSkatt';

import styles from './Skattegrunnlagsmodal.module.less';

const Skattegrunnlagsmodal = (props: { skatt: EksternGrunnlagSkatt; open: boolean; close: () => void }) => {
    return (
        <Modal open={props.open} onClose={() => props.close()}>
            <Modal.Content className={styles.skattegrunnlagsmodal}>
                <OppsummeringAvEksternGrunnlagSkatt eksternGrunnlagSkatt={props.skatt} />
            </Modal.Content>
        </Modal>
    );
};

export default Skattegrunnlagsmodal;
