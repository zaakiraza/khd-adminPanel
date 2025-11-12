import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../../../components/common/Toast/ToastContext";
import "./OnlineForms.css";

export default function OnlineForms() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  const handleDeleteStudent = async (studentId, studentName) => {
    const confirmed = window.confirm(
      `Are you sure you want to reject the application for ${studentName}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const api = await axios.put(
        `${baseURL}/users/update_application_status/${studentId}`,
        { application_status: "rejected" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (api.status === 200) {
        // Remove the student from the current list
        setStudents((prevStudents) =>
          prevStudents.filter((student) => student._id !== studentId)
        );

        // Update total users count
        setTotalUsers((prevTotal) => prevTotal - 1);

        showSuccess("Application status updated to rejected successfully");
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      if (error.response && error.response.status === 403) {
        showError(error.response.data.message);
        navigate("/");
      } else {
        showError("Error updating application status. Please try again.");
      }
    }
  };

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
        setTotalUsers(api.data.data.pagination.totalUsers);
      }
    } catch (e) {
      setError(e.response.data.message);
      if (e.response && e.response.status === 403) {
        showError(e.response.data.message);
        navigate("/");
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
      <table>
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Student Name</th>
            <th>Father Name</th>
            <th>Age</th>
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
                <td
                  style={{
                    color:
                      student.personal_info.age > 19 ||
                      student.personal_info.age < 9
                        ? "Red"
                        : "black",
                  }}
                >
                  {student.personal_info.age}
                </td>
                <td>{student.personal_info.whatsapp_no}</td>
                <td>
                  <i 
                    className="fa-solid fa-pen"
                    onClick={() => navigate(`/dashboard/students/online-forms/${student._id}`)}
                    style={{ cursor: "pointer" }}
                    title="View/Edit Details"
                  ></i>
                </td>
                <td>
                  <i
                    className="fa-solid fa-trash"
                    style={{ cursor: "pointer", color: "#dc3545" }}
                    onClick={() =>
                      handleDeleteStudent(
                        student._id,
                        student.personal_info.first_name
                      )
                    }
                    title="Reject Application"
                  ></i>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
