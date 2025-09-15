#!/bin/bash

# Replace the premium badge code with comment
sed -i '242,244c\                  {/* cadenas premium supprimé comme demandé */}' "/app/frontend/app/(tabs)/home.tsx"

echo "Replacement completed"