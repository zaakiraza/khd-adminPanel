export default function StudentFilter({
  year,
  group,
  status,
  selected,
  onChange,
}) {
  const renderSelect = (label, options) => (
    <div className="form-group">
      <label>{label}</label>
      <select
        value={selected[label]}
        onChange={(e) => onChange(label, e.target.value)}
      >
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="student-panel">
      {renderSelect("Year", year)}
      {renderSelect("Group", group)}
      {renderSelect("Status", status)}
    </div>
  );
}
