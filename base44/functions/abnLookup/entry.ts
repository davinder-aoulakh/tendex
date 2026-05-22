import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { abn } = await req.json();

    if (!abn) {
      return Response.json({ error: 'ABN is required' }, { status: 400 });
    }

    const clean = abn.replace(/[^\d]/g, '');
    if (clean.length !== 11 && clean.length !== 9) {
      return Response.json({ error: 'Invalid ABN/ACN length' }, { status: 400 });
    }

    const guid = Deno.env.get('ABR_GUID');
    if (!guid) {
      return Response.json({ valid: false, error: 'ABR_GUID secret not configured' }, { status: 200 });
    }
    const url = `https://abr.business.gov.au/json/AbnDetails.aspx?abn=${clean}&callback=cb&guid=${guid}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'text/javascript, application/json, */*',
        'User-Agent': 'Mozilla/5.0 (compatible; TendeX/1.0)',
      },
    });

    console.log('ABN API status:', response.status, response.statusText);
    console.log('ABN API url:', url);

    if (!response.ok) {
      return Response.json({ valid: false, error: `ABN register unavailable: ${response.status}` }, { status: 200 });
    }

    const text = await response.text();
    console.log('ABN API raw response:', text.substring(0, 500));

    // Strip JSONP wrapper: cb({...})
    const jsonMatch = text.match(/cb\s*\((\{.*\})\s*\)/s);
    if (!jsonMatch) {
      console.error('Could not parse JSONP response:', text.substring(0, 200));
      return Response.json({ valid: false, error: 'Could not parse response' }, { status: 200 });
    }

    const data = JSON.parse(jsonMatch[1]);
    console.log('Parsed ABN data:', JSON.stringify(data));
    console.log('Abn field:', data.Abn, '| AbnStatus:', data.AbnStatus);

    if (data.Message && data.Message.includes('GUID')) {
      console.error('Invalid ABR GUID:', data.Message);
      return Response.json({ valid: false, error: 'ABR GUID is not registered. Please register at https://abr.business.gov.au/Tools/WebServices' }, { status: 200 });
    }

    if (!data.Abn) {
      return Response.json({ valid: false, message: 'ABN not found or not registered' }, { status: 200 });
    }

    if (data.AbnStatus !== 'Active') {
      return Response.json({ valid: false, message: `ABN is not active (status: ${data.AbnStatus})` }, { status: 200 });
    }

    const entityName = data.EntityName || data.MainName || '';

    return Response.json({
      valid: true,
      abn: data.Abn,
      entityName,
      abnStatus: data.AbnStatus,
      entityType: data.EntityTypeName || '',
      postcode: data.AddressPostcode || '',
      state: data.AddressState || '',
    });
  } catch (error) {
    console.error('ABN lookup error:', error.message);
    return Response.json({ valid: false, error: error.message }, { status: 200 });
  }
});