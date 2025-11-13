import styles from '~src/components/oppsummering/oppsummeringAvVedtak/OppsummeringAvVedtak.module.less';
import messages from '~src/components/oppsummering/oppsummeringAvVedtak/OppsummeringAvVedtak-nb';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import SidestiltOppsummeringAvVilkårOgGrunnlag from '~src/components/oppsummering/sidestiltOppsummeringAvVilkårOgGrunnlag/SidestiltOppsummeringAvVilkårOgGrunnlag';
import { useI18n } from '~src/lib/i18n';
import { opprettOmgjøringÅrsakTekstMapper } from '~src/pages/saksbehandling/sakintro/Vedtakstabell/omgjøringsmodal-nb';
import { Sakstype } from '~src/types/Sak';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { formatDateTime } from '~src/utils/date/dateUtils';
import { splitStatusOgResultatFraSøkandsbehandling } from '~src/utils/SøknadsbehandlingUtils';
import { søknadMottatt } from '~src/utils/søknad/søknadUtils';

export const PartialOppsummeringAvSøknadsbehandling = (props: { s: Søknadsbehandling; sakstype: Sakstype }) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...opprettOmgjøringÅrsakTekstMapper } });

    return (
        <div>
            <div className={styles.vedtakOgBehandlingInfoContainer}>
                <OppsummeringPar
                    label={formatMessage('behandling.resultat')}
                    verdi={splitStatusOgResultatFraSøkandsbehandling(props.s).resultat}
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('søknadsbehandling.startet')}
                    verdi={formatDateTime(props.s.opprettet)}
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('søknadsbehandling.søknadsdato')}
                    verdi={søknadMottatt(props.s.søknad)}
                    retning={'vertikal'}
                />
                {props.s.omgjøringsårsak && props.s.omgjøringsgrunn && (
                    <>
                        <OppsummeringPar
                            label={formatMessage('label.årsak')}
                            verdi={formatMessage(props.s.omgjøringsårsak)}
                            retning={'vertikal'}
                        />
                        <OppsummeringPar
                            label={formatMessage('label.omgjøring')}
                            verdi={formatMessage(props.s.omgjøringsgrunn)}
                            retning={'vertikal'}
                        />
                    </>
                )}
            </div>
            <SidestiltOppsummeringAvVilkårOgGrunnlag
                grunnlagsdataOgVilkårsvurderinger={props.s.grunnlagsdataOgVilkårsvurderinger}
                visesSidestiltMed={props.s.søknad.søknadInnhold}
                sakstype={props.sakstype}
            />
        </div>
    );
};
