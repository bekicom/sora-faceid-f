import React, { memo, useState, useRef } from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import "./layout.css";
import { FaUser, FaCalendarCheck } from "react-icons/fa";
import {
  MdClass,
  MdOutlineAttachMoney,
  MdOutlineSpaceDashboard,
  MdPayments,
  MdQrCodeScanner,
  
} from "react-icons/md";
import { FaRegCircleUser } from "react-icons/fa6";
import { CloseModal } from "../utils/closemodal";
import { apiSlice } from "../context/service/api.service";
import { useDispatch } from "react-redux";
import moment from "moment";

import { RiMoneyDollarBoxFill } from "react-icons/ri";
import { PiStudentDuotone } from "react-icons/pi";
import { TbReportAnalytics } from "react-icons/tb";
import { GiCardExchange } from "react-icons/gi";
import { MdOutlineIncompleteCircle } from "react-icons/md";

export const Layout = memo(() => {
  const admin = JSON.parse(localStorage.getItem("admin") || "null");
  const navigate = useNavigate()
  const location = useNavigate()
  const dispatch = useDispatch();
  const [menu, setMenu] = useState(false);
  const toggleMenu = () => setMenu(!menu);
  const menuRef = useRef(null);
  moment.utc(5);

  const logout = () => {
    localStorage.clear();
    dispatch(apiSlice.util.resetApiState());
    window.location.href = "/";
  };

  CloseModal({ modalRef: menuRef, onClose: () => setMenu(false) });

  return (
    <main className="main">
      <aside className="aside">
        <div className="aside__logo">
          <Link to="/">
            <span>SORA-DAVOMAT</span>
          </Link>
        </div>

        <ol className="aside__menu">
          <li>
            <NavLink to="/student">
              <FaUser />
              <span>Hodimlar</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/davomat">
              <FaCalendarCheck />
              <span>Davomat</span>
            </NavLink>
          </li>
        </ol>
      </aside>
      <div className="navigation">
        <div
          onClick={() => navigate("/")}
          className={`navigation_item ${
            location.pathname === "/davomat" ? "link_active" : null
          }`}
        >
          <MdOutlineSpaceDashboard />
        </div>
        <div
          onClick={() => navigate("/class")}
          className={`navigation_item ${
            location.pathname === "/class" ? "link_active" : null
          }`}
        >
          <MdClass />
        </div>
        <div
          onClick={() => navigate("/teacher")}
          className={`navigation_item ${
            location.pathname === "/teacher" ? "link_active" : null
          }`}
        ></div>
        <div
          onClick={() => navigate("/student")}
          className={`navigation_item ${
            location.pathname === "/student" ? "link_active" : null
          }`}
        >
          <PiStudentDuotone />
        </div>
        <div
          onClick={() => navigate("/davomat")}
          className={`navigation_item ${
            location.pathname === "/davomat" ? "link_active" : null
          }`}
        >
          <FaCalendarCheck />
        </div>
        <div
          onClick={() => navigate("/scan")}
          className={`navigation_item ${
            location.pathname === "/scan" ? "link_active" : null
          }`}
        >
          <MdQrCodeScanner />
        </div>
        <div
          onClick={() => navigate("/oylik")}
          className={`navigation_item ${
            location.pathname === "/oylik" ? "link_active" : null
          }`}
        >
          <RiMoneyDollarBoxFill />
        </div>
        <div
          onClick={() => navigate("/hisobot")}
          className={`navigation_item ${
            location.pathname === "/hisobot" ? "link_active" : null
          }`}
        >
          <TbReportAnalytics />
        </div>
        <div
          onClick={() => navigate("/payment")}
          className={`navigation_item ${
            location.pathname === "/payment" ? "link_active" : null
          }`}
        >
          <MdOutlineAttachMoney />
        </div>
        <div
          onClick={() => navigate("/debtor")}
          className={`navigation_item ${
            location.pathname === "/debtor" ? "link_active" : null
          }`}
        >
          <MdOutlineIncompleteCircle />
        </div>
        <div
          onClick={() => navigate("/harajat")}
          className={`navigation_item ${
            location.pathname === "/harajat" ? "link_active" : null
          }`}
        >
          <MdPayments />
        </div>
        <div
          onClick={() => navigate("/change")}
          className={`navigation_item ${
            location.pathname === "/change" ? "link_active" : null
          }`}
        >
          <GiCardExchange />
        </div>
      </div>
      <header className="header">
        <h1></h1>

        <div className="header__user" ref={menuRef}>
          <span>{admin?.fullname}</span>
          <button onClick={toggleMenu}>
            <FaRegCircleUser />
          </button>

          <div className={`header__user-info ${menu ? "active" : ""}`}>
            <ol>
              <li onClick={toggleMenu}>
                <Link to="/profile">profil</Link>
              </li>
              <li>
                <p>
                  <span>Роль: </span>
                  <span>{admin?.role}</span>
                </p>
              </li>
              <li>
                <button onClick={logout}>Выйти</button>
              </li>
            </ol>
          </div>
        </div>
      </header>
      <section className="section">
        <Outlet />
      </section>
    </main>
  );
});
