import { useParams } from "react-router-dom";
import newAdmissions from "../../../../assets/data/new_admissions.json";
import students from "../../../../assets/data/students.json";
import { useEffect, useState } from "react";

// Helper to calculate age from DOB
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const now = new Date();
  const age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  return m < 0 || (m === 0 && now.getDate() < birthDate.getDate())
    ? age - 1
    : age;
};

// Helper to get current academic year (e.g. "2025-2026")
const getAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  return `${year}-${year + 1}`;
};

export default function NewAdmissionDetails() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const admission = newAdmissions.find((item) => item.id === parseInt(id));
    if (admission) {
      const nextRollNo =
        Math.max(...students.map((s) => s.Roll_No || 0), 0) + 1;

      const enrichedStudent = {
        ...admission,
        Age: calculateAge(admission.DOB),
        Atfaal_Awwal: null,
        Atfaal_Doam: null,
        Awal: null,
        Doam: null,
        Soam: null,
        Chaharum: null,
        Namaz_Certification: null,
        Wuzu_Certfied: null,
        Assess_Test: null,
        Halafnama: null,
        Roll_No: nextRollNo,
        year: getAcademicYear(),
        Group: null,
        Pass_Out: null,
      };

      setStudent(enrichedStudent);
    }
  }, [id]);

  if (!student) return <p>Student not found</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>New Admission Details</h2>
      <form className="student-details-form">
        {[
          "Name",
          "Father_Name",
          "DOB",
          "Age",
          "Whatsapp_No",
          "Alternative_No",
          "Address",
          "City",
          "Country",
          "Marj_E_Taqleed",
          "Class",
          "Result",
          "Roll_No",
          "year",
        ].map((field) => (
          <div className="form-group" key={field}>
            <label>{field.replaceAll("_", " ")}:</label>
            <input
              type="text"
              value={student[field] || ""}
              readOnly
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        ))}
      </form>
    </div>
  );
}
