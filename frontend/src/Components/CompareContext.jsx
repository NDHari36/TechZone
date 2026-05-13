import { createContext, useState, useEffect } from "react";

export const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("compareList");
    if (saved) setCompareList(JSON.parse(saved));
  }, []);

  const addToCompare = (product, isFromComparePage = false) => {
    const compareItem = {
      id: product.id,
      name: product.name,
      image:
        product.images?.[0]?.image_url ||
        product.image_url ||
        product.image ||
        "/images/img.jpg",
      price:
        product.variants?.[0]?.price || product.min_price || product.price || 0,
    };

    setCompareList((prev) => {
      let currentList = prev;
      const hasCompared = localStorage.getItem("hasCompared");

      if (hasCompared === "true" && !isFromComparePage) {
        currentList = [];
        localStorage.removeItem("hasCompared");
      }

      if (currentList.find((item) => item.id === compareItem.id)) {
        setShowBar(true);
        return currentList;
      }

      if (currentList.length >= 3) {
        alert("Chỉ được so sánh tối đa 3 sản phẩm!");
        setShowBar(true);
        return currentList;
      }

      const newList = [...currentList, compareItem];
      localStorage.setItem("compareList", JSON.stringify(newList));
      setShowBar(true);
      return newList;
    });
  };

  const removeFromCompare = (id) => {
    setCompareList((prev) => {
      const newList = prev.filter((item) => item.id !== id);
      localStorage.setItem("compareList", JSON.stringify(newList));
      if (newList.length === 0) setShowBar(false);
      return newList;
    });
  };

  const clearCompare = () => {
    setCompareList([]);
    localStorage.removeItem("compareList");
    localStorage.removeItem("hasCompared");
    setShowBar(false);
  };

  const markAsCompared = () => {
    localStorage.setItem("hasCompared", "true");
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        showBar,
        setShowBar,
        markAsCompared,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};
