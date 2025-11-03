import { FieldError } from 'react-hook-form';

import * as søknadApi from '~src/api/søknadApi.ts';
//import * as pdfApi from "~src/api/pdfApi.ts";
import { BrevInput } from '~src/components/inputs/brevInput/BrevInput.tsx';
import { AvvistBrevtyper } from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/lukkSøknadUtils.ts';
import { LukkSøknadBegrunnelse } from '~src/types/Søknad.ts';

import styles from './lukkSøknad.module.less';

//import {LukkSøknadBegrunnelse} from "~src/types/Søknad.ts";

interface AvvistProps {
    søknadId: string;
    fritekstValue: string | null;
    fritekstError?: FieldError;
    onFritekstChange: (value: string) => void;
}

const Avvist = (props: AvvistProps) => {
    console.log(props.fritekstValue);

    return (
        <div className={styles.container}>
            <BrevInput
                tekst={props.fritekstValue ?? ''}
                onVisBrevClick={() =>
                    søknadApi.hentLukketSøknadsBrevutkast({
                        søknadId: props.søknadId,
                        body: {
                            type: LukkSøknadBegrunnelse.Avvist,
                            brevConfig: {
                                brevtype: AvvistBrevtyper.Vedtaksbrev,
                                fritekst: props.fritekstValue ?? '',
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

export default Avvist;
