import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const PublishLoisirScreen: React.FC = () => {
  const router = useRouter();
  const [isPro, setIsPro] = useState<boolean>(true);
  const [category, setCategory] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [quality, setQuality] = useState<number>(3);
  const [photos, setPhotos] = useState<string[]>([]);

  const categories = [
    "hotel",
    "residence",
    "loisir",
    "plage",
    "nature",
    "site_incontournable",
  ];

  const categoryLabels: Record<string, string> = {
    hotel: "Hôtel",
    residence: "Résidence",
    loisir: "Loisir",
    plage: "Plage",
    nature: "Nature",
    site_incontournable: "Site Incontournable",
  };

  const pickImage = async () => {
    if (photos.length >= 5) {
      Alert.alert("Limite atteinte", "Vous pouvez ajouter maximum 5 photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Erreur", "Veuillez renseigner le titre.");
      return;
    }
    if (!category) {
      Alert.alert("Erreur", "Veuillez sélectionner une catégorie.");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Erreur", "Veuillez renseigner un téléphone.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Erreur", "Veuillez renseigner une description.");
      return;
    }

    Alert.alert(
      "Succès",
      "Votre annonce a été publiée avec succès !",
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publier une annonce</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Type de publication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de publication</Text>
          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, !isPro && styles.switchLabelActive]}>
              Particulier
            </Text>
            <Switch
              value={isPro}
              onValueChange={setIsPro}
              trackColor={{ false: "#4B5563", true: "#F97316" }}
              thumbColor={"#fff"}
            />
            <Text style={[styles.switchLabel, isPro && styles.switchLabelActive]}>
              Professionnel
            </Text>
          </View>
        </View>

        {/* Catégorie */}
        <View style={styles.section}>
          <Text style={styles.label}>Catégorie *</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {categoryLabels[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Titre */}
        <View style={styles.section}>
          <Text style={styles.label}>Nom de l'établissement / lieu *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Restaurant Le Palmier"
            placeholderTextColor="#6B7280"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.label}>Contact *</Text>
          <View style={styles.inputWithIcon}>
            <Ionicons name="call" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.inputField}
              placeholder="Ex: +225 0102030405"
              placeholderTextColor="#6B7280"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Site web */}
        <View style={styles.section}>
          <Text style={styles.label}>Site web (optionnel)</Text>
          <View style={styles.inputWithIcon}>
            <Ionicons name="globe" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.inputField}
              placeholder="Ex: www.monsite.ci"
              placeholderTextColor="#6B7280"
              value={website}
              onChangeText={setWebsite}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Géolocalisation */}
        <View style={styles.section}>
          <Text style={styles.label}>Géolocalisation (optionnel)</Text>
          <Text style={styles.helpText}>Pour activer l'Itinéraire</Text>
          <View style={styles.inputWithIcon}>
            <Ionicons name="location" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.inputField}
              placeholder="Lien Google Maps"
              placeholderTextColor="#6B7280"
              value={location}
              onChangeText={setLocation}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <Text style={styles.helpText}>
            Décrivez le lieu, les services, les horaires, etc.
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Entrez une description détaillée..."
            placeholderTextColor="#6B7280"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Qualité de prestation */}
        <View style={styles.section}>
          <Text style={styles.label}>Qualité de prestation</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setQuality(star)}
              >
                <Ionicons
                  name={star <= quality ? "star" : "star-outline"}
                  size={32}
                  color="#F97316"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.label}>Photos (max 5)</Text>
          <View style={styles.photosGrid}>
            {photos.map((uri, index) => (
              <View key={index} style={styles.photoItem}>
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoText}>Photo {index + 1}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < 5 && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={pickImage}
              >
                <Ionicons name="add" size={32} color="#9CA3AF" />
                <Text style={styles.addPhotoText}>Ajouter</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bouton Publier */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Publier l'annonce</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default PublishLoisirScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#1E293B",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#E5E7EB",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  switchLabel: {
    color: "#9CA3AF",
    fontSize: 15,
    fontWeight: "600",
  },
  switchLabelActive: {
    color: "#F97316",
    fontWeight: "700",
  },
  label: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  helpText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#F9FAFB",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 12,
  },
  inputField: {
    flex: 1,
    color: "#F9FAFB",
    fontSize: 14,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#475569",
  },
  categoryChipActive: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },
  categoryChipText: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: "#0F172A",
    fontWeight: "700",
  },
  starsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  photoItem: {
    position: "relative",
    width: 100,
    height: 100,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  photoText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  removePhotoButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#0F172A",
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#475569",
    borderStyle: "dashed",
  },
  addPhotoText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#F97316",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700",
  },
});
