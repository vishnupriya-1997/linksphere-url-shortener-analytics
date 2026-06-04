import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { toggleLink, deleteLink } from '../services/api';
import Loader from './Loader';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all duration-200 ${
        copied
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-slate-100 text-slate-700 hover:text-blue-600 border border-slate-200 hover:border-blue-300'
      }`}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
        isActive
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-slate-100 text-slate-600 border border-slate-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? 'bg-green-500' : 'bg-slate-400'
        }`}
      />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

export default function UrlTable({ links, loading, onRefresh }) {
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState({});
  const [showQR, setShowQR] = useState(null);

  const setLoading = (id, val) =>
    setActionLoading((prev) => ({ ...prev, [id]: val }));

  const handleToggle = async (id) => {
    setLoading(id, 'toggle');
    try {
      await toggleLink(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(id, null);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Delete this link and all its analytics? This cannot be undone.'
      )
    )
      return;

    setLoading(id, 'delete');

    try {
      await deleteLink(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(id, null);
    }
  };

  if (loading) {
    return (
      <div className="card flex items-center justify-center py-16">
        <Loader size="lg" text="Loading your links..." />
      </div>
    );
  }

  if (!links || links.length === 0) {
    return (
      <div className="card text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center">
          <span className="text-3xl">🔗</span>
        </div>

        <h3 className="text-slate-800 font-semibold text-lg mb-2">
          No links yet
        </h3>

        <p className="text-slate-500 text-sm max-w-xs mx-auto">
          Create your first shortened link above to start tracking analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-slate-800">
          Your Links
        </h2>

        <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
          {links.length} link{links.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left text-slate-600 font-medium pb-3 pr-4">
                Short URL
              </th>
              <th className="text-left text-slate-600 font-medium pb-3 pr-4">
                Destination
              </th>
              {/*bxhbxydsgvxgsdhsh*/}
              <th className="text-left text-slate-600 font-medium pb-3 pr-4">
  Created Date
</th>
              <th className="text-center text-slate-600 font-medium pb-3 pr-4">
                Clicks
              </th>
              <th className="text-center text-slate-600 font-medium pb-3 pr-4">
                Status
              </th>
              <th className="text-right text-slate-600 font-medium pb-3">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {links.map((link) => {
              const shortUrl =
                link.shortUrl ||
              // `http://10.1.7.195:5000/${link.shortCode}`
              `http://localhost:5000/${link.shortCode}`;

              return (
                <tr
                  key={link._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 font-medium truncate max-w-[160px]">
                        {shortUrl}
                      </span>

                      <CopyButton text={shortUrl} />
                    </div>
                  </td>

                  <td className="py-4 pr-4">
                    <span
                      className="text-slate-600 truncate max-w-[200px] block"
                      title={link.originalUrl}
                    >
                      {link.originalUrl}
                    </span>
                  </td>
                  {/*zsxdcfgvhbjnk */}
                  <td className="py-4 pr-4 text-slate-600">
  {new Date(link.createdAt).toLocaleDateString()}
</td>

                  <td className="py-4 pr-4 text-center">
                    <span className="text-slate-900 font-medium">
                      {link.totalClicks?.toLocaleString() ?? 0}
                    </span>

                    {link.clickLimit && (
                      <span className="text-slate-500 text-xs ml-1">
                        / {link.clickLimit.toLocaleString()}
                      </span>
                    )}
                  </td>

                  <td className="py-4 pr-4 text-center">
                    <StatusBadge isActive={link.isActive} />
                  </td>

                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          navigate(`/analytics/${link._id}`)
                        }
                        className="btn-ghost"
                      >
                        Analytics
                      </button>
                      <button
  onClick={() => setShowQR(shortUrl)}
  className="btn-ghost"
>
  QR
</button>

                      <button
                        onClick={() => handleToggle(link._id)}
                        disabled={
                          actionLoading[link._id] === 'toggle'
                        }
                        className="btn-ghost"
                      >
                        {actionLoading[link._id] === 'toggle' ? (
                          <Loader size="sm" />
                        ) : link.isActive ? (
                          'Pause'
                        ) : (
                          'Activate'
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(link._id)}
                        disabled={
                          actionLoading[link._id] === 'delete'
                        }
                        className="btn-danger"
                      >
                        {actionLoading[link._id] === 'delete' ? (
                          <Loader size="sm" />
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {links.map((link) => {
          const shortUrl =
            link.shortUrl ||
            //`http://10.1.7.195:5000/${link.shortCode}`
            `http://localhost:5000/${link.shortCode}`;

          return (
            <div
              key={link._id}
              className="glass-light rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-blue-600 font-medium text-sm truncate">
                      {shortUrl}
                    </span>

                    <CopyButton text={shortUrl} />
                  </div>

                  <p className="text-slate-500 text-xs mt-1 truncate">
                    {link.originalUrl}
                  </p>
                </div>

                <StatusBadge isActive={link.isActive} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 text-sm">
                  <span className="text-slate-900 font-medium">
                    {link.totalClicks ?? 0}
                  </span>{' '}
                  clicks
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      navigate(`/analytics/${link._id}`)
                    }
                    className="btn-ghost text-xs"
                  >
                    Analytics
                  </button>
             <button
                onClick={() => setShowQR(shortUrl)}
           className="btn-ghost text-xs">QR</button>
                  <button
                    onClick={() => handleToggle(link._id)}
                    className="btn-ghost text-xs"
                  >
                    {link.isActive ? 'Pause' : 'Activate'}
                  </button>

                  <button
                    onClick={() => handleDelete(link._id)}
                    className="btn-danger text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
            {showQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center">
            <h3 className="text-lg font-semibold mb-4">
              Scan QR Code
            </h3>
            <QRCodeCanvas
  value={showQR}
  size={220}
  includeMargin={true}
/>

            <button
              onClick={() => setShowQR(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>

  );
}