import React, { useState, useEffect } from "react";
import Table from "./Table";
import SearchBar from "./Searchbar";
import GridView from "./Gridview";
import Filter from "./Filter";
import SortTable from "./SortTable";
import { Row, Col } from "react-bootstrap";

const DataTable = ({
  id = "datatable",
  tableRef,
  columns = [],
  data = [],
  defaultView = "table",
  searchable = true,
  filterable = true,
  sortable = true,
  paginated = true,
  showCheckbox = true,
  grid = true,
  children,
}) => {
  const [filteredData, setFilteredData] = useState(data);
  const [view, setView] = useState(defaultView);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const handleViewToggle = () => {
    setView((prevView) => (prevView === "table" ? "grid" : "table"));
  };

  const handleSearch = (query) => {
    const searchedData = data.filter((item) => {
      return Object.values(item).some((value) =>
        String(value).toLowerCase().includes(query.toLowerCase())
      );
    });
    setFilteredData(searchedData);
  };

  useEffect(() => {
    if (!sortable || !sortColumn) return;

    const sortedData = [...filteredData].sort((a, b) => {
      let valueA = a[sortColumn] ?? "";
      let valueB = b[sortColumn] ?? "";

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortOrder === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
      }

      if (Date.parse(valueA) && Date.parse(valueB)) {
        return sortOrder === "asc"
          ? new Date(valueA) - new Date(valueB)
          : new Date(valueB) - new Date(valueA);
      }

      return 0;
    });

    setFilteredData(sortedData);
  }, [sortColumn, sortOrder, sortable, filteredData]);

  return (
    <div>
      <Row className="align-items-center  mt-4">
        <Col>
          {searchable && (
            <SearchBar
              tableId={id}
              gridviewId={id}
              placeholder="Search for data..."
              onSearch={(query) => handleSearch(query)}
            />
          )}
        </Col>

        <Col className="mt-2 col-auto">
          <div className="d-flex justify-content-end gap-2">
            {filterable && (
              <Filter
                columns={columns}
                data={data}
                onFilter={setFilteredData}
                tableId={id}
                gridviewId={id}
              />
            )}

            {grid && (
              <div className="table-btn">
                <button className="btn grid-btn " onClick={handleViewToggle}>
                  <i className="bi bi-grid"></i>
                </button>
              </div>
            )}

            {sortable && (
              <SortTable
                data={filteredData}
                setSortedData={setFilteredData}
                columns={columns}
                sortColumn={sortColumn}
                setSortColumn={setSortColumn}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
              />
            )}
          </div>
        </Col>
      </Row>

      {view === "table" ? (
        <Table
          id={id}
          data={data}
          columns={columns}
          tableRef={tableRef}
          filteredData={filteredData}
          showCheckbox={showCheckbox}
          setFilteredData={setFilteredData}
          paginated={paginated}
          enableHorizontalScroll={true}
        />
      ) : (
        <>
          {children ? (
            <>{children}</>
          ) : (
            <GridView
              gridviewId={id}
              data={filteredData}
              columns={columns}
              sortColumn={sortColumn}
              sortOrder={sortOrder}
              viewType={view}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DataTable;
