import {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';

const Container = styled.View`
  flex: 1;
`;

const RatingRecipes = () => {
  const [profile, setProfile] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          navigation.replace('Landing');
          return;
        }

        const response = await axios.get('http://3.34.59.23/api/v1/users/me', {
          headers: {Authorization: `Bearer ${token}`},
        });

        setProfile(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          await AsyncStorage.removeItem('accessToken');
          navigation.replace('Landing');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigation]);

  return <></>;
};

export default RatingRecipes;
