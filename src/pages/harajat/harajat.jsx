import React, { useState, useEffect } from "react";
import { Table, Input, Button, Select, DatePicker } from "antd";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useGetHarajatQuery } from "../../context/service/harajat.service";
import moment from "moment";
import { Loading } from "../../components/loading/loading";

const { Option } = Select;

const Harajat = () => {
  const navigate = useNavigate();
  const {
    data = [],
    error: fetchError,
    isLoading: fetchLoading,
  } = useGetHarajatQuery();

  const [filteredHarajat, setFilteredHarajat] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    setFilteredHarajat(data);
    calculateTotal(data);
  }, [data]);

  useEffect(() => {
    if (filterType === "all") {
      setFilteredHarajat(data);
      calculateTotal(data);
    } else {
      const filteredData = data.filter(
        (harajat) => harajat.paymentType === filterType
      );
      setFilteredHarajat(filteredData);
      calculateTotal(filteredData);
    }
  }, [filterType, data]);

  useEffect(() => {
    if (selectedDate) {
      if (selectedDate === "") {
        setFilteredHarajat(data);
        calculateTotal(data);
        setSelectedDate("");
        return;
      } else {
        const filteredData = data.filter(
          (harajat) =>
            moment(harajat.createdAt).format("DD-MM-YYYY") === selectedDate
        );
        setFilteredHarajat(filteredData);
        calculateTotal(filteredData);
      }
    }
  }, [selectedDate]);

  const calculateTotal = (harajatData) => {
    const total = harajatData.reduce((acc, item) => acc + item.summ, 0);
    setTotalAmount(total);
  };

  const columns = [
    {
      title: "№",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Ismi",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Harajat sababi",
      dataIndex: "comment",
      key: "comment",
    },
    {
      title: "Harajat summasi",
      dataIndex: "summ",
      key: "summ",
      render: (summ) => `${summ.toLocaleString()}`,
    },
    {
      title: "To'lov turi",
      dataIndex: "paymentType",
      key: "paymentType",
      render: (paymentType) => (paymentType === "naqd" ? "Naqd" : "Plastik"),
    },
    {
      title: "Sana",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("DD-MM-YYYY HH:mm"),
    },
  ];
  const onChange = (date, dateString) => {
    if (dateString) {
      setSelectedDate(dateString);
    } else {
      setSelectedDate("");
      setFilteredHarajat(data);
      calculateTotal(data);
    }
  };
  if (fetchLoading) return <Loading />;
  if (fetchError) return <div>Harajatlarni olishda xato yuz berdi</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Harajatlar</h1>
        <div className="page-header__actions">
          <DatePicker
            format="DD-MM-YYYY"
            onChange={onChange}
            placeholder="Sana"
          />

          <Select
            value={filterType}
            onChange={setFilterType}
            style={{ width: 120, marginLeft: "10px" }}
          >
            <Option value="all">Hammasi</Option>
            <Option value="naqd">Naqd</Option>
            <Option value="plastik">Plastik</Option>
          </Select>
          <Button type="primary" onClick={() => navigate("create")}>
            <FaPlus /> Harajat qo'shish
          </Button>
        </div>
      </div>
      <Table
        dataSource={filteredHarajat}
        columns={columns}
        rowKey="_id"
        loading={fetchLoading}
      />
      <h1>Jami harajat: {totalAmount.toLocaleString()} UZS</h1>
    </div>
  );
};

export default Harajat;
