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
} from "react-native";

// ⚠️ adapte le chemin selon ton projet
const rawData = require("../../src/data/loisirs_tourisme.json");

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
        {/* Placeholder d'image – tu pourras le remplacer par une vraie Image plus tard */}
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

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {item.tags.slice(0, 4).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Ligne de boutons actions (Appeler, Site web, Carte, Itinéraire) */}
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
      {/* Recherche */}
      <View style={styles.searchContainer}>
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {categories.map(renderCategorieChip)}
      </ScrollView>

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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: "#1E293B",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#F9FAFB",
    fontSize: 14,
  },
  sectionTitle: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  chipRow: {
    paddingBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#475569",
    marginRight: 8,
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
