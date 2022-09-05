import { Alert } from '@navikt/ds-react';
import React from 'react';

import OppsummeringAvUførevilkår from '~src/components/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvUføre';
import { useI18n } from '~src/lib/i18n';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { SøknadInnholdUføre } from '~src/types/Søknad';
import { Vilkårsinformasjon, vilkårTittelFormatted } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';

export interface UføreVilkårsblokkProps {
    info: Vilkårsinformasjon;
    søknadInnhold: SøknadInnholdUføre;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}

export const UførhetFaktablokk = ({ søknadInnhold }: { søknadInnhold: SøknadInnholdUføre }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Faktablokk
            tittel={formatMessage('display.fraSøknad')}
            fakta={[
                {
                    tittel: formatMessage('uførhet.vedtakOmUføretrygd'),
                    verdi: søknadInnhold.uførevedtak.harUførevedtak
                        ? formatMessage('fraSøknad.ja')
                        : formatMessage('fraSøknad.nei'),
                },
            ]}
        />
    );
};

export const UførhetVilkårsblokk = (props: UføreVilkårsblokkProps) => {
    const { formatMessage } = useI18n({ messages });

    const { uføre } = props.grunnlagsdataOgVilkårsvurderinger;
    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(props.info.vilkårtype)}
            status={props.info.status}
            søknadfaktablokk={<UførhetFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                uføre === null ? (
                    <Alert variant="info">{formatMessage('display.ikkeVurdert')}</Alert>
                ) : (
                    <>
                        <OppsummeringAvUførevilkår
                            uførevilkår={props.grunnlagsdataOgVilkårsvurderinger.uføre}
                            visesIVedtak
                        />
                    </>
                )
            }
        />
    );
};
