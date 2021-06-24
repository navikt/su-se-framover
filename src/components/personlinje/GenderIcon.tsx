import * as React from 'react';

import { Kjønn } from '~api/personApi';
import * as Icons from '~assets/Icons';

const GenderIcon = (props: { kjønn: Kjønn }) => {
    switch (props.kjønn) {
        case Kjønn.Kvinne:
            return <Icons.KjønnKvinne size="24px" />;
        case Kjønn.Mann:
            return <Icons.KjønnMann size="24px" />;
        case Kjønn.Ukjent:
            return <Icons.KjønnUkjent size="24px" />;
    }
};

export default GenderIcon;
