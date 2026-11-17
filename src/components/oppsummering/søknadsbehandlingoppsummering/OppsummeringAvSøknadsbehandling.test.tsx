import * as RemoteData from '@devexperts/remote-data-ts';
import { renderToStaticMarkup } from 'react-dom/server';

import { useApiCall } from '~src/lib/hooks';
import { BosituasjonTyper } from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { Person } from '~src/types/Person';
import { Sakstype } from '~src/types/Sak';
import { Søknadstype } from '~src/types/Søknadinnhold';
import { Søknadsbehandling, SøknadsbehandlingStatus, Valg } from '~src/types/Søknadsbehandling';

import OppsummeringAvSøknadsbehandling from './OppsummeringAvSøknadsbehandling';
import messages from './OppsummeringAvSøknadsbehandling-nb';

jest.mock('~src/lib/hooks', () => ({
    ...jest.requireActual<typeof import('~src/lib/hooks')>('~src/lib/hooks'),
    useApiCall: jest.fn(),
}));
jest.mock('../sidestiltOppsummeringAvVilkårOgGrunnlag/SidestiltOppsummeringAvVilkårOgGrunnlag', () => ({
    __esModule: true,
    default: () => null,
}));
jest.mock('../oppsummeringAvBeregningOgsimulering/OppsummeringAvBeregningOgSimulering', () => ({
    __esModule: true,
    default: () => null,
}));

const periode = { fraOgMed: '2026-01-01', tilOgMed: '2026-12-31' };
const eps: Person = {
    fnr: 'eps-test',
    aktorId: '',
    navn: { fornavn: '', mellomnavn: null, etternavn: '' },
    fødsel: { dato: '1959-10-24', år: 1959, alder: 67 },
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
const behandling: Søknadsbehandling = {
    id: 'behandling-test',
    sakId: 'sak-test',
    sakstype: Sakstype.Uføre,
    status: SøknadsbehandlingStatus.TIL_ATTESTERING_INNVILGET,
    opprettet: '2026-01-01T12:00:00Z',
    attesteringer: [],
    saksbehandler: null,
    stønadsperiode: { periode },
    beregning: null,
    simulering: null,
    erLukket: false,
    aldersvurdering: null,
    eksterneGrunnlag: { skatt: null },
    omgjøringsårsak: null,
    omgjøringsgrunn: null,
    brevvalg: { valg: Valg.IKKE_SEND, fritekst: null },
    grunnlagsdataOgVilkårsvurderinger: {
        pensjon: null,
        familiegjenforening: null,
        uføre: null,
        flyktning: null,
        fastOpphold: null,
        lovligOpphold: null,
        fradrag: [],
        bosituasjon: [
            {
                type: BosituasjonTyper.EPS_IKKE_UFØR_FLYKTNING,
                fnr: eps.fnr,
                periode,
                sats: '',
                delerBolig: null,
                ektemakeEllerSamboerUførFlyktning: false,
            },
        ],
        formue: { formuegrenser: [], resultat: null, vurderinger: [], vilkår: 'Formue' },
        utenlandsopphold: null,
        opplysningsplikt: null,
        personligOppmøte: null,
        institusjonsopphold: null,
        vedtaksbrev: null,
    },
    søknad: {
        id: 'søknad-test',
        sakId: 'sak-test',
        opprettet: '2026-01-01T12:00:00Z',
        innsendtAv: '',
        lukket: null,
        søknadInnhold: {
            type: Sakstype.Uføre,
            personopplysninger: { fnr: 'søker-test' },
            uførevedtak: { harUførevedtak: true },
            flyktningsstatus: { registrertFlyktning: true },
            oppholdstillatelse: {
                erNorskStatsborger: false,
                harOppholdstillatelse: true,
                typeOppholdstillatelse: null,
                statsborgerskapAndreLand: false,
                statsborgerskapAndreLandFritekst: null,
            },
            boforhold: {
                borOgOppholderSegINorge: true,
                delerBoligMedVoksne: true,
                delerBoligMed: null,
                ektefellePartnerSamboer: { fnr: eps.fnr, erUførFlyktning: false },
                innlagtPåInstitusjon: null,
                borPåAdresse: null,
                ingenAdresseGrunn: null,
            },
            utenlandsopphold: { registrertePerioder: null, planlagtePerioder: null },
            inntektOgPensjon: {
                forventetInntekt: null,
                andreYtelserINav: null,
                andreYtelserINavBeløp: null,
                søktAndreYtelserIkkeBehandletBegrunnelse: null,
                trygdeytelserIUtlandet: null,
                pensjon: null,
            },
            formue: {
                borIBolig: null,
                verdiPåBolig: null,
                boligBrukesTil: null,
                depositumsBeløp: null,
                verdiPåEiendom: null,
                eiendomBrukesTil: null,
                kjøretøy: null,
                innskuddsBeløp: null,
                verdipapirBeløp: null,
                skylderNoenMegPengerBeløp: null,
                kontanterBeløp: null,
            },
            ektefelle: null,
            forNav: { type: Søknadstype.DigitalSøknad, harFullmektigEllerVerge: null },
        },
    },
};

describe('OppsummeringAvSøknadsbehandling', () => {
    beforeEach(() => {
        jest.mocked(useApiCall).mockReturnValue([RemoteData.success(eps), jest.fn(), jest.fn()]);
    });

    it.each([undefined, false])('viser EPS-varselet når skjulEpsVarsel er %s', (skjulEpsVarsel) => {
        const markup = renderToStaticMarkup(
            <OppsummeringAvSøknadsbehandling behandling={behandling} skjulEpsVarsel={skjulEpsVarsel} />,
        );

        expect(markup).toContain(messages['eps.fyller67IPerioden']);
    });

    it('skjuler EPS-varselet ved underkjenning uten å skjule resten av oppsummeringen', () => {
        const markup = renderToStaticMarkup(<OppsummeringAvSøknadsbehandling behandling={behandling} skjulEpsVarsel />);

        expect(markup).not.toContain(messages['eps.fyller67IPerioden']);
        expect(markup).toContain(messages['oppsummering.søknadsbehandling']);
    });
});
