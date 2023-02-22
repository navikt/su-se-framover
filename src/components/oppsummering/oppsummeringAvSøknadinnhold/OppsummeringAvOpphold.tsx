import React from 'react';

import { TypeOppholdstillatelse } from '~src/features/søknad/types';
import { useI18n } from '~src/lib/i18n';
import { IngenAdresseGrunn } from '~src/types/Person';
import { Boforhold, Oppholdstillatelse } from '~src/types/Søknadinnhold';
import { formatAdresse } from '~src/utils/format/formatUtils';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';

import messages from './OppsummeringAvSøknadinnhold-nb';

const OppsummeringAvOpphold = (props: { oppholdstillatelse: Oppholdstillatelse; visAdresse?: Boforhold }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <OppsummeringPar
                label={formatMessage('opphold.erNorskStatsborger')}
                verdi={formatMessage(`bool.${props.oppholdstillatelse.erNorskStatsborger}`)}
            />
            {!props.oppholdstillatelse.erNorskStatsborger && (
                <OppsummeringPar
                    label={formatMessage('opphold.harOppholdstillatelse')}
                    verdi={formatMessage(`bool.${props.oppholdstillatelse.harOppholdstillatelse!}`)}
                />
            )}
            {props.oppholdstillatelse.harOppholdstillatelse && (
                <OppsummeringPar
                    label={formatMessage('opphold.oppholdstillatelse.midlertidigEllerPermanent')}
                    verdi={formatMessage(props.oppholdstillatelse.typeOppholdstillatelse! as TypeOppholdstillatelse)}
                />
            )}
            <OppsummeringPar
                label={formatMessage('opphold.statsborgerskapAndreLand')}
                verdi={formatMessage(`bool.${props.oppholdstillatelse.statsborgerskapAndreLand}`)}
            />
            {props.oppholdstillatelse.statsborgerskapAndreLand && (
                <OppsummeringPar
                    label={formatMessage('opphold.hvilkeLandStatsborger')}
                    verdi={props.oppholdstillatelse.statsborgerskapAndreLandFritekst}
                />
            )}
            {props.visAdresse && <BoforholdsAdresse b={props.visAdresse} />}
        </div>
    );
};

const BoforholdsAdresse = (props: { b: Boforhold }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <OppsummeringPar
            label={formatMessage('boforhold.adresse')}
            verdi={
                props.b.borPåAdresse
                    ? formatAdresse(props.b.borPåAdresse)
                    : props.b.ingenAdresseGrunn === IngenAdresseGrunn.BOR_PÅ_ANNEN_ADRESSE
                    ? formatMessage('boforhold.adresse.ingenAdresse.borPåAnnenAdresse')
                    : props.b.ingenAdresseGrunn === IngenAdresseGrunn.HAR_IKKE_FAST_BOSTED
                    ? formatMessage('boforhold.adresse.ingenAdresse.harIkkeFastBosted')
                    : ''
            }
        />
    );
};

export default OppsummeringAvOpphold;
