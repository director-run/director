"use client";

import { useEffect, useState } from "react";

interface Entry {
  id: string;
  name: string;
  description: string;
  transport: {
    type: string;
    command: string;
    args: string[];
  };
  source: {
    type: string;
    url: string;
  };
  sourceRegistry: {
    name: string;
  };
  categories: string[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function Page() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/entries?page=${page}`);
      if (!response.ok) {
        throw new Error("Failed to fetch entries");
      }
      const data = await response.json();
      setEntries(data.entries);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Registry Entries</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 border-b text-left">Name</th>
              <th className="px-6 py-3 border-b text-left">Description</th>
              <th className="px-6 py-3 border-b text-left">Categories</th>
              <th className="px-6 py-3 border-b text-left">Source</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b">{entry.name}</td>
                <td className="px-6 py-4 border-b">{entry.description}</td>
                <td className="px-6 py-4 border-b">
                  {entry.categories.join(", ")}
                </td>
                <td className="px-6 py-4 border-b">
                  <a
                    href={entry.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {entry.source.url}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => fetchEntries(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchEntries(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
