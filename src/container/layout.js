import React, { useState, useEffect } from "react";
import LeftView from "./leftview";
import Header from "./header";
import { Container } from "react-bootstrap";

const pinColors = [
  "#007aff",
  "#11AF22",
  "#ED231C",
  "#1e293b",
  "#6366f1",
  "#FF870F",
];

const pinSvgTemplate = `
<svg class="section-pin" width="65" height="19" viewBox="0 0 65 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="10" y1="9.5" x2="65" y2="9.5" stroke="{color}" stroke-dasharray="3 3"/>
    <circle cx="9.5" cy="9.5" r="8" fill="white" stroke="{color}" stroke-width="3"/>
</svg>`;

function getRandomColor(excludeColor = null) {
  let availableColors = pinColors.filter((color) => color !== excludeColor);
  return availableColors[Math.floor(Math.random() * availableColors.length)];
}

function attachPinsToFormSections() {
  let lastUsedColor = null;
  const formSections = document.querySelectorAll(".form_section");

  formSections.forEach((section) => {
    const isRightSide = section.closest(".col-md-5") !== null;
    const pinClass = isRightSide ? "pin-right" : "pin-left";
    const color = getRandomColor(lastUsedColor);
    lastUsedColor = color;
    const pinHtml = pinSvgTemplate.replace(/{color}/g, color);
    const pinWrapper = document.createElement("div");
    pinWrapper.className = pinClass;
    pinWrapper.innerHTML = pinHtml;
    section.appendChild(pinWrapper);
  });
}

const Layout = ({ children }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };
  useEffect(() => {
    attachPinsToFormSections();
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">
        <LeftView isVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />
        <div
          className={`col right-container MainDashView ${
            isSidebarVisible ? "with-sidebar" : ""
          }`}
          style={{ transition: "margin-left 0.3s ease", }}
        >
          <Header toggleSidebar={toggleSidebar} />
          <Container style={{ marginTop: "110px" }} className="content">
            {children}
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Layout;
