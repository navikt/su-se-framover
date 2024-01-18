import { useI18n } from '~src/lib/i18n';
import { Alderspensjon } from '~src/types/Søknadinnhold';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';

import messages from './OppsummeringAvSøknadinnhold-nb';

const OppsummeringAvAlderspensjon = (props: { alderspensjon: Alderspensjon }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <OppsummeringPar
                label={formatMessage('alderspensjon.søktOmAlderspensjon')}
                verdi={formatMessage(`bool.${props.alderspensjon.harSøktAlderspensjon}`)}
            />
        </div>
    );
};

export default OppsummeringAvAlderspensjon;
