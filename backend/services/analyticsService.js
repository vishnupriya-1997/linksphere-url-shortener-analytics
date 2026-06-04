const exceljs = require('exceljs');
const mongoose = require('mongoose');
const Link = require('../models/Link');
const Click = require('../models/Click');

const getOverviewStats = async (creatorId) => {
  // 1. Fetch user's links
  const links = await Link.find({ creatorId });
  const linkIds = links.map((link) => link._id);

  const totalLinks = links.length;
  const activeLinks = links.filter((link) => link.isActive).length;

  // 2. Fetch total click count
  const totalClicks = links.reduce((sum, link) => sum + link.totalClicks, 0);

  // 3. Unique visitors metric (by unique IP count across user's links)
  const uniqueIps = await Click.distinct('ipAddress', { linkId: { $in: linkIds } });
  const uniqueVisitors = uniqueIps.length;

  return {
    totalLinks,
    activeLinks,
    inactiveLinks: totalLinks - activeLinks,
    totalClicks,
    uniqueVisitors
  };
};

const getLinkStats = async (linkId, creatorId, isPublic = false) => {
  const query = { _id: linkId };
  if (!isPublic) {
    query.creatorId = creatorId;
  }

  const link = await Link.findOne(query);
  if (!link) {
    const error = new Error('Link not found or authorization denied.');
    error.statusCode = 404;
    error.errorCode = 'LINK_NOT_FOUND';
    throw error;
  }
const objectLinkId = new mongoose.Types.ObjectId(linkId);
  // 1. Overview click counts
  const totalClicks = link.totalClicks;
  const uniqueIps = await Click.distinct('ipAddress', { linkId });
  const uniqueClicks = uniqueIps.length;

  // 2. Historical Click Trends Timeline (Last 30 Days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const timelineData = await Click.aggregate([

    { $match: { linkId: objectLinkId, timestamp: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        clicks: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const timeline = timelineData.map((item) => ({
    date: item._id,
    clicks: item.clicks
  }));

  // 3. Geolocation metrics
  const countryData = await Click.aggregate([
    
    { $match: { linkId: objectLinkId } },
    { $group: { _id: '$country', clicks: { $sum: 1 } } },
    { $sort: { clicks: -1 } },
    { $limit: 10 }
  ]);

  const countries = countryData.map((item) => ({
    country: item._id,
    clicks: item.clicks
  }));

  // 4. Device type metrics
  const deviceData = await Click.aggregate([

    { $match: { linkId: objectLinkId } },
    { $group: { _id: '$device', value: { $sum: 1 } } }
  ]);

  const devices = deviceData.map((item) => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.value
  }));

  // 5. Referrer metrics
  const referrerData = await Click.aggregate([
    
    { $match: { linkId: objectLinkId } },
    { $group: { _id: '$referrer', clicks: { $sum: 1 } } },
    { $sort: { clicks: -1 } },
    { $limit: 5 }
  ]);
//
// 6. Last Visited + Recent Visits

const recentClicks = await Click.find({ linkId })
  .sort({ timestamp: -1 })
  .limit(10);

const lastVisited =
  recentClicks.length > 0
    ? recentClicks[0].timestamp
    : null;

const recentVisits = recentClicks.map((click) => ({
  timestamp: click.timestamp,
  country: click.country,
  browser: click.browser,
  device: click.device
}));

console.log('Timeline:', timelineData);
console.log('Countries:', countryData);
console.log('Devices:', deviceData);
console.log('Referrers:', referrerData);
  const referrers = referrerData.map((item) => ({
    source: item._id,
    clicks: item.clicks
  }));

  return {
    overview: {
  totalClicks,
  uniqueClicks,
  clickLimit: link.clickLimit,
  isActive: link.isActive,
  isPublicStats: link.isPublicStats,
  shortUrl: `${process.env.CLIENT_URL || 'http://localhost:5000'}/${link.shortCode}`,
  lastVisited
},
  metrics: {
  timeline,
  countries,
  devices,
  referrers,
  recentVisits
}
  };
};

const getPublicStats = async (shortCode) => {
  const link = await Link.findOne({ shortCode });
  if (!link) {
    const error = new Error('Shortcode not found.');
    error.statusCode = 404;
    error.errorCode = 'LINK_NOT_FOUND';
    throw error;
  }

  if (!link.isPublicStats) {
    const error = new Error('Public access to analytics is disabled for this link.');
    error.statusCode = 403;
    error.errorCode = 'STATS_PRIVATE';
    throw error;
  }

  return getLinkStats(link._id, null, true);
};

const exportExcelReport = async (linkId, creatorId) => {
  const link = await Link.findOne({ _id: linkId, creatorId });
  if (!link) {
    const error = new Error('Link not found or access denied.');
    error.statusCode = 404;
    error.errorCode = 'LINK_NOT_FOUND';
    throw error;
  }

  const clicks = await Click.find({ linkId }).sort({ timestamp: -1 });

  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet('Click Analytics');

  worksheet.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 25 },
    { header: 'IP Address', key: 'ipAddress', width: 18 },
    { header: 'Country', key: 'country', width: 12 },
    { header: 'Region', key: 'region', width: 15 },
    { header: 'City', key: 'city', width: 15 },
    { header: 'Browser', key: 'browser', width: 18 },
    { header: 'OS', key: 'os', width: 15 },
    { header: 'Device', key: 'device', width: 12 },
    { header: 'Referrer', key: 'referrer', width: 20 }
  ];

  clicks.forEach((click) => {
    worksheet.addRow({
      timestamp: click.timestamp.toISOString(),
      ipAddress: click.ipAddress,
      country: click.country,
      region: click.region,
      city: click.city,
      browser: click.browser,
      os: click.os,
      device: click.device,
      referrer: click.referrer
    });
  });

  // Apply styling to header row
  worksheet.getRow(1).font = { bold: true };

  return workbook;
};

module.exports = {
  getOverviewStats,
  getLinkStats,
  getPublicStats,
  exportExcelReport
};
