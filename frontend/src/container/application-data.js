import React, { useEffect, useState, useRef } from "react";
import Layout from "./layout";
import FormHeader from "../components/FormHeader";
import { useNavigate, useParams } from "react-router-dom";
import DataTable from "../components/DataTable";
import { makePostRequest, makePatchRequest } from "../utils/api";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { FaCheck } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import { FaQuestion } from "react-icons/fa6";

const ApplicationData = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const tableRef = useRef();

    const [applicationsData, setApplicationsData] = useState([]);
    const [projectTitle, setProjectTitle] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjectTitle = async () => {
            try {
                const payload = { projects_task_id: id };
                const response = await makePostRequest(
                    "projectsTask/getprojects_taskbyid",
                    payload
                );

                const project = response?.data?.projects;
                if (project?.project_title) {
                    setProjectTitle(project.project_title);
                } else {
                    console.error("Project title not found");
                }

            } catch (error) {
                console.error("Error fetching project title:", error);
            }
        };

        const fetchApplications = async () => {
            try {
                const payload = { projects_task_id: id };
                const response = await makePostRequest(
                    "applications/projects/get-applications",
                    payload
                );

                const applications = response?.data?.data;
                if (Array.isArray(applications)) {
                    // Combine first_name and last_name into `name`
                    const formattedData = applications.map((item) => ({
                        ...item,
                        name: `${item.first_name || ''} ${item.last_name || ''}`.trim(),
                    }));
                    setApplicationsData(formattedData);
                } else {
                    console.error("Expected applications array but got:", applications);
                    setApplicationsData([]);
                }
            } catch (error) {
                console.error("Error fetching applications:", error);
                setApplicationsData([]);
            } finally {
                setLoading(false);
            }
        };

        if (localStorage.getItem("jwtToken")) {
            fetchProjectTitle();
            fetchApplications();
        } else {
            showErrorToast("Please log in to view applications.");
            navigate("/login");
        }
    }, [navigate, id]);

    const updateStatus = async (applied_projects_id, newStatus) => {
        try {
            const payload = {
                applied_projects_id,
                status: newStatus,
            };
            const response = await makePatchRequest("applications/update-status", payload);
            showSuccessToast("Status updated!");
        } catch (error) {
            console.error("Error updating status:", error);
            showErrorToast("Failed to update status.");
        }
    };


    const applicationsColumns = [
        {
            headname: "Name",
            dbcol: "name",
        },
        {
            headname: "Experience",
            dbcol: "experience",
            type: "text",
        },
        {
            headname: "Skills",
            dbcol: "skill",
            type: "tags",
        },
        {
            headname: "Status",
            dbcol: "status",
            type: "status",
        },
    ];

    return (
        <Layout>
            <FormHeader
                title={projectTitle ? projectTitle : ""}
                backUrl="/projectmanagement"
            />

            {loading ? (
                <div>Loading...</div>
            ) : applicationsData.length === 0 ? (
                <div>No Applications found.</div>
            ) : (
                <DataTable
                    id="table1"
                    tableRef={tableRef}
                    columns={applicationsColumns}
                    data={applicationsData}
                    defaultView="table"
                    searchable
                    filterable
                    sortable
                    paginated
                    onFilteredDataChange={(data) =>
                        console.log("Filtered Data:", data)
                    }
                />
            )}
        </Layout>
    );
};

export default ApplicationData;
