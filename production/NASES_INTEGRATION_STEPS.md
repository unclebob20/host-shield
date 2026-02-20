# NASES ÚPVS Integration Process: Step-by-Step Guide

This guide is based on the official [NASES Integration Process](https://www.nases.gov.sk/sluzby/sluzby-pre-po-a-ovm/integracie/integracny-proces) documentation.

---

## Phase 0: Preparation

1.  **Project Identification**: Define a project name and an abbreviation (Project Prefix).
    *   **Project Name:** `HostShield`
    *   **Project Prefix:** `HSHLD`
    *   This prefix is critical as it identifies your project in all communications with NASES (incident resolution, matrix setup, etc.).

---

## Phase 1: FIX Environment Setup (Testing)

### 1. Infrastructure Access (Network Matrix)
*   **Action**: Request a network tunnel to the FIX environment.
*   **Connection Type**: Select **Internet** (Govnet is for Public Authorities only).
*   **Adresat**: `integracie@nases.gov.sk`
*   **Subject**: `[HSHLD] - FIX - INFRA - Žiadosť - Nastavenie infraštruktúrneho pripojenia`
*   **Body (Slovak Template)**:
    ```text
    Dobrý deň,

    žiadam pre projekt HostShield (skratka HSHLD) o pridelenie adresného rozsahu pre tunel do FIX prostredia a zaslanie potrebného XLS súboru (matice) pre špecifikáciu komunikácie. 

    Komunikácia bude prebiehať cez Internet.

    Ďakujem.
    ```
*   **Result**: NASES will send a pre-filled Matrix (Excel). Complete it and return it via email.

### 2. Test Identities
*   **Action**: Request test identities for development.
*   **Adresat**: `integracie@nases.gov.sk`
*   **Subject**: `[HSHLD] - FIX - INFRA - Žiadosť - Zriadenie testovacích identít`
*   **Body (Slovak Template)**:
    ```text
    Dobrý deň,

    žiadam o vytvorenie testovacích identít vo FIX prostredí pre projekt HostShield (skratka HSHLD). 

    Pre potrebu testovania SaaS architektúry (poskytovateľ a klienti) žiadam o zriadenie nasledovných identít:
    1. 3x FO (Fyzické osoby)
    2. 3x PO (Právnické osoby)

    Logika zastupovania:
    - FO_1 zastupuje PO_1 (Identita poskytovateľa HostShield)
    - FO_2 zastupuje PO_2 (Testovací klient - Hotel 1)
    - FO_3 zastupuje PO_3 (Testovací klient - Hotel 2)

    Prehlasujem, že všetky poskytnuté údaje identít sú fiktívne.

    Ďakujem.
    ```
*   **Note**: NASES will send an Excel file. Fill it with fictional names/data and return it. You will receive logins (EXXXXXXXX) and passwords.

### 3. Technical Account & Certificates
*   **Action**: Register a Technical Account and pair your certificate.
*   **How**: Log into the [ÚPVS FIX Portal](https://schranka.upvsfixnew.gov.sk/) using a test FO identity.
*   **Path**: `My Profile (Môj profil) -> Technical Accounts and Certificates (Technické účty a certifikáty)`.
*   **Purpose**: This allows your system to call ÚPVS services on behalf of the identity.
*   ✅ **REGISTERED (FIX):**
    *   **Technical Account Name**: `T5000015401`
    *   **Certificate Subject (CN)**: `CN=rc-8810100155`
    *   **Certificate SHA-256 Fingerprint**: `BE726840F19334DF834C8B03467953F1AB093E4E01518F2CBD9CAA3C137180BD`
    *   **Certificate files**: `security/hostshield_iam_v2.crt` (PEM), `security/hostshield_iam_v2.cer` (DER), `security/hostshield_iam_v2.key` (private key)
    *   **Default PFP/account password**: `Poprad@Ta3` (change on first login)

### 4. Service Provider Metadata (SP)
*   **Action**: Register Service Provider metadata for SAML authentication.
*   **How**: Use the electronic service on the FIX Portal. [Detailed guide here](https://www.nases.gov.sk/sluzby/sluzby-pre-po-a-ovm/integracie/poskytovatel-sluzieb-jeho-registracia).

---

## Phase 2: Formal Integration Agreement (DIZ)

1.  **Drafting DIZ**: Document the scope and method of integration.
2.  **Templates**: Download the DIZ template from the **[Partner Framework Portal (PFP)](https://pfp.slovensko.sk/)**.
    *   ⚠️ The old GitHub link (`NASES-Slovakia/integration_templates`) is **dead (404)**. Templates moved to PFP.
    *   **PFP Registration** (required first): Submit the [PFP access request form](https://schranka.slovensko.sk/FormConstructor/Default.aspx?IdService=508090) on behalf of your PO/company via slovensko.sk. Access is granted by email.
3.  **Submission**:
    *   **Adresat**: `integracie@nases.gov.sk`
    *   **Subject**: `[HSHLD] - FIX - DIZ - Žiadosť - Revízia dohody o integračnom zámere`
4.  **Finalization**: Once NASES approves the draft, deliver the signed copy (physically or electronically).

---

## Phase 3: Testing & Acceptance (UAT)

1.  **Execution**: Perform tests as described in your DIZ Agreement. These are done by you (the consumer) without NASES participation.
2.  **UAT Protocol**: Complete the protocol using the UAT template from the **[Partner Framework Portal (PFP)](https://pfp.slovensko.sk/)**.
    *   ⚠️ The old GitHub link is **dead (404)**. Templates are now on PFP (requires same registration as DIZ — see Phase 2).
3.  **Submission**:
    *   **Adresat**: `integracie@nases.gov.sk`
    *   **Subject**: `[HSHLD] - FIX - UAT - Žiadosť - Revízia UAT protokolu`
4.  **Optional - Freeze**: You can request a "freeze" of the FIX environment (no changes made by NASES) for your final testing window.
    *   Request at least 1 week in advance. Term: Tue, Wed, Fri (08:00 - 14:00).

---

## Phase 4: Transition to Production (PROD)

### 1. Production Infrastructure
*   **Action**: Request production tunnel access.
*   **Submission**:
    *   **Adresat**: `integracie@nases.gov.sk`
    *   **Subject**: `[HSHLD] - PROD - INFRA - Žiadosť - Nastavenie infraštruktúrneho pripojenia`
*   **Requirement**: Attach the Matrix updated with PROD endpoints (consistent with DIZ/UAT).

### 2. Production Technical Account
*   **Action**: Register your actual technical certificates on the [Production ÚPVS Portal](https://schranka.slovensko.sk/).

### 3. System Solution Provider (if applicable)
*   **Action**: Register in the list of System Solution Providers.
*   **Requirement**: Requires an approved DIZ.
*   **Online Forms**: [Registration Link](https://schranka.slovensko.sk/FormConstructor/Default.aspx?IdService=459253).

### 4. Mandate / Representation Setup
*   **Action**: Set up representation (granting authority for your system to act for the host/legal entity).
*   **Path**: Use mandatory electronic forms for "Udelenie oprávnenia poskytovateľovi na zastupovanie". [Guides available here](https://www.slovensko.sk/_img/CMS4/Navody/Udelenie_opravnenia_poskytovatelovi_systemovych_rieseni.pdf).

---

## Summary of Contact Emails

*   **Testing/Integrations (FIX)**: `integracie@nases.gov.sk`
*   **Production Environment (PROD)**: `prevadzka@nases.gov.sk`
*   **General/Official Registry**: `podatelna@nases.gov.sk`
