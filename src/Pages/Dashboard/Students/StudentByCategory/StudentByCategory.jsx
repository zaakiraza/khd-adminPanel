import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StudentByCategory.css";

export default function StudentByCategory() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [enrolledYear, setEnrolledYear] = useState("");
  const [verified, setVerified] = useState("");
  const [status, setStatus] = useState("");
  const [application_status, setApplication_status] = useState("");
  const [searchInput, setSearchInput] = useState("");

  console.log(typeof searchInput);

  const checkforEmpty = (value) => {
    if (
      value === null ||
      value === undefined ||
      value.trim() === "" ||
      value.trim().length < 3
    ) {
      return true;
    }
    fetchStudents();
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const api = await axios.get(
        `${baseURL}/users/all?search=${searchInput}&verified=${verified}&status=${status}&enrolled_year=${enrolledYear}&application_status=${application_status}&limit=${limit}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (api.status === 200) {
        setStudents(api.data.data.users);
        setTotalPages(api.data.data.pagination.totalPages);
        setTotalUsers(api.data.data.pagination.totalUsers);
      }
    } catch (e) {
      setError(e.response.data.message);
      if (e.response && e.response.status === 403) {
        alert(e.response.data.message);
        window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, limit, status, verified, enrolledYear, application_status]);

  return (
    <section className="container">
      <div className="heading">
        <h1>All Students By Category</h1>
      </div>
      <div className="extras">
        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            style={{ cursor: page === 1 ? "not-allowed" : "pointer" }}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page === totalPages}
            style={{ cursor: page === totalPages ? "not-allowed" : "pointer" }}
          >
            Next
          </button>
        </div>
        <div className="limithandle">
          <p>
            records:<strong>{totalUsers}</strong>
          </p>
          <label htmlFor="limit">Records per page: </label>
          <select
            name="limit"
            id="limit"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      <div className="search">
        <input
          type="text"
          placeholder="Search by Name, Email, Phone Number"
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key == "Enter") checkforEmpty(searchInput);
          }}
        />
        <button onClick={() => checkforEmpty(searchInput)}>
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
      </div>
      <div className="filters">
        <div className="filter">
          <select
            name="enrolled_year"
            id="enrolled_year"
            value={enrolledYear}
            onChange={(e) => setEnrolledYear(e.target.value)}
          >
            <option value="">-- Enrolled Year - All --</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>
        <div className="filter">
          <select
            name="verified"
            id="verified"
            value={verified}
            onChange={(e) => setVerified(e.target.value)}
          >
            <option value="">-- Verifyed - All --</option>
            <option value="true">Verified</option>
            <option value="false">Not Verified</option>
          </select>
        </div>
        <div className="filter">
          <select
            name="status"
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">-- Status - All --</option>
            <option value="active">Active</option>
            <option value="inactive">In-Active</option>
          </select>
        </div>
        <div className="filter">
          <select
            name="application_status"
            id="application_status"
            value={application_status}
            onChange={(e) => {
              setApplication_status(e.target.value);
              e.target.value == "rejected"
                ? setStatus("inactive")
                : setStatus("");
            }}
          >
            <option value="">-- Application Status - All --</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Student Name</th>
            <th>Father Name</th>
            <th>Phone</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                Loading...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", color: "red" }}>
                {error}
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr key={student.personal_info.rollNo}>
                <td>{student.personal_info.rollNo}</td>
                <td>{student.personal_info.first_name}</td>
                <td>{student.personal_info.father_name}</td>
                <td>{student.personal_info.whatsapp_no}</td>
                <td>
                  <i className="fa-solid fa-pen"></i>
                </td>
                <td>
                  <i className="fa-solid fa-trash"></i>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
