import { Heading } from '@navikt/ds-react';
import React from 'react';

import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import * as Routes from '~lib/routes';
import { Regulering } from '~types/Regulering';

interface Props {
    data: Regulering[];
}

const GReguleringTabell = ({ data }: Props) => {
    return (
        <div>
            <Heading level="1" size="medium">
                G-Reguleringsresultat
            </Heading>
            <table className="tabell">
                <thead>
                    <tr>
                        <th>Saksnummer</th>
                        <th>Type</th>
                        <th>Lenk til sak</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((d, index) => {
                        return (
                            <tr key={index}>
                                <td>{d.saksnummer}</td>
                                <td>{d.type}</td>
                                <td>
                                    <LinkAsButton
                                        variant="tertiary"
                                        href={Routes.saksoversiktValgtSak.createURL({ sakId: d.sakId })}
                                    >
                                        Se sak
                                    </LinkAsButton>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default GReguleringTabell;
