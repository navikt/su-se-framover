import React, { useState } from 'react';
import { reverseDateString } from '../../../HelperFunctions';
import ModalWrapper from 'nav-frontend-modal';
import { useDispatch } from 'react-redux';
import { kontrollSamtaleUpdated } from '../../../redux/saksoversikt/saksoversiktActions';
import { DialogIcon, PencilIcon } from '../../../assets/Icons';
import { useSelector } from 'react-redux';
import { BoldP, FlexDiv, FlexColumnDiv } from './StyledComponents';

const Kontrollsamtaler = () => {
    const { saksoversiktReducer } = useSelector(state => state);
    const { saksoversikt } = saksoversiktReducer;

    const kontrollsamtalerState = saksoversikt.aktivStønadsperiode.kontrollsamtaler;

    const renderKontrollsamtaler = () => {
        return (
            <FlexDiv>
                {DialogIcon()}
                <div style={{ marginLeft: '1em', width: '100%' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: ' 1fr 1fr', marginBottom: '1em' }}>
                        <BoldP>Dato</BoldP>
                        <BoldP>endre</BoldP>
                    </div>
                    {kontrollsamtalerState.map((dato, index) => (
                        <KontrollSamtale key={dato} dato={dato} index={index} />
                    ))}
                </div>
            </FlexDiv>
        );
    };

    const KontrollSamtale = ({ dato, index }) => {
        const [modalOpen, setModalOpen] = useState(false);
        const dispatch = useDispatch();

        let tempDate = dato;

        const openModal = () => {
            setModalOpen(true);
        };
        const closeModal = () => {
            setModalOpen(false);
            dispatch(kontrollSamtaleUpdated(tempDate));
        };
        const updateDate = (value, index) => {
            tempDate = { index: index, value: value };
        };

        return (
            <div style={{ display: 'grid', gridTemplateColumns: ' 1fr 1fr', marginBottom: '1em' }}>
                <p>{reverseDateString(dato)}</p>
                <p>
                    {/*TODO: Fix span allignment with Icon - span hack to limit onlick to icon only */}
                    <span onClick={() => openModal()}>{PencilIcon()}</span>
                </p>
                {modalOpen ? (
                    <ModalWrapper
                        isOpen={modalOpen}
                        onRequestClose={() => {
                            closeModal();
                        }}
                        contentLabel="kontrollModal"
                        ariaHideApp={false}
                    >
                        <div style={{ padding: '2rem 2.5rem' }}>
                            <p>Endre dato for kontrollsamtale</p>
                            <input type="date" defaultValue={dato} onChange={e => updateDate(e.target.value, index)} />
                        </div>
                    </ModalWrapper>
                ) : (
                    ''
                )}
            </div>
        );
    };

    return (
        <FlexColumnDiv>
            <p style={{ marginBottom: '1em', fontSize: '20px', fontWeight: 'bold' }}>Neste Kontrollsamtaler:</p>
            {renderKontrollsamtaler()}
        </FlexColumnDiv>
    );
};

export default Kontrollsamtaler;
