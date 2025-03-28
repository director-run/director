import { Logo } from "@director.run/ui/components/brand";
import { useState } from "react";

import "./App.css";
import { trpc } from "./trpc/client";

export function App() {
  const [newProxyName, setNewProxyName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Query to fetch all proxies
  const { data: proxies, isLoading, refetch } = trpc.store.getAll.useQuery();

  // Mutation to create a new proxy
  const createProxyMutation = trpc.store.create.useMutation({
    onSuccess: () => {
      // Clear the input field and any errors on success
      setNewProxyName("");
      setError(null);
      // Refetch the list of proxies
      refetch();
    },
    onError: (err) => {
      // Handle errors such as "proxy already exists"
      setError(err.message);
    },
  });

  // Mutation to delete a proxy
  const deleteProxyMutation = trpc.store.delete.useMutation({
    onSuccess: () => {
      // Refetch the list of proxies after deletion
      refetch();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // Handle adding a new proxy
  const handleAddProxy = () => {
    if (!newProxyName.trim()) {
      setError("Proxy name cannot be empty");
      return;
    }

    // Clear any previous errors
    setError(null);

    // Create a new proxy with the given name and empty servers array
    createProxyMutation.mutate({
      name: newProxyName,
      servers: [],
    });
  };

  // Handle deleting a proxy
  const handleDeleteProxy = (name: string) => {
    deleteProxyMutation.mutate({ name });
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center p-8">
      <Logo className="mb-4 size-10" />

      <div className="w-full max-w-md">
        <h2 className="mb-4 text-xl font-bold">Proxies</h2>

        {/* Error message display */}
        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Add new proxy form */}
        <div className="flex mb-4">
          <input
            type="text"
            value={newProxyName}
            onChange={(e) => setNewProxyName(e.target.value)}
            placeholder="Enter proxy name"
            className="flex-grow rounded-l border border-gray-300 px-3 py-2 focus:outline-none"
          />
          <button
            onClick={handleAddProxy}
            disabled={createProxyMutation.isPending}
            className="rounded-r bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-blue-300"
          >
            {createProxyMutation.isPending ? "Adding..." : "Add Proxy"}
          </button>
        </div>

        {/* Proxies list */}
        <div className="overflow-hidden rounded border">
          {isLoading ? (
            <div className="p-4 text-center">Loading proxies...</div>
          ) : proxies && proxies.length > 0 ? (
            <ul>
              {proxies.map((proxy) => (
                <li
                  key={proxy.name}
                  className="flex items-center justify-between border-b p-4 last:border-b-0"
                >
                  <div>
                    <span className="font-medium">{proxy.name}</span>
                    <span className="ml-2 text-gray-500 text-sm">
                      {proxy.servers.length} servers
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteProxy(proxy.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No proxies found. Add one above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
