import React from 'react';
import { Modal, SafeAreaView } from 'react-native';
import OriginalPostcode from '@actbase/react-daum-postcode';
import axios from 'axios';

// 래퍼 컴포넌트 생성
const PostcodeWrapper = React.forwardRef((props, ref) => {
  return <OriginalPostcode {...props} ref={ref} />;
});

const Address = ({ visible, onClose, onSelect }) => {
    const getAddressData = async (data) => {
        try {
            // 좌표 검색 API 호출
            const response = await axios.get(
                `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(data.roaAddress || data.address)}`,
                {
                    headers: {
                        Authorization: 'KakaoAK 857d50bbbb53cca5de7f05ed3f8e8e99'
                    }
                }
            );
    
            // console.log('🌐 Kakao API 전체 응답:', JSON.stringify(response.data, null, 2));
    
            if (response.data.documents.length > 0) {
                const { x, y } = response.data.documents[0];
                
                const addressInfo = {
                    roadAddress: data.address_name || data.address,
                    zipCode: data.zonecode,
                    longitude: x,
                    latitude: y
                };
    
                console.log('다음postcode', addressInfo);
    
                onSelect(addressInfo);
                onClose();
            }
        } catch (error) {
            console.error('❌ 좌표 변환 중 오류:', error);
        }
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
                        hideMapBtn: true,
                        autoMapping: true,     // 자동 매핑 활성화
                        shorthand: false       // 주소 축약 비활성화
                    }}
                    onSelected={getAddressData}
                    onError={(error) => console.log('주소 검색 에러:', error)}
                />
            </SafeAreaView>
        </Modal>
    );
};

export default Address;