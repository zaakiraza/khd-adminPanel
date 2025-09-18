import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StudentDetails.css";

export default function StudentDetails() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const api = await axios.get(`${baseURL}/users/active?page=1&limit=10`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (api.status === 200) {
        setStudents(api.data.data.users);
      }
    } catch (e) {
      setError("Failed to fetch students.");
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
  }, []);

  return (
    <section className="container">
      <div className="heading">
        <h1>Students currently enrolled</h1>
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
