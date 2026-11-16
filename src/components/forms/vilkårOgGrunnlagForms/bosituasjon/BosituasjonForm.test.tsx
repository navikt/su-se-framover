import { renderToStaticMarkup } from 'react-dom/server';
import { useForm } from 'react-hook-form';

import { Fødsel, Person } from '~src/types/Person';

import messages from '../VilkårOgGrunnlagForms-nb';
import { EpsFyller67Varsel, ErEpsFylt67Felt } from './BosituasjonForm';
import { BosituasjonGrunnlagFormData, nyBosituasjon } from './BosituasjonFormUtils';

const periode = { fraOgMed: new Date(2026, 0, 1), tilOgMed: new Date(2026, 11, 31) };
const fødsel = (dato: string | null): Fødsel => ({ dato, år: 1959, alder: 66 });
const eps: Person = {
    fnr: '',
    aktorId: '',
    navn: { fornavn: '', mellomnavn: null, etternavn: '' },
    fødsel: null,
    telefonnummer: { landskode: '', nummer: '' },
    adresse: null,
    adressebeskyttelse: null,
    skjermet: null,
    sivilstand: null,
    kontaktinfo: null,
    vergemål: null,
    dødsdato: null,
    dødsbo: null,
};

const Aldersfelt = (props: { fødsel: Fødsel | null }) => {
    const form = useForm<BosituasjonGrunnlagFormData>({
        defaultValues: { bosituasjoner: [nyBosituasjon()] },
    });

    return (
        <ErEpsFylt67Felt
            form={form}
            nameAndIdx="bosituasjoner.0"
            eps={{ ...eps, fødsel: props.fødsel }}
            periodeFraOgMed={periode.fraOgMed}
        />
    );
};

describe('ErEpsFylt67Felt', () => {
    it.each(['1958-01-01', '1960-06-15'])('låser feltet ved gyldig fødselsdato (%s)', (dato) => {
        const markup = renderToStaticMarkup(<Aldersfelt fødsel={fødsel(dato)} />);

        expect(markup).toContain('navds-radio--readonly');
        expect(markup).toContain(messages['bosituasjon.erEPSFylt67Forhåndsutfylt']);
        expect(markup).not.toContain(messages['bosituasjon.erEPSFylt67ForhåndsutfyltUsikkert']);
    });

    it.each([
        null,
        '',
        'ugyldig',
        '1959-02-30',
    ])('lar feltet være redigerbart og viser fødselsårsfallback ved manglende eller ugyldig dato (%s)', (dato) => {
        const markup = renderToStaticMarkup(<Aldersfelt fødsel={{ ...fødsel(dato), år: 1958 }} />);

        expect(markup).not.toContain('navds-radio--readonly');
        expect(markup).toContain(messages['bosituasjon.erEPSFylt67ForhåndsutfyltUsikkert']);
        expect(markup).not.toContain(messages['bosituasjon.erEPSFylt67Forhåndsutfylt']);
    });

    it('lar feltet være redigerbart uten forhåndsutfyllingstekst når fødselsåret ikke avgjør alderen', () => {
        const markup = renderToStaticMarkup(<Aldersfelt fødsel={fødsel(null)} />);

        expect(markup).not.toContain('navds-radio--readonly');
        expect(markup).not.toContain(messages['bosituasjon.erEPSFylt67Forhåndsutfylt']);
        expect(markup).not.toContain(messages['bosituasjon.erEPSFylt67ForhåndsutfyltUsikkert']);
    });

    it('lar feltet være redigerbart når fødselsopplysninger mangler helt', () => {
        const markup = renderToStaticMarkup(<Aldersfelt fødsel={null} />);

        expect(markup).not.toContain('navds-radio--readonly');
        expect(markup).not.toContain(messages['bosituasjon.erEPSFylt67Forhåndsutfylt']);
        expect(markup).not.toContain(messages['bosituasjon.erEPSFylt67ForhåndsutfyltUsikkert']);
    });
});

describe('EpsFyller67Varsel', () => {
    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(new Date(2026, 5, 15, 14, 30));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it.each([
        '1959-01-01',
        '1959-06-15',
        '1959-12-31',
    ])('inkluderer 67-årsdagen i perioden for fødselsdato %s', (dato) => {
        jest.setSystemTime(new Date(2025, 11, 31));

        const markup = renderToStaticMarkup(
            <EpsFyller67Varsel
                eps={{ ...eps, fødsel: fødsel(dato) }}
                periode={periode}
                søknadsbehandlingEllerRevurdering="Søknadsbehandling"
            />,
        );

        expect(markup).toContain(messages['bosituasjon.epsFyller67IPeriodenAutomatiskOppgave']);
    });

    it.each(['1958-12-31', '1960-01-01'])('viser ikke varsel for 67-årsdag utenfor perioden (%s)', (dato) => {
        expect(
            renderToStaticMarkup(
                <EpsFyller67Varsel
                    eps={{ ...eps, fødsel: fødsel(dato) }}
                    periode={periode}
                    søknadsbehandlingEllerRevurdering="Søknadsbehandling"
                />,
            ),
        ).toBe('');
    });

    it.each([
        '1959-01-01',
        '1959-06-14',
        '1959-06-15',
    ])('viser satsvurdering uten automatikk når 67-årsdagen er i dag eller tidligere (%s)', (dato) => {
        const markup = renderToStaticMarkup(
            <EpsFyller67Varsel
                eps={{ ...eps, fødsel: fødsel(dato) }}
                periode={periode}
                søknadsbehandlingEllerRevurdering="Søknadsbehandling"
            />,
        );

        expect(markup).toContain(messages['bosituasjon.epsHarFylt67IPerioden']);
        expect(markup).not.toContain('automatisk');
    });

    it('viser automatikktekst når 67-årsdagen er i morgen', () => {
        const markup = renderToStaticMarkup(
            <EpsFyller67Varsel
                eps={{ ...eps, fødsel: fødsel('1959-06-16') }}
                periode={periode}
                søknadsbehandlingEllerRevurdering="Søknadsbehandling"
            />,
        );

        expect(markup).toContain(messages['bosituasjon.epsFyller67IPeriodenAutomatiskOppgave']);
    });

    it.each([
        null,
        '',
        'ugyldig',
        '1959-02-30',
    ])('beholder varsel basert på fødselsår uten å love automatikk ved manglende eller ugyldig dato (%s)', (dato) => {
        const markup = renderToStaticMarkup(
            <EpsFyller67Varsel
                eps={{ ...eps, fødsel: fødsel(dato) }}
                periode={periode}
                søknadsbehandlingEllerRevurdering="Søknadsbehandling"
            />,
        );

        expect(markup).toContain('Basert på fødselsår');
        expect(markup).toContain('2026');
        expect(markup).not.toContain('automatisk');
    });

    it('beholder varsel om ukjent fødselsdato når fødselsopplysninger mangler', () => {
        const markup = renderToStaticMarkup(
            <EpsFyller67Varsel eps={eps} periode={periode} søknadsbehandlingEllerRevurdering="Søknadsbehandling" />,
        );

        expect(markup).toContain(messages['bosituasjon.epsFødselsdatoUgyldig']);
        expect(markup).not.toContain('automatisk');
    });

    it.each([
        '1959-01-01',
        '1959-06-15',
        '1959-12-31',
    ])('beholder manuell påminnelse i revurdering uavhengig av dagens dato (%s)', (dato) => {
        const markup = renderToStaticMarkup(
            <EpsFyller67Varsel
                eps={{ ...eps, fødsel: fødsel(dato) }}
                periode={periode}
                søknadsbehandlingEllerRevurdering="Revurdering"
            />,
        );

        expect(markup).toContain(messages['bosituasjon.epsFyller67IPerioden']);
        expect(markup).not.toContain('automatisk');
    });
});
