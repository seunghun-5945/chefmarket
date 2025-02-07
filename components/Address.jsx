import React from 'react';
import { Modal, SafeAreaView } from 'react-native';
import OriginalPostcode from '@actbase/react-daum-postcode';

// 래퍼 컴포넌트 생성
const PostcodeWrapper = React.forwardRef((props, ref) => {
  return <OriginalPostcode {...props} ref={ref} />;
});

const Address = ({ visible, onClose, onSelect }) => {
    const getAddressData = (data) => {
        let defaultAddress = '';
        let fullAddress = data.address;
        
        if(data.buildingName === '') {
            defaultAddress = '';
        }
        else if(data.buildingName === 'N') {
            defaultAddress = data.apartment ? `(${data.apartment})` : '';
        }
        else {
            defaultAddress = `(${data.buildingName})`;
        }

        const finalAddress = defaultAddress ? `${fullAddress} ${defaultAddress}` : fullAddress;
        onSelect(finalAddress);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <PostcodeWrapper
                    style={{ width: '100%', height: '100%' }}
                    jsOptions={{ 
                        animation: true,
                        hideMapBtn: true
                    }}
                    onSelected={getAddressData}
                    onError={(error) => console.log('주소 검색 에러:', error)}
                />
            </SafeAreaView>
        </Modal>
    );
};

export default Address;