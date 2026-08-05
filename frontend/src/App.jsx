import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Cart from "./pages/Cart.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import PropertyDetail from "./pages/PropertyDetail.jsx";
import Portfolio from "./pages/Portfolio.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Marketplace />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Routes>
    </Layout>
  );
}
