import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StudentDetails.css";

export default function StudentDetails() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [enrolled_class, setEnrolled_class] = useState("");
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const api = await axios.get(
        `${baseURL}/users/active?enrolled_class=${enrolled_class}&page=${page}&limit=${limit}`,
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
  }, [page, limit, enrolled_class]);

  return (
    <section className="container">
      <div className="heading">
        <h1>Students Currently Active</h1>
      </div>
      <div className="extras">
        <div className="pagination">
          <button
            disabled={page === 1}
            style={{ cursor: page === 1 ? "not-allowed" : "pointer" }}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
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
      <div className="filters">
        <div className="filter">
          <select
            name="enrolled_class"
            id="enrolled_class"
            onChange={(e) => {
              setEnrolled_class(e.target.value);
            }}
          >
            <option value="">-- Group - All --</option>
            <option value="Atfaal-Awal">Atfaal-Awal</option>
            <option value="Atfaal-doam">Atfaal-doam</option>
            <option value="Awwal">Awwal</option>
            <option value="Doam">Doam</option>
            <option value="Soam">Soam</option>
            <option value="Chaharum">Chaharum</option>
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
                  <i className="fa-solid fa-eye"></i>
                </td>
                {/* <td>
                  <i className="fa-solid fa-trash"></i>
                </td> */}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
