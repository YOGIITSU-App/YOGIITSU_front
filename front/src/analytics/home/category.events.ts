import analytics from '@react-native-firebase/analytics';

export const logSelectFacilityCategory = ({
  category,
  label,
  action,
}: {
  category: string;
  label: string;
  action: 'select' | 'deselect';
}) => {
  analytics().logEvent('select_facility_category', {
    category,
    label,
    action,
    screen: 'MapHome',
  });
};
