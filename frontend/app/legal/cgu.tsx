import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CGU() {
  return (
    <SafeAreaView style={styles.safe} edges={["top","left","right"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Conditions Générales d’Utilisation (CGU) &amp; Politique de Confidentialité</Text>
        <Text style={styles.subtitle}>Applications : Allô Services CI, Allô Resto, Allô Docteur, Allô Talents, Allô Truck</Text>

        <Section n={1} title="Présentation du service">
          <Text style={styles.p}>
            Les applications Allô Services CI, Allô Resto, Allô Docteur, Allô Talents et Allô Truck sont éditées par
            DigitalLab Côte d’Ivoire, permettant l’accès à des informations et services utiles (urgences, santé,
            emplois, services publics, restauration, recrutement, logistique, etc.).
          </Text>
        </Section>

        <Section n={2} title="Objet">
          <Text style={styles.p}>
            Les présentes CGU définissent les conditions d’accès et d’utilisation de ces applications et les engagements
            réciproques entre l’éditeur et l’utilisateur.
          </Text>
        </Section>

        <Section n={3} title="Accès au service">
          <Text style={styles.p}>
            Applications accessibles gratuitement. Certaines fonctionnalités sont premium et accessibles par abonnement
            via paiement mobile (Orange Money, Wave, MTN, Moov).
          </Text>
        </Section>

        <Section n={4} title="Utilisation des applications">
          <Text style={styles.p}>
            L’utilisateur s’engage à utiliser les applications conformément aux lois ivoiriennes et à ne pas détourner leur usage.
          </Text>
        </Section>

        <Section n={5} title="Données personnelles">
          <Text style={styles.p}>Conformément à la loi n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel :</Text>
          <View style={styles.list}>
            <Text style={styles.li}>• Données collectées : nom, téléphone, email, localisation.</Text>
            <Text style={styles.li}>• Usage limité au bon fonctionnement des services (pharmacies, emplois, alertes, restauration, etc.).</Text>
            <Text style={styles.li}>• Pas de cession ou de vente à des tiers sans consentement.</Text>
            <Text style={styles.li}>• Droit d’accès, de rectification et de suppression via contact éditeur.</Text>
          </View>
        </Section>

        <Section n={6} title="Sécurité et confidentialité">
          <Text style={styles.p}>
            Les données sont hébergées sur des serveurs sécurisés. Toute violation sera notifiée à l’ATCI et aux utilisateurs.
          </Text>
        </Section>

        <Section n={7} title="Responsabilité">
          <Text style={styles.p}>
            L’éditeur n’est pas responsable des interruptions dues aux opérateurs ou aux erreurs externes.
          </Text>
        </Section>

        <Section n={8} title="Propriété intellectuelle">
          <Text style={styles.p}>
            Tous les contenus (logos, textes, design) sont protégés par le droit ivoirien.
          </Text>
        </Section>

        <Section n={9} title="Modifications">
          <Text style={styles.p}>
            Les CGU peuvent être modifiées. Les utilisateurs seront notifiés dans les applications.
          </Text>
        </Section>

        <Section n={10} title="Contact">
          <Text style={styles.p}>DigitalLab Côte d’Ivoire - Abidjan, Côte d’Ivoire</Text>
          <Text style={styles.p}>Email : contact@digitallab.ci</Text>
          <Text style={styles.p}>Téléphone : (+225) 27 21 52 89 12 / 07 48 73 53 89</Text>
        </Section>

        <Text style={styles.subtitle}>Résumé Politique de Confidentialité :</Text>
        <View style={styles.list}>
          <Text style={styles.li}>• Vos données sont protégées par la loi ivoirienne.</Text>
          <Text style={styles.li}>• Collecte limitée au nécessaire.</Text>
          <Text style={styles.li}>• Droits d’accès, rectification et suppression garantis.</Text>
          <Text style={styles.li}>• Aucune donnée vendue à des tiers sans accord explicite.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.h2}>{n}. {title}</Text>
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#0A7C3A', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, fontWeight: '700', color: '#0F5132', marginBottom: 8, textAlign: 'center' },
  h2: { fontSize: 16, fontWeight: '800', color: '#0F5132', marginBottom: 6 },
  p: { fontSize: 14, color: '#333', lineHeight: 20 },
  list: { marginTop: 6 },
  li: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 2 },
});