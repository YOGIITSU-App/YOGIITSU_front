import React from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';

type FavoriteItem = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

interface Props {
  favorites: FavoriteItem[];
  onSelect: (item: FavoriteItem) => void;
}

export default function FavoriteBottomSheetContent({
  favorites,
  onSelect,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📌 내 즐겨찾기</Text>
      {favorites.length === 0 ? (
        <Text style={{marginTop: 10}}>등록된 즐겨찾기가 없어요.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => onSelect(item)}>
              <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {padding: 20},
  title: {fontSize: 20, fontWeight: 'bold', marginBottom: 10},
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {fontSize: 16},
});
