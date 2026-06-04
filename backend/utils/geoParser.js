const geoip = require('geoip-lite');
const useragent = require('useragent');

/**
 * Parses client request headers and IP to resolve geographical and device metadata.
 * @param {string} ipAddress 
 * @param {string} uaHeader 
 * @returns {object}
 */
const parseRequestMetadata = (ipAddress, uaHeader) => {
  // 1. Geolocation lookup (handle local/private IPs gracefully)
  let country = 'Unknown';
  let region = 'Unknown';
  let city = 'Unknown';

  // Normalize IP
  let cleanIp = ipAddress;
if (
  ipAddress === '::1' ||
  ipAddress === '127.0.0.1' ||
  ipAddress.startsWith('::ffff:127.')
) {
  country = 'India';
  region = 'Tamil Nadu';
  city = 'Coimbatore';
} else {
  try {
    const geo = geoip.lookup(cleanIp);

    if (geo) {
      country = geo.country || 'Unknown';
      region = geo.region || 'Unknown';
      city = geo.city || 'Unknown';
    }
  } catch (error) {
    console.error('GeoIP lookup error:', error.message);
  }
}

  // 2. User agent string decoding
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'unknown';

  if (uaHeader) {
    try {
      const agent = useragent.parse(uaHeader);
      browser = agent.toAgent() || 'Unknown';
      os = agent.os.toString() || 'Unknown';

      // Simple regex device parsing
      const ua = uaHeader.toLowerCase();
      if (ua.includes('tablet') || ua.includes('ipad') || ua.includes('playbook')) {
        device = 'tablet';
      } else if (ua.includes('mobi') || ua.includes('iphone') || ua.includes('android')) {
        device = 'mobile';
      } else {
        device = 'desktop';
      }
    } catch (error) {
      console.error('User-Agent parsing error:', error.message);
    }
  }

  return {
    country,
    region,
    city,
    browser,
    os,
    device
  };
};

module.exports = { parseRequestMetadata };
