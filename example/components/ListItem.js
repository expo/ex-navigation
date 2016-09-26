import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

export default function ListItem({ title, description, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, .1)',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    margin: 2,
  },

  description: {
    fontSize: 12,
    color: '#888',
    margin: 2,
  },
});
