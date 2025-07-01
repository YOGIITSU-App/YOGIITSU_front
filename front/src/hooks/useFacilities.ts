import {useEffect, useState} from 'react';
import {fetchFacilities, Facility} from '../api/facilityApi';

export const useFacilities = (type: string | null) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);

  useEffect(() => {
    if (!type) {
      setFacilities([]);
      return;
    }

    const getData = async () => {
      try {
        const data = await fetchFacilities(type);
        setFacilities(data);
      } catch (err) {
        console.error('시설 가져오기 실패', err);
      }
    };

    getData();
  }, [type]);

  return facilities;
};
