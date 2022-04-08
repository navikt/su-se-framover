import React from 'react';

import OppsummeringAvKlage from '~src/components/oppsummeringAvKlage/OppsummeringAvKlage';
import { Klage } from '~src/types/Klage';
import { Vedtak } from '~src/types/Vedtak';

interface Props {
    vedtak: Vedtak;
    klage: Klage;
}
const Klagevedtaksoppsummering = (props: Props) => {
    return <OppsummeringAvKlage klage={props.klage} klagensVedtak={props.vedtak} />;
};

export default Klagevedtaksoppsummering;
