import classNames from 'classnames';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { ForNav, Søknadstype } from '~src/types/Søknadinnhold';
import { formatDate } from '~src/utils/date/dateUtils';

import { OppsummeringPar } from '../revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';

import messages from './OppsummeringAvSøknadinnhold-nb';
import styles from './OppsummeringAvSøknadinnhold.module.less';

const OppsummeringAvForNav = (props: { forNav: ForNav; visesIVedtak?: boolean }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div
            className={classNames({
                [styles.oppsummeringsContainer]: !props.visesIVedtak,
            })}
        >
            {props.forNav.type === Søknadstype.DigitalSøknad && (
                <>
                    <OppsummeringPar
                        label={formatMessage('forNav.digitalSøknad.harSøkerMøttPersonlig')}
                        verdi={formatMessage(`bool.${props.forNav.harFullmektigEllerVerge !== null}`)}
                    />
                    <OppsummeringPar
                        label={formatMessage('forNav.digitalSøknad.harSøkerFullmektigEllerVerge')}
                        verdi={props.forNav.harFullmektigEllerVerge}
                    />
                </>
            )}
            {props.forNav.type === Søknadstype.Papirsøknad && (
                <>
                    <OppsummeringPar
                        label={formatMessage('forNav.papirSøknad.mottaksdatoForSøknad')}
                        verdi={formatDate(props.forNav.mottaksdatoForSøknad)}
                    />
                    <OppsummeringPar
                        label={formatMessage('forNav.papirSøknad.hvorforSendtInnUtenOppmøte')}
                        verdi={formatMessage(props.forNav.grunnForPapirinnsending)}
                    />
                    {props.forNav.annenGrunn && (
                        <OppsummeringPar
                            label={formatMessage('forNav.papirSøknad.beskrivelse')}
                            verdi={props.forNav.annenGrunn}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default OppsummeringAvForNav;
