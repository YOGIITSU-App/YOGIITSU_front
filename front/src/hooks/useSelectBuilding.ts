import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {selectBuilding} from '../utils/selectBuilding';
import {MapStackParamList} from '../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../constants/navigation';

type SearchNavProp = StackNavigationProp<
  MapStackParamList,
  typeof mapNavigation.SEARCH
>;

type SearchRouteProp = RouteProp<
  MapStackParamList,
  typeof mapNavigation.SEARCH
>;

export function useSelectBuilding() {
  const navigation = useNavigation<SearchNavProp>();
  const route = useRoute<SearchRouteProp>();

  const onSelect = (buildingId: number) => {
    selectBuilding(buildingId, {
      selectionType: route.params?.selectionType ?? 'start',
      fromResultScreen: route.params?.fromResultScreen ?? false,
      routeParams: route.params!,
      navigation,
    });
  };

  return {onSelect};
}
