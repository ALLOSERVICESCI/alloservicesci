#!/usr/bin/env python3

import re

# Read the original file
with open('/app/frontend/app/(tabs)/home.tsx', 'r') as f:
    content = f.read()

# Define the old and new strings
old_str = """  useEffect(() => {
    if (!marqueeW || !textW || marqueeItems.length === 0) return;
    marqueeX.stopAnimation();
    marqueeX.setValue(marqueeW);
    const speed = 60; // px/s
    const distance = marqueeW + textW;
    const duration = (distance / speed) * 1000;
    const loop = () => {
      marqueeX.setValue(marqueeW);
      Animated.timing(marqueeX, { toValue: -textW, duration, easing: Easing.linear, useNativeDriver: true }).start(() => loop());
    };
    const id = setTimeout(loop, 100);
    return () => { clearTimeout(id); marqueeX.stopAnimation(); };
  }, [marqueeW, textW, marqueeItems]);"""

new_str = """  useEffect(() => {
    if (!marqueeW || !textW || marqueeItems.length === 0) return;
    marqueeX.stopAnimation();
    const speed = 60; // px/s
    const distance = textW; // with double-buffer, shift by exactly one text width
    const duration = (distance / speed) * 1000;
    const loop = () => {
      marqueeX.setValue(0);
      Animated.timing(marqueeX, { toValue: -distance, duration, easing: Easing.linear, useNativeDriver: true }).start(({ finished }) => {
        if (finished) loop();
      });
    };
    const id = setTimeout(loop, 100);
    return () => { clearTimeout(id); marqueeX.stopAnimation(); };
  }, [marqueeW, textW, marqueeItems]);"""

# Check if old_str exists in the content
if old_str in content:
    # Replace the old string with the new string
    new_content = content.replace(old_str, new_str)
    
    # Write the updated content back to the file
    with open('/app/frontend/app/(tabs)/home.tsx', 'w') as f:
        f.write(new_content)
    
    print("Replacement successful!")
else:
    print("Old string not found in the file")
    print("Searching for similar patterns...")
    
    # Try to find the useEffect block
    pattern = r'useEffect\(\(\) => \{[^}]*marqueeX\.stopAnimation\(\);[^}]*\}, \[marqueeW, textW, marqueeItems\]\);'
    matches = re.findall(pattern, content, re.DOTALL)
    
    if matches:
        print(f"Found {len(matches)} similar patterns:")
        for i, match in enumerate(matches):
            print(f"Match {i+1}:")
            print(match[:200] + "..." if len(match) > 200 else match)
    else:
        print("No similar patterns found")