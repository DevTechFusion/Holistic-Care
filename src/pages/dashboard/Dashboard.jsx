import { useState } from "react";
import CreateUserModal from "../../components/forms/UserForm";
import CreateProcedureModal from "../../components/forms/ProcedureForm";
import CreateDepartmentModal from "../../components/forms/DepartmentForm";
import CreateDoctorModal from "../../components/forms/DoctorForm";
import DashboardContent from "./DashboardContent";
const Dashboard = () => {
  // One state to track which modal is open
  const [openModal, setOpenModal] = useState(null); // "user" | "procedure" | "department" | null

  return (
    <div>

      <button onClick={() => setOpenModal("user")}>Create User</button>
      <button onClick={() => setOpenModal("procedure")}>Create Procedure</button>
      <button onClick={() => setOpenModal("department")}>Create Department</button>
      <button onClick={() => setOpenModal("doctor")}>Create Doctor</button>

      {/* User Modal */}
      <CreateUserModal
        open={openModal === "user"}
        onClose={() => setOpenModal(null)}
      />

      {/* Procedure Modal */}
      <CreateProcedureModal
        open={openModal === "procedure"}
        onClose={() => setOpenModal(null)}
      />

      {/* Department Modal */}
      <CreateDepartmentModal
        open={openModal === "department"}
        onClose={() => setOpenModal(null)}
      />

      {/* Doctor Modal */}
      <CreateDoctorModal
        open={openModal === "doctor"}
        onClose={() => setOpenModal(null)}
      />

      <DashboardContent />
    </div>
  );
};

export default Dashboard;
