import * as React from 'react';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import sharedStyles from '../../steg-shared.module.less';
import { useHistory } from 'react-router-dom';
import * as innsendingSlice from '~features/søknad/innsending.slice';

import * as RemoteData from '@devexperts/remote-data-ts';
import Søknadoppsummering from './Søknadoppsummering/Søknadoppsummering';

const Oppsummering = (props: { forrigeUrl: string }) => {
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
                />
            </form>
        </div>
    );
};

export default Oppsummering;
