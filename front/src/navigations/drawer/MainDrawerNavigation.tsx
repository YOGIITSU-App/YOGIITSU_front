import {createDrawerNavigator} from '@react-navigation/drawer';
import FeedHomeScreen from '../../screens/feed/FeedHomeScreen';
import CalendarHomeScreen from '../../screens/calendar/CalendarHomeScreen';
import MapHomeScreen from '../../screens/map/MapHomeScreen';
import MapStackNavigator from '../stack/MapStackNavigator';

const Drawer = createDrawerNavigator();

function MainDrawerNavigator() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Map" component={MapStackNavigator} />
      <Drawer.Screen name="FeedHome" component={FeedHomeScreen} />
      <Drawer.Screen name="CalendarHome" component={CalendarHomeScreen} />
    </Drawer.Navigator>
  );
}

export default MainDrawerNavigator;
