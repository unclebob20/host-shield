const { create } = require('xmlbuilder2');

/**
 * XML Factory for Slovak Foreign Police submissions.
 *
 * This is deliberately decoupled from persistence: it takes plain JS objects
 * that mirror the DB schema (hosts, guest_register) and returns an XML string.
 *
 * NOTE: For Sprint 2 we keep the structure close to the existing
 * MVSR.HlaseniePobytu schema, but we can later adapt this to the exact
 * eForm / SKTalk envelope once the final schema is locked in.
 */

function buildGuestStayXml(host, guest) {
  if (!host || !guest) {
    throw new Error('Host and guest records are required');
  }

  const xmlObj = {
    'RegistrationOfStay': {
      '@xmlns': 'http://schemas.gov.sk/form/MVSR.HlaseniePobytu/1.0',
      'AccommodationProvider': {
        'PoliceProviderId': host.police_provider_id || null,
        'Name': host.full_name,
        'Email': host.email
      },
      'Guest': {
        'FirstName': guest.first_name,
        'Surname': guest.last_name,
        'BirthDate': guest.date_of_birth, // ISO-8601 from DB
        'Nationality': guest.nationality_iso3,
        'Document': {
          'Type': guest.document_type,
          'Number': guest.document_number
        },
        'StayDetails': {
          'ArrivalDate': guest.arrival_date,
          'DepartureDate': guest.departure_date,
          'Purpose': guest.purpose_of_stay || 'turistika'
        },
        'Compliance': {
          'SubmissionId': guest.gov_submission_id || null,
          'Status': guest.submission_status || 'pending',
          'SubmittedAt': guest.submitted_at || null
        }
      }
    }
  };

  // Ensure nulls are stripped from the output but fields remain structurally stable.
  const cleaned = JSON.parse(JSON.stringify(xmlObj, (key, value) => {
    if (value === null || value === undefined) return undefined;
    return value;
  }));

  return create({ version: '1.0', encoding: 'UTF-8' }, cleaned).end({ prettyPrint: false });
}

module.exports = {
  buildGuestStayXml
};

