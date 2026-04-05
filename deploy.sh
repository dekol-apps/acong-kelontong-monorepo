#!/bin/bash

# Deployment script for Acong Kelontong Monorepo
# Choose between simple and regular deployment

set -e

echo "🚀 Acong Kelontong Deployment"
echo "================================"
echo ""
echo "Choose deployment type:"
echo "1) Simple (recommended) - Single MongoDB instance"
echo "2) Regular - 3-node MongoDB replica set"
echo ""
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        echo "📦 Starting SIMPLE deployment..."
        echo "• Single MongoDB instance"
        echo "• Reduced resource usage"
        echo "• Faster startup"
        echo ""
        
        # Stop any existing containers
        echo "🛑 Stopping existing containers..."
        docker-compose -f docker-compose.yml down --remove-orphans 2>/dev/null || true
        docker-compose -f docker-compose.simple.yml down --remove-orphans 2>/dev/null || true
        
        # Start simple deployment
        echo "🚀 Starting simple deployment..."
        docker-compose -f docker-compose.simple.yml up -d --build
        
        echo ""
        echo "✅ Simple deployment complete!"
        echo "🌐 Access your app at:"
        echo "   Frontend: https://ack.dekolapps.tech"
        echo "   Backend:  https://api.dekolapps.tech/api"
        ;;
        
    2)
        echo "📦 Starting REGULAR deployment..."
        echo "• 3-node MongoDB replica set"
        echo "• High availability"
        echo "• More resource usage"
        echo ""
        
        # Stop any existing containers
        echo "🛑 Stopping existing containers..."
        docker-compose -f docker-compose.yml down --remove-orphans 2>/dev/null || true
        docker-compose -f docker-compose.simple.yml down --remove-orphans 2>/dev/null || true
        
        # Start regular deployment
        echo "🚀 Starting regular deployment..."
        docker-compose -f docker-compose.yml up -d --build
        
        echo ""
        echo "✅ Regular deployment complete!"
        echo "🌐 Access your app at:"
        echo "   Frontend: https://ack.dekolapps.tech"
        echo "   Backend:  https://api.dekolapps.tech/api"
        ;;
        
    *)
        echo "❌ Invalid choice. Please run the script again and choose 1 or 2."
        exit 1
        ;;
esac

echo ""
echo "📊 Checking container status..."
sleep 5

if [ "$choice" = "1" ]; then
    docker-compose -f docker-compose.simple.yml ps
else
    docker-compose -f docker-compose.yml ps
fi

echo ""
echo "🎉 Deployment finished!"
