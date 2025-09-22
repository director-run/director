import React, { useState } from "react";
import { registryClient } from "../contexts/gateway-context";

export const RegistryListPage: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, error } = registryClient.entries.getEntries.useQuery(
    {
      pageIndex,
      pageSize: 20,
      searchQuery,
    },
    {
      placeholderData: (prev) => prev,
    },
  );

  if (isLoading) {
    return <div className="page">Loading...</div>;
  }

  if (error) {
    return <div className="page">Error: {error.message}</div>;
  }

  return <div className="page">{JSON.stringify(data)}</div>;
};
