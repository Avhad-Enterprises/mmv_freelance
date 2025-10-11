import React, { useEffect, useState, useRef } from "react";
import Layout from "./layout";
import FormHeader from "../components/FormHeader";
import { useNavigate, useParams } from "react-router-dom";
import DataTable from "../components/DataTable";
import { makePostRequest, makePatchRequest, makeGetRequest } from "../utils/api";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";

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
                const response = await makeGetRequest(`projectsTask/getprojects_taskbyid/${id}`);

                console.log("API Response: ", response);

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
                const response = await makeGetRequest("applications/my-applications");
                console.log("Application Response: ", response);

                const applications = response?.data?.data;
                if (Array.isArray(applications)) {
                    // Combine first_name and last_name into `name`
                    const formattedData = applications.map((item) => ({
                        ...item,
                        name: `${item.first_name || ''} ${item.last_name || ''}`.trim(),
                        experience: Array.isArray(item.experience)
                            ? item.experience
                                .map(
                                    (exp) =>
                                        `${exp.role || "N/A"} at ${exp.company || "N/A"} (${exp.duration || "N/A"})`
                                )
                                .join(", ")
                            : "0",
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

    const updateStatus = async (projects_task_id, newStatus, user_id) => {
        try {
            const payload = {
                projects_task_id,
                status: newStatus,
                user_id: user_id
            };
            const response = await makePatchRequest("projectsTask/updatestatus", payload);
            console.log(response);
            showSuccessToast("Status updated!");
        } catch (error) {
            console.error("Error updating status:", error);
            showErrorToast("Failed to update status.");
        }
    };


    const applicationsColumns = [
        {
            headname: "Profile Picture",
            dbcol: "profile_picture",
            type: "custom", // Mark as custom
            render: (row) => (
                row.profile_picture ? (
                    <img
                        src={row.profile_picture}
                        alt={row.name || "Profile"}
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: "50%",
                            objectFit: "cover"
                        }}
                    />
                ) : (
                    <span>No Image</span>
                )
            ),
        },
        {
            headname: "Name",
            dbcol: "name",
        },
        {
            headname: "Email",
            dbcol: "email",
            type: "",
        },
        {
            headname: "Bio",
            dbcol: "bio",
            type: "",
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
                    onStatusChange={updateStatus}
                />
            )}
        </Layout>
    );
};

export default ApplicationData;
