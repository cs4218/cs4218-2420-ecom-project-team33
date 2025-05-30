import React, { useEffect } from "react";
import { useSearch } from "../../context/search";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const SearchInput = () => {
  const [values, setValues] = useSearch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/search") {
      setValues({ keyword: "", results: []});
      localStorage.removeItem("search");
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get(
        `/api/v1/product/search/${values.keyword}`
      );
      setValues({ ...values, results: data });
      localStorage.setItem("search", JSON.stringify({ keyword: values.keyword, results: data }));
      navigate("/search");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <form className="d-flex" role="search" onSubmit={handleSubmit}>
        <input
          className="form-control me-2"
          type="search"
          placeholder="Search"
          aria-label="Search"
          value={values.keyword}
          onChange={(e) => setValues({ ...values, keyword: e.target.value })}
          data-testid="search"
        />
        <button className="btn btn-outline-success" data-testid="search-btn" type="submit">
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchInput;