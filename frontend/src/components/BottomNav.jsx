import { NavLink, useLocation } from "react-router-dom";
import { useMemo } from "react";
import "./BottomNav.css";

const HomeIcon = (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" {...props}>
    <path d="M3 10.5 12 3l9 7.5v8a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 18.5v-8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LogIcon = (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" {...props}>
    <path d="M4 5h16M4 12h10M4 19h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ReportsIcon = (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" {...props}>
    <path d="M4 20h16M7 20V10M12 20V4M17 20v-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function BottomNav() {
  const { pathname } = useLocation();

  const activeKey = useMemo(() => {
    if (pathname.startsWith("/reports")) return "reports";
    if (pathname.startsWith("/log")) return "log";
    if (pathname.startsWith("/home")) return "home";
    // como la app redirige "/" -> "/reports", dejamos reports por defecto
    return "reports";
  }, [pathname]);

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav__rail" data-active={activeKey}>
        <span className="bottom-nav__indicator" aria-hidden />
        <NavLink to="/home" className="bottom-nav__item" data-key="home">
          <HomeIcon className="bottom-nav__icon" />
          <span className="bottom-nav__label">Home</span>
        </NavLink>
        <NavLink to="/log" className="bottom-nav__item" data-key="log">
          <LogIcon className="bottom-nav__icon" />
          <span className="bottom-nav__label">Log</span>
        </NavLink>
        <NavLink to="/reports" className="bottom-nav__item" data-key="reports">
          <ReportsIcon className="bottom-nav__icon" />
          <span className="bottom-nav__label">Reports</span>
        </NavLink>
      </div>
    </nav>
  );
}
