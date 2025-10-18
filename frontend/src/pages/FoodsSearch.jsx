import { useCallback, useState } from "react";
import SearchBar from "../components/SearchBar";
import FoodList from "../components/FoodList";
import { searchFoods } from "../services/foods";

export default function FoodsSearch() {
  const [items, setItems] = useState([]);
  const [loading, setLoad] = useState(false);
  const [error, setErr] = useState("");

  const doSearch = useCallback(async (q) => {
    if (!q) { setItems([]); setErr(""); return; }
    try {
      setLoad(true); setErr("");
      const { foods } = await searchFoods(q, 1, 25);
      setItems(foods || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoad(false);
    }
  }, []);

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 16 }}>
      <h1 style={{ color: "#67E67C" }}>Buscar alimentos</h1>
      <SearchBar onSearch={doSearch} />
      <FoodList items={items} loading={loading} error={error} />
    </main>
  );
}
