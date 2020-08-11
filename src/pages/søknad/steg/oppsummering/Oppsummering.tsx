import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { Person } from '~api/personApi';
import * as innsendingSlice from '~features/søknad/innsending.slice';
import { trackEvent, søknadSendInn } from '~lib/tracking/trackingEvents';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';

import Søknadoppsummering from './Søknadoppsummering/Søknadoppsummering';

const Oppsummering = (props: { forrigeUrl: string; nesteUrl: string; søker: Person }) => {
    const history = useHistory();
    const søknadFraStore = useAppSelector((s) => s.soknad);
    const dispatch = useAppDispatch();

    return (
        <div className={sharedStyles.container}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    dispatch(
                        innsendingSlice.sendSøknad({
                            søknad: søknadFraStore,
                            søker: props.søker,
                        })
                    );
                    history.push(props.nesteUrl);
                    trackEvent(søknadSendInn({ ident: props.søker.aktorId }));
                }}
            >
                <Søknadoppsummering søknad={søknadFraStore} søker={props.søker} />

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
