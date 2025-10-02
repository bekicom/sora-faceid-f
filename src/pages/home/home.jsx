import React, { useEffect, useState } from "react";
import "./home.css";
import dollar from "../../assets/svg/dollar.svg";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useGetSchoolQuery } from "../../context/service/admin.service";
import {
  useGetPaymentLogQuery,
  useGetPaymentSummaryMonthQuery,
  useGetPaymentSummaryQuery,
} from "../../context/service/payment.service";
import {
  useGetHarajatSummaryQuery,
  useGetHarajatQuery,
} from "../../context/service/harajat.service";
import moment from "moment/moment";
import { DatePicker } from "antd";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const Home = () => {
  const { data: schoolData = {} } = useGetSchoolQuery();
  const { data: payments = [] } = useGetPaymentLogQuery()

  const { data: summaryData = [] } = useGetPaymentSummaryQuery();
  const { data: harajatSummaryData = [] } = useGetHarajatSummaryQuery();
  const { data: datasumma = [] } = useGetHarajatQuery();

  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const selectedMonth = moment(selectedDate).format("MM-YYYY");
  const { data: summaryMonthData = [] } = useGetPaymentSummaryMonthQuery({
    month: selectedMonth,
  });

  const [summ, setSum] = useState([]);
  const [harajatSumm, setHarajatSum] = useState([]);
  const [monthSumm, setMonthSumm] = useState([]);
  const [dailyExpense, setDailyExpense] = useState(0);
  const [dailyExpenseCard, setDailyExpenseCard] = useState(0);


  const [dailyPayment, setDailyPayment] = useState(0);
  const [dailyPaymentCard, setDailyPaymentCard] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);

  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [currentBudget, setCurrentBudget] = useState(0);

  useEffect(() => {
    const currentDate = moment(selectedDate, "YYYY-MM-DD").format("YYYY-MM-DD");
    const dailyHarajat = datasumma
      .filter(
        (item) => moment(item.createdAt).format("YYYY-MM-DD") === currentDate && item.paymentType === "naqd"
      )
      .reduce((total, item) => total + item.summ, 0);
    const dailyHarajatCard = datasumma
      .filter(
        (item) => moment(item.createdAt).format("YYYY-MM-DD") === currentDate && item.paymentType === "plastik"
      )
      .reduce((total, item) => total + item.summ, 0);

    setDailyExpense(dailyHarajat);
    setDailyExpenseCard(dailyHarajatCard);
    setDailyPayment(payments.filter(p => moment(p.createdAt).format("YYYY-MM-DD") === currentDate && p.payment_type === "cash").reduce((acc, item) => acc + item.payment_quantity, 0))
    setDailyPaymentCard(payments.filter(p => moment(p.createdAt).format("YYYY-MM-DD") === currentDate && p.payment_type === "card").reduce((acc, item) => acc + item.payment_quantity, 0))

    const currentMonthIndex = moment(selectedMonth, "MM-YYYY").month();
    const currentDateIndex = moment(selectedDate, "YYYY-MM-DD").date() - 1;
    setMonthlyExpense(harajatSumm[currentMonthIndex] || 0);
    setMonthlyPayment(summ[currentMonthIndex] || 0);
    // setDailyPayment(monthSumm[currentDateIndex]?.payment || 0);


    const initialBudget =
      schoolData.budgetHistory?.find((item) =>
        moment(item.month, "MM-YYYY").isSame(selectedMonth, "month")
      )?.budget || 0;
    setCurrentBudget(
      initialBudget +
      (summ[currentMonthIndex] || 0) -
      (harajatSumm[currentMonthIndex] || 0)
    );
  }, [
    selectedMonth,
    selectedDate,
    summ,
    harajatSumm,
    payments,
    monthSumm,
    datasumma,
    schoolData.budgetHistory,
  ]);


  useEffect(() => {
    setSum(summaryData.map((item) => item.summ));
    setHarajatSum(harajatSummaryData.map((item) => item.summ));
    setMonthSumm(
      summaryMonthData.map((item) => ({
        date: moment(item.date).format("YYYY-MM-DD"),
        payment: item.summ,
        expense: item.expense,
      }))
    );
  }, [summaryData, harajatSummaryData, summaryMonthData]);

  const handleDateChange = (date, dateString) => {
    if (dateString) {
      setSelectedDate(dateString);
    } else {
      setSelectedDate(moment().format("YYYY-MM-DD"));
    }

    // Kunlik harajatlarni yangilash
    const currentDate = moment(dateString, "YYYY-MM-DD").format("YYYY-MM-DD");
    const dailyHarajat = datasumma
      .filter(
        (item) => moment(item.createdAt).format("YYYY-MM-DD") === currentDate && item.paymentType === "naqd"
      )
      .reduce((total, item) => total + item.summ, 0);
    const dailyHarajatCard = datasumma
      .filter(
        (item) => moment(item.createdAt).format("YYYY-MM-DD") === currentDate && item.paymentType === "plastik"
      )
      .reduce((total, item) => total + item.summ, 0);

    setDailyExpense(dailyHarajat);
    setDailyExpenseCard(dailyHarajatCard);
  };


  const data = {
    labels: [
      "Yanvar",
      "Fevral",
      "Mart",
      "Aprel",
      "May",
      "Iyun",
      "Iyul",
      "Avgust",
      "Sentabr",
      "Oktabr",
      "Noyabr",
      "Dekabr",
    ],
    datasets: [
      {
        label: "To'lovlar",
        data: summ,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const data2 = {
    labels: [
      "Yanvar",
      "Fevral",
      "Mart",
      "Aprel",
      "May",
      "Iyun",
      "Iyul",
      "Avgust",
      "Sentabr",
      "Oktabr",
      "Noyabr",
      "Dekabr",
    ],
    datasets: [
      {
        label: "Xarajatlar",
        data: harajatSumm,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  function getDaysInCurrentMonth() {
    const today = new Date();
    const year = today.getFullYear();
    const monthIndex = selectedMonth?.slice(0, 2);

    const monthNames = {
      "01": "Yanvar",
      "02": "Fevral",
      "03": "Mart",
      "04": "Aprel",
      "05": "May",
      "06": "Iyun",
      "07": "Iyul",
      "08": "Avgust",
      "09": "Sentabr",
      10: "Oktabr",
      11: "Noyabr",
      12: "Dekabr",
    };
    const monthName = monthNames[monthIndex];

    const daysInMonth = new Date(year, monthIndex, 0).getDate();
    const daysArray = [];
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(`${day}-${monthName}`);
    }
    return daysArray;
  }

  const data3 = {
    labels: getDaysInCurrentMonth(),
    datasets: [
      {
        label: "To'lovlar(1 oylik)",
        data: monthSumm.map((item) => item.payment),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Xarajatlar(1 oylik)",
        data: monthSumm.map((item) => item.expense),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="main">
      
    </div>
  );
};

export default Home;
