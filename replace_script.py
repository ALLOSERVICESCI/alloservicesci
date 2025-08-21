#!/usr/bin/env python3

import re

# Read the file
with open('/app/frontend/app/(tabs)/home.tsx', 'r') as f:
    content = f.read()

# Define the old text to replace
old_text = """  aiImgWrapLg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0A7C3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiImgLg: {
    width: 49,
    height: 49,
    resizeMode: 'contain',
  },"""

# Define the new text
new_text = """  aiImgLg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#0A7C3A',
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },"""

# Perform the replacement
new_content = content.replace(old_text, new_text)

# Write the file back
with open('/app/frontend/app/(tabs)/home.tsx', 'w') as f:
    f.write(new_content)

print("Replacement completed successfully!")