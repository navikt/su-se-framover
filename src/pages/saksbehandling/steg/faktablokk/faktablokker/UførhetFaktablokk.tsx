import AlertStripe from 'nav-frontend-alertstriper';
import React from 'react';

import { vilkårTittelFormatted } from '~features/saksoversikt/utils';
import { useI18n } from '~lib/hooks';
import { keyOf } from '~lib/types';

import Vilkårsblokk from '../../../vilkårsOppsummering/VilkårsBlokk';
import saksbehandlingMessages from '../../uførhet/uførhet-nb';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps, VilkårsblokkProps } from './faktablokkUtils';

export const UførhetFaktablokk = (props: FaktablokkProps) => {
    const intl = useI18n({
        messages,
    });

    return (
        <Faktablokk
            tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
            fakta={[
                {
                    tittel: intl.formatMessage({ id: 'uførhet.vedtakOmUføretrygd' }),
                    verdi: props.søknadInnhold.uførevedtak.harUførevedtak
                        ? intl.formatMessage({ id: 'fraSøknad.ja' })
                        : intl.formatMessage({ id: 'fraSøknad.nei' }),
                },
            ]}
        />
    );
};

export const UførhetVilkårsblokk = (props: VilkårsblokkProps<'uførhet'>) => {
    const intl = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
        },
    });
    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(props.info.vilkårtype)}
            status={props.info.status}
            søknadfaktablokk={<UførhetFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                props.behandlingsinformasjon === null ? (
                    <AlertStripe type="info">{intl.formatMessage({ id: 'display.ikkeVurdert' })}</AlertStripe>
                ) : (
                    <Faktablokk
                        tittel={intl.formatMessage({ id: 'display.fraSaksbehandling' })}
                        fakta={[
                            {
                                tittel: intl.formatMessage({
                                    id: keyOf<typeof saksbehandlingMessages>('radio.uførhet.legend'),
                                }),
                                verdi:
                                    props.behandlingsinformasjon.status === 'VilkårOppfylt'
                                        ? intl.formatMessage({ id: 'fraSøknad.ja' })
                                        : props.behandlingsinformasjon.status === 'VilkårIkkeOppfylt'
                                        ? intl.formatMessage({ id: 'fraSøknad.nei' })
                                        : intl.formatMessage({ id: 'radio.label.uføresakTilBehandling' }),
                            },
                        ]}
                    />
                )
            }
            begrunnelse={props.info.begrunnelse}
        />
    );
};
