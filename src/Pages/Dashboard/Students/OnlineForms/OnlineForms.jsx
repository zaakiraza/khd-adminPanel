import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OnlineForms.css";

export default function OnlineForms() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [totalPages, setTotalPages] = useState(0);
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const api = await axios.get(
        `${baseURL}/users/pending?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (api.status === 200) {
        setStudents(api.data.data.users);
        setTotalPages(api.data.data.pagination.totalPages);
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
  }, [page, limit]);

  return (
    <section className="container">
      <div className="heading">
        <h1>Students Currently Pending</h1>
      </div>
      <div className="extras">
        <div className="pagination">
          <button
            disabled={page === 1}
            cursor="not-allowed"
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
          >
            Next
          </button>
        </div>
        <div className="limithandle">
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
