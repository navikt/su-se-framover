import * as RemoteData from '@devexperts/remote-data-ts';
import { Calculator } from '@navikt/ds-icons';
import { Alert, Heading } from '@navikt/ds-react';
import React, { useEffect } from 'react';

import * as reguleringApi from '~api/reguleringApi';
import CircleWithIcon from '~components/circleWithIcon/CircleWithIcon';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import { pipe } from '~lib/fp';
import { useApiCall } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Regulering } from '~types/Regulering';

import messages from './regulering-nb';
import styles from './regulering.module.less';

const Reguleringsoversikt = () => {
    const { formatMessage } = useI18n({ messages });
    const [reguleringsstatus, hentReguleringsstatus] = useApiCall(reguleringApi.hentReguleringsstatus);
    useEffect(() => hentReguleringsstatus({}), []);

    return pipe(
        reguleringsstatus,
        RemoteData.fold(
            () => null, // loader
            () => null, // loader
            () => null, // error melding
            (reguleringer) => {
                const automatiske = reguleringer.filter((regulering) => regulering.reguleringType === 'AUTOMATISK');
                return (
                    <div className={styles.oversikt}>
                        <Alert variant="success">
                            {formatMessage('resultat', {
                                antallAutomatiske: automatiske.length,
                                antallManuelle: reguleringer.length - automatiske.length,
                            })}
                        </Alert>

                        <div>
                            <Heading size="medium" className={styles.heading}>
                                <CircleWithIcon variant="yellow" icon={<Calculator />} />
                                {formatMessage('resultat.startManuell')}
                            </Heading>
                            {RemoteData.isSuccess(reguleringsstatus) && (
                                <Reguleringstabell
                                    data={reguleringer.filter((regulering) => regulering.reguleringType === 'MANUELL')}
                                />
                            )}
                        </div>
                    </div>
                );
            }
        )
    );
};

const Reguleringstabell = ({ data }: { data: Regulering[] }) => {
    return (
        <div>
            <table className="tabell">
                <tbody>
                    {data.map((d, index) => {
                        return (
                            <tr key={index}>
                                <td>{d.saksnummer}</td>
                                <td>
                                    <LinkAsButton
                                        variant="tertiary"
                                        href={Routes.saksoversiktValgtSak.createURL({ sakId: d.sakId })}
                                    >
                                        Se sak
                                    </LinkAsButton>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default Reguleringsoversikt;
