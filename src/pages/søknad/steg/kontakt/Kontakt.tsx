import * as React from 'react';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import messages from './kontakt-nb';
import TextProvider, { Languages } from '~components/TextProvider';
import { useHistory } from 'react-router-dom';

const Kontakt = (props: { forrigeUrl: string; nesteUrl: string }) => {
    const history = useHistory();

    return (
        <TextProvider messages={{ [Languages.nb]: messages }}>
            <div>
                <form
                    onSubmit={() => {
                        history.push(props.nesteUrl);
                    }}
                >
                    <Bunnknapper
                        previous={{
                            onClick: () => {
                                history.push(props.forrigeUrl);
                            }
                        }}
                    />
                </form>
            </div>
        </TextProvider>
    );
};

export default Kontakt;
