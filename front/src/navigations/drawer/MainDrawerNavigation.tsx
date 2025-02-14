import {createStackNavigator} from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createStackNavigator();

function MainDrawerNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Map"
        component={BottomTabNavigator}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

export default MainDrawerNavigator;
