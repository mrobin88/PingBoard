# 🌐 Network Setup Guide for PingBoard

This guide will help you make PingBoard accessible to other devices on your local network and optionally from the internet.

## 🏠 Local Network Access

### What This Gives You
- **Office Communication**: Team members can access from their computers/phones
- **Home Network**: Family members can use the app
- **Local Community**: Neighbors on the same WiFi can participate

### Step 1: Find Your IP Address

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```cmd
ipconfig | findstr "IPv4"
```

**Example Output:**
```
inet 192.168.1.100 netmask 0xffffff00 broadcast 192.168.1.255
```
Your IP is: `192.168.1.100`

### Step 2: Start Django with Network Binding

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python manage.py runserver 0.0.0.0:8000
```

**Important**: Use `0.0.0.0:8000` not `localhost:8000`

### Step 3: Test Network Access

- **From your computer**: http://localhost:8000 ✅
- **From your phone**: http://192.168.1.100:8000 ✅
- **From other devices**: http://YOUR_IP:8000 ✅

## 🌍 Internet Access (Advanced)

### ⚠️ Security Warning
Making your app accessible from the internet exposes it to potential attacks. Only do this if you understand the risks and need external access.

### Option 1: Port Forwarding

1. **Access your router's admin page**
   - Usually: http://192.168.1.1 or http://192.168.0.1
   - Check router manual for default credentials

2. **Find Port Forwarding section**
   - Look for: "Port Forwarding", "Virtual Server", or "NAT"
   - May be under "Advanced Settings"

3. **Add port forwarding rule**
   ```
   External Port: 8000
   Internal Port: 8000
   Internal IP: YOUR_COMPUTER_IP (e.g., 192.168.1.100)
   Protocol: TCP
   ```

4. **Test external access**
   - From outside your network: http://YOUR_PUBLIC_IP:8000
   - Find your public IP: https://whatismyipaddress.com/

### Option 2: Dynamic DNS (Recommended)

1. **Sign up for a dynamic DNS service**
   - Free options: No-IP, DuckDNS, FreeDNS
   - Paid options: DynDNS, Cloudflare

2. **Configure your router**
   - Most routers have built-in dynamic DNS support
   - Enter your DDNS credentials

3. **Set up port forwarding** (as above)

4. **Access your app**
   - Custom URL: http://yourname.ddns.net:8000

### Option 3: Cloudflare Tunnel (Safest)

1. **Install Cloudflare Tunnel**
   ```bash
   # Download from: https://github.com/cloudflare/cloudflared/releases
   # Or use package manager
   ```

2. **Authenticate and create tunnel**
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create pingboard
   ```

3. **Configure tunnel**
   ```bash
   cloudflared tunnel route dns pingboard yourdomain.com
   ```

4. **Run tunnel**
   ```bash
   cloudflared tunnel run pingboard
   ```

## 🔒 Security Considerations

### Firewall Settings
- **Windows**: Allow Python through Windows Firewall
- **macOS**: Allow incoming connections for Python
- **Linux**: Configure iptables/ufw if needed

### Strong Passwords
- Use unique, strong passwords for admin accounts
- Consider enabling two-factor authentication

### Regular Updates
- Keep Django and dependencies updated
- Monitor for security vulnerabilities

## 🚨 Troubleshooting

### "Connection Refused" Error
- Check if Django is running on `0.0.0.0:8000`
- Verify firewall settings
- Ensure devices are on the same network

### "DisallowedHost" Error
- Add your IP to `ALLOWED_HOSTS` in Django settings
- Restart Django server

### Can't Access from Internet
- Verify port forwarding is configured correctly
- Check if your ISP blocks port 8000
- Try a different port (e.g., 8080, 9000)

### Performance Issues
- **Local network**: Should be fast (same WiFi)
- **Internet access**: May be slower due to bandwidth
- **Multiple users**: Consider production deployment for 10+ users

## 📱 Mobile Access

### From Smartphones
- Works on any device with a web browser
- No app installation required
- Responsive design for mobile screens

### From Tablets
- Full desktop experience
- Touch-friendly interface
- Perfect for office kiosks

## 🏢 Office Deployment Tips

### Small Office (5-25 people)
- Current setup is perfect
- Run on a dedicated computer
- Use during business hours

### Medium Office (25-100 people)
- Consider production deployment
- Use PostgreSQL database
- Set up monitoring and backups

### Large Office (100+ people)
- Use proper server infrastructure
- Load balancing for high traffic
- Professional hosting services

## 🎯 Best Practices

1. **Start Local**: Test on your network first
2. **Secure Gradually**: Add security features as you grow
3. **Monitor Usage**: Watch for performance issues
4. **Backup Data**: Regular database backups
5. **Document Everything**: Keep setup notes for your team

---

**Need Help?** Check the main README.md or open an issue on GitHub!
