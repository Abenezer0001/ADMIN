# INSEAT Admin Deployment Steps

## Deployment Process Documentation
Last deployment: April 29, 2025

### Prerequisites
- Sudo privileges
- Node.js and npm installed
- Git access to the repository
- Caddy server configured

### Deployment Steps

1. **Verify Sudo Access**
   ```bash
   sudo -v
   ```

2. **Navigate to Project Directory**
   ```bash
   cd /home/administrator/Desktop/Project/INSEAT-Admin
   ```

3. **Pull Latest Changes**
   ```bash
   git pull origin main
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```
   - Note: Some warnings about engine compatibility were observed but did not affect the build

5. **Fix Code Issues**
   - Fixed WebSocketEvents import issue in OrderService.ts
   - Changed import from WebSocketEvents to WebSocketEventType

6. **Build Application**
   ```bash
   npm run build
   ```
   - Build completed successfully
   - Note: Some chunks larger than 500KB (consider code splitting in future)

7. **Deploy to Production**
   ```bash
   sudo cp -r dist/* /var/www/admin
   sudo chown -R www-data:www-data /var/www/admin
   ```

8. **Configure Permissions**
   ```bash
   sudo chown -R www-data:www-data /var/www/admin
   ```

9. **Reload Server**
   ```bash
   sudo systemctl reload caddy
   ```

10. **Verify Deployment**
    - Check Caddy status
    - Verify application accessibility

### Common Issues and Solutions
- If changes not reflected, verify file timestamps and redeploy
- Check Caddy logs for any serving issues
- Ensure proper file permissions

### Deployment Verification
- Access the application at cms.inseat.achievengine.com
- Verify all features are working as expected
- Monitor for any console errors

