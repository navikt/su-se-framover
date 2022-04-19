import { Heading } from '@navikt/ds-react';
import React from 'react';

import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
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
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.søknadsContainer}>
            <Oversiktslinje kategoriTekst={formatMessage('regulering.tittel')} entries={props.reguleringer}>
                {{
                    oversiktsinformasjon: (regulering) => {
                        return (
                            <>
                                <Heading size="small" level="3" spacing>
                                    {regulering.reguleringstype === Reguleringstype.AUTOMATISK
                                        ? formatMessage('regulering.automatisk')
                                        : formatMessage('regulering.manuell')}
                                </Heading>
                                <Informasjonslinje label="Opprettet" value={() => formatDate(regulering.opprettet)} />
                                <Informasjonslinje label="Jobbnavn" value={() => formatMessage('regulering.g')} />
                            </>
                        );
                    },
                    knapper: (regulering) => {
                        const vedtakId = props.vedtak.find((v) => v.behandlingId === regulering.id)?.id;
                        return (
                            <>
                                {regulering.erFerdigstilt ? (
                                    <LinkAsButton
                                        variant="secondary"
                                        size="small"
                                        href={Routes.vedtaksoppsummering.createURL({
                                            sakId: props.sakId,
                                            vedtakId: vedtakId ?? '',
                                        })}
                                    >
                                        {formatMessage('regulering.seOppsummering')}
                                    </LinkAsButton>
                                ) : null}
                            </>
                        );
                    },
                }}
            </Oversiktslinje>
        </div>
    );
};

export default ReguleringLister;
