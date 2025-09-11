// FontAwesomeIcon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
// FilterComponent
import StudentFilter from "../../../common/StudentFilter";

// DB data
import studentdata from "../../../../assets/data/students.json";

import "../../dashboard.css";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Student() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    Year: "All",
    Group: "All",
    Status: "All",
  });
  const [filteredData, setFilteredData] = useState(studentdata);

  const yearOptions = ["All", "2022-2023", "2023-2024", "2024-2025"];
  const groupOptions = [
    "All",
    "Darja Atfal Awwal",
    "Darja Atfal Doam",
    "Darja Awwal",
    "Darja Doam",
    "Darja Soam",
    "Darja Chaharum",
  ];
  const statusOptions = ["All", "Rajab", "Zillhaj", "Left"];

  const filterHandler = (label, value) => {
    const updatedFilters = {
      ...filters,
      [label]: value,
    };
    setFilters(updatedFilters);

    const result = studentdata.filter((e) => {
      const yearMatch =
        updatedFilters.Year === "All" || e.year === updatedFilters.Year;
      const groupMatch =
        updatedFilters.Group === "All" || e.Group === updatedFilters.Group;
      const statusMatch =
        updatedFilters.Status === "All" ||
        (e.Pass_Out && e.Pass_Out.includes(updatedFilters.Status));
      return yearMatch && groupMatch && statusMatch;
    });

    setFilteredData(result);
  };

  useEffect(() => {
    setFilteredData(studentdata);
  }, []);

  return (
    <>
      <StudentFilter
        year={yearOptions}
        group={groupOptions}
        status={statusOptions}
        selected={filters}
        onChange={filterHandler}
      />
      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Age</th>
              <th>Whatsapp No</th>
              <th>Group</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((e, index) => (
              <tr key={index}>
                <td>{e.Roll_No}</td>
                <td>{e.Name}</td>
                <td>{e.Age}</td>
                <td>{e.Whatsapp_No}</td>
                <td>{e.Group}</td>
                <td>
                  <FontAwesomeIcon
                    icon={faEdit}
                    style={{
                      marginRight: "10px",
                      cursor: "pointer",
                      color: "#4CAF50",
                    }}
                    title="Edit"
                    onClick={() => navigate(`/dashboard/student/${e.Roll_No}`)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
