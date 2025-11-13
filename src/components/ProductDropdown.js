import React, { useState, useRef, useEffect } from "react";

const ProductDropdown = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="custom-dropdown w-100" ref={dropdownRef}>
      <button
        className="dropdown-button w-100 d-flex justify-content-between"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {items.length} Item(s)
        <i class="bi bi-chevron-down"></i>
      </button>

      {isOpen && (
        <div className="dropdown-content">
          {items.map((item, index) => (
            <div key={index} className="dropdown-item d-flex">
              <img
                src={item.image_url}
                alt={item.product_name}
                className="product-image"
              />
              <div className="product-details">
                <strong>{item.product_name}</strong>
                <br />
                <small>SKU: {item.sku}</small>
                <br />
                <small>Qty: {item.quantity}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductDropdown;
