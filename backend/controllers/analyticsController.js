const analyticsService = require('../services/analyticsService');

const overview = async (req, res, next) => {
  try {
    const stats = await analyticsService.getOverviewStats(req.user._id);
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

const linkStats = async (req, res, next) => {
  const { id } = req.params;
  try {
    const stats = await analyticsService.getLinkStats(id, req.user._id);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

const publicStats = async (req, res, next) => {
  const { shortCode } = req.params;
  try {
    const stats = await analyticsService.getPublicStats(shortCode);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

const exportData = async (req, res, next) => {
  const { id } = req.params;
  try {
    const workbook = await analyticsService.exportExcelReport(id, req.user._id);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + `link-analytics-${id}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  overview,
  linkStats,
  publicStats,
  exportData
};
