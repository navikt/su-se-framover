import { FieldError } from 'react-hook-form';

import * as søknadApi from '~src/api/søknadApi.ts';
import { BrevInput } from '~src/components/inputs/brevInput/BrevInput.tsx';
import { AvslagBrevtyper } from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/lukkSøknadUtils.ts';
import { LukkSøknadBegrunnelse } from '~src/types/Søknad.ts';

import styles from './lukkSøknad.module.less';

interface AvlsagProps {
    søknadId: string;
    fritekstValue: string;
    fritekstError?: FieldError;
    onFritekstChange: (value: string) => void;
}

const Avslag = (props: AvlsagProps) => {
    return (
        <div className={styles.container}>
            <BrevInput
                tekst={props.fritekstValue}
                onVisBrevClick={() =>
                    søknadApi.hentLukketSøknadsBrevutkast({
                        søknadId: props.søknadId,
                        body: {
                            type: LukkSøknadBegrunnelse.Avslag,
                            brevConfig: {
                                brevtype: AvslagBrevtyper.Vedtaksbrev,
                                fritekst: props.fritekstValue,
                            },
                        },
                    })
                }
                onChange={(e) => props.onFritekstChange(e.target.value)}
                feil={props.fritekstError}
            />
        </div>
    );
};

export default Avslag;
