import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Heading, Loader, Modal } from '@navikt/ds-react';
import React, { useState } from 'react';

import * as reguleringApi from '~src/api/reguleringApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import { Regulering, Reguleringstype } from '~src/types/Regulering';
import { Vedtak } from '~src/types/Vedtak';
import { formatDate } from '~src/utils/date/dateUtils';

import Oversiktslinje, { Informasjonslinje } from './components/Oversiktslinje';
import messages from './sakintro-nb';
import * as styles from './sakintro.module.less';

interface Props {
    sakId: string;
    reguleringer: Regulering[];
    vedtak: Vedtak[];
}

const ReguleringLister = (props: Props) => {
    const { sakId, reguleringer, vedtak } = props;
    const { formatMessage } = useI18n({ messages });
    const [avsluttReguleringStatus, avsluttRegulering] = useApiCall(reguleringApi.avsluttRegulering);
    const [avsluttModal, setAvsluttModal] = useState(false);

    const AvsluttReguleringModal = ({ regulering }: { regulering: Regulering }) => (
        <Modal open={avsluttModal} onClose={() => setAvsluttModal(false)}>
            <Modal.Content>
                <div className={styles.avsluttReguleringModal}>
                    <Heading level="2" size="medium">
                        {formatMessage('regulering.modal.tittel')}
                    </Heading>
                    {RemoteData.isFailure(avsluttReguleringStatus) && (
                        <ApiErrorAlert error={avsluttReguleringStatus.error} />
                    )}
                    <div className={styles.knapper}>
                        <Button variant="tertiary" type="button" onClick={() => setAvsluttModal(false)}>
                            {formatMessage('regulering.modal.avbryt')}
                        </Button>
                        <Button
                            variant="danger"
                            type="button"
                            onClick={() => avsluttRegulering({ reguleringId: regulering.id }, () => location.reload())}
                        >
                            {formatMessage('regulering.modal.lukk')}
                            {RemoteData.isPending(avsluttReguleringStatus) && <Loader />}
                        </Button>
                    </div>
                </div>
            </Modal.Content>
        </Modal>
    );

    const Reguleringsknapper = ({ regulering }: { regulering: Regulering }): Nullable<JSX.Element> => {
        if (regulering.avsluttet) return null;
        if (regulering.erFerdigstilt) {
            const vedtakId = vedtak.find((v) => v.behandlingId === regulering.id)?.id;
            return (
                <LinkAsButton
                    variant="secondary"
                    size="small"
                    href={Routes.vedtaksoppsummering.createURL({
                        sakId: sakId,
                        vedtakId: vedtakId ?? '',
                    })}
                >
                    {formatMessage('regulering.seOppsummering')}
                </LinkAsButton>
            );
        }

        if (regulering.reguleringstype === Reguleringstype.MANUELL) {
            return (
                <div className={styles.reguleringKnapper}>
                    <Button variant="secondary" size="small" onClick={() => setAvsluttModal(true)}>
                        {formatMessage('regulering.avslutt')}
                    </Button>
                    <LinkAsButton
                        variant="primary"
                        size="small"
                        href={Routes.manuellRegulering.createURL({
                            sakId: sakId,
                            reguleringId: regulering.id,
                        })}
                    >
                        {formatMessage('regulering.manuell.start')}
                    </LinkAsButton>
                </div>
            );
        }

        return null;
    };

    return (
        <div className={styles.søknadsContainer}>
            <Oversiktslinje kategoriTekst={formatMessage('regulering.tittel')} entries={reguleringer}>
                {{
                    oversiktsinformasjon: (regulering) => {
                        const knyttetVedtak = vedtak.find((v) => v.behandlingId === regulering.id);
                        return (
                            <>
                                <Heading size="small" level="3" spacing>
                                    {regulering.avsluttet
                                        ? formatMessage('regulering.avsluttet')
                                        : regulering.reguleringstype === Reguleringstype.AUTOMATISK
                                        ? formatMessage('regulering.automatisk')
                                        : formatMessage('regulering.manuell')}
                                </Heading>
                                {knyttetVedtak && (
                                    <Informasjonslinje
                                        label={formatMessage('regulering.iverksattDato')}
                                        value={() => formatDate(knyttetVedtak.opprettet)}
                                    />
                                )}
                                <AvsluttReguleringModal regulering={regulering} />
                            </>
                        );
                    },
                    knapper: (regulering) => <Reguleringsknapper regulering={regulering} />,
                }}
            </Oversiktslinje>
        </div>
    );
};

export default ReguleringLister;
