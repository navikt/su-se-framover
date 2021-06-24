import { Nullable } from '../../../lib/types';
import { Periode } from '../../Periode';

export enum BosituasjonTyper {
    DELER_BOLIG_MED_VOKSNE = 'DELER_BOLIG_MED_VOKSNE',
    EPS_IKKE_UFØR_FLYKTNING = 'EPS_IKKE_UFØR_FLYKTNING',
    EPS_OVER_67 = 'EPS_OVER_67',
    EPS_UFØR_FLYKTNING = 'EPS_UFØR_FLYKTNING',
    ENSLIG = 'ENSLIG',
    UFULLSTENDIG_HAR_EPS = 'UFULLSTENDIG_HAR_EPS',
    UFULLSTENDIG_HAR_IKKE_EPS = 'UFULLSTENDIG_HAR_IKKE_EPS',
}

// Fullstendig bostituasjonstyper
interface BosituasjonBase<T extends BosituasjonTyper = BosituasjonTyper> {
    type: T;
    periode: Periode<string>;
}

interface FullstendigBosituasjonBase<T extends BosituasjonTyper = BosituasjonTyper> extends BosituasjonBase<T> {
    sats: string;
    begrunnelse: Nullable<string>;
}

interface UfullstendigBosituasjonBase<T extends BosituasjonTyper = BosituasjonTyper> extends BosituasjonBase<T> {
    sats: null;
    begrunnelse: null;
}

interface DelerBoligMedVoksne extends FullstendigBosituasjonBase<BosituasjonTyper.DELER_BOLIG_MED_VOKSNE> {
    fnr: null;
    delerBolig: true;
    ektemakeEllerSamboerUførFlyktning: null;
}

interface Under67IkkeUfør extends FullstendigBosituasjonBase<BosituasjonTyper.EPS_IKKE_UFØR_FLYKTNING> {
    fnr: string;
    delerBolig: null;
    ektemakeEllerSamboerUførFlyktning: false;
}

interface Under67Ufør extends FullstendigBosituasjonBase<BosituasjonTyper.EPS_UFØR_FLYKTNING> {
    fnr: string;
    delerBolig: null;
    ektemakeEllerSamboerUførFlyktning: true;
}

interface SektiSyvEllerEldre extends FullstendigBosituasjonBase<BosituasjonTyper.EPS_OVER_67> {
    fnr: string;
    delerBolig: null;
    ektemakeEllerSamboerUførFlyktning: false;
}

interface Enslig extends FullstendigBosituasjonBase<BosituasjonTyper.ENSLIG> {
    fnr: null;
    delerBolig: false;
    ektemakeEllerSamboerUførFlyktning: null;
}

// Ufullstendig bostituasjonstyper
interface HarEps extends UfullstendigBosituasjonBase<BosituasjonTyper.UFULLSTENDIG_HAR_EPS> {
    fnr: string;
    delerBolig: true;
    ektemakeEllerSamboerUførFlyktning: null;
}

interface HarIkkeEps extends UfullstendigBosituasjonBase<BosituasjonTyper.UFULLSTENDIG_HAR_IKKE_EPS> {
    fnr: null;
    delerBolig: null;
    ektemakeEllerSamboerUførFlyktning: null;
}

export type FullstendigBosituasjon = DelerBoligMedVoksne | Under67IkkeUfør | Under67Ufør | SektiSyvEllerEldre | Enslig;
export type UfullstendigBosituasjon = HarEps | HarIkkeEps;

export type Bosituasjon = FullstendigBosituasjon | UfullstendigBosituasjon;

export const erBosituasjonFullstendig = (b: Bosituasjon): b is FullstendigBosituasjon => {
    if (!b) return false;
    return [
        BosituasjonTyper.DELER_BOLIG_MED_VOKSNE,
        BosituasjonTyper.EPS_IKKE_UFØR_FLYKTNING,
        BosituasjonTyper.EPS_OVER_67,
        BosituasjonTyper.EPS_UFØR_FLYKTNING,
        BosituasjonTyper.ENSLIG,
    ].includes(b.type);
};
