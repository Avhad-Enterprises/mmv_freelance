import React, { useState, useEffect, useCallback } from "react";
import Layout from "./layout";
import FormHeader from "../components/FormHeader";
import TextInput from "../components/TextInput";
import Aetextarea from "../components/Aetextarea";
import TagInput from "../components/TagInput";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { makePostRequest, makeGetRequest } from "../utils/api";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { useNavigate } from "react-router-dom";
import { getLoggedInUser } from "../utils/auth";

const CreateBlog = () => {
    const navigate = useNavigate();

    const [blogData, setBlogData] = useState({
        author_name: "",
        title: "",
        slug: "",
        featured_image: null,
        short_description: "",
        content: "",
        category: "",
        status: "draft",
        is_featured: false,
        seo_title: "",
        seo_description: "",
        reading_time: "",
        // scheduled_at: "",
        tags: [],
        sub_section: [],
        notes: "",
        is_active: true,
        created_by: null,
    });

    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    // ✅ Fetch tags on mount
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await makeGetRequest("tags");
                const fetchedTags = response.data?.data || [];
                const tagNames = fetchedTags.map((tag) => tag.tag_name);
                setAvailableTags(tagNames);
            } catch (error) {
                console.error("Failed to fetch tags:", error);
                showErrorToast("Failed to load tags.");
            }
        };
        fetchTags();
    }, []);

    useEffect(() => {
        const user = getLoggedInUser();
        if (user?.user_id) {
            setBlogData((prev) => ({
                ...prev,
                created_by: user.user_id,
            }));
        } else {
            showErrorToast("User not authenticated.");
        }
    }, []);

    // ✅ Auto-generate slug + SEO fields like your project form
    useEffect(() => {
        // Generate slug + seo_title from title
        if (blogData.title) {
            const slug = blogData.title
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, "")
                .trim()
                .replace(/\s+/g, "-"); // Replace spaces with -

            setBlogData((prev) => ({
                ...prev,
                slug,
                seo_title: blogData.title, // mirror title
            }));
        }

        // Generate seo_description from short_description
        if (blogData.short_description) {
            setBlogData((prev) => ({
                ...prev,
                seo_description: blogData.short_description,
            }));
        }
    }, [blogData.title, blogData.short_description]);

    // ✅ Handle input changes
    const handleInputChange = useCallback((e, customValue = null) => {
        if (e?.target) {
            const { name, type, value, checked } = e.target;
            const updatedValue = type === "checkbox" ? checked : value;
            setBlogData((prev) => ({ ...prev, [name]: updatedValue }));
        } else if (typeof e === "string" && customValue !== null) {
            setBlogData((prev) => ({ ...prev, [e]: customValue }));
        }
    }, []);

    // ✅ Handle image upload
    const handleFileChange = (e) => {
        setBlogData({ ...blogData, featured_image: e.target.files[0] });
    };

    // ✅ Handle tag selection
    const handleTagsChange = useCallback((tags) => {
        setSelectedTags(tags);
        setBlogData((prev) => ({ ...prev, tags }));
    }, []);

    // ✅ Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        const user = getLoggedInUser();
        if (!user?.user_id) {
            showErrorToast("User not authenticated.");
            return;
        }

        try {
            const payload = {
                ...blogData,
                is_featured: blogData.is_featured === "true" || blogData.is_featured === true,
                notes: blogData.notes ? [blogData.notes] : [],
                tags: Array.isArray(blogData.tags) ? blogData.tags : [],
                featured_image:
                    blogData.featured_image?.name || blogData.featured_image || "",
                created_by: blogData.created_by,
            };

            const response = await makePostRequest("blog", payload);

            if (response.data?.success) {
                showSuccessToast("🎉 Blog created successfully!");
                navigate("/blog");
            } else {
                showErrorToast(response.data?.message || "Failed to create blog.");
            }
        } catch (error) {
            console.error("Error creating blog:", error);
            showErrorToast("Something went wrong while creating the blog.");
        }
    };

    return (
        <Layout>
            <form onSubmit={handleSubmit}>
                <FormHeader
                    title="Add New Blog"
                    showAdd
                    backUrl="/blog"
                    onBack={() => navigate("/blog")}
                />
                <Row>
                    <Col md={7}>
                        <div className="form_section">
                            <TextInput
                                label="Author Name"
                                name="author_name"
                                value={blogData.author_name}
                                onChange={handleInputChange}
                            />

                            <TextInput
                                label="Title"
                                name="title"
                                value={blogData.title}
                                onChange={handleInputChange}
                            />

                            <div className="form-group">
                                <label>Featured Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <Aetextarea
                                label="Short Description"
                                name="short_description"
                                value={blogData.short_description}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form_section">
                            <TextInput
                                label="Slug"
                                name="slug"
                                value={blogData.slug}
                                disabled
                            />

                            <TextInput
                                label="SEO Title"
                                name="seo_title"
                                value={blogData.seo_title}
                                onChange={handleInputChange}
                            />

                            <Aetextarea
                                label="SEO Description"
                                name="seo_description"
                                value={blogData.seo_description}
                                onChange={handleInputChange}
                            />
                        </div>
                    </Col>

                    <Col md={5}>
                        <div className="form_section">
                            <div className="form-group mt-3">
                                <label>Content</label>
                                <TextInput
                                    value={blogData.content}
                                    name="content"
                                    onChange={handleInputChange}
                                    theme="snow"
                                    className="bg-white"
                                />
                            </div>

                            <TextInput
                                label="Category"
                                name="category"
                                value={blogData.category}
                                onChange={handleInputChange}
                            />

                            <div className="form-group mt-3">
                                <label>Status</label>
                                <select
                                    className="form-control"
                                    name="status"
                                    value={blogData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>

                            <TextInput
                                label="Reading Time (mins)"
                                name="reading_time"
                                type="number"
                                value={blogData.reading_time}
                                onChange={handleInputChange}
                            />

                            <div className="form-group mt-3">
                                <label>Featured</label>
                                <select
                                    className="form-control"
                                    name="is_featured"
                                    value={blogData.is_featured}
                                    onChange={handleInputChange}
                                >
                                    <option value="true">True</option>
                                    <option value="false">False</option>
                                </select>
                            </div>

                            {/* <TextInput
                                label="Scheduled At"
                                name="scheduled_at"
                                type="datetime-local"
                                value={blogData.scheduled_at}
                                onChange={handleInputChange}
                            /> */}

                            <TagInput
                                availableTags={availableTags}
                                initialTags={selectedTags}
                                onTagsChange={handleTagsChange}
                                info="Select or add tags"
                            />

                            <Aetextarea
                                label="Notes"
                                name="notes"
                                value={blogData.notes}
                                onChange={handleInputChange}
                            />
                        </div>
                    </Col>
                </Row>

                {/* <div className="text-end mt-4">
                    <button type="submit" className="btn btn-primary">
                        Create Blog
                    </button>
                </div> */}
            </form>
        </Layout>
    );
};

export default CreateBlog;
