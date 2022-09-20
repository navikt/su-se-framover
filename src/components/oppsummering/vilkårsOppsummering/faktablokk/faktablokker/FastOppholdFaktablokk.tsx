import { Alert } from '@navikt/ds-react';
import React from 'react';

import { IngenAdresseGrunn } from '~src/api/personApi';
import OppsummeringAvFastOppholdvilkår from '~src/components/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFastOpphold';
import { MessageFormatter, useI18n } from '~src/lib/i18n';
import boOgOppholdSøknadMessages from '~src/pages/søknad/steg/bo-og-opphold-i-norge/bo-og-opphold-i-norge-nb';
import flyktningstatusSøknadMessages from '~src/pages/søknad/steg/flyktningstatus-oppholdstillatelse/flyktningstatus-oppholdstillatelse-nb';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { SøknadInnhold } from '~src/types/Søknadinnhold';
import { VilkårtypeFelles, VilkårVurderingStatus } from '~src/types/Vilkårsvurdering';
import { formatAdresse } from '~src/utils/format/formatUtils';
import { vilkårTittelFormatted } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import saksbehandlingMessages from '../../../../../pages/saksbehandling/søknadsbehandling/fast-opphold-i-norge/fastOppholdINorge-nb';
import Vilkårsblokk from '../../VilkårsBlokk';
import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps } from './faktablokkUtils';

export const FastOppholdFaktablokk = (props: FaktablokkProps) => {
    const { formatMessage } = useI18n({
        messages: {
            ...messages,
            ...flyktningstatusSøknadMessages,
            ...boOgOppholdSøknadMessages,
        },
    });
    return (
        <Faktablokk
            tittel={formatMessage('display.fraSøknad')}
            fakta={createFaktaBlokkArray(props.søknadInnhold, formatMessage)}
        />
    );
};
const createFaktaBlokkArray = (
    søknadsInnhold: SøknadInnhold,
    formatMessage: MessageFormatter<
        typeof messages & typeof flyktningstatusSøknadMessages & typeof boOgOppholdSøknadMessages
    >
) => {
    const arr = [];
    arr.push({
        tittel: formatMessage('norsk.statsborger.label'),
        verdi: søknadsInnhold.oppholdstillatelse.erNorskStatsborger
            ? formatMessage('fraSøknad.ja')
            : formatMessage('fraSøknad.nei'),
    });
    if (!søknadsInnhold.oppholdstillatelse.erNorskStatsborger) {
        arr.push({
            tittel: formatMessage('oppholdstillatelse.label'),
            verdi: søknadsInnhold.oppholdstillatelse.harOppholdstillatelse
                ? formatMessage('fraSøknad.ja')
                : formatMessage('fraSøknad.nei'),
        });
        arr.push({
            tittel: formatMessage('oppholdstillatelse.type'),
            verdi: søknadsInnhold.oppholdstillatelse.typeOppholdstillatelse ?? formatMessage('fraSøknad.ikkeRegistert'),
        });
    }
    arr.push({
        tittel: formatMessage('fastOpphold.adresse'),
        verdi: søknadsInnhold.boforhold.borPåAdresse
            ? formatAdresse(søknadsInnhold.boforhold.borPåAdresse)
            : søknadsInnhold.boforhold.ingenAdresseGrunn === IngenAdresseGrunn.BOR_PÅ_ANNEN_ADRESSE
            ? formatMessage('adresse.ingenAdresse.borPåAnnenAdresse')
            : søknadsInnhold.boforhold.ingenAdresseGrunn === IngenAdresseGrunn.HAR_IKKE_FAST_BOSTED
            ? formatMessage('adresse.ingenAdresse.harIkkeFastBosted')
            : formatMessage('fraSøknad.ikkeRegistert'),
    });
    return arr;
};

interface Props {
    søknadInnhold: SøknadInnhold;
    fastOppholdVilkår: GrunnlagsdataOgVilkårsvurderinger['fastOpphold'];
    status: VilkårVurderingStatus;
}

export const FastOppholdVilkårsblokk = (props: Props) => {
    const { formatMessage } = useI18n({
        messages: {
            ...messages,
            ...saksbehandlingMessages,
        },
    });
    return (
        <Vilkårsblokk
            tittel={vilkårTittelFormatted(VilkårtypeFelles.FastOppholdINorge)}
            søknadfaktablokk={<FastOppholdFaktablokk søknadInnhold={props.søknadInnhold} />}
            saksbehandlingfaktablokk={
                props.fastOppholdVilkår === null ? (
                    <Alert variant="info">{formatMessage('display.ikkeVurdert')}</Alert>
                ) : (
                    <OppsummeringAvFastOppholdvilkår fastOpphold={props.fastOppholdVilkår} visesIVedtak />
                )
            }
            status={props.status}
        />
    );
};
