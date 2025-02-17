import { useState, useContext, createContext, useEffect } from "react";

const SearchContext = createContext();
const SearchProvider = ({ children }) => {
  const [search, setSearch] = useState({
    keyword: "",
    results: [],
  });

  useEffect(() => {
    let existingSearch = localStorage.getItem("search");
    if (existingSearch) {
      const searchObject = JSON.parse(existingSearch);
      setSearch({
        keyword: searchObject.keyword,
        results: searchObject.results
      })
    }
  }, []);

  return (
    <SearchContext.Provider value={[search, setSearch]}>
      {children}
    </SearchContext.Provider>
  );
};

// custom hook
const useSearch = () => useContext(SearchContext);

export { useSearch, SearchProvider };