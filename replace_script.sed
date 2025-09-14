s|          <View style={styles.emblemSection}>|          <View style={styles.emblemSection}>|
/          <View style={styles.emblemSection}>/,/          <\/View>/{
  s|            <Image source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-premium/artifacts/5tgdv5mj_512px-Coat_of_arms_of_Co%CC%82te_d%27Ivoire_%281997-2001_variant%29.svg.png' }} style={styles.emblemImage} />|            <View style={styles.emblemRow}>\
              <Image source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-premium/artifacts/5tgdv5mj_512px-Coat_of_arms_of_Co%CC%82te_d%27Ivoire_%281997-2001_variant%29.svg.png' }} style={styles.emblemImage} />\
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Publier une alerte" onPress={() => router.push('/alerts/new')} style={styles.publishInlineBtn}>\
                <Ionicons name="megaphone" size={18} color="#fff" />\
                <Text style={styles.publishInlineText}>Publier</Text>\
              </TouchableOpacity>\
            </View>|
}