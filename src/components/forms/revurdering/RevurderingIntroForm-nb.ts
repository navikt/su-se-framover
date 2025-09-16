import { omgjøringsgrunnerTekstMapper } from '~src/components/forms/revurdering/Omgjøringgrunner-nb';
import { InformasjonSomRevurderesTextMapper } from '~src/typeMappinger/InformasjonSomRevurderesTextMapper';
import { opprettRevurderingÅrsakTekstMapper } from '~src/typeMappinger/OpprettRevurderingÅrsak';

export default {
    'datovelger.fom.legend': 'Fra',
    'datovelger.tom.legend': 'Til',
    'periode.overskrift': 'Periode',
    'revurdering.begrunnelse': 'Begrunnelse',
    'revurdering.begrunnelse.description': 'Unngå personsensitive opplysninger',

    'input.årsak.label': 'Årsak for revurdering',
    'input.omgjøringsgrunn.label': 'Omgjøringsgrunn',
    'input.omgjøringsgrunn.value': 'Velg en omgjøringsgrunn',
    'input.årsak.value.default': 'Velg årsak',
    'input.begrunnelse.label': 'Begrunnelse',
    'input.informasjonSomRevurderes.label': 'Hva vil du revurdere?',
    'info.bosituasjon': 'Ved boforhold kan det være relevant å endre inntekt og formue også',

    ...opprettRevurderingÅrsakTekstMapper,
    ...InformasjonSomRevurderesTextMapper,
    ...omgjøringsgrunnerTekstMapper,
};
