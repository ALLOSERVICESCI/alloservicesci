# Read the file
with open('frontend/app/(tabs)/profile.tsx', 'r') as f:
    content = f.read()

# Define the exact old and new strings
old_str = '''  brand: {
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 22,
    color: '#0A7C3A',
    textAlign: 'center',
  },'''

new_str = '''  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0A7C3A',
    textAlign: 'center',
  },'''

# Replace the exact string
if old_str in content:
    new_content = content.replace(old_str, new_str)
    
    # Write back to file
    with open('frontend/app/(tabs)/profile.tsx', 'w') as f:
        f.write(new_content)
    
    print("Replacement completed successfully")
else:
    print("Old string not found in file")
