import { useState } from 'react';
import { createLink } from '../services/api';
import Loader from './Loader';

const EMPTY = {
  originalUrl: '',
  customAlias: '',
  expiresAt: '',
  clickLimit: '',
};

export default function UrlForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.originalUrl) {
      setError('Destination URL is required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        originalUrl: form.originalUrl,
        customAlias: form.customAlias || undefined,
        expiresAt: form.expiresAt || undefined,
        clickLimit: form.clickLimit
          ? parseInt(form.clickLimit, 10)
          : undefined,
      };

      await createLink(payload);

      setSuccess('Short link created successfully!');
      setForm(EMPTY);
      setOpen(false);

      onCreated && onCreated();

      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          'Failed to create link.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Create Short Link
          </h2>

          <p className="text-slate-500 text-sm mt-1">
            Shorten any URL with optional controls
          </p>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 font-medium shadow-sm"
        >
          {open ? 'Close' : '+ New Link'}
        </button>
      </div>

      {/* Success */}
      {success && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          ✓ {success}
        </div>
      )}

      {open && (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 pt-5 border-t border-slate-200"
        >
          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* URL */}
          <div>
            <label className="block text-sm text-slate-700 mb-2">
              Destination URL
              <span className="text-red-500 ml-1">*</span>
            </label>

            <input
              name="originalUrl"
              value={form.originalUrl}
              onChange={handleChange}
              placeholder="https://your-very-long-url.com/path?query=123"
              className="input-field"
              type="url"
            />
          </div>

          {/* Alias + Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                Custom Alias
              </label>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm whitespace-nowrap">
                  localhost:5000/
                </span>

                <input
                  name="customAlias"
                  value={form.customAlias}
                  onChange={handleChange}
                  placeholder="my-brand"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">
                Click Limit
              </label>

              <input
                name="clickLimit"
                value={form.clickLimit}
                onChange={handleChange}
                placeholder="e.g. 1000"
                className="input-field"
                type="number"
                min="1"
              />
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-sm text-slate-700 mb-2">
              Expiry Date (Optional)
            </label>

            <input
              name="expiresAt"
              value={form.expiresAt}
              onChange={handleChange}
              className="input-field"
              type="datetime-local"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 font-medium shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader size="sm" />
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Short Link'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}