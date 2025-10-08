import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { apiFetch } from '../../src/utils/api';

export default function ChangePassword() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const validateForm = () => {
    if (!currentPassword.trim()) {
      Alert.alert('Erreur', 'Le mot de passe actuel est obligatoire');
      return false;
    }
    if (!newPassword.trim()) {
      Alert.alert('Erreur', 'Le nouveau mot de passe est obligatoire');
      return false;
    }
    if (newPassword.length < 8) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'La confirmation du nouveau mot de passe ne correspond pas');
      return false;
    }
    if (currentPassword === newPassword) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit être différent de l\'ancien');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    if (!user?.id) {
      Alert.alert('Erreur', 'Vous devez être connecté pour changer votre mot de passe');
      return;
    }

    try {
      setLoading(true);
      
      const response = await apiFetch(`/api/auth/change-password?user_id=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors du changement de mot de passe');
      }

      Alert.alert(
        'Succès !', 
        'Votre mot de passe a été modifié avec succès.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );

      // Réinitialiser les champs
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (error: any) {
      console.error('Erreur changement mot de passe:', error);
      Alert.alert('Erreur', error.message || 'Une erreur est survenue lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0A7C3A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Changer le mot de passe</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Modifier votre mot de passe</Text>
        <Text style={styles.subtitle}>Saisissez votre mot de passe actuel et choisissez un nouveau mot de passe sécurisé</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mot de passe actuel</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              style={styles.passwordInput}
              placeholder="Entrez votre mot de passe actuel"
              secureTextEntry={!showCurrentPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              onPress={() => setShowCurrentPassword(!showCurrentPassword)} 
              style={styles.eyeBtn}
            >
              <Ionicons 
                name={showCurrentPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nouveau mot de passe</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.passwordInput}
              placeholder="Minimum 8 caractères"
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              onPress={() => setShowNewPassword(!showNewPassword)} 
              style={styles.eyeBtn}
            >
              <Ionicons 
                name={showNewPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Le mot de passe doit contenir au moins 8 caractères</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            placeholder="Répétez votre nouveau mot de passe"
            secureTextEntry={true}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          onPress={handleChangePassword}
          disabled={loading}
          style={[styles.changeBtn, loading && styles.changeBtnDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={20} color="#fff" />
              <Text style={styles.changeBtnText}>Modifier le mot de passe</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={20} color="#0A7C3A" />
          <Text style={styles.securityText}>
            Votre mot de passe est chiffré et sécurisé. Nous ne pouvons pas le récupérer, seul vous pouvez le modifier.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A7C3A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8F0E8',
    borderRadius: 8,
    backgroundColor: '#FAFAF8',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A7C3A',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
  },
  changeBtnDisabled: {
    backgroundColor: '#999',
  },
  changeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E6F4EA',
    padding: 16,
    borderRadius: 8,
    marginTop: 32,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: '#0A7C3A',
    marginLeft: 12,
    lineHeight: 18,
  },
});