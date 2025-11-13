import { Accordion, Heading } from '@navikt/ds-react';

import { VilkårAlder } from '~src/components/oppsummering/sidestiltOppsummeringAvVilkårOgGrunnlag/alder/VilkårAlder.tsx';
import {
    AccordionItemBosituasjon,
    AccordionItemFastOpphold,
    AccordionItemFormue,
    AccordionItemFradrag,
    AccordionItemInstitusjonsopphold,
    AccordionItemLovligOpphold,
    AccordionItemPersonligOppmøte,
    AccordionItemUtenlandsopphold,
} from '~src/components/oppsummering/sidestiltOppsummeringAvVilkårOgGrunnlag/FellesVilkår.tsx';
import { VilkårUføre } from '~src/components/oppsummering/sidestiltOppsummeringAvVilkårOgGrunnlag/ufoere/VilkårUføre.tsx';
import { useI18n } from '~src/lib/i18n';
import { EksterneGrunnlag } from '~src/types/EksterneGrunnlag';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Sakstype } from '~src/types/Sak.ts';
import { SøknadInnhold } from '~src/types/Søknadinnhold';
import styles from './SidestiltOppsummeringAvVilkårOgGrunnlag.module.less';
import messages from './SidestiltOppsummeringAvVilkårOgGrunnlag-nb';

/*
TODO:
 2. skille mellom (grunnlagvilkår mot grunnlagvilkår) og (grunnlagvilkår mot søknadsdiff)
 SOS: rekkefølgen her bør henge sammen med rekkefølgen definert i vilkår.tsx -> der er det definert med forrige og nesteUrl
 */
const SidestiltOppsummeringAvVilkårOgGrunnlag = (props: {
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    visesSidestiltMed: GrunnlagsdataOgVilkårsvurderinger | SøknadInnhold;
    eksterneGrunnlag?: EksterneGrunnlag;
    sakstype: Sakstype;
}) => {
    const { formatMessage } = useI18n({ messages });

    const sidestiltMedSøknad = sidestiltMedSøknadInnhold(props.visesSidestiltMed);
    const sidestiltMedGrunnlagOgVilkår = sidestiltMedGrunnlagsdataOgVilkårsvurderinger(props.visesSidestiltMed);

    return (
        <div>
            <div className={styles.accordionOverskrift}>
                {sidestiltMedSøknad ? (
                    <Heading size="medium">{formatMessage('accordion.overskrift.fraSaksbehandling')}</Heading>
                ) : (
                    <Heading size="medium">{formatMessage('accordion.overskrift.nyVedtaksinformasjon')}</Heading>
                )}
                {sidestiltMedGrunnlagOgVilkår && (
                    <Heading size="medium">
                        {formatMessage('accordion.overskrift.eksisterendeVedtaksinformasjon')}
                    </Heading>
                )}
                {sidestiltMedSøknad && (
                    <Heading size="medium">{formatMessage('accordion.overskrift.fraSøknad')}</Heading>
                )}
            </div>
            {props.sakstype === Sakstype.Uføre && (
                <VilkårUføre
                    uføre={props.grunnlagsdataOgVilkårsvurderinger.uføre}
                    flyktning={props.grunnlagsdataOgVilkårsvurderinger.flyktning}
                    visesSidestiltMed={props.visesSidestiltMed}
                    sidestiltMedSøknad={sidestiltMedSøknad}
                    sidestiltMedGrunnlagOgVilkår={sidestiltMedGrunnlagOgVilkår}
                />
            )}
            {props.sakstype === Sakstype.Alder && (
                <VilkårAlder
                    familiegjenforening={props.grunnlagsdataOgVilkårsvurderinger.familiegjenforening}
                    pensjon={props.grunnlagsdataOgVilkårsvurderinger.pensjon}
                    visesSidestiltMed={props.visesSidestiltMed}
                    sidestiltMedSøknad={sidestiltMedSøknad}
                    sidestiltMedGrunnlagOgVilkår={sidestiltMedGrunnlagOgVilkår}
                />
            )}
            <Accordion>
                <AccordionItemLovligOpphold
                    lovligOppholdFraGrunnlag={props.grunnlagsdataOgVilkårsvurderinger.lovligOpphold}
                    sidestiltLovligOppholdVilkår={
                        sidestiltMedGrunnlagOgVilkår
                            ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).lovligOpphold
                            : undefined
                    }
                    sidestiltOppholdstillatelseFraSøknad={
                        sidestiltMedSøknad ? (props.visesSidestiltMed as SøknadInnhold).oppholdstillatelse : undefined
                    }
                />
                <AccordionItemFastOpphold
                    fastOppholdFraGrunnlag={props.grunnlagsdataOgVilkårsvurderinger.fastOpphold}
                    sidestiltFastOppholdVilkår={
                        sidestiltMedGrunnlagOgVilkår
                            ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).fastOpphold
                            : undefined
                    }
                    sidestiltOppholdstillatelseFraSøknad={
                        sidestiltMedSøknad
                            ? {
                                  oppholdstillatelse: (props.visesSidestiltMed as SøknadInnhold).oppholdstillatelse,
                                  boforhold: (props.visesSidestiltMed as SøknadInnhold).boforhold,
                              }
                            : undefined
                    }
                />
                <AccordionItemInstitusjonsopphold
                    institusjonsoppholdFraGrunnlag={props.grunnlagsdataOgVilkårsvurderinger.institusjonsopphold}
                    sidestiltInstitusjonsopphold={
                        sidestiltMedGrunnlagOgVilkår
                            ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).institusjonsopphold
                            : undefined
                    }
                    sidestiltInstitusjonsoppholdFraSøknad={
                        sidestiltMedSøknad
                            ? (props.visesSidestiltMed as SøknadInnhold).boforhold.innlagtPåInstitusjon
                            : undefined
                    }
                />
                <AccordionItemUtenlandsopphold
                    utenlandsoppholdFraGrunnlag={props.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold}
                    sidestiltUtenlandsopphold={
                        sidestiltMedGrunnlagOgVilkår
                            ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).utenlandsopphold
                            : undefined
                    }
                    sidestiltUtenlandsoppholdFraSøknad={
                        sidestiltMedSøknad ? (props.visesSidestiltMed as SøknadInnhold).utenlandsopphold : undefined
                    }
                />
                <AccordionItemBosituasjon
                    bosituasjonFraGrunnlag={props.grunnlagsdataOgVilkårsvurderinger.bosituasjon}
                    sidestiltBosituasjon={
                        sidestiltMedGrunnlagOgVilkår
                            ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).bosituasjon
                            : undefined
                    }
                    boforholdFraSøknad={
                        sidestiltMedSøknad ? (props.visesSidestiltMed as SøknadInnhold).boforhold : undefined
                    }
                />
                <AccordionItemFormue
                    formueFraGrunnlag={props.grunnlagsdataOgVilkårsvurderinger.formue}
                    sidestiltFormue={
                        sidestiltMedGrunnlagOgVilkår
                            ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).formue
                            : undefined
                    }
                    sidestiltFormueFraSøknad={
                        sidestiltMedSøknad
                            ? {
                                  søkers: (props.visesSidestiltMed as SøknadInnhold).formue,
                                  eps: (props.visesSidestiltMed as SøknadInnhold).ektefelle?.formue,
                              }
                            : undefined
                    }
                    eksternGrunnlagSkatt={props.eksterneGrunnlag?.skatt ?? null}
                />
                <AccordionItemPersonligOppmøte
                    personligOppmøteFraGrunnlag={props.grunnlagsdataOgVilkårsvurderinger.personligOppmøte}
                    sidestiltPersonligOppmøte={
                        sidestiltMedGrunnlagOgVilkår
                            ? (props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).personligOppmøte
                            : undefined
                    }
                    sidestiltForNav={sidestiltMedSøknad ? (props.visesSidestiltMed as SøknadInnhold).forNav : undefined}
                />
                {sidestiltMedGrunnlagOgVilkår && (
                    <AccordionItemFradrag
                        fradragFraGrunnlag={props.grunnlagsdataOgVilkårsvurderinger.fradrag}
                        sidestiltFradrag={(props.visesSidestiltMed as GrunnlagsdataOgVilkårsvurderinger).fradrag}
                    />
                )}
            </Accordion>
        </div>
    );
};

const sidestiltMedSøknadInnhold = (
    sidestilt: GrunnlagsdataOgVilkårsvurderinger | SøknadInnhold,
): sidestilt is SøknadInnhold => 'forNav' in sidestilt;

const sidestiltMedGrunnlagsdataOgVilkårsvurderinger = (
    sidestilt: GrunnlagsdataOgVilkårsvurderinger | SøknadInnhold,
): sidestilt is GrunnlagsdataOgVilkårsvurderinger => 'bosituasjon' in sidestilt;

export default SidestiltOppsummeringAvVilkårOgGrunnlag;
