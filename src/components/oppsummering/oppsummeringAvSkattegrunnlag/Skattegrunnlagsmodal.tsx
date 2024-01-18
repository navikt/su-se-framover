import { Button, Modal } from '@navikt/ds-react';
import { useRef } from 'react';

import { useI18n } from '~src/lib/i18n';
import { EksternGrunnlagSkatt } from '~src/types/EksterneGrunnlag';

import OppsummeringAvEksternGrunnlagSkatt from '../oppsummeringAvEksternGrunnlag/OppsummeringAvEksternGrunnlagSkatt';

import messages from './OppsummeringAvSkattegrunnlag-nb';
import * as styles from './Skattegrunnlagsmodal.module.less';

const SeSkattegrunnlag = (props: { eksternGrunnlagSkatt: EksternGrunnlagSkatt }) => {
    const { formatMessage } = useI18n({ messages });
    const ref = useRef<HTMLDialogElement>(null);
    return (
        <>
            <Button
                className={styles.seSkattegrunnlagKnapp}
                variant="tertiary"
                type="button"
                onClick={() => ref.current?.showModal()}
            >
                {formatMessage('seSkattegrunnlag.knapp.seSkatt')}
            </Button>

            <Modal ref={ref} width={1000} header={{ heading: formatMessage('seSkattegrunnlag.modal.tittel') }}>
                <Modal.Body>
                    <OppsummeringAvEksternGrunnlagSkatt eksternGrunnlagSkatt={props.eksternGrunnlagSkatt} />
                </Modal.Body>
            </Modal>
        </>
    );
};

export default SeSkattegrunnlag;
