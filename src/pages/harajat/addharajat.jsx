import React, { useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAddHarajatMutation } from "../../context/service/harajat.service";
import { Button, Select } from "antd";

const { Option } = Select;

const AddHarajat = () => {
  const navigate = useNavigate();
  const [addHarajat, { isLoading, isError, error }] = useAddHarajatMutation();
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [summ, setSumm] = useState(""); // inputda ko'rsatiladigan summ
  const [paymentType, setPaymentType] = useState("naqd");

  // Summani formatlash funksiyasi
  const handleSummChange = (e) => {
    const rawValue = e.target.value.replace(/\s/g, ""); // space ni olib tashlaymiz
    if (!isNaN(rawValue)) {
      const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      setSumm(formattedValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !comment || !summ) {
      alert("Iltimos, barcha kerakli maydonlarni to'ldiring.");
      return;
    }

    const body = {
      name,
      comment,
      summ: Number(summ.replace(/\s/g, "")), // 🔥 Probellarni olib tashlaymiz
      paymentType,
    };

    try {
      await addHarajat(body).unwrap();
      navigate("/harajat");
    } catch (err) {
      console.error("Xatolik:", err);
    }
  };

  const errorMessage = error?.data?.message || "Noma'lum xatolik yuz berdi.";

  return (
    <div className="page">
      <div className="page-header">
        <h1>Yangi harajat qo'shish</h1>
        <Button type="primary" onClick={() => navigate("/harajat")}>
          <FaChevronLeft />
        </Button>
      </div>

      <form className="form_body" onSubmit={handleSubmit}>
        <label htmlFor="name">
          <p>Ism</p>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label htmlFor="comment">
          <p>Harajat sababi</p>
          <input
            type="text"
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </label>

        <label htmlFor="summ">
          <p>Harajat summasi</p>
          <input
            type="text" // 🔥 number emas, text type bo'ladi formatlash uchun
            id="summ"
            value={summ}
            onChange={handleSummChange}
            placeholder="Masalan: 200 000"
          />
        </label>

        <label htmlFor="paymentType">
          <p>To'lov turi</p>
          <Select
            id="paymentType"
            value={paymentType}
            onChange={(value) => setPaymentType(value)}
          >
            <Option value="naqd">Naqd</Option>
            <Option value="plastik">Plastik</Option>
          </Select>
        </label>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Yuklanmoqda..." : "Qo'shish"}
        </button>

        {isError && <p className="error">Xatolik: {errorMessage}</p>}
      </form>
    </div>
  );
};

export default AddHarajat;
