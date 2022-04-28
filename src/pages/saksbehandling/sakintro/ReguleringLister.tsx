import { Button, Heading } from '@navikt/ds-react';
import React from 'react';

import * as reguleringApi from '~src/api/reguleringApi';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { useApiCall } from '~src/lib/hooks';
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
    const [, avsluttRegulering] = useApiCall(reguleringApi.avsluttRegulering);

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
                                ) : regulering.reguleringstype === Reguleringstype.MANUELL ? (
                                    <div className={styles.reguleringKnapper}>
                                        <Button
                                            variant="secondary"
                                            size="small"
                                            onClick={() =>
                                                avsluttRegulering(
                                                    { reguleringId: regulering.id, begrunnelse: 'test' },
                                                    () => location.reload()
                                                )
                                            }
                                        >
                                            {formatMessage('regulering.avslutt')}
                                        </Button>
                                        <LinkAsButton
                                            variant="primary"
                                            size="small"
                                            href={Routes.manuellRegulering.createURL({
                                                sakId: props.sakId,
                                                reguleringId: regulering.id,
                                            })}
                                        >
                                            {formatMessage('regulering.manuell.start')}
                                        </LinkAsButton>
                                    </div>
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
