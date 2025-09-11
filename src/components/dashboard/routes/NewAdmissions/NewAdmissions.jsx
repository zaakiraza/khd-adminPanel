import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import data from "../../../../assets/data/new_admissions.json";
import "../../dashboard.css";

export default function NewAdmissions() {
  const navigate = useNavigate();

  return (
    <div className="table-container">
      <h2>New Admissions</h2>
      <table className="styled-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Father Name</th>
            <th>Whatsapp No</th>
            <th>Age</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((student) => {
            const age =
              new Date().getFullYear() - new Date(student.DOB).getFullYear();

            return (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.Name}</td>
                <td>{student.Father_Name}</td>
                <td>{student.Whatsapp_No}</td>
                <td>{age}</td>
                <td>
                  <FontAwesomeIcon
                    icon={faEdit}
                    className="icon-btn edit"
                    onClick={() =>
                      navigate(`/dashboard/new-admissions/${student.id}`)
                    }
                  />
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="icon-btn delete"
                    onClick={() => alert("Remove not implemented")}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
