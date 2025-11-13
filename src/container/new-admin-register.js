import React, { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
    const [isInvitation, setIsInvitation] = useState(false);
    const inputRefs = useRef({})
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    React.useEffect(() => {
        if (token) {
            setIsInvitation(true);
        }
    }, [token]);

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        let payload, endpoint, successMessage;
        if (isInvitation) {
            payload = {
                token: token,
                new_password: formData.password,
            };
            endpoint = "admin/invites/accept";
            successMessage = "Invitation accepted successfully! You can now log in.";
        } else {
            payload = {
                full_name: formData.full_name,
                username: formData.username,
                email: formData.email,
                phone_number: formData.phone_number,
                password: formData.password,
                account_type: formData.account_type,
            };
            endpoint = "users/insert_user";
            successMessage = "Admin registered successfully!";
        }

        try {
            const response = await makePostRequest(endpoint, payload);
            showSuccessToast(response.data.message || successMessage);
            if (isInvitation) {
                // Redirect to login after accepting invitation
                window.location.href = "/login";
            } else {
                setFormData({
                    full_name: "",
                    username: "",
                    email: "",
                    phone_number: "",
                    password: "",
                    account_type: "admin",
                });
            }
        } catch (error) {
            showErrorToast(error.response?.data?.message || "Registration failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div
                className="container d-flex justify-content-center align-items-center"
                style={{ minHeight: "80vh" }}
            >
                <div className="w-100" style={{ maxWidth: "700px" }}>
                    <form onSubmit={handleSubmit} className="p-4 shadow rounded bg-white">
                        <h5 className="mb-4 fw-bold">{isInvitation ? "Accept Invitation" : "Register New Admin"}</h5>

                        {isInvitation ? (
                            <div className="mb-3">
                                <TextInput
                                    label="New Password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        ) : (
                            <>
                                {/* Row 1: Full Name */}
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
                                            ref={(el) => (inputRefs.current.password = el)}
                                            label="Password"
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Row 4: Account Type */}
                                <div className="row">
                                    <div className="col-md-12">
                                        <label className="form-label">Account Type</label>
                                        <select
                                            className="form-control"
                                            name="account_type"
                                            value={formData.account_type}
                                            onChange={(e) => handleChange("account_type", e.target.value)}
                                            required
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="user">User</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="d-flex justify-content-center mt-4">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? "Processing..." : (isInvitation ? "Accept Invitation" : "Register Admin")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default AdminRegister;
