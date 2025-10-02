import React, { useState, useEffect } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddStudentMutation,
  useGetCoinQuery,
  useUpdateStudentMutation,
} from "../../context/service/students.service";
import { Button, message } from "antd";

const AddStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // RTK Query hooks
  const [addStudent, { isLoading, isSuccess }] = useAddStudentMutation();
  const [updateStudent] = useUpdateStudentMutation();
  const { data: studentData = [] } = useGetCoinQuery();

  // States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [employeeNo, setEmployeeNo] = useState("");

  // Agar edit bo‘lsa — formni to‘ldirib qo‘yish
  useEffect(() => {
    if (id) {
      const editingStudent = studentData.find((student) => student._id === id);
      if (editingStudent) {
        setFirstName(editingStudent.firstName || "");
        setLastName(editingStudent.lastName || "");
        setPhoneNumber(editingStudent.phoneNumber || "");
        setEmployeeNo(editingStudent.employeeNo || "");
      }
    }
  }, [id, studentData]);

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !phoneNumber || !employeeNo) {
      message.error("❌ Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }

    const body = {
      firstName,
      lastName,
      phoneNumber,
      employeeNo,
      schoolId: localStorage.getItem("school_id"), // ✅ majburiy qo‘shamiz
    };

    try {
      if (id) {
        await updateStudent({ id, body }).unwrap();
        message.success("✅ O'quvchi muvaffaqiyatli yangilandi!");
      } else {
        await addStudent(body).unwrap();
        message.success("✅ O'quvchi muvaffaqiyatli qo'shildi!");
      }
      navigate("/student");
    } catch (err) {
      console.error("Xatolik:", err);
      message.error("❌ Amaliyotda xatolik yuz berdi.");
    }
  };

  // Qo‘shilgandan keyin navigate (faqat yangi qo‘shishda ishlaydi)
  useEffect(() => {
    if (isSuccess) {
      navigate("/student");
    }
  }, [isSuccess, navigate]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>{id ? "O'quvchini tahrirlash" : "O'quvchi qo'shish"}</h1>
        <Button type="primary" onClick={() => navigate("/student")}>
          <FaChevronLeft />
        </Button>
      </div>

      <form className="form_body" autoComplete="off" onSubmit={handleSubmit}>
        <label htmlFor="employeeNo">
          <p>Employee No (QR uchun)</p>
          <input
            type="text"
            id="employeeNo"
            value={employeeNo}
            onChange={(e) => setEmployeeNo(e.target.value)}
          />
        </label>

        <label htmlFor="firstName">
          <p>Ismi</p>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </label>

        <label htmlFor="lastName">
          <p>Familiyasi</p>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </label>

        <label htmlFor="phoneNumber">
          <p>Telefon raqam</p>
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </label>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Yuklanmoqda..." : "Saqlash"}
        </button>
      </form>
    </div>
  );
};

export default AddStudent;
