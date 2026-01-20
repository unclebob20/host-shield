/**
 * HostShield Government Integration Service
 * Formats and submits guest data to the Slovak Foreign Police.
 */
const axios = require('axios');

async function submitGuestToPolice(guestData, hostId) {
    // 1. Map OCR/DB data to the required Slovak Gov fields
    const payload = {
        hlásenie_pobytu: {
            ubytovateľ_id: hostId, // Your host's unique ID assigned by the Police
            cudzinec: {
                meno: guestData.firstName,
                priezvisko: guestData.lastName,
                datum_narodenia: guestData.dob,
                statna_prislusnost: guestData.nationality_code, // ISO alpha-3 (e.g., DEU, USA)
                cislo_dokladu: guestData.docNumber,
                typ_dokladu: guestData.documentType,
                pobyt_od: guestData.arrivalDate,
                pobyt_do: guestData.departureDate,
                ucel_cesty: "turistika" // Default for most Airbnb stays
            }
        }
    };

    try {
        // 2. Push to the Slovensko.digital bridge (self-hosted in your K3s)
        const response = await axios.post('http://hostshield_gov_api:3000/api/v1/submit', payload, {
            headers: { 'Authorization': `Bearer ${process.env.GOV_TOKEN}` }
        });

        // 3. Return the Gov Tracking ID for the "Kniha ubytovaných" audit log
        return response.data.submission_id;
    } catch (error) {
        console.error("Submission to Foreign Police failed:", error.response?.data || error.message);
        throw new Error("Compliance failure: Could not report guest.");
    }
}