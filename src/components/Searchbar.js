import React, { useState } from "react";

const SearchBar = ({ tableId, gridviewId, placeholder = "Search Table...", onSearch }) => {
  const [query, setQuery] = useState("");

  // Whenever search query changes, update the filtered data
  const handleInputChange = (e) => {
    const searchQuery = e.target.value;
    setQuery(searchQuery);
    onSearch(searchQuery);
  };

  return (
    <div className="table-searchbar mt-2">
      <i className="bi bi-search aetablesearch-icon"></i>
      <input
        type="text"
        className="aetabletag-input"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default SearchBar;
