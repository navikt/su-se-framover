import { Button, Modal } from '@navikt/ds-react';
import React, { useState } from 'react';

import { useI18n } from '~src/lib/i18n';
import { EksternGrunnlagSkatt } from '~src/types/EksterneGrunnlag';

import OppsummeringAvEksternGrunnlagSkatt from '../oppsummeringAvEksternGrunnlag/OppsummeringAvEksternGrunnlagSkatt';

import messages from './OppsummeringAvSkattegrunnlag-nb';
import styles from './Skattegrunnlagsmodal.module.less';

const SeSkattegrunnlag = (props: { eksternGrunnlagSkatt: EksternGrunnlagSkatt }) => {
    const { formatMessage } = useI18n({ messages });
    const [modalÅpen, setModalÅpen] = useState<boolean>(false);
    return (
        <>
            <Button
                className={styles.seSkattegrunnlagKnapp}
                variant="tertiary"
                type="button"
                onClick={() => setModalÅpen(true)}
            >
                {formatMessage('seSkattegrunnlag.knapp.seSkatt')}
            </Button>
            {modalÅpen && (
                <Skattegrunnlagsmodal
                    skatt={props.eksternGrunnlagSkatt}
                    open={modalÅpen}
                    close={() => setModalÅpen(false)}
                />
            )}
        </>
    );
};

const Skattegrunnlagsmodal = (props: { skatt: EksternGrunnlagSkatt; open: boolean; close: () => void }) => {
    return (
        <Modal open={props.open} onClose={() => props.close()}>
            <Modal.Content className={styles.skattegrunnlagsmodal}>
                <OppsummeringAvEksternGrunnlagSkatt medTittel eksternGrunnlagSkatt={props.skatt} />
            </Modal.Content>
        </Modal>
    );
};

export default SeSkattegrunnlag;
