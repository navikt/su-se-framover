import * as React from 'react';
import { FormattedMessage } from 'react-intl';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import { Søknadsteg } from '../../types';
import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import messages from './uførevedtak-nb'
import TextProvider, { Languages } from '~components/TextProvider';
import sharedStyles from '../../steg-shared.module.less';

const Uførevedtak = () => {
    const harVedtakFraStore = useAppSelector(s => s.soknad.harUførevedtak);
    const [harVedtak, setHarVedtak] = React.useState<null | boolean>(harVedtakFraStore);
    const dispatch = useAppDispatch();

    return (
        <div>
            <TextProvider messages={{ [Languages.nb]: messages }}>
                <div className={sharedStyles.formContainer}>
                    <JaNeiSpørsmål
                        legend={<FormattedMessage id="input.uforevedtak.label" />}
                        feil={null}
                        fieldName="uforevedtak"
                        state={harVedtak}
                        onChange={val => {
                            setHarVedtak(val);
                        }}
                    />
                </div>

                <Bunnknapper
                    next={{
                        onClick: () => {
                            dispatch(søknadSlice.actions.harUførevedtakUpdated(harVedtak));
                        },
                        steg: Søknadsteg.FlyktningstatusOppholdstillatelse
                    }}
                />
            </TextProvider>
        </div>
    );
};

export default Uførevedtak;
