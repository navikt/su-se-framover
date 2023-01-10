import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { InnlagtPåInstitusjon } from '~src/types/Søknadinnhold';
import { formatDate } from '~src/utils/date/dateUtils';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';

import messages from './OppsummeringAvSøknadinnhold-nb';

const OppsummeringAvInnlagtPåInstitusjon = (props: { innlagtPåInstitusjon: Nullable<InnlagtPåInstitusjon> }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            <OppsummeringPar
                label={formatMessage('boforhold.innlagtPåInstitusjon.harDuVærtInnlagtSiste3Måneder')}
                verdi={formatMessage(`bool.${props.innlagtPåInstitusjon !== null}`)}
            />

            {props.innlagtPåInstitusjon !== null && (
                <>
                    <OppsummeringPar
                        label={formatMessage('boforhold.innlagtPåInstitusjon.harDuVærtInnlagtSiste3Måneder')}
                        verdi={formatDate(props.innlagtPåInstitusjon.datoForInnleggelse!)}
                    />
                    <OppsummeringPar
                        label={formatMessage('boforhold.innlagtPåInstitusjon.datoForUtskrivelse')}
                        verdi={
                            props.innlagtPåInstitusjon.datoForUtskrivelse
                                ? formatDate(props.innlagtPåInstitusjon.datoForUtskrivelse)
                                : formatMessage('boforhold.innlagtPåInstitusjon.fortsattInnlagt')
                        }
                    />
                </>
            )}
        </div>
    );
};

export default OppsummeringAvInnlagtPåInstitusjon;
