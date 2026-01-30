# Cost Comparison: Kubernetes Hosting & Domains

The following table compares the **monthly** costs of running a small Kubernetes cluster (suitable for HostShield) across major providers.

**Assumptions:**
*   Cluster Size: 2 Nodes (to prevent downtime during updates).
*   Spec per Node: ~2 vCPU, 4GB RAM (Minimum for Java/Node/Postgres stack).
*   Includes 1 Load Balancer & ~40GB Block Storage.

| Feature | **Hetzner Cloud** (Recommended) | **DigitalOcean (DOKS)** | **Google Cloud (GKE)** | **Azure (AKS)** | **AWS (EKS)** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Control Plane** | **€0** (Self-managed K3s) | **$0** (Free) | **$0** (Free for 1st zonal) | **$0** (Free tier) | **$73.00** ($0.10/hr) |
| **Worker Nodes (x2)** | **€21.50** (2x CPX21: 3vCPU/4GB) | **$48.00** (2x Basic: 2vCPU/4GB) | **~$62.00** (2x e2-medium) | **~$68.00** (2x B2s) | **~$70.00** (2x t3.medium) |
| **Load Balancer** | **€6.90** | **$12.00** | **~$18.00** | **~$20.00** | **~$18.00** (ALB/CLB) |
| **Block Storage (40GB)** | **included in VPS** (80GB) | **$4.00** | **$4.00** | **$5.00** | **$4.00** |
| **Bandwidth (Egress)** | **20TB** included | **2TB** included | High cost after free tier | High cost after free tier | High cost after free tier |
| **TOTAL (Monthly)** | **~€29.00** (${{ convert_euro_usd }}) | **~$64.00** | **~$84.00** | **~$93.00** | **~$165.00** |
| **Complexity** | ⚠️ High (Manual Setup) | ✅ Low (1-Click) | ⚠️ Medium (Many options) | ⚠️ Medium | ⚠️ High (IAM, VPC) |

---

## Domain Registration (.sk / .com)

Most cloud providers (DigitalOcean, Hetzner) do **NOT** failitate `.sk` domain registration directly. You should use a dedicated registrar.

| Extension | AWS Route53 | Google Domains | Namecheap / GoDaddy | Websupport.sk (Local) |
| :--- | :--- | :--- | :--- | :--- |
| **.com** | $14.00 / yr | $12.00 / yr | ~$10 - $15 / yr | ~$12 / yr |
| **.sk** | Not directly available | Not directly available | **~$16.00 / yr** | **~$14.00 / yr** |

**Recommendation:**
1.  **Buy Domain**: Use **Namecheap** or **Websupport.sk** (best for Slovak support) to buy `hostshield.sk`.
2.  **DNS Management**: Point the "Nameservers" to DigitalOcean or Cloudflare for easier record management.

---

## Summary Recommendation
1.  **Budget King**: **Hetzner** (~€30/mo). If you are comfortable running a few commands to set up K3s, this is half the price of the nearest competitor.
2.  **Balance of Ease & Cost**: **DigitalOcean** (~$65/mo). You get a real, managed Kubernetes control plane. No manual patching of the master node.
3.  **Avoid**: AWS EKS is overkill and expensive for a project of this scale due to the $73/mo base fee.
