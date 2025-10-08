import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../src/context/AuthContext';

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [loading, setSaving] = useState(false);

  // Source de l'avatar (photo de profil ou icône par défaut)
  const APP_ICON = require('../../assets/logo_digital_ci.png');
  const avatarSource = avatar ? { uri: `data:image/jpeg;base64,${avatar}` } : APP_ICON;

  // Fonction pour sélectionner une photo
  const pickImage = async () => {
    try {
      // Demander les permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à vos photos.');
        return;
      }

      // Lancer le sélecteur d'image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Carré
        quality: 0.7, // Compression pour réduire la taille
        base64: true, // Obtenir en base64 pour stockage
      });

      if (!result.canceled && result.assets[0]) {
        const imageBase64 = result.assets[0].base64;
        if (imageBase64) {
          setAvatar(imageBase64);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  // Fonction pour supprimer la photo
  const removePhoto = () => {
    Alert.alert(
      'Supprimer la photo',
      'Êtes-vous sûr de vouloir supprimer votre photo de profil ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => setAvatar(null) }
      ]
    );
  };

  // Fonction pour sauvegarder
  const saveProfile = async () => {
    try {
      setSaving(true);
      
      // Sauvegarder dans AsyncStorage (simulation de base de données)
      const updatedUser = {
        ...user,
        name: name.trim(),
        email: email.trim(),
        avatar: avatar,
      };

      await AsyncStorage.setItem('user_profile', JSON.stringify(updatedUser));
      
      // Mettre à jour le contexte utilisateur
      if (updateUser) {
        updateUser(updatedUser);
      }

      Alert.alert(
        'Succès',
        'Votre profil a été mis à jour !',
        [{ text: 'OK', onPress: () => router.back() }]
      );

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le profil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0A7C3A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier profil</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        <Text style={styles.title}>Modifier votre profil</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom complet</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Entrez votre nom"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="Entrez votre email"
            keyboardType="email-address"
          />
        </View>

        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Enregistrer les modifications</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.select({ ios: 50, android: 20, default: 20 }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F0E8',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A7C3A',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A7C3A',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8F0E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAF8',
  },
  saveBtn: {
    backgroundColor: '#0A7C3A',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});