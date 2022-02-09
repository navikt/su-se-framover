import React, { useState } from 'react';

import Resultat from './reguleringsoversikt';
import Startside from './reguleringsstartside';

const Regulering = () => {
    const [reguleringer, setReguleringer] = useState<string[]>([]);

    return reguleringer.length === 0 ? (
        <Startside setReguleringer={(s: string) => setReguleringer([s])} />
    ) : (
        <Resultat />
    );
};

export default Regulering;
