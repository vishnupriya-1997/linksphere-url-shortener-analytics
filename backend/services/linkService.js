const Link = require('../models/Link');
const Click = require('../models/Click');
const { generateShortCode } = require('../utils/codeGenerator');

const createLink = async (originalUrl, customAlias, expiresAt, clickLimit, creatorId) => {
  let shortCode;

  // 1. Resolve custom alias or generate random shortCode
  if (customAlias && customAlias.trim() !== '') {
    const aliasExists = await Link.findOne({
      $or: [{ shortCode: customAlias }, { customAlias }]
    });
    if (aliasExists) {
      const error = new Error(`The custom alias '${customAlias}' is already in use.`);
      error.statusCode = 400;
      error.errorCode = 'ALIAS_TAKEN';
      throw error;
    }
    shortCode = customAlias.trim();
  } else {
    // Generate unique short code
    let isUnique = false;
    while (!isUnique) {
      shortCode = generateShortCode(6);
      const codeExists = await Link.findOne({ shortCode });
      if (!codeExists) {
        isUnique = true;
      }
    }
  }

  const link = await Link.create({
    originalUrl,
    shortCode,
    customAlias: customAlias ? customAlias.trim() : undefined,
    creatorId,
    expiresAt: expiresAt || null,
    clickLimit: clickLimit || null
  });

  return link;
};

const listLinks = async (creatorId, query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const { search, status, sortBy, sortOrder } = query;

  // Build MongoDB query filters
  const mongoQuery = { creatorId };

  if (search) {
    mongoQuery.$or = [
      { originalUrl: { $regex: search, $options: 'i' } },
      { shortCode: { $regex: search, $options: 'i' } },
      { customAlias: { $regex: search, $options: 'i' } }
    ];
  }

  if (status === 'active') {
    mongoQuery.isActive = true;
  } else if (status === 'inactive') {
    mongoQuery.isActive = false;
  }

  // Sorting
  const sort = {};
  const field = sortBy === 'totalClicks' ? 'totalClicks' : 'createdAt';
  sort[field] = sortOrder === 'asc' ? 1 : -1;

  const links = await Link.find(mongoQuery)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const totalItems = await Link.countDocuments(mongoQuery);

  return {
    links,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    }
  };
};

const toggleLinkStatus = async (linkId, creatorId) => {
  const link = await Link.findOne({ _id: linkId, creatorId });
  if (!link) {
    const error = new Error('Link not found or ownership denied.');
    error.statusCode = 404;
    error.errorCode = 'LINK_NOT_FOUND';
    throw error;
  }

  link.isActive = !link.isActive;
  await link.save();
  return link;
};

const deleteLink = async (linkId, creatorId) => {
  const link = await Link.findOneAndDelete({ _id: linkId, creatorId });
  if (!link) {
    const error = new Error('Link not found or ownership denied.');
    error.statusCode = 404;
    error.errorCode = 'LINK_NOT_FOUND';
    throw error;
  }

  // Asynchronously clean up all associated click logs
  await Click.deleteMany({ linkId });
  return link;
};

const bulkImportLinks = async (linksArray, creatorId) => {
  const imported = [];
  const errors = [];

  for (let i = 0; i < linksArray.length; i++) {
    const row = linksArray[i];
    const { originalUrl, customAlias, expiresAt, clickLimit } = row;

    try {
      // Inline simple validation
      if (!originalUrl || !originalUrl.startsWith('http')) {
        throw new Error('Invalid destination URL format');
      }

      const link = await createLink(
        originalUrl,
        customAlias,
        expiresAt ? new Date(expiresAt) : null,
        clickLimit ? parseInt(clickLimit, 10) : null,
        creatorId
      );

      imported.push(link);
    } catch (err) {
      errors.push({
        row: i + 2, // Accounting for CSV Header line
        url: originalUrl || 'N/A',
        reason: err.message
      });
    }
  }

  return {
    success: true,
    importedCount: imported.length,
    failedCount: errors.length,
    errors
  };
};

module.exports = {
  createLink,
  listLinks,
  toggleLinkStatus,
  deleteLink,
  bulkImportLinks
};
