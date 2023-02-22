import * as React from 'react';

import * as Icons from '~src/assets/Icons';
import { Nullable } from '~src/lib/types';
import { Kjønn } from '~src/types/Person';

const GenderIcon = (props: { kjønn: Nullable<Kjønn> }) => {
    switch (props.kjønn) {
        case Kjønn.Kvinne:
            return <Icons.KjønnKvinne size="24px" />;
        case Kjønn.Mann:
            return <Icons.KjønnMann size="24px" />;
        case Kjønn.Ukjent:
            return <Icons.KjønnUkjent size="24px" />;
        case null:
            return <Icons.KjønnUkjent size="24px" />;
    }
};

export default GenderIcon;
