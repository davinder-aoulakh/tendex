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

  const query = (body.query || '').trim();
  if (query.length < 3) {
    return Response.json({ results: [] });
  }

  const params = new URLSearchParams({
    format: 'json',
    q: query,
    countrycodes: 'au',
    addressdetails: '1',
    limit: '6',
  });

  const url = `https://nominatim.openstreetmap.org/search?${params}`;

  let data;
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TendeX/1.0 (support@tendex.com.au)',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      console.error('Nominatim returned status:', response.status);
      return Response.json({ results: [], error: 'lookup_failed' }, { status: 502 });
    }
    data = await response.json();
  } catch (err) {
    console.error('Address lookup fetch failed:', err);
    return Response.json({ results: [], error: 'api_unavailable' }, { status: 502 });
  }

  const results = (Array.isArray(data) ? data : []).map(item => {
    const addr = item.address || {};
    const street = [addr.unit, addr.house_number, addr.road].filter(Boolean).join(' ');
    const suburb = addr.suburb || addr.town || addr.village || addr.hamlet || addr.city_district || addr.city || '';
    const state = addr.state || '';
    const postcode = addr.postcode || '';
    return {
      fullAddress: item.display_name || '',
      street,
      suburb,
      state,
      postcode,
    };
  });

  return Response.json({ results });
});