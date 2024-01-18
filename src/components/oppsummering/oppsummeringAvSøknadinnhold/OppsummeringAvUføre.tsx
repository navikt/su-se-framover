import { useI18n } from '~src/lib/i18n';
import { Uførevedtak } from '~src/types/Søknadinnhold';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';

import messages from './OppsummeringAvSøknadinnhold-nb';

const OppsummeringAvUføre = (props: { uføre: Uførevedtak }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <OppsummeringPar
                label={formatMessage('uføre.vedtakOmUføretrygd')}
                verdi={formatMessage(`bool.${props.uføre.harUførevedtak}`)}
            />
        </div>
    );
};

export default OppsummeringAvUføre;
