import React from "react";
import { PuffLoader } from "react-spinners";

const Loader = ({ size = 60, color = "#000", fullPage = false }) => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: fullPage ? "100px 0" : "20px 0",
                minHeight: fullPage ? "calc(100vh - 100px)" : "unset",
                width: "100%",
            }}
        >
            <PuffLoader size={size} color={color} />
        </div>
    );
};

export default Loader;
