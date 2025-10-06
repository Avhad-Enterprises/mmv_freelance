import React, { useRef, useState } from "react";
import Layout from "./layout";
import TextInput from "../components/TextInput";
import { makePostRequest } from "../utils/api";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";

const AdminRegister = () => {
    const [formData, setFormData] = useState({
        full_name: "",
        username: "",
        email: "",
        phone_number: "",
        password: "",
        account_type: "admin",
    });

    const [loading, setLoading] = useState(false);
    const inputRefs = useRef({})

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            full_name: formData.full_name,
            username: formData.username,
            email: formData.email,
            phone_number: formData.phone_number,
            password: formData.password,
            account_type: formData.account_type,
        }

        try {
            const response = await makePostRequest("users/insert_user", payload);
            showSuccessToast(response.data.message || "Admin registered successfully!");
            setFormData({
                full_name: "",
                username: "",
                email: "",
                phone_number: "",
                password: "",
                account_type: "admin",
            });
        } catch (error) {
            showErrorToast(error.response?.data?.message || "Registration failed!");
        }

        setLoading(false);
    };

    return (
        <Layout>
            <div
                className="container d-flex justify-content-center align-items-center"
                style={{ minHeight: "80vh" }}
            >
                <div className="w-100" style={{ maxWidth: "700px" }}>
                    <form onSubmit={handleSubmit} className="p-4 shadow rounded bg-white">
                        <h5 className="mb-4 fw-bold">Register New Admin</h5>

                        <div className="row">
                            <div className="col-md-12">
                                <TextInput
                                    ref={(el) => (inputRefs.current.full_name = el)}
                                    label="Full Name"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Row 2: Username & Email */}
                        <div className="row">
                            <div className="col-md-6">
                                <TextInput
                                    ref={(el) => (inputRefs.current.username = el)}
                                    label="Username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <TextInput
                                    ref={(el) => (inputRefs.current.email = el)}
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Row 3: Phone Number & Password */}
                        <div className="row">
                            <div className="col-md-6">
                                <TextInput
                                    ref={(el) => (inputRefs.current.phone_number = el)}
                                    label="Phone Number"
                                    name="phone_number"
                                    type="number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    minLength={10}
                                    maxLength={10}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <TextInput
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary mt-3"
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Register Admin"}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default AdminRegister;
