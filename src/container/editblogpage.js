import React, { useState, useEffect, useCallback } from "react";
import Layout from "./layout";
import { jwtDecode } from "jwt-decode";
import FormHeader from "../components/FormHeader";
import TextInput from "../components/TextInput";
import Aetextarea from "../components/Aetextarea";
import TagInput from "../components/TagInput";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { makeGetRequest, makePutRequest, makeDeleteRequest } from "../utils/api";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { useNavigate, useParams } from "react-router-dom";

const EditBlog = () => {
    const navigate = useNavigate();
    const { id } = useParams();

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
        tags: [],
        sub_section: [],
        notes: "",
        is_active: true,
        created_by: null,
    });

    const [hasChanges, setHasChanges] = useState(false);
    const [initialBlogData, setInitialBlogData] = useState(null);

    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [canEdit, setCanEdit] = useState(true);
    const [loading, setLoading] = useState(true);

    // ✅ Fetch available tags
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

    // ✅ Fetch blog data by ID
    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await makeGetRequest(`blog/${id}`);
                const data = response.data?.data;

                if (!data) {
                    showErrorToast("Blog not found!");
                    navigate("/blog");
                    return;
                }

                const formattedData = {
                    author_name: data.author_name || "",
                    title: data.title || "",
                    slug: data.slug || "",
                    featured_image: data.featured_image || null,
                    short_description: data.short_description || "",
                    content: data.content || "",
                    category: data.category || "",
                    status: data.status || "draft",
                    is_featured: data.is_featured || false,
                    seo_title: data.seo_title || "",
                    seo_description: data.seo_description || "",
                    reading_time: data.reading_time || "",
                    tags: data.tags || [],
                    sub_section: data.sub_section || [],
                    notes: data.notes || "",
                    is_active: data.is_active ?? true,
                    created_by: data.created_by || null,
                };

                setBlogData(formattedData);
                setInitialBlogData(formattedData); // 👈 store original
                setSelectedTags(data.tags || []);
            } catch (error) {
                console.error("Error fetching blog:", error);
                showErrorToast("Failed to fetch blog data.");
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [id, navigate]);

    useEffect(() => {
        if (!initialBlogData) return;

        const changed = JSON.stringify(blogData) !== JSON.stringify(initialBlogData);
        setHasChanges(changed);
    }, [blogData, initialBlogData]);



    // ✅ Handle input changes
    const handleInputChange = useCallback(
        (e, customValue = null) => {
            if (!canEdit) {
                showErrorToast("You are not authorized to edit this project.");
                return;
            }
            if (e?.target) {
                const { name, value } = e.target;
                const isNumberField = ["reading_time"].includes(name);
                setBlogData((prev) => ({
                    ...prev,
                    [name]: isNumberField ? (value === "" ? null : parseInt(value, 10)) : value,
                }));
            } else if (typeof e === "string" && customValue !== null) {
                const name = e;
                const value = customValue;
                const isNumberField = ["reading_time"].includes(name);
                setBlogData((prev) => ({
                    ...prev,
                    [name]: isNumberField ? (value === "" ? null : parseInt(value, 10)) : value,
                }));
            }
        },
        [canEdit]
    );


    // ✅ Handle file upload
    const handleFileChange = (e) => {
        setBlogData({ ...blogData, featured_image: e.target.files[0] });
    };

    // ✅ Handle tag change
    const handleTagsChange = (tags) => {
        setSelectedTags(tags);
        setBlogData((prev) => ({ ...prev, tags }));
    };

    // ✅ Update blog
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canEdit) {
            showErrorToast("You are not authorized to edit this client.");
            return;
        }

        if (!hasChanges) {
            showErrorToast("No changes made to update.");
            return;
        }

        try {
            
            const payload = {
                ...blogData,
                blog_id: id,
                is_featured:
                    blogData.is_featured === "true" || blogData.is_featured === true,
                tags: Array.isArray(blogData.tags) ? blogData.tags : [],
                notes: blogData.notes ? [blogData.notes] : [],
                featured_image:
                    blogData.featured_image?.name || blogData.featured_image || "",
                sub_section: Array.isArray(blogData.sub_section) ? blogData.sub_section : [],

            };

            const response = await makePutRequest(`blog`, payload);

            if (response.data?.success) {
                showSuccessToast("✅ Blog updated successfully!");
                navigate("/blog");
            } else {
                showErrorToast(response.data?.message || "Failed to update blog.");
            }
        } catch (error) {
            console.error("Error updating blog:", error);
            showErrorToast("Something went wrong while updating the blog.");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this blog?")) return;

        try {
            const response = await makeDeleteRequest(`blog`, { blog_id: id });

            if (response.data?.success) {
                showSuccessToast("🗑️ Blog deleted successfully!");
                navigate("/blog");
            } else {
                showErrorToast(response.data?.message || "Failed to delete blog.");
            }
        } catch (error) {
            console.error("Error deleting blog:", error);
            showErrorToast("Something went wrong while deleting the blog.");
        }
    };

    if (loading) return <Layout><p>Loading blog data...</p></Layout>;

    return (
        <Layout>
            <form onSubmit={handleSubmit}>
                <FormHeader
                    title="Edit Blog"
                    showUpdate={hasChanges && canEdit}
                    onUpdate={handleSubmit}
                    showDelete
                    onDelete={handleDelete}
                    backUrl="/blog"
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
                                {blogData.featured_image && typeof blogData.featured_image === "string" && (
                                    <img
                                        src={blogData.featured_image}
                                        alt="Current"
                                        className="mt-2 rounded"
                                        width="150"
                                    />
                                )}
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
                            <TextInput
                                label="Content"
                                name="content"
                                value={blogData.content}
                                onChange={handleInputChange}
                            />

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

                            <TagInput
                                availableTags={availableTags}
                                setSelectedTags={setSelectedTags}
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
                        Update Blog
                    </button>
                </div> */}
            </form>
        </Layout>
    );
};

export default EditBlog;
