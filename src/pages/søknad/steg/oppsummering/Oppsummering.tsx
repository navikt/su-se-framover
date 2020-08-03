import * as RemoteData from '@devexperts/remote-data-ts';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import * as innsendingSlice from '~features/søknad/innsending.slice';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';

import Søknadoppsummering from './Søknadoppsummering/Søknadoppsummering';

const Oppsummering = (props: { forrigeUrl: string; nesteUrl: string }) => {
    const history = useHistory();
    const søknadFraStore = useAppSelector((s) => s.soknad);
    const søkerFraStore = useAppSelector((s) => s.søker.søker);
    const dispatch = useAppDispatch();

    return (
        <div className={sharedStyles.container}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (RemoteData.isSuccess(søkerFraStore)) {
                        dispatch(
                            innsendingSlice.sendSøknad({
                                søknad: søknadFraStore,
                                søker: søkerFraStore.value,
                            })
                        );
                        history.push(props.nesteUrl);
                    }
                }}
            >
                <Søknadoppsummering søknad={søknadFraStore} />

                <Bunnknapper
                    previous={{
                        onClick: () => {
                            history.push(props.forrigeUrl);
                        },
                    }}
                    next={{
                        label: <FormattedMessage id="steg.sendInn" />,
                    }}
                />
            </form>
        </div>
    );
};

export default Oppsummering;
