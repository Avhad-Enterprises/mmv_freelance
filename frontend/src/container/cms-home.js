import React, { useState, useEffect } from "react";
import Layout from "./layout";
import { makeGetRequest, makePostRequest, makePutRequest } from "../utils/api";
import FormHeader from "../components/FormHeader";
import FileUploadComponent from "../components/FileUploadComponent";
import { getLoggedInUser } from "../utils/auth";
import { showErrorToast } from "../utils/toastUtils";

const CMSHome = () => {
    const [formData, setFormData] = useState({
        image: [],
        carousel: [],
        title: "",
        description: "",
        categories: [],
    });
    const [, setLoading] = useState(false);
    const [cmsId, setCmsId] = useState(null);

    // ✅ Fetch CMS Data on Mount
    useEffect(() => {
        const fetchCMS = async () => {
            try {
                const { data } = await makeGetRequest("/cms/getallcms");
                if (data && data.length > 0) {
                    const cms = data[0];
                    setFormData({
                        image: cms.image || "",
                        carousel: cms.carousel_images ? cms.carousel_images.split(",") : [],
                        title: cms.title || "",
                        description: cms.description || "",
                        // hero_subtitle: cms.hero_subtitle || "",
                        categories: cms.category
                            ? JSON.parse(cms.category).map(item => JSON.parse(item))
                            : [],
                    });
                    setCmsId(cms.id);
                }
            } catch (err) {
                console.error("Error fetching CMS:", err);
            }
        };
        fetchCMS();
    }, []);

    // ✅ Handle text fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const user = getLoggedInUser();
        if (!user?.user_id) {
            showErrorToast("User not authenticated.");
            return;
        }

        setLoading(true);

        try {
            // 🔑 Build the payload expected by your backend
            // const userId = localStorage.getItem("user_id") || 1; // replace with JWT decode if you store user info
            const payload = {
                image: (formData.image || []).filter(Boolean).join(","),
                carousel: (formData.carousel || []).filter(Boolean).join(","),
                title: formData.title,
                description: formData.description,
                category: JSON.stringify(formData.categories || []),
                created_by: parseInt(user.user_id, 10),
            };  

            let response;
            if (cmsId) {
                response = await makePutRequest("cms/updatecms", {
                    id: cmsId,
                    ...payload,
                    updated_by: parseInt(user.user_id, 10),
                });
            } else {
                response = await makePostRequest("cms/insertcms", payload);
            }

            alert("CMS saved successfully!");
            console.log(response.data);
        } catch (err) {
            console.error("Error saving CMS:", err.response?.data || err.message);
            alert("Failed to save CMS");
        } finally {
            setLoading(false);
        }
    };
    return (
        <Layout>
            <div className="container mx-auto p-4">
                <form onSubmit={handleSubmit} className="row g-4">
                    <FormHeader
                        title="Home Page"
                        backUrl
                        showSave={!cmsId}
                    />
                    {/* Left Hero Image */}
                    <div className="col-12 col-md-4">
                        <div className="form_section">
                            <h6>Left Image</h6>
                            <FileUploadComponent
                                // label="Left Image (261x430 px)"
                                name="image"
                                allowedClasses="image"
                                required={true}
                                initialFile={
                                    formData.image[0] ? { fileUrl: formData.image[0] } : null
                                }
                                onChange={(files) => {
                                    if (files.length > 0 && files[0].fileUrl) {
                                        const updated = [...formData.image];
                                        updated[0] = files[0].fileUrl;
                                        setFormData({ ...formData, image: updated });
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Center Text */}
                    <div className="col-12 col-md-4 text-center">
                        <div className="form_section">
                            <div className="mb-4">
                                <label className="form-label">Main Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>

                            <div>
                                <label className="form-label">Subtitle / Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Hero Image */}
                    <div className="col-12 col-md-4">
                        <div className="form_section">
                            <h6>Right Image</h6>
                            <FileUploadComponent
                                name="image"
                                allowedClasses="image"
                                required={true}
                                initialFile={
                                    formData.image[1] ? { fileUrl: formData.image[1] } : null
                                }
                                onChange={(files) => {
                                    if (files.length > 0 && files[0].fileUrl) {
                                        const updated = [...formData.image];
                                        updated[1] = files[0].fileUrl;
                                        setFormData({ ...formData, image: updated });
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Carousel Images */}
                    <div className="col-12">
                        <div className="form_section">
                            <h6>Carousel</h6>

                            <FileUploadComponent
                                key={formData.carousel.length}
                                name="carousel"
                                allowedClasses="image"
                                multiple={true}
                                initialFile={null}
                                onChange={(files) => {
                                    const newImages = files
                                        .filter(f => f.fileUrl)
                                        .map(f => f.fileUrl);

                                    setFormData({
                                        ...formData,
                                        carousel: [...formData.carousel, ...newImages],
                                    });
                                }}
                            />

                            {/* Thumbnails */}
                            <div className="d-flex flex-wrap gap-2 mb-2">
                                {formData.carousel.map((img, index) => (
                                    <div key={index} className="position-relative">
                                        <img
                                            src={img}
                                            alt={`carousel-${index}`}
                                            style={{
                                                width: "120px",
                                                height: "80px",
                                                objectFit: "cover",
                                                borderRadius: "4px",
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                            onClick={() => {
                                                const updated = formData.carousel.filter((_, i) => i !== index);
                                                setFormData({ ...formData, carousel: updated });
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>

                    {/* Category Section */}
                    <div className="col-12">
                        <div className="form_section">
                            <h6>Categories</h6>

                            {formData.categories?.map((cat, index) => (
                                <div
                                    key={index}
                                    className="d-flex align-items-center gap-3 mb-3 border p-2 rounded"
                                >
                                    {/* Icon Upload */}
                                    <FileUploadComponent
                                        name={`category_icon_${index}`}
                                        allowedClasses="image"
                                        required={false}
                                        initialFile={cat.icon ? { fileUrl: cat.icon } : null}
                                        onChange={(files) => {
                                            if (files.length > 0 && files[0].fileUrl) {
                                                const updatedCategories = [...formData.categories];
                                                updatedCategories[index].icon = files[0].fileUrl;
                                                setFormData({ ...formData, categories: updatedCategories });
                                            }
                                        }}
                                    />

                                    {/* Text Field */}
                                    <input
                                        type="text"
                                        placeholder="Category Name"
                                        className="form-control"
                                        value={cat.name}
                                        onChange={(e) => {
                                            const updatedCategories = [...formData.categories];
                                            updatedCategories[index].name = e.target.value;
                                            setFormData({ ...formData, categories: updatedCategories });
                                        }}
                                    />

                                    {/* Delete Button */}
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger"
                                        onClick={() => {
                                            const updatedCategories = formData.categories.filter(
                                                (_, i) => i !== index
                                            );
                                            setFormData({ ...formData, categories: updatedCategories });
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}

                            {/* Add New Category Button */}
                            <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() =>
                                    setFormData({
                                        ...formData,
                                        categories: [...(formData.categories || []), { icon: "", name: "" }],
                                    })
                                }
                            >
                                + Add Category
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default CMSHome;
