import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation,useNavigate } from "react-router-dom";
import "./Sidebar.css";

const menuConfig = [
  {
    key: "students",
    label: "Students Information",
    items: [
      "Student Details",
      "Online Forms",
      "Student by category",
      "Manage status",
      "Promote Students",
    ],
  },
  {
    key: "attendance",
    label: "Attendance",
    items: ["Student Attendance", "Zoom Attendance", "Attendance by Category", "Approve Leave"],
  },
  {
    key: "examinations",
    label: "Examinations",
    items: ["Exam Schedule", "Results"],
  },
  {
    key: "lessonplan",
    label: "Lesson Plan",
    items: ["Manage Lesson Plans"],
  },
  {
    key: "academics",
    label: "Academics",
    items: ["TimeTable", "Sessions", "Classes", "Schedule", "Assignments", "Quizzes"],
  },
  {
    key: "communications",
    label: "Communications",
    // items: ["Send Message", "Email Matter", "Send Mail"],
    items: ["Email Matter"],
  },
  {
    key: "zoom",
    label: "Zoom Classes",
    items: ["Schedule Meeting", "Meeting Categories"],
  },
  {
    key: "reports",
    label: "Reports",
    items: [
      "Student Report",
      "Teacher Report",
      "Classes Report",
      "Session Report",
      "Exam Report",
    ],
  },
];

export default function Sidebar() {
  const [openKey, setOpenKey] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const labelToKey = useMemo(
    () => ({
      "Students Information": "students",
      Attendance: "attendance",
      Examinations: "examinations",
      "Lesson Plan": "lessonplan",
      Academics: "academics",
      Communications: "communications",
      "Zoom Classes": "zoom",
      Reports: "reports",
    }),
    []
  );

  const naviLink = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    const path = location.pathname;
    const match = path.match(/\/dashboard\/([^/]+)/);
    if (match && match[1]) {
      const sectionSlug = match[1];
      const slugToKey = {
        students: "students",
        attendance: "attendance",
        examinations: "examinations",
        "lesson-plan": "lessonplan",
        academics: "academics",
        communications: "communications",
        zoom: "zoom",
        reports: "reports",
      };
      const key = slugToKey[sectionSlug] || null;
      if (key) setOpenKey(key);
    }
  }, [location.pathname]);

  const toggle = (key) => {
    setOpenKey((prev) => (prev === key ? null : key));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand" onClick={naviLink}>
        <img src="/logo.png" alt="Khuddam" className="sidebar__logo" />
        <h1 className="sidebar__title">Khuddam Learning Online CLasses</h1>
      </div>

      <nav className="sidebar__nav" aria-label="Dashboard Navigation">
        {menuConfig.map((section) => {
          const isOpen = openKey === section.key;
          return (
            <div className="sidebar__section" key={section.key}>
              <button
                className={`sidebar__toggle${isOpen ? " is-open" : ""}`}
                onClick={() => toggle(section.key)}
                aria-expanded={isOpen}
                aria-controls={`menu-${section.key}`}
              >
                <span>{section.label}</span>
                <span className="sidebar__chevron" aria-hidden>
                  ▸
                </span>
              </button>

              <ul
                id={`menu-${section.key}`}
                className={`sidebar__submenu${isOpen ? " is-open" : ""}`}
                role="menu"
              >
                {section.items.map((item) => {
                  const to = buildPath(section.label, item);
                  return (
                    <li
                      key={item}
                      role="menuitem"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <NavLink
                        to={to}
                        className={({ isActive }) =>
                          `sidebar__link${isActive ? " is-active" : ""}`
                        }
                      >
                        {item}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

function slugify(label) {
  return label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function buildPath(sectionLabel, itemLabel) {
  const base = "/dashboard";
  const sectionMap = {
    "Students Information": "students",
    Attendance: "attendance",
    Examinations: "examinations",
    "Lesson Plan": "lesson-plan",
    Academics: "academics",
    Communications: "communications",
    "Zoom Classes": "zoom",
    Reports: "reports",
  };
  const section = sectionMap[sectionLabel] || slugify(sectionLabel);

  // Special cases to match our route slugs exactly
  const itemOverrides = {
    "Student Details": "student-details",
    "Online Forms": "online-forms",
    "Student by category": "student-by-category",
    "Manage status": "manage-status",
    "Promote Students": "promote-students",
    "Student Attendance": "student-attendance",
    "Zoom Attendance": "zoom-attendance",
    "Attendance by Category": "attendance-by-category",
    "Approve Leave": "approve-leave",
    "Exam Schedule": "exam-schedule",
    Results: "results",
    "Manage Lesson Plans": "manage-lesson-plans",
    TimeTable: "timetable",
    Sessions: "sessions",
    Classes: "classes",
    Schedule: "schedule",
    Assignments: "assignments",
    Quizzes: "quizzes",
    "Send Message": "send-message",
    "Email Matter": "email-matter",
    "Send Mail": "send-mail",
    "Schedule Meeting": "schedule-meeting",
    "Meeting Categories": "meeting-categories",
    "Student Report": "student-report",
    "Teacher Report": "teacher-report",
    "Classes Report": "classes-report",
    "Session Report": "session-report",
    "Exam Report": "exam-report",
  };

  const item = itemOverrides[itemLabel] || slugify(itemLabel);
  return `${base}/${section}/${item}`;
}
