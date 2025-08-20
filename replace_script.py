#!/usr/bin/env python3

import re

# Read the file
with open('/app/frontend/app/(tabs)/subscribe.tsx', 'r') as f:
    content = f.read()

# Define the old string to replace
old_str = """  logoWrapper: {
    position: 'relative',
  },

  logo: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: '#0A7C3A',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },"""

# Define the new string
new_str = """  logoWrapper: {
    position: 'relative',
  },
  logoContainer: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 4,
    borderColor: '#0A7C3A',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 3,
    borderColor: '#ffffff',
  },"""

# Perform the replacement
if old_str in content:
    new_content = content.replace(old_str, new_str)
    
    # Write the updated content back to the file
    with open('/app/frontend/app/(tabs)/subscribe.tsx', 'w') as f:
        f.write(new_content)
    
    print("Replacement successful!")
else:
    print("Old string not found in file")
    print("Searching for similar patterns...")
    
    # Let's try to find the logoWrapper section
    import re
    pattern = r'logoWrapper:\s*\{[^}]+\},'
    matches = re.findall(pattern, content, re.DOTALL)
    if matches:
        print("Found logoWrapper pattern:")
        for match in matches:
            print(repr(match))