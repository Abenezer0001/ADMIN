# INSEAT Deployment Guide

This guide explains how to deploy the INSEAT applications to both staging and production environments using GitHub Actions.

## 📋 Overview

The INSEAT project consists of two main applications:
- **INSEAT Customer** (`inseat-customer`): Customer-facing menu application
- **INSEAT Admin** (`INSEAT-Admin`): Restaurant management dashboard

Both applications use GitHub Actions for automated deployment to staging and production environments.

## 🌐 Environment Configuration

### Production Environment
- **API Endpoint**: `api.inseat.achievengine.com`
- **Customer URL**: `menu.inseat.achievengine.com` 
- **Admin URL**: `admin.inseat.achievengine.com`
- **Server Path**: `/var/www/inseat-customer/` and `/var/www/admin/`

### Staging Environment  
- **API Endpoint**: `sandboxapi.inseat.achievengine.com`
- **Customer URL**: `staging-menu.inseat.achievengine.com`
- **Admin URL**: `staging-admin.inseat.achievengine.com`
- **Server Path**: `/var/www/staging-inseat-customer/` and `/var/www/staging-admin/`

## 🚀 Deployment Commands

### Production Deployment

#### INSEAT Customer (Production)
```bash
# Navigate to customer project
cd /home/administrator/Desktop/Project/inseat-customer

# Make changes to your code, then commit
git add .
git commit -m "Your commit message"

# Deploy to production by pushing to prod branch
git push origin main:prod
# OR if you're already on prod branch
git push origin prod
```

#### INSEAT Admin (Production)
```bash
# Navigate to admin project  
cd /home/administrator/Desktop/Project/INSEAT-Admin

# Make changes to your code, then commit
git add .
git commit -m "Your commit message"

# Deploy to production by pushing to prod branch
git push origin main:prod
# OR if you're already on prod branch
git push origin prod
```

### Staging Deployment

#### INSEAT Customer (Staging)
```bash
# Navigate to customer project
cd /home/administrator/Desktop/Project/inseat-customer

# Make changes to your code, then commit
git add .
git commit -m "Your commit message"

# Deploy to staging by pushing to staging branch
git push origin main:staging
# OR if you're already on staging branch
git push origin staging
```

#### INSEAT Admin (Staging)
```bash
# Navigate to admin project
cd /home/administrator/Desktop/Project/INSEAT-Admin

# Make changes to your code, then commit
git add .
git commit -m "Your commit message"

# Deploy to staging by pushing to staging branch
git push origin main:staging
# OR if you're already on staging branch
git push origin staging
```
