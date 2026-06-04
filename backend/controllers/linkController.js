const csv = require('csv-parser');
const fs = require('fs');
const linkService = require('../services/linkService');

const create = async (req, res, next) => {
  const { originalUrl, customAlias, expiresAt, clickLimit } = req.body;
  try {
    const link = await linkService.createLink(
      originalUrl,
      customAlias,
      expiresAt,
      clickLimit,
      req.user._id
    );

    // Build absolute URL string
    const host = req.headers.host;
    const protocol = req.secure ? 'https' : 'http';
    const shortUrl = `${protocol}://${host}/${link.shortCode}`;

    res.status(201).json({
      success: true,
      data: {
        id: link._id,
        originalUrl: link.originalUrl,
        shortCode: link.shortCode,
        customAlias: link.customAlias,
        shortUrl,
        isActive: link.isActive,
        expiresAt: link.expiresAt,
        clickLimit: link.clickLimit,
        totalClicks: link.totalClicks,
        isPublicStats: link.isPublicStats,
        createdAt: link.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const result = await linkService.listLinks(req.user._id, req.query);
    res.status(200).json({
      success: true,
      data: result.links,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const toggleStatus = async (req, res, next) => {
  const { id } = req.params;
  try {
    const link = await linkService.toggleLinkStatus(id, req.user._id);
    res.status(200).json({
      success: true,
      message: `Link state updated to ${link.isActive ? 'Active' : 'Inactive'}.`,
      isActive: link.isActive
    });
  } catch (error) {
    next(error);
  }
};

const deleteLink = async (req, res, next) => {
  const { id } = req.params;
  try {
    await linkService.deleteLink(id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Link and associated analytical logs permanently deleted.'
    });
  } catch (error) {
    next(error);
  }
};

const updateLinkSettings = async (req, res, next) => {
  const { id } = req.params;
  const { expiresAt, clickLimit, isPublicStats } = req.body;
  try {
    const LinkModel = require('../models/Link');
    const link = await LinkModel.findOne({ _id: id, creatorId: req.user._id });
    if (!link) {
      return res.status(404).json({
        success: false,
        error: { code: 'LINK_NOT_FOUND', message: 'Link not found.' }
      });
    }

    if (expiresAt !== undefined) link.expiresAt = expiresAt;
    if (clickLimit !== undefined) link.clickLimit = clickLimit;
    if (isPublicStats !== undefined) link.isPublicStats = isPublicStats;

    await link.save();
    res.status(200).json({
      success: true,
      message: 'Link access parameters updated successfully.',
      data: link
    });
  } catch (error) {
    next(error);
  }
};

const bulkImport = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'FILE_REQUIRED',
        message: 'CSV file upload is required inside mult-part key: "file"',
        details: []
      }
    });
  }

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const report = await linkService.bulkImportLinks(results, req.user._id);
        // Clean temporary uploaded file
        fs.unlinkSync(req.file.path);
        res.status(201).json(report);
      } catch (error) {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        next(error);
      }
    })
    .on('error', (error) => {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    });
};

module.exports = {
  create,
  list,
  toggleStatus,
  deleteLink,
  updateLinkSettings,
  bulkImport
};
