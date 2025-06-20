#!/bin/bash

# Script to migrate NextAuth to Clerk in API routes

files=(
    "app/api/dispatcher/accept/route.ts"
    "app/api/dispatcher/analysis/route.ts"
    "app/api/dispatcher/message/route.ts"
    "app/api/integrations/test/route.ts"
    "app/api/marketplace/cargo/[id]/accept/route.ts"
    "app/api/marketplace/cargo/[id]/chat/route.ts"
    "app/api/marketplace/cargo/[id]/deliver/route.ts"
    "app/api/real-time/data/route.ts"
    "app/api/vehicles/available/route.ts"
    "app/api/vehicles/[id]/details/route.ts"
)

for file in "${files[@]}"; do
    echo "Migrating $file..."
    
    # Replace NextAuth imports with Clerk
    sed -i 's/import { getServerSession } from '\''next-auth'\'';/import { auth } from '\''@clerk\/nextjs\/server'\'';/' "$file"
    sed -i 's/import { authOptions } from '\''@\/lib\/auth'\'';//' "$file"
    
    # Replace session logic
    sed -i 's/const session = await getServerSession(authOptions);/const { userId } = await auth();/' "$file"
    sed -i 's/const session = await getServerSession();/const { userId } = await auth();/' "$file"
    
    # Replace session checks
    sed -i 's/if (!session?.user?.id)/if (!userId)/' "$file"
    sed -i 's/if (!session?.user?.email)/if (!userId)/' "$file"
    sed -i 's/if (!session)/if (!userId)/' "$file"
    
    # Replace user ID access
    sed -i 's/session\.user\.id/userId/g' "$file"
    sed -i 's/session?.user?.id/userId/g' "$file"
    
    echo "✅ Migrated $file"
done

echo "🎉 All API routes migrated from NextAuth to Clerk!"