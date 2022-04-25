import React from 'react';

import { Person } from '~src/api/personApi';
import { getEtiketter, TagWithBlack } from '~src/components/personadvarsel/PersonAdvarsel';

export const PersonAdvarsel = (props: { person: Person }) => {
    const etiketter = getEtiketter(props.person);

    return (
        <div>
            {etiketter.map((etikett) => (
                <TagWithBlack key={etikett.text} etikett={etikett} />
            ))}
        </div>
    );
};
