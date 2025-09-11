import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import studentdata from "../../../../assets/data/students.json";

export default function StudentDetails() {
  const { rollNo } = useParams();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const found = studentdata.find((s) => String(s.Roll_No) === rollNo);
    setStudent(found);
  }, [rollNo]);

  if (!student) return <p>Loading student data...</p>;

  return (
    <div style={{ padding: "30px" }}>
      <h2>Student Details - Roll No: {student.Roll_No}</h2>
      <form
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          maxWidth: "1000px",
        }}
      >
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
          "Atfaal_Awwal",
          "Atfaal_Doam",
          "Awal",
          "Doam",
          "Soam",
          "Chaharum",
          "Namaz_Certification",
          "Wuzu_Certfied",
          "Assess_Test",
          "Halafnama",
          "Roll_No",
          "year",
          "Group",
          "Pass_Out",
        ].map((field) => (
          <label
            key={field}
            style={{ display: "flex", flexDirection: "column" }}
          >
            {field.replace(/_/g, " ")}:
            <input
              type="text"
              defaultValue={student[field] ?? ""}
              name={field}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </label>
        ))}
      </form>

      <button
        type="submit"
        style={{
          marginTop: "30px",
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Save Changes
      </button>
    </div>
  );
}
