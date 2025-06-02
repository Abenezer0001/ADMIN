#!/bin/bash

# INSEAT Admin Deployment Script
set -e

echo "🚀 Starting INSEAT Admin deployment..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

# Backup existing deployment
echo "💾 Creating backup..."
if [ -d "/var/www/admin" ]; then
    sudo cp -r /var/www/admin /var/www/admin.backup.$(date +%Y%m%d_%H%M%S)
fi

# Create admin directory if it doesn't exist
echo "📁 Preparing deployment directory..."
sudo mkdir -p /var/www/admin

# Remove existing files
echo "🗑️ Removing old files..."
sudo rm -rf /var/www/admin/*

# Copy new build files
echo "📋 Copying new files..."
sudo cp -r dist/* /var/www/admin/

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data /var/www/admin
sudo chmod -R 755 /var/www/admin

# Verify deployment
echo "✅ Verifying deployment..."
if [ -f "/var/www/admin/index.html" ]; then
    echo "✅ Deployment successful!"
    echo "📊 Files deployed:"
    ls -la /var/www/admin | head -10
else
    echo "❌ Deployment failed - index.html not found"
    exit 1
fi

echo "🎉 INSEAT Admin deployment completed successfully!"
