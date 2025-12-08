import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Linking,
  Alert,
  ImageBackground,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const rawData = require("../../src/data/loisirs_tourisme.json");
const HEADER_BG = { uri: "https://customer-assets.emergentagent.com/job_smartcommunity-2/artifacts/x28hv0dw_loisirst_bg.png" };

type LieuLoisir = {
  id: number;
  nom: string;
  categorie: string;
  type: string;
  ville: string;
  region: string;
  quartier: string;
  description_courte: string;
  description_longue: string;
  image_hint: string;
  tags: string[];
  telephone: string;
  site_web: string;
  maps_localisation: string;
  maps_itineraire: string;
};

const LoisirsTourismeScreen: React.FC = () => {
  const router = useRouter();
  const [selectedCategorie, setSelectedCategorie] = useState<string>("tous");
  const [search, setSearch] = useState<string>("");

  const data: LieuLoisir[] = useMemo(
    () => rawData as LieuLoisir[],
    []
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    data.forEach((item) => set.add(item.categorie));
    return ["tous", ...Array.from(set)];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (selectedCategorie !== "tous" && item.categorie !== selectedCategorie) {
        return false;
      }
      if (search.trim().length > 0) {
        const q = search.toLowerCase();
        const haystack = `${item.nom} ${item.ville} ${item.region} ${item.description_courte}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [data, selectedCategorie, search]);

  const openURL = async (url?: string) => {
    if (!url) return;
    const can = await Linking.canOpenURL(url);
    if (!can) {
      Alert.alert("Oups", "Impossible d'ouvrir ce lien sur votre appareil.");
      return;
    }
    Linking.openURL(url);
  };

  const renderCategorieChip = (cat: string) => {
    const isActive = cat === selectedCategorie;
    const labelMap: Record<string, string> = {
      tous: "Tous",
      hotel: "Hôtels",
      residence: "Résidences",
      loisir: "Loisirs",
      plage: "Plages",
      nature: "Nature",
      site_incontournable: "Incontournables",
    };
    const label = labelMap[cat] ?? cat;

    return (
      <TouchableOpacity
        key={cat}
        style={[styles.chip, isActive && styles.chipActive]}
        onPress={() => setSelectedCategorie(cat)}
      >
        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: LieuLoisir }) => {
    return (
      <View style={styles.card}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>
            {item.ville || item.categorie}
          </Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.nom}>{item.nom}</Text>
            <View style={styles.badgeCategorie}>
              <Text style={styles.badgeCategorieText}>
                {item.categorie.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.localisation}>
            {item.ville || "Côte d'Ivoire"}
            {item.region ? ` • ${item.region}` : ""}
            {item.quartier ? ` • ${item.quartier}` : ""}
          </Text>

          <Text style={styles.descriptionCourte}>
            {item.description_courte}
          </Text>

          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {item.tags.slice(0, 4).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.actionsRow}>
            {item.telephone ? (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openURL(`tel:${item.telephone}`)}
              >
                <Text style={styles.actionButtonText}>Appeler</Text>
              </TouchableOpacity>
            ) : null}

            {item.site_web ? (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openURL(item.site_web)}
              >
                <Text style={styles.actionButtonText}>Site web</Text>
              </TouchableOpacity>
            ) : null}

            {item.maps_localisation ? (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openURL(item.maps_localisation)}
              >
                <Text style={styles.actionButtonText}>Carte</Text>
              </TouchableOpacity>
            ) : null}

            {item.maps_itineraire ? (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openURL(item.maps_itineraire)}
              >
                <Text style={styles.actionButtonText}>Itinéraire</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header avec image de fond */}
      <View style={styles.headerWrapper}>
        <ImageBackground source={HEADER_BG} style={styles.headerImage} resizeMode="cover">
          <LinearGradient
            colors={["rgba(15,23,42,0.7)", "rgba(15,23,42,0.5)", "rgba(15,23,42,0.3)"]}
            style={StyleSheet.absoluteFillObject}
          />
          
          {/* Bouton Retour en haut à gauche */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/home")}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Titre et bouton Publier en bas */}
          <View style={styles.headerBottom}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Loisirs & Tourisme</Text>
              <Text style={styles.headerSubtitle}>Découvrez les meilleurs lieux</Text>
            </View>
            
            <TouchableOpacity
              style={styles.publishButton}
              onPress={() => router.push("/publish_loisir")}
            >
              <Ionicons name="add-circle" size={20} color="#F97316" />
              <Text style={styles.publishButtonText}>Publier</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>

      {/* Recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          placeholder="Rechercher un lieu, une plage, un hôtel..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Filtres */}
      <Text style={styles.sectionTitle}>Catégories</Text>
      <View style={styles.chipRowWrap}>
        {categories.map(renderCategorieChip)}
      </View>

      {/* Liste */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Aucun lieu trouvé avec ces filtres.
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default LoisirsTourismeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  headerWrapper: {
    height: 200,
    width: "100%",
  },
  headerImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#E5E7EB",
    fontSize: 14,
  },
  publishButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    gap: 6,
  },
  publishButtonText: {
    color: "#F97316",
    fontSize: 14,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: "#1E293B",
    borderRadius: 999,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: "#F9FAFB",
    fontSize: 14,
  },
  sectionTitle: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginHorizontal: 16,
  },
  chipRowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#475569",
    backgroundColor: "transparent",
  },
  chipActive: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },
  chipText: {
    color: "#CBD5F5",
    fontSize: 13,
  },
  chipTextActive: {
    color: "#0F172A",
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  imagePlaceholder: {
    height: 140,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "600",
  },
  cardContent: {
    padding: 12,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  nom: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  badgeCategorie: {
    backgroundColor: "#0F172A",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#4B5563",
  },
  badgeCategorieText: {
    color: "#F97316",
    fontSize: 10,
    fontWeight: "700",
  },
  localisation: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 4,
  },
  descriptionCourte: {
    color: "#E5E7EB",
    fontSize: 13,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: "#111827",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    color: "#9CA3AF",
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F97316",
  },
  actionButtonText: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
  },
});
