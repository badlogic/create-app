# Server Setup

Guide for preparing your server to host apps created with this CLI.

This may look intimidating if you're new to Linux administration, but it's a one-time setup that's mostly copy-and-paste commands. Once configured, your server will handle deployments automatically.

**Note:** I'm not a security or administration expert - this setup has served me well over the years. If you think something is wrong or could be improved, please send a PR.

## Prerequisites

- Ubuntu 22.04+ (or similar Linux distribution)
- Root or sudo access
- Domain pointing to server IP

**Server recommendation:** I use [Hetzner](https://www.hetzner.com/) exclusively for my self-hosting setup (not sponsored) and it's been a fantastic experience for the past 10 years. Their root servers are reliable and well-priced.

The below instructions have been tested with Hetzner root servers and DigitalOcean droplets.

## Essential System Setup

### Install Essential Packages

```bash
# Install security tools
sudo apt install fail2ban ufw

# Install essential utilities
sudo apt install curl rsync nano

# Optional: useful tools
sudo apt install htop git vim

# Enable automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Configure Fail2ban

```bash
# Enable fail2ban for SSH protection
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check status
sudo systemctl status fail2ban
```

Even with SSH key authentication, fail2ban provides additional protection by blocking repeated connection attempts, reducing log noise, and can protect other services you might run.

## Installation

### 1. Install Docker

**Important:** Don't run these commands as root. If you only have a root account (common on new VPS instances), create a regular user first:

```bash
# Create new user (run as root)
adduser yourusername
usermod -aG sudo yourusername

# Switch to new user
su - yourusername
```

Follow the [official Docker installation guide](https://docs.docker.com/engine/install/ubuntu/) or use these commands:

```bash
# Remove any old Docker packages
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
  sudo apt-get remove $pkg
done

# Set up Docker's apt repository
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

# Install Docker packages
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
sudo docker run hello-world

# Add user to docker group (requires logout/login)
# ⚠️  SECURITY WARNING: Docker group membership gives root-equivalent access! ⚠️
# Anyone in the 'docker' group can trivially become root on the host system.
# Only do this on single-user machines. For production servers, consider:
# - Using 'sudo docker' instead (more secure)
# - Setting up Docker rootless mode
# - Using Podman as a rootless alternative
sudo usermod -aG docker $USER

# If you skip this step, you'll need to use 'sudo' for all docker commands
```

**What does "root-equivalent access" mean?** Any user in the docker group can mount system files and become root. For example: `docker run -v /etc:/host ubuntu rm -rf /host/*` would delete system files. Only add trusted users to the docker group.

### 2. Create Docker Network

**Note:** If you just added your user to the docker group, you need to log out and SSH back in for the group membership to take effect. Otherwise, use `sudo` for Docker commands.

```bash
docker network create caddy-network
```

The `caddy-network` allows Caddy to communicate with your application containers. Docker containers on the same network can reach each other by container name, enabling Caddy to proxy requests to your apps. Additionally, Caddy Docker Proxy monitors this network to automatically discover new containers with Caddy labels, generate SSL certificates for their domains, and route traffic accordingly. Without this shared network, Caddy couldn't route traffic to your containerized applications.

### 3. Install Caddy Docker Proxy

Create the Caddy directory and compose file:

```bash
mkdir -p ~/caddy
cat > ~/caddy/docker-compose.yml << 'EOF'
services:
  caddy:
    image: lucaslorentz/caddy-docker-proxy:2.10.0
    container_name: caddy
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - caddy_data:/data
    networks:
      - caddy-network
    restart: unless-stopped

volumes:
  caddy_data:

networks:
  caddy-network:
    external: true
EOF
```

Start Caddy:

```bash
cd ~/caddy
docker compose up -d
```

### 4. Configure SSH Key Authentication

Ensure SSH key authentication is enabled on the server:

```bash
# On the server, check SSH config
sudo grep -E "PubkeyAuthentication|AuthorizedKeysFile" /etc/ssh/sshd_config

# Should show:
# PubkeyAuthentication yes
# AuthorizedKeysFile .ssh/authorized_keys
```

On your local machine, generate SSH keys if you don't have them:

```bash
# Generate SSH key pair (all platforms)
ssh-keygen -t ed25519 -C "your-email@example.com"

# Press Enter to accept default location (~/.ssh/id_ed25519)
# Set a passphrase or press Enter for no passphrase
```

Copy your SSH key to the server (adds to `~/.ssh/authorized_keys`):

```bash
# For ed25519 keys (specify the key file)
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@your-server.com

# Or for older RSA keys (auto-detected)
ssh-copy-id user@your-server.com
```

**Windows users:** Use PowerShell or install [Git for Windows](https://git-scm.com/download/win) which includes SSH tools.

**Security recommendation:** After verifying SSH key login works, disable password authentication:

```bash
# On the server, edit SSH config
sudo nano /etc/ssh/sshd_config
```

```
# Set these values (uncomment and modify if needed):
PasswordAuthentication no
ChallengeResponseAuthentication no
PermitRootLogin no
```

```bash
# Restart SSH service
sudo systemctl restart ssh
```

### 5. DNS Configuration

For each app/project you deploy, point the domain to your server. Caddy will automatically route traffic to the correct container based on the domain:

```
A    myapp.com           -> server-ip
A    api.myproject.io    -> server-ip
A    blog.example.com    -> server-ip
```

You can also use wildcard DNS for subdomains:

```
A    *.yourdomain.com    -> server-ip
```

Each deployed app uses Docker labels to tell Caddy which domain routes to which container - no manual Caddy configuration needed.

### 6. Firewall Configuration

If using UFW, configure it for Docker and Caddy:

```bash
# Allow SSH with rate limiting, HTTP, and HTTPS
sudo ufw limit ssh
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

**Note:** The templates don't expose any ports directly on the production server - all traffic routes through Caddy. However, if you modify the Docker Compose files to publish ports (e.g., `ports: "3000:3000"`), be aware that Docker bypasses UFW rules for published ports. In such cases, consider using Docker's built-in firewall controls or iptables rules in the `DOCKER-USER` chain.

## Verification

Test the setup:

```bash
# Check Docker
docker --version
docker compose version

# Check Caddy is running
docker ps | grep caddy

# Check network exists
docker network ls | grep caddy-network
```

### End-to-End Test

Verify the complete system works by deploying a test application:

1. Create a test directory and compose file:

```bash
mkdir ~/test-app
cd ~/test-app
```

2. Create the test app:

```bash
cat > docker-compose.yml << 'EOF'
services:
  whoami:
    image: traefik/whoami
    container_name: whoami-test
    restart: unless-stopped
    networks:
      - caddy-network
    labels:
      caddy: test.yourdomain.com
      caddy.reverse_proxy: "{{upstreams 80}}"

networks:
  caddy-network:
    external: true
EOF
```

3. Deploy and test:

```bash
# Start the test app
docker compose up -d

# Wait 30 seconds for SSL certificate generation
sleep 30

# Test the endpoint (replace with your domain)
curl -I https://test.yourdomain.com
```

4. Clean up:

```bash
# Remove test app
docker compose down
cd ~ && rm -rf ~/test-app
```

**What this validates:**
- DNS resolution to your server
- Caddy automatic SSL certificate generation
- Docker network connectivity
- Label-based routing
- HTTPS termination

If this test succeeds, your server is ready for production deployments.

## Project Deployment

Projects created with this CLI will:

1. Deploy to `/home/$USER/domain.com/` directories
2. Use Docker labels for automatic Caddy routing
3. Get automatic SSL certificates via Let's Encrypt
4. Connect to the `caddy-network` network

No additional server configuration needed per project.