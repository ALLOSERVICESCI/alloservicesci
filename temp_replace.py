import re

# Read the file
with open('frontend/app/(tabs)/profile.tsx', 'r') as f:
    content = f.read()

# Define the old and new patterns
old_pattern = r'  brand: \{\s*fontSize: 32,\s*\s*\s*color: \'#0A7C3A\',\s*\s*  \},'
new_pattern = '''  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0A7C3A',
    textAlign: 'center',
  },'''

# Replace the pattern
new_content = re.sub(old_pattern, new_pattern, content, flags=re.MULTILINE)

# Write back to file
with open('frontend/app/(tabs)/profile.tsx', 'w') as f:
    f.write(new_content)

print("Replacement completed")
