#!/usr/bin/env python3

import re

# Read the file
with open('/app/frontend/app/(tabs)/home.tsx', 'r') as f:
    content = f.read()

# Define the old and new strings
old_str = """          <View style={styles.emblemSection}>
            <Image source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-premium/artifacts/5tgdv5mj_512px-Coat_of_arms_of_Co%CC%82te_d%27Ivoire_%281997-2001_variant%29.svg.png' }} style={styles.emblemImage} />
            <Text style={styles.mottoText}>Union - Discipline - Travail</Text>
          </View>"""

new_str = """          <View style={styles.emblemSection}>
            <View style={styles.emblemRow}>
              <Image source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-premium/artifacts/5tgdv5mj_512px-Coat_of_arms_of_Co%CC%82te_d%27Ivoire_%281997-2001_variant%29.svg.png' }} style={styles.emblemImage} />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Publier une alerte" onPress={() => router.push('/alerts/new')} style={styles.publishInlineBtn}>
                <Ionicons name="megaphone" size={18} color="#fff" />
                <Text style={styles.publishInlineText}>Publier</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.mottoText}>Union - Discipline - Travail</Text>
          </View>"""

# Perform the replacement
if old_str in content:
    new_content = content.replace(old_str, new_str)
    
    # Write the updated content back to the file
    with open('/app/frontend/app/(tabs)/home.tsx', 'w') as f:
        f.write(new_content)
    
    print("Replacement successful!")
else:
    print("Old string not found in file")
    print("Looking for:")
    print(repr(old_str))