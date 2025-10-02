import React, { useEffect, useState } from "react";
import { useGetClassQuery } from "../../context/service/class.service";
import {
  useGetDavomatQuery,
  useAddDavomatByScanMutation,
} from "../../context/service/oquvchiDavomati.service";
import { useGetCoinQuery } from "../../context/service/students.service";
import {
  Button,
  DatePicker,
  Select,
  Modal,
  Progress,
  Card,
  Statistic,
  Row,
  Col,
  Tag,
  Avatar,
  Divider,
  Space,
  Typography,
  TimePicker,
  message,
  Popconfirm,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  FaList,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaUser,
  FaChartLine,
} from "react-icons/fa";
import { IoTimeOutline, IoExitOutline, IoStatsChart } from "react-icons/io5";
import { MdLogin, MdLogout } from "react-icons/md";
import moment from "moment";

// ✅ Custom oq rangli table import
import { Table } from "../../components/table/table";

const { Title, Text } = Typography;

const Davomat = () => {
  const today = moment().format("YYYY-MM-DD");
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedClass, setSelectedClass] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(
    moment().format("MM-YYYY")
  );

  // Qo'lda davomat olish uchun state'lar
  const [attendanceModal, setAttendanceModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [arrivalTime, setArrivalTime] = useState(null);
  const [leaveTime, setLeaveTime] = useState(null);
  const [attendanceType, setAttendanceType] = useState("");

  const navigate = useNavigate();
  const { data: classData = [] } = useGetClassQuery();
  const { data: davomatData = [], refetch } = useGetDavomatQuery();
  const { data: studentData = [] } = useGetCoinQuery();
  const [addDavomatByScan, { isLoading }] = useAddDavomatByScanMutation();

  // 🔎 Sinf bo'yicha filterlash
  useEffect(() => {
    if (selectedClass) {
      setFilteredStudents(
        studentData.filter((item) => item.groupId._id === selectedClass)
      );
    } else {
      setFilteredStudents(studentData);
    }
  }, [selectedClass, studentData]);

  const onChange = (date, dateString) => {
    setSelectedDate(dateString || today);
  };

  // 🔎 Bitta student uchun shu sanadagi yozuvni topish
  const getStudentEntry = (studentId) => {
    const entry = davomatData?.find(
      (item) =>
        moment(item.date).format("YYYY-MM-DD") ===
        moment(selectedDate).format("YYYY-MM-DD")
    );
    if (!entry || !Array.isArray(entry.body)) return null;

    return entry.body.find(
      (s) => String(s.student_id?._id || s.student_id) === String(studentId)
    );
  };

  const getStatus = (studentId) => {
    const entry = getStudentEntry(studentId);
    if (!entry) return "Kelmadi";
    if (entry.status === "keldi") return "Keldi";
    if (entry.status === "ketdi") return "Ketdi";
    return "Kelmadi";
  };

  const getArrivedTime = (studentId) => {
    const entry = getStudentEntry(studentId);
    return entry?.time || "-";
  };

  const getQuittedTime = (studentId) => {
    const entry = getStudentEntry(studentId);
    return entry?.quittedTime || "-";
  };

  // Qo'lda davomat belgilash funksiyasi
  const handleMarkAttendance = async (student, type) => {
    setCurrentStudent(student);
    setAttendanceType(type);

    const currentTime = moment();
    if (type === "arrive") {
      setArrivalTime(currentTime);
      setLeaveTime(null);
    } else {
      setLeaveTime(currentTime);
      const existingEntry = getStudentEntry(student._id);
      if (existingEntry && existingEntry.time) {
        setArrivalTime(moment(existingEntry.time, "HH:mm"));
      }
    }

    setAttendanceModal(true);
  };

  // Davomatni saqlash
  const saveAttendance = async () => {
    if (!currentStudent || !arrivalTime) {
      message.error("Student va kelish vaqti majburiy!");
      return;
    }

    try {
      const attendanceData = {
        employeeNo: currentStudent.employeeNo,
        date: moment(selectedDate).format("YYYY-MM-DD"),
        status: "keldi",
        time: arrivalTime.format("HH:mm"),
        quittedTime: leaveTime ? leaveTime.format("HH:mm") : undefined,
      };

      await addDavomatByScan(attendanceData).unwrap();
      message.success(
        `${currentStudent.firstName} ${currentStudent.lastName} ning davomati belgilandi`
      );

      setAttendanceModal(false);
      setCurrentStudent(null);
      setArrivalTime(null);
      setLeaveTime(null);
      setAttendanceType("");

      refetch();
    } catch (error) {
      console.error("Davomat belgilashda xatolik:", error);
      message.error("Davomat belgilashda xatolik yuz berdi!");
    }
  };

  // Kelmagan deb belgilash
  const markAsAbsent = async (student) => {
    try {
      const attendanceData = {
        employeeNo: student.employeeNo,
        date: moment(selectedDate).format("YYYY-MM-DD"),
        status: "kelmadi",
      };

      await addDavomatByScan(attendanceData).unwrap();
      message.success(
        `${student.firstName} ${student.lastName} kelmagan deb belgilandi`
      );
      refetch();
    } catch (error) {
      console.error("Davomat belgilashda xatolik:", error);
      message.error("Davomat belgilashda xatolik yuz berdi!");
    }
  };

  // 📌 Oylik hisobot olish
  // 📌 Oylik hisobot olish
  const getMonthlyStatus = (student_id, month) => {
    const [monthPart, yearPart] = month.split("-").map(Number);
    const daysInMonth = new Date(yearPart, monthPart, 0).getDate();

    const result = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = moment(
        `${yearPart}-${monthPart}-${day}`,
        "YYYY-MM-DD"
      );

      // Shu kunga mos yozuvni topamiz
      const entry = davomatData.find(
        (d) =>
          moment(d.date).format("YYYY-MM-DD") ===
          currentDate.format("YYYY-MM-DD")
      );

      let status = "kelmadi";
      let time = "-";
      let quittedTime = "-";

      if (entry && Array.isArray(entry.body)) {
        entry.body.forEach((item) => {
          // Eski format (array ichida students)
          if (Array.isArray(item.students)) {
            item.students.forEach((s) => {
              if (
                String(s.student_id?._id || s.student_id) === String(student_id)
              ) {
                if (
                  s.status === true ||
                  s.status === "keldi" ||
                  (s.time && s.time !== "-")
                ) {
                  status = "keldi";
                }
                time = s.time || time;
                quittedTime = s.quittedTime || quittedTime;
              }
            });
          }

          // Yangi format
          if (
            String(item.student_id?._id || item.student_id) ===
            String(student_id)
          ) {
            if (
              item.status === true ||
              item.status === "keldi" ||
              (item.time && item.time !== "-")
            ) {
              status = "keldi";
            }
            time = item.time || time;
            quittedTime = item.quittedTime || quittedTime;
          }
        });
      }

      // O'zbekcha kun nomlari
      const uzbekDays = {
        Sunday: "Yakshanba",
        Monday: "Dushanba",
        Tuesday: "Seshanba",
        Wednesday: "Chorshanba",
        Thursday: "Payshanba",
        Friday: "Juma",
        Saturday: "Shanba",
      };

      result.push({
        key: currentDate.format("DD-MM-YYYY"),
        date: currentDate.format("DD-MM-YYYY"),
        day: uzbekDays[currentDate.format("dddd")],
        dayNumber: day,
        status,
        time,
        quittedTime,
        isWeekend: false,
      });
    }

    setMonthlyData(result);
  };

  // Statistikalarni hisoblash - JAMI ISH SOATLARI BILAN
  const getStatistics = () => {
    const totalDays = monthlyData.length;
    const presentDays = monthlyData.filter((d) => d.status === "keldi").length;
    const absentDays = totalDays - presentDays;
    const attendanceRate =
      totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Jami ish soatlarini hisoblash
    let totalWorkHours = 0;
    let totalWorkMinutes = 0;

    monthlyData.forEach((day) => {
      if (day.time !== "-" && day.quittedTime !== "-") {
        const arrivalTime = moment(day.time, "HH:mm");
        const leaveTime = moment(day.quittedTime, "HH:mm");

        if (arrivalTime.isValid() && leaveTime.isValid()) {
          const duration = moment.duration(leaveTime.diff(arrivalTime));
          const hours = duration.hours();
          const minutes = duration.minutes();

          totalWorkHours += hours;
          totalWorkMinutes += minutes;
        }
      }
    });

    // Minutlarni soatga aylantirish
    totalWorkHours += Math.floor(totalWorkMinutes / 60);
    totalWorkMinutes = totalWorkMinutes % 60;

    return {
      totalDays,
      presentDays,
      absentDays,
      attendanceRate,
      totalWorkHours,
      totalWorkMinutes,
    };
  };

  const stats = getStatistics();

  return (
    <div className="page">
      {/* Qo'lda davomat modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {attendanceType === "arrive" ? (
              <MdLogin style={{ color: "#52c41a", fontSize: "20px" }} />
            ) : (
              <MdLogout style={{ color: "#ff4d4f", fontSize: "20px" }} />
            )}
            <span>
              {attendanceType === "arrive" ? "Darsga kelish" : "Darsdan ketish"}
            </span>
          </div>
        }
        open={attendanceModal}
        onCancel={() => {
          setAttendanceModal(false);
          setCurrentStudent(null);
          setArrivalTime(null);
          setLeaveTime(null);
          setAttendanceType("");
        }}
        footer={[
          <Button key="cancel" onClick={() => setAttendanceModal(false)}>
            Bekor qilish
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={isLoading}
            onClick={saveAttendance}
            style={{ background: "#52c41a" }}
          >
            Saqlash
          </Button>,
        ]}
      >
        {currentStudent && (
          <div>
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <Avatar
                size={64}
                style={{ background: "#f56a00", marginBottom: "12px" }}
                icon={<FaUser />}
              />
              <Title level={4} style={{ margin: 0 }}>
                {currentStudent.firstName} {currentStudent.lastName}
              </Title>
              <Text type="secondary">
                {currentStudent.groupId?.name} - ID: {currentStudent.employeeNo}{" "}
                - Sana: {selectedDate}
              </Text>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: "16px" }}>
                  <Text strong>Kelish vaqti:</Text>
                  <TimePicker
                    style={{ width: "100%", marginTop: "8px" }}
                    format="HH:mm"
                    value={arrivalTime}
                    onChange={setArrivalTime}
                    placeholder="Kelish vaqtini tanlang"
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: "16px" }}>
                  <Text strong>Ketish vaqti:</Text>
                  <TimePicker
                    style={{ width: "100%", marginTop: "8px" }}
                    format="HH:mm"
                    value={leaveTime}
                    onChange={setLeaveTime}
                    placeholder="Ketish vaqtini tanlang (ixtiyoriy)"
                  />
                </div>
              </Col>
            </Row>

            <div
              style={{
                background: "#f6ffed",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #b7eb8f",
              }}
            >
              <Text type="secondary" style={{ fontSize: "13px" }}>
                <FaClock style={{ marginRight: "6px" }} />
                Dars vaqti: 08:00 - 17:00
              </Text>
            </div>
          </div>
        )}
      </Modal>

      {/* Oylik Hisobot Modal */}
      <Modal
        open={isModalVisible}
        title={null}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={1000}
        bodyStyle={{ padding: 0 }}
        style={{ top: 20 }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: "24px",
            borderRadius: "8px 8px 0 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Avatar
              size={64}
              style={{ background: "rgba(255,255,255,0.2)", fontSize: "24px" }}
              icon={<FaUser />}
            />
            <div>
              <Title level={3} style={{ color: "white", margin: 0 }}>
                {selectedStudent?.firstName} {selectedStudent?.lastName}
              </Title>
              <Text
                style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}
              >
                <FaCalendarAlt style={{ marginRight: "8px" }} />
                {selectedStudent?.groupId?.name} guruhi - ID:{" "}
                {selectedStudent?.employeeNo}
              </Text>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col span={8}>
              <Card size="small">
                <DatePicker
                  picker="month"
                  format="MMMM YYYY"
                  style={{ width: "100%" }}
                  placeholder="Oyni tanlang"
                  onChange={(date) => {
                    const formattedMonth = moment(date).format("MM-YYYY");
                    setSelectedMonth(formattedMonth);
                    getMonthlyStatus(selectedStudent._id, formattedMonth);
                  }}
                  defaultValue={moment()}
                />
              </Card>
            </Col>
            <Col span={16}>
              <Row gutter={16}>
                <Col span={5}>
                  <Card size="small">
                    <Statistic
                      title="Jami kunlar"
                      value={stats.totalDays}
                      prefix={<FaCalendarAlt style={{ color: "#1890ff" }} />}
                    />
                  </Card>
                </Col>
                <Col span={5}>
                  <Card size="small">
                    <Statistic
                      title="Kelgan"
                      value={stats.presentDays}
                      prefix={<FaCheckCircle style={{ color: "#52c41a" }} />}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Card>
                </Col>
                <Col span={5}>
                  <Card size="small">
                    <Statistic
                      title="Kelmagan"
                      value={stats.absentDays}
                      prefix={<FaTimesCircle style={{ color: "#f5222d" }} />}
                      valueStyle={{ color: "#f5222d" }}
                    />
                  </Card>
                </Col>
                <Col span={5}>
                  <Card size="small">
                    <Statistic
                      title="Jish soati"
                      value={`${stats.totalWorkHours}:${stats.totalWorkMinutes
                        .toString()
                        .padStart(2, "0")}`}
                      prefix={<FaClock style={{ color: "#fa8c16" }} />}
                      valueStyle={{ color: "#fa8c16", fontSize: "18px" }}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>

          <Divider />

          <Title level={4} style={{ marginBottom: "16px" }}>
            <IoStatsChart style={{ marginRight: "8px", color: "#1890ff" }} />
            Oylik Davomat Kalendari
          </Title>

          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              border: "1px solid #f0f0f0",
              borderRadius: "8px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  background: "#fafafa",
                  zIndex: 1,
                }}
              >
                <tr>
                  <th
                    style={{
                      padding: "12px 8px",
                      borderBottom: "2px solid #e8e8e8",
                      fontWeight: 600,
                      textAlign: "left",
                    }}
                  >
                    Sana
                  </th>
                  <th
                    style={{
                      padding: "12px 8px",
                      borderBottom: "2px solid #e8e8e8",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    Kun
                  </th>
                  <th
                    style={{
                      padding: "12px 8px",
                      borderBottom: "2px solid #e8e8e8",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    <IoTimeOutline style={{ marginRight: "4px" }} />
                    Kelish
                  </th>
                  <th
                    style={{
                      padding: "12px 8px",
                      borderBottom: "2px solid #e8e8e8",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    <IoExitOutline style={{ marginRight: "4px" }} />
                    Ketish
                  </th>
                  <th
                    style={{
                      padding: "12px 8px",
                      borderBottom: "2px solid #e8e8e8",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    Holat
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((item, index) => (
                  <tr
                    key={item.key}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#fafafa" : "white",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#e6f7ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        index % 2 === 0 ? "#fafafa" : "white";
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 8px",
                        borderBottom: "1px solid #f0f0f0",
                        fontWeight: "500",
                      }}
                    >
                      {item.date}
                    </td>
                    <td
                      style={{
                        padding: "12px 8px",
                        borderBottom: "1px solid #f0f0f0",
                        textAlign: "center",
                      }}
                    >
                      <Tag color="blue" size="small">
                        {item.day}
                      </Tag>
                    </td>
                    <td
                      style={{
                        padding: "12px 8px",
                        borderBottom: "1px solid #f0f0f0",
                        textAlign: "center",
                        fontFamily: "monospace",
                      }}
                    >
                      {item.time !== "-" ? (
                        <Tag color="green" style={{ fontFamily: "monospace" }}>
                          <FaClock style={{ marginRight: "4px" }} />
                          {item.time}
                        </Tag>
                      ) : (
                        <span style={{ color: "#ccc" }}>-</span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "12px 8px",
                        borderBottom: "1px solid #f0f0f0",
                        textAlign: "center",
                        fontFamily: "monospace",
                      }}
                    >
                      {item.quittedTime !== "-" ? (
                        <Tag color="orange" style={{ fontFamily: "monospace" }}>
                          <FaClock style={{ marginRight: "4px" }} />
                          {item.quittedTime}
                        </Tag>
                      ) : (
                        <span style={{ color: "#ccc" }}>-</span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "12px 8px",
                        borderBottom: "1px solid #f0f0f0",
                        textAlign: "center",
                      }}
                    >
                      {item.status === "keldi" ? (
                        <Tag color="success" size="small">
                          <FaCheckCircle style={{ marginRight: "4px" }} />
                          Kelgan
                        </Tag>
                      ) : (
                        <Tag color="error" size="small">
                          <FaTimesCircle style={{ marginRight: "4px" }} />
                          Kelmagan
                        </Tag>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              background: "#f8f9fa",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <Space size="large">
              <div>
                <Text strong style={{ color: "#52c41a", fontSize: "18px" }}>
                  {stats.attendanceRate}%
                </Text>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  Umumiy davomat
                </div>
              </div>
              <Divider type="vertical" style={{ height: "40px" }} />
              <div>
                <Text strong style={{ color: "#1890ff", fontSize: "16px" }}>
                  {stats.presentDays}/{stats.totalDays}
                </Text>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  Kelgan kunlar
                </div>
              </div>
              <Divider type="vertical" style={{ height: "40px" }} />
              <div>
                <Text strong style={{ color: "#f5222d", fontSize: "16px" }}>
                  {stats.absentDays}
                </Text>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  Kelmagan kunlar
                </div>
              </div>
              <Divider type="vertical" style={{ height: "40px" }} />
              <div>
                <Text strong style={{ color: "#fa8c16", fontSize: "16px" }}>
                  {stats.totalWorkHours}:
                  {stats.totalWorkMinutes.toString().padStart(2, "0")} soat
                </Text>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  Jami ish vaqti
                </div>
              </div>
            </Space>
          </div>
        </div>
      </Modal>

      <div className="page-header">
        <h1>Hodimlar davomati</h1>
        <div className="log-header" style={{ display: "flex", gap: "8px" }}>
          <DatePicker
            format="YYYY-MM-DD"
            onChange={onChange}
            placeholder="Sana"
          />
        </div>
      </div>

      <Table>
        <thead>
          <tr>
            <td>№</td>
            <td>Ismi</td>
            <td>ID</td>
            <td>Kelish vaqti</td>
            <td>Ketish vaqti</td>
            <td>Holati</td>
            <td>Amallar</td>
            <td>Hisobot</td>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student, index) => {
            const status = getStatus(student._id);
            const arrivedTime = getArrivedTime(student._id);
            const quittedTime = getQuittedTime(student._id);

            return (
              <tr key={student._id}>
                <td>{index + 1}</td>
                <td>
                  {student.firstName} {student.lastName}
                </td>
                <td>{student.employeeNo}</td>
                <td>{arrivedTime}</td>
                <td>{quittedTime}</td>
                <td>
                  <Tag
                    color={
                      status === "Keldi"
                        ? "success"
                        : status === "Ketdi"
                        ? "processing"
                        : "error"
                    }
                    icon={
                      status === "Keldi" ? (
                        <FaCheckCircle />
                      ) : status === "Ketdi" ? (
                        <FaClock />
                      ) : (
                        <FaTimesCircle />
                      )
                    }
                  >
                    {status}
                  </Tag>
                </td>
                <td>
                  <Space size="small">
                    <Button
                      type="primary"
                      size="small"
                      icon={<MdLogin />}
                      onClick={() => handleMarkAttendance(student, "arrive")}
                      style={{
                        background: "#52c41a",
                        borderColor: "#52c41a",
                        color: "black",
                        fontSize: "12px",
                      }}
                      disabled={arrivedTime !== "-"}
                    >
                      Keldi
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      icon={<MdLogout />}
                      onClick={() => handleMarkAttendance(student, "leave")}
                      style={{
                        background: "#ff7a00",
                        borderColor: "#ff7a00",
                        color: "black",
                        fontSize: "12px",
                      }}
                      disabled={arrivedTime === "-" || quittedTime !== "-"}
                    >
                      Ketdi
                    </Button>
                    <Popconfirm
                      title="O'quvchini kelmagan deb belgilaysizmi?"
                      onConfirm={() => markAsAbsent(student)}
                      okText="Ha"
                      cancelText="Yo'q"
                    >
                      <Button
                        danger
                        size="small"
                        icon={<FaTimesCircle />}
                        style={{ fontSize: "12px" }}
                        disabled={arrivedTime !== "-"}
                      >
                        Kelmadi
                      </Button>
                    </Popconfirm>
                  </Space>
                </td>
                <td>
                  <Button
                    type="primary"
                    icon={<FaChartLine />}
                    size="small"
                    onClick={() => {
                      setSelectedStudent(student);
                      const currentMonth = moment().format("MM-YYYY");
                      setSelectedMonth(currentMonth);
                      getMonthlyStatus(student._id, currentMonth);
                      setIsModalVisible(true);
                    }}
                    style={{
                      width: "120px",
                      height: "37px",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                    }}
                  >
                    Hisobot
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default Davomat;
