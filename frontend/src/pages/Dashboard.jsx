import { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import UrlForm from '../components/UrlForm';
import UrlTable from '../components/UrlTable';
import AnalyticsCard from '../components/AnalyticsCard';
import Loader from '../components/Loader';
import { listLinks, getOverview } from '../services/api';

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [overview, setOverview] = useState(null);
  const [linksLoading, setLinksLoading] = useState(true);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchOverview = async () => {
    try {
      const { data } = await getOverview();
      setOverview(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setOverviewLoading(false);
    }
  };

  const fetchLinks = useCallback(async () => {
    setLinksLoading(true);
    try {
      const { data } = await listLinks({
        page,
        limit: 10,
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        sortBy,
        sortOrder: 'desc',
      });

      setLinks(data.data);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLinksLoading(false);
    }
  }, [page, search, status, sortBy]);

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleRefresh = () => {
    fetchLinks();
    fetchOverview();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-800 mb-1">
            Dashboard
          </h1>

          <p className="text-slate-500">
            Manage and track all your shortened links
          </p>
        </div>

        {/* Overview Stats */}
        {overviewLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader size="md" text="Loading overview..." />
          </div>
        ) : overview ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <AnalyticsCard
              label="Total Links"
              value={overview.totalLinks ?? 0}
              color="indigo"
              icon="🔗"
            />

            <AnalyticsCard
              label="Total Clicks"
              value={overview.totalClicks ?? 0}
              color="cyan"
              icon="📊"
            />

            <AnalyticsCard
              label="Unique Visitors"
              value={overview.uniqueVisitors ?? 0}
              color="emerald"
              icon="👥"
            />

            <AnalyticsCard
              label="Active Links"
              value={overview.activeLinks ?? 0}
              sub={`${overview.inactiveLinks ?? 0} inactive`}
              color="amber"
              icon="✅"
            />
          </div>
        ) : null}

        {/* URL Form */}
        <div className="mb-6">
          <UrlForm onCreated={handleRefresh} />
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">

          <input
            type="text"
            placeholder="Search by URL or alias..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input-field flex-1"
          />

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="input-field sm:w-40"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="input-field sm:w-48"
          >
            <option value="createdAt">Newest First</option>
            <option value="totalClicks">Most Clicked</option>
          </select>
        </div>

        {/* Table */}
        <UrlTable
          links={links}
          loading={linksLoading}
          onRefresh={handleRefresh}
        />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">

            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost disabled:opacity-30"
            >
              ← Prev
            </button>

            {Array.from(
              { length: pagination.totalPages },
              (_, i) => i + 1
            ).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all duration-200 ${
                  p === page
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() =>
                setPage((p) =>
                  Math.min(pagination.totalPages, p + 1)
                )
              }
              disabled={page === pagination.totalPages}
              className="btn-ghost disabled:opacity-30"
            >
              Next →
            </button>

          </div>
        )}
      </main>
    </div>
  );
}