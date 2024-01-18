import { useI18n } from '~src/lib/i18n';
import { OppholdstillatelseAlder } from '~src/types/Søknadinnhold';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';

import messages from './OppsummeringAvSøknadinnhold-nb';

const OppsummeringAvOppholdstillatelseAlder = (props: { oppholdstillatelse: OppholdstillatelseAlder }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <OppsummeringPar
                label={formatMessage('familiegjenforening.komTilNorgePgaFamiliegjenforening')}
                verdi={formatMessage(`bool.${props.oppholdstillatelse.familieforening!}`)}
            />
        </div>
    );
};

export default OppsummeringAvOppholdstillatelseAlder;
