# Read the file
with open('frontend/app/(tabs)/profile.tsx', 'r') as f:
    content = f.read()

# Find and replace the brand style
import re

# Pattern to match the current brand style (with empty lines)
pattern = r'  brand: \{\s*fontSize: 32,\s*\s*\s*color: \'#0A7C3A\',\s*\s*  \},'

replacement = '''  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0A7C3A',
    textAlign: 'center',
  },'''

# Replace using regex
new_content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)

# Write back to file
with open('frontend/app/(tabs)/profile.tsx', 'w') as f:
    f.write(new_content)

print("Brand style fixed successfully")
