import React from 'react';

import OppsummeringAvKlage from '~components/oppsummeringAvKlage/OppsummeringAvKlage';
import { Klage } from '~types/Klage';
import { Vedtak } from '~types/Vedtak';

interface Props {
    vedtak: Vedtak;
    klage: Klage;
}
const Klagevedtaksoppsummering = (props: Props) => {
    return <OppsummeringAvKlage klage={props.klage} klagensVedtak={props.vedtak} />;
};

export default Klagevedtaksoppsummering;
