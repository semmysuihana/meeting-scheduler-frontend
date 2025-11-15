import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import DetailBook from "./pages/DetailBook";
import NotFound from "./pages/NotFound";
import Layout from "./component/Layout";
import Dashboard from "./pages/Dashboard";
import Booking from "./pages/Booking";
import Settings from "./pages/Settings";
import EditSetting from "./pages/EditSetting";
function App() {

 return (
  <Router>
    <Routes>

      <Route path="/" element={<Home />} />
      <Route path="/book/:id" element={<DetailBook />} />

      {/* Halaman dengan layout */}
      <Route element={<Layout />}>
        <Route path="organizer/:id/settings/edit/:edit" element={<EditSetting  />} />
        <Route path="organizer/:id/settings/edit/:edit" element={<EditSetting />} />
        <Route path="organizer/:id/settings/edit/:edit" element={<EditSetting  />} />
        <Route path="organizer/:id/dashboard" element={<Dashboard />} />
        <Route path="organizer/:id/booking" element={<Booking />} />
        <Route path="organizer/:id/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />

    </Routes>
  </Router>
);

}

export default App;
