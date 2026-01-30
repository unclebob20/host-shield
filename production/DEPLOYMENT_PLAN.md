# Production Deployment Plan for HostShield (Kubernetes)

## 1. Hosting Architecture
For a **production-grade**, **manageable**, but **cost-effective** Kubernetes cluster, we recommend:

### Option A: **DigitalOcean Kubernetes (DOKS)** (Recommended)
*   **Why**: Fully managed control plane (free), easy scaling, excellent storage integration.
*   **Cost**:
    *   Cluster: ~$24/mo (2x Nodes for high availability, or start with 1x Node at $12/mo).
    *   Load Balancer: $12/mo.
    *   Container Registry: Free (basic tier).
*   **Management**: Very user-friendly dashboard.

### Option B: **Hetzner Cloud + K3s** (Lowest Cost)
*   **Why**: Extremely cheap hardware.
*   **Method**: Provision 2-3 VPS instances (~€4/mo each) and install **K3s** (Lightweight Kubernetes).
*   **Management**: More manual work (setting up Traefik/Nginx ingress, handling storage updates).
*   **Tooling**: Use [Hetzner-K3s CLI](https://github.com/vitobotta/hetzner-k3s) for easy setup.

---

## 2. Infrastructure Components (K8s)

The architecture is defined in `production/k8s/` manifests:

1.  **Stateful Storage**:
    *   PostgreSQL (StatefulSet): Persistent data for guests (`02-database.yaml`).
    *   Redis (Deployment): Caching (`03-redis.yaml`).
2.  **Microservices Application**:
    *   `gov-bridge`: Official SK Digital integration (`04-gov-bridge.yaml`).
    *   `mrz-reader`: OCR Parsing Service (`05-mrz-reader.yaml`).
    *   `api-server`: Main Node.js Backend (`06-api-server.yaml`).
    *   `web-client`: Nginx-served React App (`07-web-client.yaml`).
3.  **Networking**:
    *   **Ingress**: Routes traffic for `app.hostshield.sk` to Frontend or API (`08-ingress.yaml`).
    *   **CertManager**: (Implicit) For auto-renewing Let's Encrypt SSL certificates.

---

## 3. Deployment Guide

### Prerequisites
*   `kubectl` installed and configured.
*   A Container Registry (e.g., DigitalOcean Container Registry, Docker Hub, or GitHub Packages).

### Step 1: Automated Build (CI/CD) - Solving the Architecture Mismatch
Since you are developing on **Apple Silicon (ARM64)** but deploying to standard servers (**x86_64/AMD64**), building Docker images locally causes architecture errors ("Exec format error").

We solve this using **GitHub Actions**. I have created a workflow (`.github/workflows/production-build.yml`) that:
1.  Triggers whenever you push to the `main` branch.
2.  Runs on a standard Ubuntu (Intel) runner provided by GitHub.
3.  Builds the correct **x86_64** Docker images.
4.  Pushes them to the **GitHub Container Registry (GHCR)**.

**Configuring Access:**
1.  Push your code to GitHub:
    ```bash
    git add .
    git commit -m "Setup production pipeline"
    git push origin main
    ```
2.  The workflow will automatically build images like: `ghcr.io/unclebob20/host-shield-api-server:latest`.
3.  **Kubernetes Access**:
    To let your K8s cluster pull these private images, you must create a docker-registry secret:
    ```bash
    # Generate a Personal Access Token (PAT) on GitHub with 'read:packages' scope.
    kubectl create secret docker-registry ghcr-secret \
      --docker-server=ghcr.io \
      --docker-username=YOUR_GITHUB_USERNAME \
      --docker-password=YOUR_GITHUB_PAT \
      --docker-email=YOUR_EMAIL \
      -n hostshield
    ```
    *Note: I have updated the yaml manifests to expect these image names, but verify the `image:` fields match your GitHub username/repository structure.*

### Step 2: Configure Secrets
1.  **Create Certificates Secret**:
    Upload your real `gov_private.key`, `production.keystore`, etc., to the cluster.
    ```bash
    kubectl create namespace hostshield
    kubectl create secret generic hostshield-certs \
      --from-file=gov_private.key=./security/gov_fake_private.key \
      --from-file=gov_production.public.pem=./security/gov_fake_public.pem \
      --from-file=production.keystore=./security/gov_fake_sts.keystore \
      -n hostshield
    ```

2.  **Update Secrets Manifest**:
    Edit `production/k8s/01-base.yaml` and put in your REAL database passwords and API tokens (base64 encoded not required in manifest stringData, but safeguard this file).

### Step 3: Apply Manifests
Deploy the entire stack in order.

```bash
kubectl apply -f production/k8s/
```

### Step 4: Verify Status
```bash
kubectl get pods -n hostshield
kubectl get ingress -n hostshield
```

Once the Ingress gets an External IP (from the Cloud Load Balancer), point your DNS (e.g., `app.hostshield.sk`) to that IP.
