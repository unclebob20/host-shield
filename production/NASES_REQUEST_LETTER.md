# Žiadosť o prístup k produkčnému API ÚPVS

## Email na: integracie@nases.gov.sk
## Kópia (CC): prevadzka@nases.gov.sk

---

**Predmet**: Žiadosť o prístup k produkčnému API ÚPVS - Aplikácia HostShield

Vážený tým podpory NASES,

vyvíjame aplikáciu HostShield, systém na správu ubytovania, ktorý integruje služby portálu slovensko.sk pre automatizované hlásenie hostí polícii.

Používame Docker kontajner slovensko-digital/slovensko-sk-api (verzia 3.8.1) a potrebujeme prístup na sťahovanie formulárových šablón a odosielanie údajov na produkčné endpointy.

**IP adresa nášho produkčného servera**: 167.86.78.26

**Potrebujeme prístup k nasledujúcim endpointom**:
- iamwse.slovensko.sk:8581 (STS endpoint)
- iamwse.slovensko.sk:7017 (IAM endpoint)
- usr.slovensko.sk (ServiceBus endpoint)
- eschranka1.slovensko.sk (eDesk endpoint)

Mohli by ste nám prosím poskytnúť informácie o:
1. Procese získania prístupu k produkčnému API
2. Či je potrebný VPN prístup alebo whitelist IP adresy
3. Požadovanej dokumentácii pre formálne schválenie integrácie

Ďakujeme za vašu pomoc.

S pozdravom,  
Boris  
HostShield

---

## English Version (for reference)

**Subject**: Request for UPVS Production API Access - HostShield Application

Dear NASES Support Team,

We are developing HostShield, an accommodation management system that integrates 
with the UPVS portal for automated guest registration reporting to police.

We are using the slovensko-digital/slovensko-sk-api Docker container (version 3.8.1) 
and need access to download form templates and submit data to production endpoints.

**Our production server IP**: 167.86.78.26

**Required access to**:
- iamwse.slovensko.sk:8581 (STS endpoint)
- iamwse.slovensko.sk:7017 (IAM endpoint)  
- usr.slovensko.sk (ServiceBus endpoint)
- eschranka1.slovensko.sk (eDesk endpoint)

Could you please advise on:
1. The process for obtaining production API access
2. Whether VPN access or IP whitelisting is required
3. Required documentation for formal integration approval

Thank you for your assistance.

Best regards,  
Boris  
HostShield
