import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const abn = (body.abn || '').replace(/[^\d]/g, '');

  if (abn.length !== 11) {
    return Response.json({ valid: false, reason: 'invalid_format', message: 'ABN must be 11 digits' }, { status: 400 });
  }

  const guid = Deno.env.get('ABR_GUID');
  if (!guid) {
    console.error('ABR_GUID secret is not set');
    return Response.json({ valid: false, reason: 'server_config_error', message: 'ABN lookup is not configured' }, { status: 500 });
  }

  const url = `https://abr.business.gov.au/json/AbnDetails.aspx?abn=${abn}&callback=callback&guid=${guid}`;

  let rawText;
  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'TendeX/1.0' },
      signal: AbortSignal.timeout(10000),
    });
    rawText = await response.text();
  } catch (err) {
    console.error('ABR API fetch failed:', err);
    return Response.json({
      valid: false,
      reason: 'api_unavailable',
      message: 'Could not connect to the ABN Register. Please try again.',
    }, { status: 502 });
  }

  let data;
  try {
    const jsonString = rawText.replace(/^callback\s*\(/, '').replace(/\s*\);\s*$/, '');
    data = JSON.parse(jsonString);
  } catch {
    console.error('Failed to parse ABR response:', rawText.slice(0, 200));
    return Response.json({ valid: false, reason: 'parse_error', message: 'Unexpected response from ABN Register' }, { status: 502 });
  }

  console.log('Parsed ABN data:', JSON.stringify(data));

  if (data.Message && String(data.Message).trim() !== '') {
    console.error('ABR message:', data.Message);
    return Response.json({ valid: false, reason: 'not_found', message: 'This ABN was not found in the ABN Register' });
  }

  if (!data.Abn) {
    return Response.json({ valid: false, reason: 'not_found', message: 'This ABN was not found in the ABN Register' });
  }

  if (data.AbnStatus !== 'Active') {
    return Response.json({
      valid: false,
      reason: 'cancelled',
      message: `This ABN is no longer active (status: ${data.AbnStatus}). Only active ABNs can be used in TendeX.`,
    });
  }

  const entityName = String(data.EntityName || '').trim();
  const addressState = String(data.AddressState || '').trim();
  const addressPostcode = String(data.AddressPostcode || '').trim();
  const gstRegistered = Boolean(data.Gst && String(data.Gst).trim() !== '');
  const gstRegisteredSince = data.Gst ? String(data.Gst).trim() : null;
  const abnActiveSince = data.AbnStatusEffectiveFrom ? String(data.AbnStatusEffectiveFrom).trim() : null;
  const entityTypeCode = String(data.EntityTypeCode || '').trim();
  const entityTypeName = String(data.EntityTypeName || '').trim();
  const acn = String(data.Acn || '').trim();

  return Response.json({
    valid: true,
    abn: String(data.Abn).replace(/\s/g, ''),
    entityName,
    entityTypeCode,
    entityTypeName,
    addressState,
    addressPostcode,
    gstRegistered,
    gstRegisteredSince,
    abnActiveSince,
    acn: acn || null,
  });
});