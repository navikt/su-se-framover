import React from 'react';
import { FieldError } from 'react-hook-form';

import * as PdfApi from '~src/api/pdfApi';
import { BrevInput } from '~src/components/brevInput/BrevInput';
import { Nullable } from '~src/lib/types';

import * as styles from './avslåttSøknad.module.less';

interface Props {
    søknadId: string;
    fritekstValue: Nullable<string>;
    fritekstError?: FieldError;
    onFritekstChange: (value: string) => void;
}

const AvslåttSøknad = (props: Props) => {
    return (
        <div className={styles.container}>
            <BrevInput
                tekst={props.fritekstValue ?? ''}
                onVisBrevClick={() =>
                    PdfApi.brevutkastForAvslagPgaManglendeDokumentasjon({
                        søknadId: props.søknadId,
                        body: {
                            fritekst: props.fritekstValue ?? '',
                        },
                    })
                }
                onChange={(e) => props.onFritekstChange(e.target.value)}
                feil={props.fritekstError}
            />
        </div>
    );
};

export default AvslåttSøknad;
