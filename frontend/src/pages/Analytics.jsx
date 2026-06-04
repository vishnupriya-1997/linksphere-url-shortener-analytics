import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import Navbar from '../components/Navbar';
import AnalyticsCard from '../components/AnalyticsCard';
import Loader from '../components/Loader';
import { getLinkStats, exportData } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CHART_DEFAULTS = {
  plugins: {
    legend: {
      labels: { color: '#334155', font: { family: 'Outfit', size: 12 } },
    },
    tooltip: {
      backgroundColor: '#1e293b',
      borderColor: 'rgba(99,102,241,0.3)',
      borderWidth: 1,
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
    },
  },
  scales: {
    x: {
      ticks: { color: '#334155', font: { family: 'Outfit', size: 11 } },
      grid: { color: 'rgba(255,255,255,0.04)' },
    },
    y: {
      ticks: { color: '#64748b', font: { family: 'Outfit', size: 11 } },
      grid: { color: 'rgba(255,255,255,0.04)' },
      beginAtZero: true,
    },
  },
};

export default function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await getLinkStats(id);
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportData(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${id}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };
   const timelineChart = stats
  ? {
      labels: stats.metrics?.timeline?.map((t) => t.date) || [],
      datasets: [
        {
          label: 'Clicks',
          data: stats.metrics?.timeline?.map((t) => t.clicks) || [],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.08)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#2563eb',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    }
  : null;

  const deviceChart = stats
    ? {
        labels: stats.metrics?.devices?.map((d) => d.name) || [],
        datasets: [
          {
            data: stats.metrics?.devices?.map((d) => d.value) || [],
            backgroundColor: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'],
            borderColor: ['#4f46e5', '#0891b2', '#059669', '#d97706'],
            borderWidth: 2,
          },
        ],
      }
    : null;

  const referrerChart = stats
    ? {
        labels:
  stats.metrics?.referrers?.map((r) =>
    r.source.length > 20
      ? r.source.substring(0, 20) + '...'
      : r.source
  ) || [],
        datasets: [
          {
            label: 'Clicks',
            data: stats.metrics?.referrers?.map((r) => r.clicks) || [],
          backgroundColor: '#4f46e5',
            borderRadius: 6,
          },
        ],
      }
    : null;

  return (
   // <div className="min-h-screen"> 
       <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button + header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
             // className="btn-ghost mb-2 pl-0 text-slate-500 hover:text-white flex items-center gap-1"
             className="btn-ghost mb-2 pl-0 text-slate-500 hover:text-blue-600 flex items-center gap-1"
            >
              ← Back to Dashboard
            </button>
           {/* <h1 className="text-3xl font-bold text-white"> */}
              <h1 className="text-3xl font-semibold text-slate-800">Link Analytics</h1>
            {stats && (
             // <p className="text-slate-400 text-sm mt-1 truncate max-w-lg">
             <p className="text-slate-500 text-sm mt-1 truncate max-w-lg">
                {stats.overview?.shortUrl}
              </p>
            )}
            {stats?.overview?.lastVisited && (
  <p className="text-sm text-slate-500 mt-2">
    Last Visited :
    {' '}
    {new Date(stats.overview.lastVisited).toLocaleString()}
  </p>
)}
          </div>
          
          {stats && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="btn-primary flex items-center gap-2 self-start sm:self-center"
            >
              {exporting ? <Loader size="sm" /> : '⬇'}
              Export Excel
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader size="lg" text="Loading analytics..." />
          </div>
        ) : error ? (
          <div className="card text-center py-16">
           {/* <p className="text-rose-400 text-lg mb-4">*/} 
           <p className="text-red-600 text-lg mb-4">{error}</p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              Go to Dashboard
            </button>
          </div>
        ) : stats ? (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <AnalyticsCard
                label="Total Clicks"
                value={stats.overview?.totalClicks ?? 0}
                color="indigo"
                icon="📊"
              />
              <AnalyticsCard
                label="Unique Visitors"
                value={stats.overview?.uniqueClicks ?? 0}
                color="cyan"
                icon="👥"
              />
              <AnalyticsCard
                label="Click Limit"
                value={stats.overview?.clickLimit ?? '∞'}
                color="amber"
                icon="🔢"
              />
              <AnalyticsCard
                label="Status"
                value={stats.overview?.isActive ? 'Active' : 'Inactive'}
                color={stats.overview?.isActive ? 'emerald' : 'rose'}
                icon={stats.overview?.isActive ? '✅' : '⛔'}
              />
            </div>

            {/* Click Timeline */}
            {timelineChart && timelineChart.labels.length > 0 && (
              //<div className="card mb-6">
              <div className="card mb-6 shadow-lg">
              {/* <h2 className="text-lg font-bold text-white mb-5">*/}  
                  <h2 className="text-lg font-semibold text-slate-800 mb-5">Click Trends (Last 30 Days)</h2>
                <div className="h-64">
                  {/* <Line
                    data={timelineChart}
                    options={{
                      ...CHART_DEFAULTS,
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  /> */}
                  <Line
  data={timelineChart}
  options={{
    ...CHART_DEFAULTS,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ...CHART_DEFAULTS.plugins,
      legend: {
        display: false,
      },
    },
  }}
/>
                </div>
              </div>
            )}

            {/* Device + Referrers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Device Doughnut */}
              {deviceChart && deviceChart.labels.length > 0 && (
               // <div className="card mt-8">
                  <div className="card mt-8 shadow-lg">
                  <h2 className="text-lg font-semibold text-slate-800 mb-5">
  Device Analytics
</h2>
                  <div className="h-56 flex items-center justify-center">
                    <Doughnut
                      data={deviceChart}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          ...CHART_DEFAULTS.plugins,
                          legend: {
                            position: 'right',
                            //labels: { color: '#334155', font: { family: 'Outfit', size: 12 } },
                            labels: {
  color: '#0f172a',
  font: {
    family: 'Outfit',
    size: 13,
    weight: '600',
  },
},
                          },
                        },
                        cutout: '65%',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Referrers Bar */}
              {referrerChart && referrerChart.labels.length > 0 && (
                <div className="card mt-8 shadow-lg">
                  <h2 className="text-lg font-semibold text-slate-800 mb-5">
  Top Referrers
</h2>
                  <div className="h-56">
                    <Bar
                      data={referrerChart}
                      options={{
                        ...CHART_DEFAULTS,
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          ...CHART_DEFAULTS.plugins,
                          legend: { display: false },
                        },
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Countries Table */}
            {stats.metrics?.countries?.length > 0 && (
              //<div className="card">
              <div className="card shadow-lg">
              <h2 className="text-xl font-bold text-slate-800 mb-6">
  🌍 Geographic Distribution
</h2>
                <div className="space-y-3">
                  {stats.metrics.countries.map((c, i) => {
                    const maxClicks = stats.metrics.countries[0]?.clicks || 1;
                    const pct = Math.round((c.clicks / maxClicks) * 100);
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-8 text-right text-slate-500 text-sm font-medium">
                          #{i + 1}
                        </div>
                       {/* <div className="w-10 text-slate-300 font-semibold text-sm"> */} 
                          <div className="w-10 text-slate-700 font-medium text-sm mr-6">{c.country}</div>
                        <div className="flex-1">
                          {/*<div className="h-2 bg-white/5 rounded-full overflow-hidden"> */}
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                            //  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        {/*<div className="w-16 text-right text-slate-300 text-sm font-semibold">*/}
                        <div className="w-16 text-right text-slate-700 text-sm font-medium">
                          {c.clicks.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}




            {/* Recent Visit History */}
{stats.metrics?.recentVisits?.length > 0 && (
  <div className="card mt-10 shadow-lg">
    <h2 className="text-xl font-bold text-slate-800 mb-6">
  📋 Recent Visit History
</h2>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-300 bg-slate-100">
            <th className="text-left py-3 text-slate-800 font-semibold">Time</th>
            <th className="text-left py-3 text-slate-800 font-semibold">Country</th>
            <th className="text-left py-3 text-slate-800 font-semibold">Browser</th>
            <th className="text-left py-3 text-slate-800 font-semibold">Device</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {stats.metrics.recentVisits.map((visit, index) => (
            
              <tr
  key={index}
  className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-200"
>
              <td className="py-3 text-slate-700">
                {new Date(visit.timestamp).toLocaleString()}
              </td>

              <td className="py-3 text-slate-700">
                {visit.country || 'Unknown'}
              </td>

              <td className="py-3 text-slate-700">
                {visit.browser || 'Unknown'}
              </td>

              <td className="py-3 text-slate-700">
                {visit.device || 'Unknown'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

            {/* Empty fallback */}
            {!stats.metrics?.timeline?.length &&
              !stats.metrics?.devices?.length &&
              !stats.metrics?.countries?.length && (
                <div className="card text-center py-16">
                  <div className="text-5xl mb-4">📭</div>
                  {/*<h3 className="text-white font-semibold text-lg mb-2">*/}
                  <h3 className="text-slate-800 font-semibold text-lg mb-2">No data yet</h3>
                  <p className="text-slate-500 text-sm">
                    Share your short link to start seeing analytics here.
                  </p>
                </div>
              )}
          </>
        ) : null}
      </main>
    </div>
  );
}
