import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./layout";
import { makeGetRequest } from "../utils/api";
import DataTable from "../components/DataTable";
import Button from "../components/Button";
import { showErrorToast } from "../utils/toastUtils";

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 🧠 Fetch all blogs
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await makeGetRequest("blog");
                const data = Array.isArray(response.data?.data)
                    ? response.data.data
                    : [];
                setBlogs(data);
            } catch (error) {
                console.error("Error fetching blogs:", error);
                showErrorToast("Failed to load blogs.");
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    // 📊 DataTable Columns
    const columns = [
        {
            headname: "Title",
            dbcol: "title",
            type: "link",
            linkTemplate: "/blog/edit/:blog_id",
            linkLabelFromRow: "title", // Changed to use name for link label
            linkParamKey: "blog_id",
        },
        { headname: "Author", dbcol: "author_name", type: "text" },
        { headname: "Category", dbcol: "category", type: "" },
        {
            headname: "Tags",
            dbcol: "tags",
            type: "",
        },
        {
            headname: "Status",
            dbcol: "is_active",
            type: "badge",
        },
    ];

    return (
        <Layout>
            <div className="d-flex justify-content-between mb-3 align-items-center">
                <h3 className="mt-3">Blogs</h3>
                <Button
                    buttonType="add"
                    label="Add New Blog"
                    onClick={() => navigate("/blog/create")}
                />
            </div>

            {loading ? (
                <div>Loading blogs...</div>
            ) : blogs.length === 0 ? (
                <div>No blogs found.</div>
            ) : (
                <DataTable
                    id="blogsTable"
                    columns={columns}
                    data={blogs}
                    defaultView="table"
                    searchable
                    filterable
                    sortable
                    paginated
                />
            )}
        </Layout>
    );
};

export default Blogs;
